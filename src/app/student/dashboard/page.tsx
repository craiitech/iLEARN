
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookOpen } from "lucide-react";
import { JoinClassDialog } from "@/components/student/join-class-dialog";

export default function StudentDashboard() {
    // In a real app, you would fetch the student's enrollments.
    // For now, we'll assume they have none to show the welcome screen.
    const enrollments = []; // Empty array for now

    if (enrollments.length === 0) {
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
            <h1 className="text-3xl font-headline font-bold">Home</h1>
            {/* Cards and assignment lists will go here once the student is enrolled in classes */}
        </div>
    )
}
