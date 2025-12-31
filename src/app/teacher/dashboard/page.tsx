import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, Book, FileCheck, PlusCircle, Users } from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">Command Center</h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/teacher/quizzes/new"><PlusCircle /> Create Quiz</Link>
            </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Your active classes this semester.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions to Grade</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+32</div>
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
              +2.1% from last month
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
              Based on recent activity.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden xl:table-column">
                    Assignment
                  </TableHead>
                  <TableHead className="hidden xl:table-column">
                    Block
                  </TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Liam Johnson</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      liam@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    Final Project Proposal
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    ENG-101
                  </TableCell>
                  <TableCell className="text-right">2 min ago</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Olivia Smith</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      olivia@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    Lab Report #3
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    BIO-205
                  </TableCell>
                  <TableCell className="text-right">1 hour ago</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Noah Williams</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      noah@example.com
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    History Essay
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    HIST-310
                  </TableCell>
                  <TableCell className="text-right">3 hours ago</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Quizzes</CardTitle>
            <CardDescription>
              Quizzes you recently created or assigned.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             <div className="flex items-center gap-4">
                <div className="rounded-md bg-secondary p-3">
                  <FileCheck className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">World War II</p>
                  <p className="text-sm text-muted-foreground">HIST-310, 10 Questions</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">View</Button>
            </div>
             <div className="flex items-center gap-4">
                <div className="rounded-md bg-secondary p-3">
                  <FileCheck className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Cellular Respiration</p>
                  <p className="text-sm text-muted-foreground">BIO-205, 15 Questions</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">View</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
