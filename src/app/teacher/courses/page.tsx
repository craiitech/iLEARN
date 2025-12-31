import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Users, BookOpen, Settings } from "lucide-react";
import Link from "next/link";

const courses = [
    { id: "1", title: 'English Composition 101', description: 'Focuses on foundational writing skills.', students: 25, code: 'ENG101-FA24' },
    { id: "2", title: 'Introduction to Biology', description: 'Exploring the wonders of life sciences.', students: 32, code: 'BIO205-FA24' },
    { id: "3", title: 'American History: 1865-Present', description: 'A survey of modern American history.', students: 18, code: 'HIST310-FA24' },
    { id: "4", title: 'Calculus I', description: 'Limits, derivatives, and integrals.', students: 22, code: 'MATH210-FA24' },
];

export default function CoursesPage() {
    return (
        <div className="container mx-auto p-0">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-headline font-bold">My Courses</h1>
                <Button asChild>
                    <Link href="/teacher/courses/new"><PlusCircle /> Create New Course</Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-end">
                             <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{course.students} Students</span>
                                </div>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md">{course.code}</span>
                            </div>
                            <div className="flex gap-2 mt-auto">
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <Link href={`/teacher/courses/${course.id}`}><BookOpen className="mr-2 h-4 w-4"/>View</Link>
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
        </div>
    )
}
