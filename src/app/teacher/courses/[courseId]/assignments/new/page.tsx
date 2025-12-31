

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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";
import { useState, Suspense } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  pointsPossible: z.coerce.number().min(0, "Points must be a positive number.").default(10),
});

function NewAssignmentPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const type = searchParams.get('type') || "Assignment";

  const { firestore, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      pointsPossible: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !courseId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `You must be logged in and in a course context to create a new ${type}.`,
        });
        return;
    }
    setIsSaving(true);
    try {
        const assignmentsCollection = collection(firestore, `users/${user.uid}/courses/${courseId}/assignments`);
        await addDocumentNonBlocking(assignmentsCollection, {
            ...values,
            courseId: courseId,
            teacherId: user.uid,
            createdAt: new Date(),
            type: type,
        });
        
        toast({
            title: `${type} Created!`,
            description: `The ${type.toLowerCase()} "${values.title}" has been successfully created.`,
        });

        router.push(`/teacher/courses/${courseId}`);

    } catch (error) {
        console.error(`Error creating ${type}:`, error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: `Could not create the ${type.toLowerCase()}. Please try again.`,
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
          <CardTitle>Create New {type}</CardTitle>
          <CardDescription>Define an activity or exercise for your students.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type} Title</FormLabel>
                    <FormControl>
                      <Input placeholder={`e.g., Argumentative Essay Outline`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder={`Provide instructions, requirements, and submission guidelines for this ${type.toLowerCase()}.`} {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="pointsPossible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Possible</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    Save {type}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

export default function NewAssignmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewAssignmentPageContent />
        </Suspense>
    )
}
