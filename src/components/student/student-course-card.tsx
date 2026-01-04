
"use client";

import { useMemo } from "react";
import { doc } from "firebase/firestore";
import { useDoc } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirebase } from "@/firebase";

export function StudentCourseCard({ enrollment }: { enrollment: any }) {
    const { firestore } = useFirebase();

    const courseRef = useMemo(() => {
        if (!enrollment.teacherId || !enrollment.courseId) return null;
        return doc(firestore, `users/${enrollment.teacherId}/courses`, enrollment.courseId);
    }, [firestore, enrollment.teacherId, enrollment.courseId]);

    const blockRef = useMemo(() => {
        // The block is a subcollection of the course, so the courseRef is needed.
        if (!courseRef || !enrollment.blockId) return null;
        return doc(courseRef, 'blocks', enrollment.blockId);
    }, [courseRef, enrollment.blockId]);

    const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);
    const { data: block, isLoading: isBlockLoading } = useDoc(blockRef);

    if (isCourseLoading || isBlockLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!course || !block) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Course</CardTitle>
                    <CardDescription>Could not find course or block details.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button disabled className="w-full">Unable to View</Button>
                 </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>Section: {block.blockName}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full">View Course</Button>
            </CardContent>
        </Card>
    );
}
