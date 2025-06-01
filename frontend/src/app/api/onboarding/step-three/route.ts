import { db, StepThreeSchema } from "@/lib";
import { withRetry } from "@/lib/utils/db-retry";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adherence, dosage, frequency, name, purpose } =
      StepThreeSchema.parse(body);

    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!adherence || !dosage || !frequency || !name) {
      return new NextResponse("Invalid data passed", { status: 422 });
    }

    // First verify the user exists in our database with retry logic
    const dbUser = await withRetry(() =>
      db.user.findFirst({
        where: {
          id: user.id,
        },
      })
    );

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const medicationData = {
      userId: user.id,
      name,
      frequency,
      adherence,
      dosage,
      purpose: purpose ?? "",
    };

    // Create new medication with retry logic
    await withRetry(() =>
      db.medication.create({
        data: medicationData,
      })
    );

    return NextResponse.json({
      message: "Medication created successfully!",
      status: 200,
    });
  } catch (error) {
    console.error("Error in step-three:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data passed", { status: 422 });
    }

    return new NextResponse("Could not create medication", { status: 500 });
  }
}
