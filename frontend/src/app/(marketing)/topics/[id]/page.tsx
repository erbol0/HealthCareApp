"use client";

import { MaxWidthWrapper } from "@/components";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeftIcon, EyeIcon, HeartIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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

const TopicDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const topicId = params.id as string;

    const { data: topic, isLoading, error } = useQuery<Topic>({
        queryKey: ["topic", topicId],
        queryFn: async () => {
            const response = await axios.get(`/api/topics/${topicId}`);
            return response.data;
        },
    });

    const { mutate: likeTopic, isPending: isLiking } = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`/api/topics/${topicId}/like`);
            return response.data;
        },
        onSuccess: (updatedTopic) => {
            queryClient.setQueryData(["topic", topicId], updatedTopic);
            toast.success("Topic liked successfully!");
        },
        onError: () => {
            toast.error("Failed to like topic. Please try again.");
        },
    });

    if (isLoading) {
        return (
            <MaxWidthWrapper className="py-10">
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MaxWidthWrapper>
        );
    }

    if (error || !topic) {
        return (
            <MaxWidthWrapper className="py-10">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-destructive mb-4">Error Loading Topic</h2>
                    <p className="text-muted-foreground mb-6">Failed to load the topic. It may have been deleted or you may not have permission to view it.</p>
                    <Link href="/topics" className={buttonVariants()}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Topics
                    </Link>
                </div>
            </MaxWidthWrapper>
        );
    }

    return (
        <MaxWidthWrapper className="py-10">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/topics" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeftIcon className="w-4 h-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-semibold font-heading text-foreground">
                        {topic.title}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}</span>
                        <div className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            <span>{topic.views}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => likeTopic()}
                            disabled={isLiking}
                        >
                            <HeartIcon className={cn("w-4 h-4", topic.likes > 0 && "text-red-500 fill-red-500")} />
                            <span>{topic.likes}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {topic.contentItems
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((item) => (
                        <Card key={item.id}>
                            <CardContent className="pt-6">
                                {item.type === "TEXT" ? (
                                    <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
                                        {item.textValue?.split("\n").map((paragraph, index) => (
                                            <p key={index} className="mb-4 last:mb-0">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                        <img
                                            src={item.imageUrl}
                                            alt=""
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </MaxWidthWrapper>
    );
};

export default TopicDetailPage; 