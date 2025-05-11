import { MaxWidthWrapper } from "@/components";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib";
import { EyeIcon, HeartIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { TopicsList } from "./topics-list";

const TopicsPage = () => {
    return (
        <MaxWidthWrapper className="py-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold font-heading text-foreground">
                        Medical <span className="text-gradient">Topics</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Explore our collection of medical topics and articles
                    </p>
                </div>
                <Link href="/topics/post" className={buttonVariants()}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Topic
                </Link>
            </div>

            <Suspense fallback={<TopicsListSkeleton />}>
                <TopicsList />
            </Suspense>
        </MaxWidthWrapper>
    );
};

const TopicsListSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-5/6 mt-2" />
                    </CardContent>
                    <CardFooter className="flex gap-4">
                        <div className="h-4 bg-muted rounded w-16" />
                        <div className="h-4 bg-muted rounded w-16" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default TopicsPage; 