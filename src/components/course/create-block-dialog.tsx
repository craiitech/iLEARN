
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
  blockName: z.string().min(1, "Block name is required."),
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
      blockName: "",
      schedule: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const blocksCollection = collection(courseRef, 'blocks');
      // The block code will now be generated on demand from the block management page.
      await addDocumentNonBlocking(blocksCollection, {
        ...values,
        blockCode: null, // Ensure blockCode is explicitly null on creation
        courseId: courseRef.id,
        createdAt: new Date(),
      });
      
      toast({
        title: "Block Created!",
        description: `The block "${values.blockName}" has been created. You can generate an enrollment code from the 'Manage' page.`,
      });

      form.reset();
      setOpen(false);

    } catch (error) {
      console.error("Error creating block:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message || "Could not create the block. Please try again.",
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
            Create a new section for this course. A unique block code can be generated later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="blockName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Section A, Morning Class" {...field} />
                    </FormControl>
                     <FormDescription>
                      A human-readable name for this block.
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
                      <Textarea placeholder="e.g., MWF 10:00 AM - 11:00 AM, Room 101" {...field} />
                    </FormControl>
                     <FormDescription>
                      Enter the class schedule. You can add room details too.
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
