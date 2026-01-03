
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collectionGroup, getDocs, query, where, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  blockCode: z.string().min(3, "Block code must be at least 3 characters long."),
});

export function JoinClassDialog() {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "You must be logged in to join a class."});
        setIsSaving(false);
        return;
    }

    try {
        // Query the 'blocks' collection group to find the block with the matching code
        const blocksRef = collectionGroup(firestore, 'blocks');
        const q = query(blocksRef, where("blockCode", "==", values.blockCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Class Not Found",
                description: "No class found with that block code. Please check the code and try again.",
            });
        } else {
            const blockDoc = querySnapshot.docs[0];
            const blockData = blockDoc.data();

            // The block's parent is the course, and the course's parent is the teacher (user)
            const courseRef = blockDoc.ref.parent.parent;
            if (!courseRef) {
                 throw new Error("Could not find parent course for this block.");
            }
            // The teacherId is the ID of the user who owns the course.
            const teacherId = courseRef.path.split('/')[1];

            // Create the enrollment document in the top-level 'enrollments' collection
            const enrollmentsCollection = collection(firestore, 'enrollments');
            await addDoc(enrollmentsCollection, {
                studentId: user.uid,
                blockId: blockDoc.id,
                courseId: blockData.courseId,
                teacherId: teacherId, 
                enrollmentDate: new Date(),
            });

            toast({
                title: "Successfully Joined Class!",
                description: `You are now enrolled in block ${values.blockCode}.`,
            });

            form.reset();
            setOpen(false);
            
            // Refresh the page to show the new enrollment status
            router.refresh();
        }

    } catch (error) {
        console.error("Error joining class:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not join the class. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Join a Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>
            Enter the unique block code from your teacher to enroll.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="blockCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AB-12-CD" {...field} />
                    </FormControl>
                    <FormDescription>
                      This code is case-sensitive.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Join Class
                    </Button>
                </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}

    