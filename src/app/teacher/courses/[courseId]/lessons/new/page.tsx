
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  learningOutcome: z.string().min(10, "Learning outcome must be at least 10 characters long."),
  objectives: z.string().min(10, "Objectives must be at least 10 characters long."),
  sdgIntegration: z.string().optional(),
  internationalization: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters long."),
});

export default function NewLessonPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { firestore, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      learningOutcome: "",
      objectives: "",
      sdgIntegration: "",
      internationalization: "",
      content: "",
    },
  });

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
      <Card>
        <CardHeader>
          <CardTitle>Create New Lesson</CardTitle>
          <CardDescription>Fill out the details for your new structured lesson.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Lesson Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write the main content of your lesson here. You can use Markdown for formatting." {...field} rows={15} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
        </CardContent>
      </Card>
    </>
  );
}
