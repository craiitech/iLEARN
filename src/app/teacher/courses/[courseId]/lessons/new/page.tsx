
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, FileText, Youtube, Presentation, Link as LinkIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFirebase, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, query } from "firebase/firestore";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  gradingPeriod: z.string().min(1, "You must select a grading period."),
  learningOutcome: z.string().min(10, "Learning outcome must be at least 10 characters long."),
  objectives: z.string().min(10, "Objectives must be at least 10 characters long."),
  sdgIntegration: z.string().optional(),
  internationalization: z.string().optional(),
  contentType: z.enum(["text", "pdf", "presentation", "youtube"]),
  contentValue: z.string().min(1, "Content is required."),
  visibleInBlocks: z.array(z.string()).default([]),
}).refine(data => {
    if (data.contentType === 'youtube') {
      try {
        const url = new URL(data.contentValue);
        return url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com' || url.hostname === 'youtu.be';
      } catch {
        return false;
      }
    }
    if (data.contentType === 'pdf' || data.contentType === 'presentation') {
        try {
            const url = new URL(data.contentValue);
            return url.hostname.includes('google.com');
        } catch {
            return false;
        }
    }
    return true;
}, {
    message: "Please provide a valid URL for the selected content type.",
    path: ["contentValue"],
});

export default function NewLessonPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { firestore, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);

  const courseRef = useMemoFirebase(() => {
    if (!user || !courseId) return null;
    return doc(firestore, `users/${user.uid}/courses`, courseId);
  }, [firestore, user, courseId]);

  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);
  
  const blocksQuery = useMemoFirebase(() => {
      if(!courseRef) return null;
      return query(collection(courseRef, 'blocks'));
  }, [courseRef]);
  const { data: blocks, isLoading: areBlocksLoading } = useCollection(blocksQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      gradingPeriod: "",
      learningOutcome: "",
      objectives: "",
      sdgIntegration: "",
      internationalization: "",
      contentType: "text",
      contentValue: "",
      visibleInBlocks: [],
    },
  });

  const contentType = form.watch("contentType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !courseId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in and in a course context to create a lesson.",
        });
        return;
    }
    setIsSaving(true);
    try {
        const lessonsCollection = collection(firestore, `users/${user.uid}/courses/${courseId}/lessons`);
        await addDocumentNonBlocking(lessonsCollection, {
            ...values,
            courseId: courseId,
            teacherId: user.uid,
            createdAt: new Date(),
        });
        
        toast({
            title: "Lesson Created!",
            description: `The lesson "${values.title}" has been successfully created.`,
        });

        router.push(`/teacher/courses/${courseId}`);

    } catch (error) {
        console.error("Error creating lesson:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not create the lesson. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href={`/teacher/courses/${courseId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Course</Link>
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Create New Lesson</CardTitle>
                <CardDescription>Fill out the details for your new structured lesson.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lesson Title</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Introduction to Photosynthesis" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                            control={form.control}
                            name="gradingPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grading Period</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger disabled={isCourseLoading || !course?.gradingPolicy}>
                                            <SelectValue placeholder="Select a term for this lesson" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isCourseLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {course?.gradingPolicy?.map((policy: any) => (
                                                <SelectItem key={policy.term} value={policy.term}>{policy.term}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                </div>

                <FormField
                    control={form.control}
                    name="learningOutcome"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Learning Outcome</FormLabel>
                        <FormControl>
                        <Textarea placeholder="What should students be able to do after this lesson?" {...field} />
                        </FormControl>
                        <FormDescription>
                        Describe the main takeaway or skill the student will gain.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Objectives</FormLabel>
                        <FormControl>
                        <Textarea placeholder="List the specific learning objectives." {...field} rows={4} />
                        </FormControl>
                        <FormDescription>
                        Use bullet points (e.g., using '-' or '*') for multiple objectives.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Block Visibility</CardTitle>
                    <CardDescription>Select which blocks this lesson will be visible to. If none are selected, it will be visible to all.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="visibleInBlocks"
                        render={() => (
                            <FormItem>
                                {areBlocksLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {!areBlocksLoading && blocks && blocks.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {blocks.map((block) => (
                                            <FormField
                                                key={block.id}
                                                control={form.control}
                                                name="visibleInBlocks"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={block.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(block.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                        ? field.onChange([...(field.value || []), block.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                            (value) => value !== block.id
                                                                            )
                                                                        )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">{block.blockCode}</FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                   <p className="text-sm text-muted-foreground">No blocks have been created for this course yet.</p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Content</CardTitle>
                    <CardDescription>Choose the format for your lesson's main content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Content Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                                >
                                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", field.value === 'text' && "border-primary")}>
                                        <RadioGroupItem value="text" className="sr-only" />
                                        <FileText className="mb-3 h-6 w-6" />
                                        Text Entry
                                    </Label>
                                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", field.value === 'pdf' && "border-primary")}>
                                        <RadioGroupItem value="pdf" className="sr-only" />
                                        <LinkIcon className="mb-3 h-6 w-6" />
                                        PDF via Google Link
                                    </Label>
                                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", field.value === 'presentation' && "border-primary")}>
                                        <RadioGroupItem value="presentation" className="sr-only" />
                                        <Presentation className="mb-3 h-6 w-6" />
                                        Google Slides Link
                                    </Label>
                                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", field.value === 'youtube' && "border-primary")}>
                                        <RadioGroupItem value="youtube" className="sr-only" />
                                        <Youtube className="mb-3 h-6 w-6" />
                                        YouTube Video
                                    </Label>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="contentValue"
                            render={({ field }) => (
                            <FormItem className="mt-6">
                                <FormLabel>{
                                    contentType === 'text' ? 'Text Content' :
                                    contentType === 'pdf' ? 'Google Drive PDF URL' :
                                    contentType === 'presentation' ? 'Google Slides URL' :
                                    'YouTube Video URL'
                                }</FormLabel>
                                <FormControl>
                                    {contentType === 'text' ? (
                                        <Textarea placeholder="Write the main content of your lesson here. You can use Markdown for formatting." {...field} rows={15} />
                                    ) : (
                                        <Input placeholder="https://..." {...field} />
                                    )}
                                </FormControl>
                                 <FormDescription>
                                     {contentType === 'youtube' && "Paste the full URL of the YouTube video."}
                                     {(contentType === 'pdf' || contentType === 'presentation') && "Paste the shareable link from Google Drive."}
                                 </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                      />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                    <CardDescription>Optional information for institutional reporting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="sdgIntegration"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>SDG Integration (Optional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="How does this lesson connect to the UN Sustainable Development Goals?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="internationalization"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Internationalization (Optional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="How does this lesson incorporate international perspectives?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
                <Link href={`/teacher/courses/${courseId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Lesson
            </Button>
            </div>
        </form>
      </Form>
    </>
  );
}
