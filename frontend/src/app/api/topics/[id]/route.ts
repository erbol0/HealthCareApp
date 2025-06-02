import { NextRequest, NextResponse } from "next/server";

const MEDICAL_TOPIC_SERVICE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${MEDICAL_TOPIC_SERVICE_URL}/api/admin/topics/${params.id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }
      throw new Error(
        `Medical topic service responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${MEDICAL_TOPIC_SERVICE_URL}/api/admin/topics/${params.id}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }
      throw new Error(
        `Medical topic service responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error liking topic:", error);
    return NextResponse.json(
      { error: "Failed to like topic" },
      { status: 500 }
    );
  }
}
