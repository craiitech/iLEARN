
"use client";

import { QuizCreator } from "@/components/quiz/quiz-creator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lightbulb, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

function NewQuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');
  const { user, firestore, isUserLoading } = useFirebase();

  const courseRef = useMemo(() => {
    if (isUserLoading || !user || !courseId) return null;
    return doc(firestore, `users/${user.uid}/courses`, courseId);
  }, [firestore, user, courseId, isUserLoading]);

  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="outline" size="sm" onClick={() => router.back()}>
                <Link href="#"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
            </Button>
         </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <h1 className="text-3xl font-headline font-bold mb-6">AI Quiz Generator</h1>
            {isCourseLoading && !course ? (
              <div className="flex items-center justify-center p-8 border rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
              </div>
            ) : (
              <QuizCreator courseId={courseId} course={course} />
            )}
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
    </div>
  );
}


export default function NewQuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewQuizPageContent />
    </Suspense>
  )
}
