
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, DocumentReference } from "firebase/firestore";

const formSchema = z.object({
  blockCode: z.string().min(3, "Code must be at least 3 characters.").max(15, "Code cannot exceed 15 characters."),
  schedule: z.string().min(5, "Schedule must be at least 5 characters."),
});

type CreateBlockDialogProps = {
    courseRef: DocumentReference;
}

export function CreateBlockDialog({ courseRef }: CreateBlockDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockCode: "",
      schedule: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const blocksCollection = collection(courseRef, 'blocks');
      await addDocumentNonBlocking(blocksCollection, {
        ...values,
        courseId: courseRef.id,
        createdAt: new Date(),
      });
      
      toast({
        title: "Block Created!",
        description: `The block "${values.blockCode}" has been successfully created.`,
      });

      form.reset();
      setOpen(false);

    } catch (error) {
      console.error("Error creating block:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not create the block. Please try again.",
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
          Create New Block
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Block</DialogTitle>
          <DialogDescription>
            Create a new section for this course with its own schedule and student roster.
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
                      <Input placeholder="e.g., ENG101-S1, BIO-LAB-A" {...field} />
                    </FormControl>
                     <FormDescription>
                      A unique code for this specific section.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., MWF 10:00 AM - 11:00 AM" {...field} />
                    </FormControl>
                     <FormDescription>
                      Enter each schedule on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Block
                    </Button>
                </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}
