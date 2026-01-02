
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Users, ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFirebase, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

function BlockDetailPage() {
    const params = useParams();
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const courseId = params.courseId as string;
    const blockId = params.blockId as string;

    const blockRef = useMemoFirebase(() => {
        if (!user || !courseId || !blockId) return null;
        return doc(firestore, `users/${user.uid}/courses/${courseId}/blocks`, blockId);
    }, [firestore, user, courseId, blockId]);

    const { data: block, isLoading: isBlockLoading } = useDoc(blockRef);

    const enrollmentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "enrollments"), where("blockId", "==", blockId));
    }, [firestore, blockId]);

    const { data: enrollments, isLoading: areEnrollmentsLoading } = useCollection(enrollmentsQuery);

    // In a real app, you would fetch user profiles based on the studentId in enrollments.
    // For now, we will display the student ID.
    
    const copyToClipboard = () => {
        if (block?.blockCode) {
            navigator.clipboard.writeText(block.blockCode);
            toast({
                title: "Copied to Clipboard",
                description: `Block code ${block.blockCode} has been copied.`
            });
        }
    };


    if (isBlockLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!block) {
        return (
             <div className="text-center">
                <h2 className="text-xl font-semibold">Block not found</h2>
                <p className="text-muted-foreground">This block may have been deleted.</p>
                 <Button asChild variant="outline" className="mt-4">
                    <Link href={`/teacher/courses/${courseId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Course</Link>
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/teacher/courses/${courseId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Course</Link>
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl font-headline">Manage Block</CardTitle>
                            <CardDescription>View enrolled students for this course section.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                            <span className="font-mono text-lg font-semibold text-primary">{block.blockCode}</span>
                            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                <ClipboardCopy className="h-5 w-5" />
                                <span className="sr-only">Copy block code</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    <p className="font-semibold">{block.schedule}</p>
                 </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    {areEnrollmentsLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : enrollments && enrollments.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Enrollment Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.map(enrollment => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://picsum.photos/seed/${enrollment.studentId}/40/40`} data-ai-hint="person" />
                                                <AvatarFallback>{enrollment.studentId.substring(0, 1).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            {/* In a real app, you'd show student name/email here */}
                                            {enrollment.studentId.substring(0, 12)}...
                                        </TableCell>
                                        <TableCell>
                                            {new Date(enrollment.enrollmentDate.seconds * 1000).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">View Progress</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center p-8 flex flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">No Students Enrolled</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto">Share the block code with your students to have them join this section.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// CollectionGroup queries for enrollments require a composite index in firestore.
// In a real app, you would create this in the Firebase console.
// The error message from Firestore in the browser console will provide a direct link to create it.
// For example: `Firestore (9.1.0): Uncaught Error In snapshot listener: The query requires an index...`
function BlockPage() {
    return <BlockDetailPage />;
}

export default BlockPage;

    