
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GripVertical, FileText, FileQuestion, Pencil, Trash2, PlusCircle, ExternalLink, Loader2, BookCopy, ChevronsUpDown, Eye, Tags } from "lucide-react";
import Link from "next/link";
import { useFirebase, useDoc, useCollection } from "@/firebase";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { LearningItemPreviewDialog } from "@/components/course/learning-item-preview";
import { Badge } from "@/components/ui/badge";


const typeIcons = {
    Lesson: <FileText className="h-5 w-5 text-muted-foreground" />,
    Quiz: <FileQuestion className="h-5 w-5 text-muted-foreground" />,
    Assignment: <FileCheck className="h-5 w-5 text-muted-foreground" />,
    Activity: <FileCheck className="h-5 w-5 text-muted-foreground" />,
    Exercise: <FileCheck className="h-5 w-5 text-muted-foreground" />,
    "Lab Activity": <FileCheck className="h-5 w-g text-muted-foreground" />
}

export type LearningPathItem = {
    id: string;
    title: string;
    createdAt: { toDate: () => Date };
    type: 'Lesson' | 'Quiz' | 'Assignment' | 'Activity' | 'Exercise' | 'Lab Activity';
    gradingPeriod: string;
    visibleInBlocks?: string[];
}

export function getEditUrl(courseId: string, item: LearningPathItem) {
    switch (item.type) {
        case 'Lesson':
            return `/teacher/courses/${courseId}/lessons/${item.id}/edit`;
        case 'Quiz':
            return `/teacher/quizzes/${item.id}/edit?courseId=${courseId}`;
        case 'Assignment':
        case 'Activity':
        case 'Exercise':
        case 'Lab Activity':
            return `/teacher/courses/${courseId}/assignments/${item.id}/edit?type=${item.type}`;
        default:
            return '#';
    }
}

export default function CourseDetailPage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const params = useParams();
    const courseId = params.courseId as string;
    const [isPolicyOpen, setIsPolicyOpen] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<LearningPathItem | null>(null);
    const [previewItem, setPreviewItem] = useState<LearningPathItem | null>(null);
    const { toast } = useToast();

    const courseRef = useMemo(() => {
        if (isUserLoading || !user) return null;
        return doc(firestore, `users/${user.uid}/courses`, courseId);
    }, [firestore, user, courseId, isUserLoading]);

    const blocksQuery = useMemo(() => {
        if (!courseRef || isUserLoading) return null;
        return query(collection(courseRef, 'blocks'));
    }, [courseRef, isUserLoading]);
    
    const lessonsQuery = useMemo(() => {
        if (!courseRef || isUserLoading) return null;
        return query(collection(courseRef, 'lessons'), orderBy('createdAt', 'asc'));
    }, [courseRef, isUserLoading]);

    const assignmentsQuery = useMemo(() => {
        if (!courseRef || isUserLoading) return null;
        return query(collection(courseRef, 'assignments'), orderBy('createdAt', 'asc'));
    }, [courseRef, isUserLoading]);

    const quizzesQuery = useMemo(() => {
        if (!courseRef || isUserLoading) return null;
        return query(collection(courseRef, 'quizzes'), orderBy('createdAt', 'asc'));
    }, [courseRef, isUserLoading]);

    const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);
    const { data: blocks, isLoading: areBlocksLoading } = useCollection(blocksQuery);
    const { data: lessons, isLoading: areLessonsLoading } = useCollection(lessonsQuery);
    const { data: assignments, isLoading: areAssignmentsLoading } = useCollection(assignmentsQuery);
    const { data: quizzes, isLoading: areQuizzesLoading } = useCollection(quizzesQuery);

    const blockIdToCodeMap = useMemo(() => {
        if (!blocks) return {};
        return blocks.reduce((acc, block) => {
            acc[block.id] = block.blockCode;
            return acc;
        }, {} as Record<string, string>);
    }, [blocks]);

    const learningPathByTerm = useMemo(() => {
        const allItems: LearningPathItem[] = [
            ...(lessons?.map(item => ({ ...item, type: 'Lesson' as const })) || []),
            ...(assignments?.map(item => ({ ...item, type: item.type as any })) || []),
            ...(quizzes?.map(item => ({ ...item, type: 'Quiz' as const })) || []),
        ];

        // Sort by 'createdAt' timestamp first
        const sortedItems = allItems.sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            return dateA.getTime() - dateB.getTime();
        });

        // Then group by gradingPeriod
        return sortedItems.reduce((acc, item) => {
            const term = item.gradingPeriod || 'Uncategorized';
            if (!acc[term]) {
                acc[term] = [];
            }
            acc[term].push(item);
            return acc;
        }, {} as Record<string, LearningPathItem[]>);

    }, [lessons, assignments, quizzes]);

    const isPathLoading = areLessonsLoading || areAssignmentsLoading || areQuizzesLoading;
    const isLabCourse = course?.courseType === 'laboratory' || course?.courseType === 'lec_lab';

    const handleDelete = () => {
        if (!itemToDelete || !courseRef) return;
        
        let subcollectionName = '';
        switch(itemToDelete.type) {
            case 'Lesson':
                subcollectionName = 'lessons';
                break;
            case 'Quiz':
                subcollectionName = 'quizzes';
                break;
            case 'Assignment':
            case 'Activity':
            case 'Exercise':
            case 'Lab Activity':
                subcollectionName = 'assignments';
                break;
        }

        if (subcollectionName) {
            const itemRef = doc(collection(courseRef, subcollectionName), itemToDelete.id);
            deleteDocumentNonBlocking(itemRef);
            toast({
                title: "Item Deleted",
                description: `"${itemToDelete.title}" has been removed from the learning path.`
            });
        }

        setItemToDelete(null);
    }


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
    
    const orderedTerms = course?.gradingPolicy?.map((p: any) => p.term) || [];
    const allTerms = [...new Set([...orderedTerms, ...Object.keys(learningPathByTerm)])];


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
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/teacher/courses/${courseId}/blocks/${block.id}`}>Manage</Link>
                                                    </Button>
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
                                        <DropdownMenuItem asChild>
                                             <Link href={`/teacher/courses/${courseId}/assignments/new?type=Assignment`}>Assignment</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                             {isPathLoading ? (
                                     <div className="text-center p-8 flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed">
                                       <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                       <p className="text-muted-foreground text-sm">Loading curriculum...</p>
                                   </div>
                                ) : allTerms.every(term => !learningPathByTerm[term] || learningPathByTerm[term].length === 0) ? (
                                    <div className="text-center p-8 flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed">
                                       <h3 className="text-lg font-semibold">Empty Learning Path</h3>
                                       <p className="text-muted-foreground text-sm">Add lessons, quizzes, and assignments to build the curriculum.</p>
                                   </div>
                                ) : (
                                    <Accordion type="multiple" className="w-full" defaultValue={allTerms}>
                                        {allTerms.map(term => learningPathByTerm[term] && learningPathByTerm[term].length > 0 && (
                                            <AccordionItem value={term} key={term}>
                                                <AccordionTrigger className="text-lg font-semibold">{term}</AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="space-y-3 pl-2 pt-2">
                                                      {learningPathByTerm[term].map((item) => (
                                                          <li key={item.id} className="flex items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
                                                              <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                                                              {typeIcons[item.type]}
                                                              <div className="flex-grow">
                                                                <span className="font-medium">{item.title}</span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Tags className="h-3 w-3 text-muted-foreground"/>
                                                                    {item.visibleInBlocks && item.visibleInBlocks.length > 0 ? (
                                                                        item.visibleInBlocks.map(blockId => (
                                                                            <Badge key={blockId} variant="secondary">{blockIdToCodeMap[blockId] || 'Unknown Block'}</Badge>
                                                                        ))
                                                                    ) : (
                                                                        <Badge variant="outline">All Blocks</Badge>
                                                                    )}
                                                                </div>
                                                              </div>
                                                              <span className="text-sm text-muted-foreground">{item.type}</span>
                                                              <div className="flex items-center gap-2">
                                                                  <Button variant="outline" size="sm" onClick={() => setPreviewItem(item)}>
                                                                      <Eye className="mr-2 h-4 w-4" />
                                                                      Preview
                                                                  </Button>
                                                                  <Button variant="ghost" size="icon" asChild>
                                                                    <Link href={getEditUrl(courseId, item)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                        <span className="sr-only">Edit</span>
                                                                    </Link>
                                                                  </Button>
                                                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setItemToDelete(item)}>
                                                                      <Trash2 className="h-4 w-4" />
                                                                       <span className="sr-only">Delete</span>
                                                                  </Button>
                                                              </div>
                                                          </li>
                                                      ))}
                                                  </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Collapsible open={isPolicyOpen} onOpenChange={setIsPolicyOpen}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-x-2">
                                <div>
                                    <CardTitle>Grading Policy</CardTitle>
                                    <CardDescription>Define grading terms and their weights.</CardDescription>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                        <ChevronsUpDown className="h-4 w-4" />
                                        <span className="sr-only">Toggle</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                {courseRef && <GradingPolicyEditor courseRef={courseRef} initialPolicy={course.gradingPolicy} onSaveSuccess={() => setIsPolicyOpen(false)} />}
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </div>
            </div>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the item
                        <span className="font-bold"> "{itemToDelete?.title}"</span>.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {previewItem && courseRef && (
                 <LearningItemPreviewDialog
                    item={previewItem}
                    courseId={courseId}
                    open={!!previewItem}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setPreviewItem(null);
                        }
                    }}
                 />
            )}
        </div>
    );
}
