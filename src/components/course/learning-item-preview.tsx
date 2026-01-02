
"use client";

import { useState } from "react";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Pencil, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getEditUrl, type LearningPathItem } from "@/app/teacher/courses/[courseId]/page";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

type LearningItemPreviewDialogProps = {
  item: LearningPathItem | null;
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LearningItemPreviewDialog({ item, courseId, open, onOpenChange }: LearningItemPreviewDialogProps) {
  const { firestore, user } = useFirebase();

  let subcollectionName = '';
  if (item) {
    switch(item.type) {
        case 'Lesson': subcollectionName = 'lessons'; break;
        case 'Quiz': subcollectionName = 'quizzes'; break;
        default: subcollectionName = 'assignments'; break;
    }
  }

  const itemRef = useMemoFirebase(() => {
    if (!user || !courseId || !item || !subcollectionName) return null;
    return doc(firestore, `users/${user.uid}/courses/${courseId}/${subcollectionName}`, item.id);
  }, [firestore, user, courseId, item, subcollectionName]);

  const { data: itemData, isLoading } = useDoc(itemRef);

  const editUrl = item ? getEditUrl(courseId, item) : '#';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item?.title}</DialogTitle>
          <DialogDescription>
            Previewing '{item?.type}' from the learning path.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
            <div className="py-4 space-y-6">
            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {!isLoading && itemData && (
                <>
                {item?.type === 'Lesson' && <LessonPreviewContent lesson={itemData} />}
                {item?.type === 'Quiz' && <QuizPreviewContent quiz={itemData} />}
                {item?.type.includes('Assignment') && <AssignmentPreviewContent assignment={itemData} />}
                {item?.type.includes('Activity') && <AssignmentPreviewContent assignment={itemData} />}
                {item?.type.includes('Exercise') && <AssignmentPreviewContent assignment={itemData} />}
                </>
            )}
            {!isLoading && !itemData && (
                <div className="text-center text-muted-foreground">
                    Could not load item content.
                </div>
            )}
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button asChild>
                <Link href={editUrl}>
                    <Pencil className="mr-2 h-4 w-4"/> Edit Item
                </Link>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{children}</div>
            <Separator/>
        </div>
    )
}

function LessonPreviewContent({ lesson }: { lesson: any }) {
    return (
        <div className="space-y-4">
            <Section title="Grading Period"><p>{lesson.gradingPeriod}</p></Section>
            <Section title="Learning Outcome"><p>{lesson.learningOutcome}</p></Section>
            <Section title="Objectives"><div dangerouslySetInnerHTML={{ __html: lesson.objectives?.replace(/\n/g, '<br/>') }} /></Section>
            <Section title="Lesson Content"><div dangerouslySetInnerHTML={{ __html: lesson.content?.replace(/\n/g, '<br/>') }} /></Section>
            {lesson.sdgIntegration && <Section title="SDG Integration"><p>{lesson.sdgIntegration}</p></Section>}
            {lesson.internationalization && <Section title="Internationalization"><p>{lesson.internationalization}</p></Section>}
        </div>
    )
}

function QuizPreviewContent({ quiz }: { quiz: any }) {
    return (
        <div className="space-y-4">
             <Section title="Grading Period"><p>{quiz.gradingPeriod}</p></Section>
             <Section title="Points Possible"><p>{quiz.pointsPossible || quiz.questions.length * 10}</p></Section>
             <h3 className="text-lg font-semibold text-primary">Questions</h3>
             <div className="space-y-4">
                {quiz.questions.map((q: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                           {q.options.map((opt: string, i: number) => (
                               <li key={i} className={`flex items-center ${opt === q.correctAnswer ? 'font-semibold text-accent' : ''}`}>
                                   <Checkbox checked={opt === q.correctAnswer} readOnly className="mr-2" />
                                   {opt}
                               </li>
                           ))}
                        </ul>
                    </div>
                ))}
             </div>
        </div>
    )
}

function AssignmentPreviewContent({ assignment }: { assignment: any }) {
    const totalPoints = assignment.rubric?.reduce((total: number, criterion: any) => {
        const maxPointsInCriterion = criterion.levels.reduce((max: number, level: any) => Math.max(max, level.points || 0), 0);
        return total + maxPointsInCriterion;
    }, 0) || assignment.pointsPossible || 0;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-baseline">
                <Section title="Grading Period"><p>{assignment.gradingPeriod}</p></Section>
                <p className="text-lg font-bold">Total Points: <span className="text-primary">{totalPoints}</span></p>
            </div>
            {assignment.description && <Section title="General Instructions"><div dangerouslySetInnerHTML={{ __html: assignment.description?.replace(/\n/g, '<br/>') }} /></Section>}
            {assignment.objectives && <Section title="Learning Objectives"><div dangerouslySetInnerHTML={{ __html: assignment.objectives?.replace(/\n/g, '<br/>') }} /></Section>}
            {assignment.deliverables && <Section title="Expected Deliverables"><div dangerouslySetInnerHTML={{ __html: assignment.deliverables?.replace(/\n/g, '<br/>') }} /></Section>}
            
            {assignment.rubric && assignment.rubric.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">Grading Rubric</h3>
                     <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Criterion</TableHead>
                                    <TableHead>Performance Levels</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignment.rubric.map((crit: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="align-top">
                                            <p className="font-medium">{crit.criterionTitle}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{crit.criterionDescription}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {crit.levels.map((level: any, i: number) => (
                                                     <div key={i} className="p-2 rounded-md bg-muted/50 flex-1">
                                                         <p className="font-semibold text-xs">{level.levelTitle} ({level.points} pts)</p>
                                                         <p className="text-xs text-muted-foreground mt-1">{level.levelDescription}</p>
                                                     </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                 </div>
            )}
        </div>
    )
}

    