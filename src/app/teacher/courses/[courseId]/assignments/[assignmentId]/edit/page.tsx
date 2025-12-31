
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
import { ArrowLeft, Loader2, Save, PlusCircle, Trash2, GripVertical } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc } from "firebase/firestore";
import { useState, Suspense, useMemo, useEffect } from "react";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const rubricLevelSchema = z.object({
    levelTitle: z.string().min(1, "Level title is required."),
    levelDescription: z.string().optional(),
    points: z.coerce.number().min(0, "Points must be non-negative."),
});

const rubricCriterionSchema = z.object({
    criterionTitle: z.string().min(1, "Criterion title is required."),
    criterionDescription: z.string().optional(),
    levels: z.array(rubricLevelSchema).min(1, "Each criterion must have at least one level."),
});


const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  objectives: z.string().optional(),
  deliverables: z.string().optional(),
  gradingPeriod: z.string().min(1, "You must select a grading period."),
  dueDate: z.date().optional(),
  closingDate: z.date().optional(),
  rubric: z.array(rubricCriterionSchema).default([]),
}).refine(data => {
    if (data.dueDate && data.closingDate) {
        return data.closingDate >= data.dueDate;
    }
    return true;
}, {
    message: "Closing date must be on or after the due date.",
    path: ["closingDate"],
});

function EditAssignmentPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const assignmentId = params.assignmentId as string;
  const type = searchParams.get('type') || "Assignment";

  const { firestore, user } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  
  const assignmentRef = useMemoFirebase(() => {
    if (!user || !courseId || !assignmentId) return null;
    return doc(firestore, `users/${user.uid}/courses/${courseId}/assignments`, assignmentId);
  }, [firestore, user, courseId, assignmentId]);

  const { data: assignment, isLoading: isAssignmentLoading } = useDoc(assignmentRef);
  
  const courseRef = useMemoFirebase(() => {
    if (!user || !courseId) return null;
    return doc(firestore, `users/${user.uid}/courses`, courseId);
  }, [firestore, user, courseId]);

  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      objectives: "",
      deliverables: "",
      rubric: [],
      gradingPeriod: "",
    },
  });

  useEffect(() => {
    if (assignment) {
      form.reset({
        ...assignment,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate) : undefined,
        closingDate: assignment.closingDate ? new Date(assignment.closingDate) : undefined,
      });
    }
  }, [assignment, form.reset]);


  const { fields: criteriaFields, append: appendCriterion, remove: removeCriterion } = useFieldArray({
    control: form.control,
    name: "rubric",
  });

  const watchedRubric = useWatch({
      control: form.control,
      name: 'rubric'
  });

  const totalPoints = useMemo(() => {
    if (!watchedRubric) return 0;
    return watchedRubric.reduce((total, criterion) => {
        const maxPointsInCriterion = criterion.levels.reduce((max, level) => Math.max(max, level.points || 0), 0);
        return total + maxPointsInCriterion;
    }, 0);
  }, [watchedRubric]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!assignmentRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `Could not update ${type}. Invalid reference.`,
        });
        return;
    }
    setIsSaving(true);
    try {
        const dataToSave = {
            ...values,
            dueDate: values.dueDate ? values.dueDate.toISOString() : null,
            closingDate: values.closingDate ? values.closingDate.toISOString() : null,
            pointsPossible: totalPoints,
            type: type, // Ensure type is preserved
        };

        updateDocumentNonBlocking(assignmentRef, dataToSave);
        
        toast({
            title: `${type} Updated!`,
            description: `The ${type.toLowerCase()} "${values.title}" has been successfully updated.`,
        });

        router.push(`/teacher/courses/${courseId}`);

    } catch (error) {
        console.error(`Error updating ${type}:`, error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: `Could not update the ${type.toLowerCase()}. Please try again.`,
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (isAssignmentLoading || isCourseLoading) {
      return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!assignment) {
      return (
           <div className="text-center">
                <h2 className="text-xl font-semibold">Assignment not found</h2>
                <p className="text-muted-foreground">This assignment may have been deleted.</p>
                 <Button asChild variant="outline" className="mt-4">
                    <Link href={`/teacher/courses/${courseId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Course</Link>
                </Button>
            </div>
      )
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
                  <CardTitle>Edit {type}</CardTitle>
                  <CardDescription>Update the details and grading criteria for this {type.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            name="gradingPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grading Period</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                        <SelectTrigger disabled={isCourseLoading || !course?.gradingPolicy}>
                                            <SelectValue placeholder="Select a term for this item" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isCourseLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {course?.gradingPolicy?.map((policy: any) => (
                                                <SelectItem key={policy.term} value={policy.term}>{policy.term}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Which grading term does this belong to?</FormDescription>
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
                            <CardDescription>Define how this {type.toLowerCase()} will be graded. Add criteria and performance levels.</CardDescription>
                        </div>
                        <h3 className="text-2xl font-bold text-right shrink-0">Total Points: <span className="text-primary">{totalPoints}</span></h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {criteriaFields.map((criterion, criterionIndex) => (
                        <CriterionBuilder key={criterion.id} form={form} criterionIndex={criterionIndex} removeCriterion={removeCriterion} />
                    ))}
                    <Separator/>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendCriterion({ 
                            criterionTitle: "", 
                            criterionDescription: "", 
                            levels: [{ points: 0, levelTitle: "", levelDescription: "" }] 
                        })}
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
                                <DateTimePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                />
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
                                 <DateTimePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                    disabled={!form.watch('dueDate')}
                                />
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
                Save Changes
            </Button>
            </div>
        </form>
      </Form>
    </>
  );
}

function CriterionBuilder({ form, criterionIndex, removeCriterion }: { form: any, criterionIndex: number, removeCriterion: (index: number) => void }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `rubric.${criterionIndex}.levels`,
    });

    return (
        <div className="rounded-lg border bg-background p-4 space-y-4">
             <div className="flex justify-between items-start">
                <div className="flex-grow space-y-4 pr-4">
                    <FormField
                        control={form.control}
                        name={`rubric.${criterionIndex}.criterionTitle`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Criterion Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Clarity" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`rubric.${criterionIndex}.criterionDescription`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Criterion Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe what this criterion is evaluating." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCriterion(criterionIndex)}>
                    <Trash2 className="h-5 w-5 text-destructive"/>
                    <span className="sr-only">Remove Criterion</span>
                </Button>
             </div>
            <Separator />
            <div className="space-y-2">
                <Label>Performance Levels</Label>
                <div className="flex items-start gap-4 overflow-x-auto pb-4">
                    {fields.map((level, levelIndex) => (
                        <div key={level.id} className="shrink-0 w-64 bg-muted/50 p-3 rounded-md space-y-3 relative">
                            <FormField
                                control={form.control}
                                name={`rubric.${criterionIndex}.levels.${levelIndex}.points`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Points</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Points" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`rubric.${criterionIndex}.levels.${levelIndex}.levelTitle`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Level Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Excellent" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`rubric.${criterionIndex}.levels.${levelIndex}.levelDescription`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe this level" {...field} rows={3}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end pt-2">
                                <Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(levelIndex)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <div className="shrink-0">
                         <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-full w-12"
                            onClick={() => append({ points: 0, levelTitle: "", levelDescription: "" })}
                        >
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function EditAssignmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditAssignmentPageContent />
        </Suspense>
    )
}
