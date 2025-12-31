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
import { Loader2, Wand2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z.number().min(1).max(10),
});

export function QuizCreator() {
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      difficulty: "medium",
      numberOfQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedQuiz(null);
    try {
      const result = await generateQuizQuestions(values);
      setGeneratedQuiz(result);
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
      setIsLoading(false);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
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

      {isLoading && (
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
          <CardContent>
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
                <Button variant="outline">Discard</Button>
                <Button>Save Quiz</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
