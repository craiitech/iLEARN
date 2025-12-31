import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload } from "lucide-react";

const studentAssignments = [
    { title: "Final Project Proposal", course: "ENG-101", dueDate: "May 25, 2024", status: "Graded", grade: "18/20" },
    { title: "Lab Report #3", course: "BIO-205", dueDate: "May 28, 2024", status: "Submitted", grade: null },
    { title: "History Essay: The Cold War", course: "HIST-310", dueDate: "June 1, 2024", status: "Not Submitted", grade: null },
    { title: "World War II Quiz", course: "HIST-310", dueDate: "June 3, 2024", status: "Not Submitted", grade: null },
];

export default function StudentDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-headline font-bold">Student Portal</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Overall Grade</CardDescription>
                        <CardTitle className="text-4xl">89%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">+5% from last week</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Upcoming Deadlines</CardDescription>
                        <CardTitle className="text-4xl">3</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Assignments due this week</div>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>To-Do List</CardTitle>
                    <CardDescription>Your upcoming assignments and quizzes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action / Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentAssignments.map((assignment, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>{assignment.course}</TableCell>
                                    <TableCell>{assignment.dueDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            assignment.status === 'Graded' ? 'default' :
                                            assignment.status === 'Submitted' ? 'outline' : 'secondary'
                                        } className={
                                            assignment.status === 'Graded' ? 'bg-accent text-accent-foreground' : ''
                                        }>
                                            {assignment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {assignment.status === 'Not Submitted' && <Button size="sm"><Upload className="mr-2 h-4 w-4"/>Submit</Button>}
                                        {assignment.status === 'Submitted' && <span className="text-sm text-muted-foreground">Pending Grade</span>}
                                        {assignment.status === 'Graded' && <span className="font-bold">{assignment.grade}</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
