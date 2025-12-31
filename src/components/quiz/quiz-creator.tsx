

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  generateQuizQuestions,
  type GenerateQuizQuestionsOutput,
} from "@/ai/flows/generate-quiz-questions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Wand2, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z.number().min(1).max(10),
  gradingPeriod: z.string().min(1, "You must select a grading period."),
});

type QuizCreatorProps = {
  courseId: string | null;
  course: any;
};

export function QuizCreator({ courseId, course }: QuizCreatorProps) {
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      difficulty: "medium",
      numberOfQuestions: 5,
      gradingPeriod: "",
    },
  });

  async function onGenerate(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setGeneratedQuiz(null);
    try {
      const result = await generateQuizQuestions({
          topic: values.topic,
          difficulty: values.difficulty,
          numberOfQuestions: values.numberOfQuestions
      });
      setGeneratedQuiz(result);
      setQuizTitle(`Quiz: ${values.topic}`);
      toast({
        title: "Quiz Generated!",
        description: "Your new quiz is ready for review.",
      });
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating your quiz. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSave() {
    if (!generatedQuiz || !courseId || !firestore || !user) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Cannot save quiz. Ensure you are logged in and have a course selected.",
      });
      return;
    }
    const gradingPeriod = form.getValues("gradingPeriod");
    if (!gradingPeriod) {
       toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Please select a grading period before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const quizzesCollection = collection(firestore, `users/${user.uid}/courses/${courseId}/quizzes`);
      const pointsPossible = generatedQuiz.questions.length * 10; // Assuming 10 points per question

      await addDocumentNonBlocking(quizzesCollection, {
        title: quizTitle,
        courseId,
        gradingPeriod,
        questions: generatedQuiz.questions,
        pointsPossible,
        createdAt: new Date(),
      });
      
      toast({
        title: "Quiz Saved!",
        description: `"${quizTitle}" has been added to the course.`,
      });

      router.push(`/teacher/courses/${courseId}`);

    } catch (error) {
      console.error("Error saving quiz:", error);
       toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the quiz to the database.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Provide the details for the quiz you want to generate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Renaissance, React Hooks, Photosynthesis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="numberOfQuestions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Number of Questions ({field.value})</FormLabel>
                            <FormControl>
                                <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="gradingPeriod"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Grading Period</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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

              <Button type="submit" disabled={isGenerating} size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="text-center p-8 flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">The AI is thinking... this may take a moment.</p>
        </div>
      )}

      {generatedQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Quiz: Review & Save</CardTitle>
            <CardDescription>Review the questions and answers. You can edit them before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input 
                id="quiz-title" 
                value={quizTitle} 
                onChange={(e) => setQuizTitle(e.target.value)} 
                placeholder="Enter a title for your quiz"
              />
            </div>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {generatedQuiz.questions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>Question {index + 1}: {q.question}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-2">
                      {q.options.map((option, i) => (
                        <li key={i} className="flex items-center text-sm p-2 rounded-md"
                          >
                          {option === q.correctAnswer ? (
                            <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-accent" />
                          ) : (
                            <div className="w-4 h-4 mr-2 flex-shrink-0" />
                          )}
                          <span className={cn(option === q.correctAnswer && "font-semibold text-foreground")}>
                            {option}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGeneratedQuiz(null)}>Discard</Button>
                <Button onClick={onSave} disabled={!courseId || isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                  Save to Course
                </Button>
            </div>
            {!courseId && (
              <p className="text-sm text-destructive text-right mt-2">
                Cannot save: No course context. Please launch from a course page.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    