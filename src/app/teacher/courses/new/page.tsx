
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
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().optional(),
  syllabusLink: z.string().url({ message: "Please enter a valid URL." }).min(1, "Syllabus link is required."),
  courseCode: z.string().min(3, "Course code must be at least 3 characters."),
  units: z.coerce.number().min(1, "Must be at least 1 unit.").max(5, "Cannot exceed 5 units."),
  courseType: z.enum(["lecture", "laboratory", "lec_lab"]),
});

export default function NewCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      syllabusLink: "",
      courseCode: "",
      units: 3,
      courseType: "lecture",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to create a course.",
        });
        return;
    }

    try {
        const coursesCollection = collection(firestore, `users/${user.uid}/courses`);
        const newCourseRef = await addDocumentNonBlocking(coursesCollection, {
            ...values,
            teacherId: user.uid,
            createdAt: new Date(),
        });
        
        toast({
            title: "Course Created!",
            description: `The course blueprint "${values.title}" has been successfully created.`,
        });

        if (newCourseRef) {
            router.push(`/teacher/courses/${newCourseRef.id}`);
        } else {
            // Fallback in case the optimistic non-blocking ref isn't available
            // This might happen in some edge cases.
            router.push('/teacher/courses');
        }

    } catch (error) {
        console.error("Error creating course:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not create the course. Please try again.",
        });
    }
  }

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/teacher/courses"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Courses</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Course Blueprint</CardTitle>
          <CardDescription>Define the curriculum for a new course. This will serve as the master template for one or more blocks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Placement Literature" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., APLIT-101" {...field} />
                    </FormControl>
                    <FormDescription>A unique code for the entire course (not the block).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Units</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Type</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a course type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lecture">Lecture</SelectItem>
                              <SelectItem value="laboratory">Laboratory</SelectItem>
                              <SelectItem value="lec_lab">Lecture & Lab</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the course and its overarching learning objectives." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="syllabusLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Syllabus Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://docs.google.com/document/d/..." {...field} />
                    </FormControl>
                     <FormDescription>
                      Paste the shareable Google Drive link to the approved syllabus.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                    <Link href="/teacher/courses">Cancel</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>Create Course Blueprint</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
