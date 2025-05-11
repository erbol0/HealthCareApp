"use client";

import { MaxWidthWrapper } from "@/components";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeftIcon, ImageIcon, LoaderIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must be less than 255 characters"),
    contentItems: z.array(z.object({
        type: z.enum(["TEXT", "IMAGE"]),
        textValue: z.string().optional(),
        displayOrder: z.number(),
    })).min(1, "At least one content item is required"),
});

type FormValues = z.infer<typeof formSchema>;

const PostPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            contentItems: [{ type: "TEXT", textValue: "", displayOrder: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contentItems",
    });

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Update image files array
        const newImageFiles = [...imageFiles];
        newImageFiles[index] = file;
        setImageFiles(newImageFiles);

        // Create and update preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const newPreviews = [...imagePreviews];
            newPreviews[index] = reader.result as string;
            setImagePreviews(newPreviews);
        };
        reader.readAsDataURL(file);
    }, [imageFiles, imagePreviews]);

    const removeImage = useCallback((index: number) => {
        const newImageFiles = [...imageFiles];
        const newPreviews = [...imagePreviews];
        newImageFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setImageFiles(newImageFiles);
        setImagePreviews(newPreviews);
    }, [imageFiles, imagePreviews]);

    const { mutate: createTopic, isPending } = useMutation({
        mutationFn: async (values: FormValues) => {
            const formData = new FormData();
            formData.append("topicData", JSON.stringify(values));
            imageFiles.forEach((file) => {
                formData.append("files", file);
            });
            const response = await axios.post("/api/topics", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["topics"] });
            toast.success("Topic created successfully!");
            router.push("/topics");
        },
        onError: (error) => {
            toast.error("Failed to create topic. Please try again.");
            console.error(error);
        },
    });

    const onSubmit = (values: FormValues) => {
        // Validate that all IMAGE type items have corresponding files
        const imageItems = values.contentItems.filter(item => item.type === "IMAGE");
    
        createTopic(values);
    };

    return (
        <MaxWidthWrapper className="py-10">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/topics" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <ArrowLeftIcon className="w-4 h-4" />
                </Link>
                <h1 className="text-3xl md:text-4xl font-semibold font-heading text-foreground">
                    Create New <span className="text-gradient">Topic</span>
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Topic Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter topic title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Content Items</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ type: "TEXT", textValue: "", displayOrder: fields.length })}
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Content
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <Card key={field.id} className="relative">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`contentItems.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Content Type</FormLabel>
                                                            <select
                                                                className={cn(
                                                                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                                                )}
                                                                {...field}
                                                            >
                                                                <option value="TEXT">Text</option>
                                                                <option value="IMAGE">Image</option>
                                                            </select>
                                                        </FormItem>
                                                    )}
                                                />
                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            remove(index);
                                                            if (form.getValues(`contentItems.${index}.type`) === "IMAGE") {
                                                                removeImage(index);
                                                            }
                                                        }}
                                                    >
                                                        <TrashIcon className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>

                                            {form.watch(`contentItems.${index}.type`) === "TEXT" ? (
                                                <FormField
                                                    control={form.control}
                                                    name={`contentItems.${index}.textValue`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Text Content</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Enter your text content"
                                                                    className="min-h-[100px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ) : (
                                                <FormItem>
                                                    <FormLabel>Image</FormLabel>
                                                    <div className="space-y-4">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageChange(e, index)}
                                                            className="cursor-pointer"
                                                        />
                                                        {imagePreviews[index] && (
                                                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                                                <img
                                                                    src={imagePreviews[index]}
                                                                    alt="Preview"
                                                                    className="object-cover w-full h-full"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2"
                                                                    onClick={() => removeImage(index)}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormItem>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/topics")}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Topic"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </MaxWidthWrapper>
    );
};

export default PostPage; 