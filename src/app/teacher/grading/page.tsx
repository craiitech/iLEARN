import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const assignmentsToGrade = [
    { id: "1", title: "Final Project Proposal", course: "ENG-101", submissions: 15, total: 25 },
    { id: "2", title: "Lab Report #3", course: "BIO-205", submissions: 22, total: 22 },
    { id: "3", title: "History Essay: The Cold War", course: "HIST-310", submissions: 5, total: 30 },
    { id: "4", title: "Calculus Problem Set 7", course: "MATH-210", submissions: 3, total: 18 },
];

export default function GradingPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">SpeedGrader</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Assignments Requiring Grading</CardTitle>
                    <CardDescription>Select an assignment to begin grading submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignmentsToGrade.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{assignment.course}</Badge>
                                    </TableCell>
                                    <TableCell>{assignment.submissions} / {assignment.total}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/teacher/grading/${assignment.id}`} className="flex items-center justify-end text-sm font-medium text-primary hover:underline">
                                            Grade <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
