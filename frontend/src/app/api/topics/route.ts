import { NextRequest, NextResponse } from "next/server";

const MEDICAL_TOPIC_SERVICE_URL = process.env.MEDICAL_TOPIC_SERVICE_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get("page") || "0";
        const size = searchParams.get("size") || "10";
        const sort = searchParams.get("sort") || "createdAt,desc";

        const response = await fetch(
            `${MEDICAL_TOPIC_SERVICE_URL}/api/admin/topics?page=${page}&size=${size}&sort=${sort}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Medical topic service responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching topics:", error);
        return NextResponse.json(
            { error: "Failed to fetch topics" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const topicData = formData.get("topicData");
        const files = formData.getAll("files");

        if (!topicData) {
            return NextResponse.json(
                { error: "Topic data is required" },
                { status: 400 }
            );
        }

        // Parse the topic data to validate and ensure proper format
        let parsedTopicData;
        try {
            parsedTopicData = JSON.parse(topicData as string);
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid topic data format" },
                { status: 400 }
            );
        }

        // Validate that files are provided for all IMAGE type content items
        const imageItems = parsedTopicData.contentItems.filter((item: any) => item.type === "IMAGE");
        if (imageItems.length > 0) {
            if (files.length !== imageItems.length) {
                return NextResponse.json(
                    { error: `Expected ${imageItems.length} image files but received ${files.length}` },
                    { status: 400 }
                );
            }

            // Validate that all files are valid
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!(file instanceof Blob)) {
                    return NextResponse.json(
                        { error: `File at index ${i} is not a valid file` },
                        { status: 400 }
                    );
                }
                if (file.size === 0) {
                    return NextResponse.json(
                        { error: `File at index ${i} is empty` },
                        { status: 400 }
                    );
                }
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    return NextResponse.json(
                        { error: `File at index ${i} is not an image (${file.type})` },
                        { status: 400 }
                    );
                }
            }
        }

        // Create a new FormData instance
        const newFormData = new FormData();
        
        // Add topicData as a JSON string
        newFormData.append("topicData", new Blob([JSON.stringify(parsedTopicData)], {
            type: "application/json",
        }));

        // Add files in the same order as IMAGE type content items
        for (const file of files) {
            if (file instanceof Blob) {
                // Get the original filename from the Blob if available
                const filename = (file as any).name || `image-${Date.now()}.${file.type.split('/')[1]}`;
                // Create a new Blob with the same data and type
                const newBlob = new Blob([await file.arrayBuffer()], { type: file.type });
                // Add the blob to form data with the filename
                newFormData.append("files", newBlob, filename);
            }
        }

        // Use the native fetch with FormData
        const response = await fetch(`${MEDICAL_TOPIC_SERVICE_URL}/api/admin/topics`, {
            method: "POST",
            body: newFormData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Medical topic service responded with status: ${response.status}`;
            console.error("Error from medical topic service:", errorData);
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating topic:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create topic" },
            { status: 500 }
        );
    }
} 