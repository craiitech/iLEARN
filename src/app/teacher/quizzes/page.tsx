import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

const quizzes = [
    { title: 'Introduction to Photosynthesis', subject: 'Biology 101', questions: 10, status: 'Draft' },
    { title: 'The American Revolution', subject: 'History 202', questions: 15, status: 'Published' },
    { title: 'Calculus I: Limits', subject: 'Math 301', questions: 20, status: 'Published' },
];

export default function QuizzesPage() {
    return (
        <div className="container mx-auto p-0">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-headline font-bold">Quiz Library</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader className="flex-grow">
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>{quiz.subject}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>{quiz.questions} Questions</span>
                                <Badge variant={quiz.status === 'Published' ? 'default' : 'secondary'} className={quiz.status === 'Published' ? 'bg-accent text-accent-foreground' : ''}>
                                    {quiz.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                 <Card className="border-dashed border-2 hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                    <Button variant="ghost" asChild className="h-full w-full">
                        <Link href="/teacher/quizzes/new" className="flex flex-col items-center justify-center gap-2 h-48">
                            <PlusCircle className="h-8 w-8" />
                            <span className="text-sm font-medium">Create New Quiz</span>
                        </Link>
                    </Button>
                </Card>
            </div>
        </div>
    )
}
