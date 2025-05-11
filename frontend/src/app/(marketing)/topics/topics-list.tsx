"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib";
import { EyeIcon, HeartIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface Topic {
    id: number;
    title: string;
    views: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
    contentItems: Array<{
        id: number;
        type: "TEXT" | "IMAGE";
        textValue?: string;
        imageUrl?: string;
        displayOrder: number;
    }>;
}

export const TopicsList = () => {
    const { data: topics, isLoading, error } = useQuery<Topic[]>({
        queryKey: ["topics"],
        queryFn: async () => {
            const response = await axios.get("/api/topics");
            return response.data.content;
        },
    });

    if (isLoading) {
        return null; // We use the skeleton from the parent component
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-destructive">Failed to load topics. Please try again later.</p>
            </div>
        );
    }

    if (!topics?.length) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No topics found. Be the first to create one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
                // Get the first text content item for preview
                const previewText = topic.contentItems
                    .find(item => item.type === "TEXT")
                    ?.textValue?.slice(0, 150) || "No text content available";

                // Get the first image for preview
                const previewImage = topic.contentItems
                    .find(item => item.type === "IMAGE")
                    ?.imageUrl;

                return (
                    <Link key={topic.id} href={`/topics/${topic.id}`}>
                        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            {previewImage && (
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                    <img
                                        src={previewImage}
                                        alt={topic.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-2">{topic.title}</CardTitle>
                                <CardDescription>
                                    {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-3">
                                    {previewText}
                                </p>
                            </CardContent>
                            <CardFooter className="flex gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <EyeIcon className="w-4 h-4" />
                                    <span>{topic.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <HeartIcon className="w-4 h-4" />
                                    <span>{topic.likes}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}; 