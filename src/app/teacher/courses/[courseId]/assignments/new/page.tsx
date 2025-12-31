

"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { ArrowLeft, Loader2, Save, Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";
import { useState, Suspense } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const rubricItemSchema = z.object({
  criterion: z.string().min(1, "Criterion cannot be empty."),
  description: z.string().optional(),
  points: z.coerce.number().min(0, "Points must be non-negative."),
});

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  objectives: z.string().optional(),
  deliverables: z.string().optional(),
  dueDate: z.date().optional(),
  closingDate: z.date().optional(),
  rubric: z.array(rubricItemSchema).default([]),
}).refine(data => {
    if (data.dueDate && data.closingDate) {
        return data.closingDate >= data.dueDate;
    }
    return true;
}, {
    message: "Closing date must be on or after the due date.",
    path: ["closingDate"],
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
      objectives: "",
      deliverables: "",
      rubric: [{ criterion: "Overall Quality", description: "", points: 10 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rubric",
  });

  const watchedRubric = useWatch({
      control: form.control,
      name: 'rubric'
  });

  const totalPoints = watchedRubric.reduce((sum, item) => sum + (item.points || 0), 0);

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
            pointsPossible: totalPoints,
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                  <CardTitle>Create New {type}</CardTitle>
                  <CardDescription>Define the details and grading criteria for this {type.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        <FormLabel>General Instructions</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Provide instructions, requirements, and submission guidelines for this ${type.toLowerCase()}.`} {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Objectives</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What will students be able to do after completing this? (Use markdown for lists)" {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Deliverables</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What specific files or content should the student submit?" {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Grading Rubric</CardTitle>
                            <CardDescription>Define how this {type.toLowerCase()} will be graded.</CardDescription>
                        </div>
                        <h3 className="text-2xl font-bold">Total Points: {totalPoints}</h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                           <div className="col-span-12 md:col-span-3">
                             <FormField
                                control={form.control}
                                name={`rubric.${index}.criterion`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Criterion</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Clarity" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                           </div>
                            <div className="col-span-12 md:col-span-6">
                                <FormField
                                    control={form.control}
                                    name={`rubric.${index}.description`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Description of the criterion" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-8 md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`rubric.${index}.points`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points</FormLabel>
                                        <FormControl>
                                        <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-4 md:col-span-1 flex items-end h-full">
                                <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                                >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ criterion: "", description: "", points: 0 })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Criterion
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Deadlines</CardTitle>
                    <CardDescription>Set the submission dates for this {type.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>The recommended deadline for submission.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                            control={form.control}
                            name="closingDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Closing Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            form.getValues('dueDate') ? date < form.getValues('dueDate')! : false
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>No submissions will be accepted after this date.</FormDescription>
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
                Save {type}
            </Button>
            </div>
        </form>
      </Form>
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
