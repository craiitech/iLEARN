"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookOpen, Settings, Library, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function CoursesPage() {
    const { firestore, user } = useFirebase();

    const coursesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/courses`));
    }, [firestore, user]);

    const { data: courses, isLoading } = useCollection(coursesQuery);

    return (
        <div className="container mx-auto p-0">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-headline font-bold">My Courses</h1>
                <Button asChild>
                    <Link href="/teacher/courses/new"><PlusCircle /> Create New Course</Link>
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">These are your master course blueprints. From here, you can manage the curriculum (lessons, quizzes, assignments) that will be shared across multiple blocks.</p>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            )}

            {!isLoading && courses && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-start gap-3">
                                    <Library className="h-6 w-6 mt-1 text-primary"/>
                                    <span>{course.title}</span>
                                </CardTitle>
                                <CardDescription className="pl-9">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col justify-end flex-grow mt-4">
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild className="flex-1">
                                        <Link href={`/teacher/courses/${course.id}`}><BookOpen className="mr-2 h-4 w-4"/>Manage Curriculum</Link>
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="h-5 w-5" />
                                        <span className="sr-only">Settings</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                        <Button variant="ghost" asChild className="h-full w-full">
                            <Link href="/teacher/courses/new" className="flex flex-col items-center justify-center gap-2 h-56">
                                <PlusCircle className="h-8 w-8" />
                                <span className="text-sm font-medium">Create New Course</span>
                            </Link>
                        </Button>
                    </Card>
                </div>
            )}

             {!isLoading && (!courses || courses.length === 0) && (
                 <div className="text-center p-8 flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed h-96">
                    <Library className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Courses Yet</h3>
                    <p className="text-muted-foreground">Get started by creating your first course blueprint.</p>
                    <Button asChild>
                        <Link href="/teacher/courses/new"><PlusCircle /> Create New Course</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
