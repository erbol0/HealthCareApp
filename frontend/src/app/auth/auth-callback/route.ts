import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if user already exists in our database
        const dbUser = await db.user.findFirst({
            where: {
                clerkId: user.id,
            },
        });

        if (!dbUser) {
            // Create new user
            await db.user.create({
                data: {
                    id: user.id,
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress!,
                    firstName: user.firstName!,
                    lastName: user.lastName || "",
                    image: user.imageUrl,
                }
            });
        }

        return NextResponse.redirect(new URL('/onboarding', request.url));
    } catch (error) {
        console.error('Error in auth callback:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}