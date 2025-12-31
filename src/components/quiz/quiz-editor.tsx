
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Save, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { DocumentReference } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const questionSchema = z.object({
  question: z.string().min(1, "Question text is required."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).min(2, "Must have at least 2 options."),
  correctAnswer: z.string().min(1, "A correct answer must be selected."),
});

const quizFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  gradingPeriod: z.string().min(1, "Grading period is required."),
  questions: z.array(questionSchema),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

type QuizEditorProps = {
  initialQuiz: any;
  quizRef: DocumentReference;
  course: any;
};

export function QuizEditor({ initialQuiz, quizRef, course }: QuizEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      gradingPeriod: "",
      questions: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  useEffect(() => {
    if (initialQuiz) {
      form.reset({
        title: initialQuiz.title,
        gradingPeriod: initialQuiz.gradingPeriod,
        questions: initialQuiz.questions,
      });
    }
  }, [initialQuiz, form.reset]);

  async function onSave(values: QuizFormValues) {
    setIsSaving(true);
    try {
      const pointsPossible = values.questions.length * 10; // Assuming 10 points per question
      const dataToSave = {
        ...values,
        pointsPossible,
      };

      updateDocumentNonBlocking(quizRef, dataToSave);

      toast({
        title: "Quiz Updated!",
        description: `"${values.title}" has been successfully updated.`,
      });

      router.push(`/teacher/courses/${course.id}`);

    } catch (error) {
      console.error("Error updating quiz:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not update the quiz in the database.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const addQuestion = () => {
    append({
        question: "",
        options: ["", ""],
        correctAnswer: ""
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Edit the title and grading period for this quiz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quiz Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., The Renaissance" {...field} />
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
                            <SelectTrigger disabled={!course?.gradingPolicy}>
                                <SelectValue placeholder="Select a term for this quiz" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Edit the questions for this quiz. Mark the correct answer for each.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Accordion type="multiple" className="w-full space-y-4">
                {fields.map((field, index) => (
                    <AccordionItem value={`item-${index}`} key={field.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="py-4">
                            <div className="flex justify-between w-full items-center pr-4">
                                <span>Question {index + 1}</span>
                                <Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => {e.stopPropagation(); remove(index)}}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pb-4">
                            <FormField
                                control={form.control}
                                name={`questions.${index}.question`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Text</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`questions.${index}.correctAnswer`}
                                render={({ field: radioField }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Options (select the correct answer)</FormLabel>
                                        <FormControl>
                                             <RadioGroup
                                                onValueChange={radioField.onChange}
                                                value={radioField.value}
                                                className="flex flex-col space-y-2"
                                            >
                                                {form.getValues(`questions.${index}.options`).map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={option} id={`q-${index}-o-${optionIndex}`} />
                                                        <Input 
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...form.getValues(`questions.${index}.options`)];
                                                                const oldOptionValue = newOptions[optionIndex];
                                                                newOptions[optionIndex] = e.target.value;
                                                                // If this was the correct answer, update the correct answer value as well
                                                                if (form.getValues(`questions.${index}.correctAnswer`) === oldOptionValue) {
                                                                    form.setValue(`questions.${index}.correctAnswer`, e.target.value);
                                                                }
                                                                form.setValue(`questions.${index}.options`, newOptions);
                                                            }}
                                                            className="flex-1"
                                                        />
                                                         <Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => {
                                                             const newOptions = form.getValues(`questions.${index}.options`).filter((_, i) => i !== optionIndex);
                                                             form.setValue(`questions.${index}.options`, newOptions);
                                                         }}>
                                                            <Trash2 className="h-4 w-4" />
                                                         </Button>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                         <Button type="button" variant="outline" size="sm" onClick={() => {
                                             const newOptions = [...form.getValues(`questions.${index}.options`), ""];
                                             form.setValue(`questions.${index}.options`, newOptions);
                                         }}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add Option
                                        </Button>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
                 <Button type="button" variant="outline" onClick={addQuestion}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Question
                </Button>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}

    