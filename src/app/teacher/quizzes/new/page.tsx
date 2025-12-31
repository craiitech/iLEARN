import { QuizCreator } from "@/components/quiz/quiz-creator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function NewQuizPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-headline font-bold mb-6">AI Quiz Generator</h1>
        <QuizCreator />
      </div>
      <div className="lg:col-span-1">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-start gap-3">
             <Lightbulb className="h-6 w-6 text-primary mt-1"/>
            <div>
              <CardTitle className="text-primary">How it works</CardTitle>
              <CardDescription className="text-primary/80">Let our AI assistant help you.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Our GenAI-powered assistant helps you create engaging quizzes in seconds.
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Enter a topic for your quiz.</li>
              <li>Select a difficulty level.</li>
              <li>Choose the number of questions.</li>
              <li>Click "Generate" and let the AI do the work.</li>
            </ol>
            <p>
              You can then review, edit, and save the generated quiz to your library.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
