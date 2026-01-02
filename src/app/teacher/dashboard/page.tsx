
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, Book, FileCheck, PlusCircle, Users, Loader2, Library } from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

export default function TeacherDashboard() {
  const { firestore, user } = useFirebase();

  const coursesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/courses`));
  }, [firestore, user]);
  
  const submissionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'submissions'), 
        where('teacherId', '==', user.uid),
        limit(5)
    );
  }, [firestore, user]);


  const { data: courses, isLoading: coursesLoading } = useCollection(coursesQuery);
  const { data: submissions, isLoading: submissionsLoading } = useCollection(submissionsQuery);
  
  const sortedSubmissions = submissions?.sort((a, b) => {
      const timeA = a.submissionTime?.toDate ? a.submissionTime.toDate().getTime() : 0;
      const timeB = b.submissionTime?.toDate ? b.submissionTime.toDate().getTime() : 0;
      return timeB - timeA;
  });

  const submissionsToGrade = submissions?.filter(s => !s.grade).length || 0;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">Home</h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/teacher/courses/new"><PlusCircle /> Create Course</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/teacher/quizzes/new">Create Quiz</Link>
            </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {coursesLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">{courses?.length || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Your active course blueprints.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions to Grade</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {submissionsLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <div className="text-2xl font-bold">+{submissionsToGrade}</div>}
            <p className="text-xs text-muted-foreground">
              New submissions are awaiting review.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">
              (Static) +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-muted-foreground">
              (Static) Based on recent activity.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Recently submitted assignments from your students.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/teacher/grading">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {submissionsLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>}
            {!submissionsLoading && sortedSubmissions && sortedSubmissions.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedSubmissions.map(sub => (
                         <TableRow key={sub.id}>
                            <TableCell>
                                <div className="font-medium">{sub.studentName || "Unknown Student"}</div>
                                <div className="hidden text-sm text-muted-foreground md:inline">
                                {sub.studentEmail || "No email"}
                                </div>
                            </TableCell>
                             <TableCell>
                                {sub.assignmentTitle || "Unknown Assignment"}
                            </TableCell>
                             <TableCell className="text-right">
                                {sub.submissionTime ? formatDistanceToNow(new Date(sub.submissionTime.toDate()), { addSuffix: true }) : 'N/A'}
                             </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                 !submissionsLoading && <p className="text-sm text-center text-muted-foreground p-8">No recent submissions found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
