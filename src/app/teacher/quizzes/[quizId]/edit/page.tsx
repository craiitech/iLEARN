
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Wand2, CheckCircle, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useFirebase, useDoc } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Suspense } from "react";
import Link from "next/link";
import { QuizEditor } from "@/components/quiz/quiz-editor";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z.number().min(1).max(10),
  gradingPeriod: z.string().min(1, "You must select a grading period."),
});

function EditQuizPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const quizId = params.quizId as string;
  const courseId = searchParams.get('courseId');

  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const quizRef = useMemo(() => {
    if (isUserLoading || !user || !courseId || !quizId) return null;
    return doc(firestore, `users/${user.uid}/courses/${courseId}/quizzes`, quizId);
  }, [firestore, user, courseId, quizId, isUserLoading]);

  const { data: quiz, isLoading: isQuizLoading } = useDoc(quizRef);

  const courseRef = useMemo(() => {
    if (isUserLoading || !user || !courseId) return null;
    return doc(firestore, `users/${user.uid}/courses`, courseId);
  }, [firestore, user, courseId, isUserLoading]);

  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  if (isQuizLoading || isCourseLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!quiz) {
    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold">Quiz not found</h2>
            <p className="text-muted-foreground">This quiz may have been deleted.</p>
             <Button asChild variant="outline" className="mt-4">
                <Link href={courseId ? `/teacher/courses/${courseId}` : '/teacher/quizzes'}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
            </Button>
        </div>
    )
  }

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href={courseId ? `/teacher/courses/${courseId}` : '/teacher/quizzes'}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
            </Button>
         </div>
        <h1 className="text-3xl font-headline font-bold mb-6">Edit Quiz</h1>
        {quizRef && course && <QuizEditor quizRef={quizRef} initialQuiz={quiz} course={course} />}
    </div>
  );
}

export default function EditQuizPage() {
    return (
        <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <EditQuizPageContent />
        </Suspense>
    )
}
