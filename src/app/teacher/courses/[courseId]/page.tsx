

"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GripVertical, FileText, FileQuestion, Pencil, Trash2, PlusCircle, ExternalLink, Loader2, BookCopy } from "lucide-react";
import Link from "next/link";
import { useFirebase, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { FileCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { CreateBlockDialog } from "@/components/course/create-block-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GradingPolicyEditor } from "@/components/course/grading-policy-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const typeIcons = {
    Lesson: <FileText className="h-5 w-5 text-muted-foreground" />,
    Quiz: <FileQuestion className="h-5 w-5 text-muted-foreground" />,
    Assignment: <FileCheck className="h-5 w-5 text-muted-foreground" />
}

type LearningPathItem = {
    id: string;
    title: string;
    createdAt: { toDate: () => Date };
    type: 'Lesson' | 'Quiz' | 'Assignment';
}

export default function CourseDetailPage() {
    const { firestore, user } = useFirebase();
    const params = useParams();
    const courseId = params.courseId as string;

    const courseRef = useMemoFirebase(() => {
        if (!user || !courseId) return null;
        return doc(firestore, `users/${user.uid}/courses`, courseId);
    }, [firestore, user, courseId]);

    const blocksQuery = useMemoFirebase(() => {
        if(!courseRef) return null;
        return query(collection(courseRef, 'blocks'));
    }, [courseRef]);
    
    const lessonsQuery = useMemoFirebase(() => {
        if (!courseRef) return null;
        return query(collection(courseRef, 'lessons'), orderBy('createdAt', 'asc'));
    }, [courseRef]);

    const assignmentsQuery = useMemoFirebase(() => {
        if (!courseRef) return null;
        return query(collection(courseRef, 'assignments'), orderBy('createdAt', 'asc'));
    }, [courseRef]);

    const quizzesQuery = useMemoFirebase(() => {
        if (!courseRef) return null;
        return query(collection(courseRef, 'quizzes'), orderBy('createdAt', 'asc'));
    }, [courseRef]);

    const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);
    const { data: blocks, isLoading: areBlocksLoading } = useCollection(blocksQuery);
    const { data: lessons, isLoading: areLessonsLoading } = useCollection(lessonsQuery);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection(assignmentsQuery);
    const { data: quizzes, isLoading: areQuizzesLoading } = useCollection(quizzesQuery);

    const learningPath: LearningPathItem[] = useMemo(() => {
        const allItems = [
            ...(lessons?.map(item => ({ ...item, type: 'Lesson' as const })) || []),
            ...(assignments?.map(item => ({ ...item, type: 'Assignment' as const })) || []),
            ...(quizzes?.map(item => ({ ...item, type: 'Quiz' as const })) || []),
        ];

        // Sort by 'createdAt' timestamp
        return allItems.sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateA.getTime() - dateB.getTime();
        });
    }, [lessons, assignments, quizzes]);

    const isPathLoading = areLessonsLoading || areAssignmentsLoading || areQuizzesLoading;
    const isLabCourse = course?.courseType === 'laboratory' || course?.courseType === 'lec_lab';


    if (isCourseLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center">
                <h2 className="text-xl font-semibold">Course not found</h2>
                <p className="text-muted-foreground">This course may have been deleted or you may not have permission to view it.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/teacher/courses"><ArrowLeft className="mr-2 h-4 w-4"/>Back to All Courses</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-0 space-y-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Button asChild variant="outline" size="sm" className="mb-2">
                        <Link href="/teacher/courses"><ArrowLeft className="mr-2 h-4 w-4"/>Back to All Courses</Link>
                    </Button>
                    <h1 className="text-3xl font-headline font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">Manage the master curriculum and specific course blocks.</p>
                </div>
                 <div className="flex items-center gap-2">
                     <Button asChild variant="secondary">
                        <Link href={course.syllabusLink} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4"/>
                            View Syllabus
                        </Link>
                    </Button>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Course Blocks</CardTitle>
                                <CardDescription>Individual sections for this course blueprint.</CardDescription>
                            </div>
                            {courseRef && <CreateBlockDialog courseRef={courseRef} />}
                        </CardHeader>
                        <CardContent>
                            {areBlocksLoading && <Loader2 className="h-6 w-6 animate-spin" />}
                            {!areBlocksLoading && blocks && blocks.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Block Code</TableHead>
                                            <TableHead>Schedule</TableHead>
                                            <TableHead>Students</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {blocks.map((block) => (
                                            <TableRow key={block.id}>
                                                <TableCell className="font-medium">{block.blockCode}</TableCell>
                                                <TableCell>{block.schedule}</TableCell>
                                                <TableCell>0</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm">Manage</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                             {!areBlocksLoading && (!blocks || blocks.length === 0) && (
                                <div className="text-center p-8 flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed">
                                     <BookCopy className="h-12 w-12 text-muted-foreground" />
                                     <h3 className="text-lg font-semibold">No Blocks Created</h3>
                                     <p className="text-muted-foreground text-sm max-w-sm mx-auto">Create the first block for this course to set a schedule and enroll students.</p>
                                     {courseRef && <CreateBlockDialog courseRef={courseRef} />}
                                 </div>
                             )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Master Learning Path</CardTitle>
                                <CardDescription>Add and arrange items for all blocks of this course.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/teacher/courses/${courseId}/lessons/new`}>Lesson</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/teacher/quizzes/new?courseId=${courseId}`}>Quiz</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/teacher/courses/${courseId}/assignments/new?type=Activity`}>Activity</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                             <Link href={`/teacher/courses/${courseId}/assignments/new?type=Exercise`}>Exercise</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild disabled={!isLabCourse}>
                                            <Link href={`/teacher/courses/${courseId}/assignments/new?type=Lab%20Activity`}>Lab Activity</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flow-root">
                                {isPathLoading ? (
                                     <div className="text-center p-8 flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed">
                                       <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                       <p className="text-muted-foreground text-sm">Loading curriculum...</p>
                                   </div>
                                ) : learningPath.length > 0 ? (
                                  <ul className="space-y-3">
                                      {learningPath.map((item) => (
                                          <li key={item.id} className="flex items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
                                              <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                                              {typeIcons[item.type]}
                                              <span className="flex-grow font-medium">{item.title}</span>
                                              <span className="text-sm text-muted-foreground">{item.type}</span>
                                              <div className="flex items-center gap-2">
                                                  <Button variant="ghost" size="icon">
                                                      <Pencil className="h-4 w-4" />
                                                      <span className="sr-only">Edit</span>
                                                  </Button>
                                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                      <Trash2 className="h-4 w-4" />
                                                       <span className="sr-only">Delete</span>
                                                  </Button>
                                              </div>
                                          </li>
                                      ))}
                                  </ul>
                                ) : (
                                    <div className="text-center p-8 flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed">
                                       <h3 className="text-lg font-semibold">Empty Learning Path</h3>
                                       <p className="text-muted-foreground text-sm">Add lessons, quizzes, and assignments to build the curriculum.</p>
                                   </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    {courseRef && <GradingPolicyEditor courseRef={courseRef} initialPolicy={course.gradingPolicy} />}
                </div>
            </div>
        </div>
    );
}
