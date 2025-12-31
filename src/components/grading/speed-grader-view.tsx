"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Submission = {
  student: { name: string; email: string };
  assignment: { title: string };
  submittedAt: Date;
  submissionUrl: string;
  grade: number | null;
  feedback: string[];
};

type RubricCriterion = { name: string; points: number; description: string };

type Rubric = {
  criteria: RubricCriterion[];
};

type Props = {
  submission: Submission;
  rubric: Rubric;
  commentBank: string[];
};

export function SpeedGraderView({ submission, rubric, commentBank }: Props) {
  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [finalGrade, setFinalGrade] = useState<string>("");

  const totalPoints = useMemo(() => rubric.criteria.reduce((sum, crit) => sum + crit.points, 0), [rubric.criteria]);

  const calculatedGrade = useMemo(() => {
    return rubric.criteria.reduce((sum, crit) => {
        if (selectedCriteria.has(crit.name)) {
            return sum + crit.points;
        }
        return sum;
    }, 0);
  }, [selectedCriteria, rubric.criteria]);

  useEffect(() => {
    setFinalGrade(calculatedGrade.toString());
  }, [calculatedGrade]);

  const handleCriterionToggle = (criterionName: string) => {
    setSelectedCriteria(prev => {
        const newSet = new Set(prev);
        if (newSet.has(criterionName)) {
            newSet.delete(criterionName);
        } else {
            newSet.add(criterionName);
        }
        return newSet;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh_-_theme(space.14))] lg:h-screen">
      <header className="flex items-center justify-between p-4 border-b bg-background z-10 shrink-0">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" aria-label="Previous Student"><ChevronLeft/></Button>
            <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${submission.student.name}/40/40`} data-ai-hint="person"/>
                <AvatarFallback>{submission.student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{submission.student.name}</p>
                <p className="text-sm text-muted-foreground">{submission.assignment.title}</p>
            </div>
            <Button variant="outline" size="icon" aria-label="Next Student"><ChevronRight/></Button>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Label htmlFor="grade-input">Grade</Label>
                <Input id="grade-input" value={finalGrade} onChange={e => setFinalGrade(e.target.value)} className="w-24" placeholder="N/A" />
                <span className="text-muted-foreground">/ {totalPoints}</span>
            </div>
            <Button>Update Grade</Button>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        <div className="lg:col-span-2 bg-muted/20 h-full overflow-auto">
           <iframe src={submission.submissionUrl.replace('/edit?usp=sharing', '/preview')} className="w-full h-full border-0" title="Student Submission Preview"/>
        </div>
        <div className="lg:col-span-1 flex flex-col h-full bg-background border-l">
            <Tabs defaultValue="rubric" className="flex flex-col flex-1 overflow-y-hidden">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b shrink-0">
                    <TabsTrigger value="rubric">Rubric</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
                <TabsContent value="rubric" className="flex-1 overflow-y-auto p-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interactive Rubric</CardTitle>
                            <CardDescription>Click criteria to assign points.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                {rubric.criteria.map((crit, index) => (
                                    <div key={index} onClick={() => handleCriterionToggle(crit.name)} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                        <Checkbox checked={selectedCriteria.has(crit.name)} id={`crit-${index}`} className="mt-1" />
                                        <div className="grid gap-1.5 flex-1">
                                            <Label htmlFor={`crit-${index}`} className="font-semibold cursor-pointer">{crit.name}</Label>
                                            <p className="text-sm text-muted-foreground">{crit.description}</p>
                                        </div>
                                        <div className="ml-auto font-bold text-lg text-primary">{crit.points}</div>
                                    </div>
                                ))}
                             </div>
                             <Separator className="my-4"/>
                             <div className="flex justify-end items-center font-bold text-lg">
                                 Total: <span className="ml-2">{calculatedGrade} / {totalPoints} pts</span>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="comments" className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                    <div className="space-y-2">
                        <Label htmlFor="feedback-textarea" className="font-semibold">Feedback Comments</Label>
                        <Textarea id="feedback-textarea" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide detailed feedback..." className="min-h-[150px]"/>
                    </div>
                     <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">Comment Bank</CardTitle>
                            <CardDescription className="text-sm">Click to add a common comment.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                            {commentBank.map((comment, index) => (
                                <button key={index} onClick={() => setFeedback(prev => prev ? `${prev}\n${comment}` : comment)} className="flex items-start gap-2 text-left w-full p-2 rounded-md hover:bg-secondary text-sm text-muted-foreground">
                                    <PlusCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary"/>
                                    <span>{comment}</span>
                                </button>
                            ))}
                        </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
