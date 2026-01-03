
"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { JoinClassDialog } from "@/components/student/join-class-dialog";
import { useFirebase, useCollection } from "@/firebase";
import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";
import { StudentCourseCard } from "@/components/student/student-course-card";

export default function StudentDashboard() {
    const { firestore, user } = useFirebase();

    // The parent layout now handles the main loading and auth checks.
    // We can safely assume 'user' is available here when the component renders.
    const enrollmentsQuery = useMemo(() => {
        if (!user) return null;
        return query(collection(firestore, 'enrollments'), where("studentId", "==", user.uid));
    }, [firestore, user]);

    const { data: enrollments, isLoading: areEnrollmentsLoading } = useCollection(enrollmentsQuery);

    if (areEnrollmentsLoading) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
                    <h3 className="text-2xl font-bold tracking-tight">
                        Loading your dashboard...
                    </h3>
                </div>
            </div>
        )
    }

    if (enrollments?.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-4 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-2xl font-bold tracking-tight">
                        You're not enrolled in any classes yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Use the block code provided by your teacher to join your first class and see your assignments.
                    </p>
                    <JoinClassDialog />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-headline font-bold">My Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments?.map(enrollment => (
                    <StudentCourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
            </div>
        </div>
    )
}
