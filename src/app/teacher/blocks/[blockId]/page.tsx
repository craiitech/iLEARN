
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GripVertical, FileText, FileQuestion, Pencil, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";

// Mock data for a single block's content
const blockDetails = {
    id: "1",
    title: "English Composition 101",
    learningPath: [
        { id: "item-1", type: "Lesson", title: "Introduction to Argumentative Writing" },
        { id: "item-2", type: "Lesson", title: "Crafting a Strong Thesis Statement" },
        { id: "item-3", type: "Quiz", title: "Thesis Statement Check" },
        { id: "item-4", type: "Assignment", title: "Outline for Argumentative Essay" },
    ]
};

const typeIcons = {
    Lesson: <FileText className="h-5 w-5 text-muted-foreground" />,
    Quiz: <FileQuestion className="h-5 w-5 text-muted-foreground" />,
    Assignment: <FileCheck className="h-5 w-5 text-muted-foreground" />
}

export default function BlockDetailPage({ params }: { params: { blockId: string } }) {
    // In a real app, you'd fetch blockDetails based on params.blockId
    const { title, learningPath } = blockDetails;

    return (
        <div className="container mx-auto p-0">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Button asChild variant="outline" size="sm" className="mb-2">
                        <Link href="/teacher/blocks"><ArrowLeft className="mr-2 h-4 w-4"/>Back to All Blocks</Link>
                    </Button>
                    <h1 className="text-3xl font-headline font-bold">{title}</h1>
                    <p className="text-muted-foreground">Arrange lessons, quizzes, and assignments for your students to complete in order.</p>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Lesson
                    </Button>
                     <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Quiz
                    </Button>
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Learning Path</CardTitle>
                    <CardDescription>Drag and drop to reorder items.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flow-root">
                      <ul className="space-y-3">
                          {learningPath.map((item) => (
                              <li key={item.id} className="flex items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
                                  <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                                  {typeIcons[item.type as keyof typeof typeIcons]}
                                  <span className="flex-grow font-medium">{item.title}</span>
                                  <span className="text-sm text-muted-foreground">{item.type}</span>
                                  <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="icon">
                                          <Pencil className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                           <span className="sr-only">Delete</span>
                                      </Button>
                                  </div>
                              </li>
                          ))}
                           <li className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 text-muted-foreground">
                                <PlusCircle className="h-5 w-5" />
                                <span>Add a new learning item</span>
                            </li>
                      </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// In a real app, you would need to import FileCheck from lucide-react
import { FileCheck } from "lucide-react";

    