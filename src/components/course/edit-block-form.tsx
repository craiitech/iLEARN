
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { DocumentReference } from "firebase/firestore";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  blockName: z.string().min(1, "Block name is required."),
  schedule: z.string().min(5, "Schedule must be at least 5 characters."),
});

type EditBlockFormProps = {
    blockRef: DocumentReference;
    currentBlockName: string;
    currentSchedule: string;
    courseId: string;
}

export function EditBlockForm({ blockRef, currentBlockName, currentSchedule, courseId }: EditBlockFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockName: currentBlockName,
      schedule: currentSchedule,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      updateDocumentNonBlocking(blockRef, values);
      
      toast({
        title: "Block Updated!",
        description: `The block details have been successfully updated.`,
      });
      
      router.push(`/teacher/courses/${courseId}`);

    } catch (error) {
      console.error("Error updating block:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not update the block. Please try again.",
      });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormLabel>Class Schedule</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., MWF 10:00 AM - 11:00 AM, Room 101" {...field} />
                </FormControl>
                <FormDescription>
                    Enter the class schedule, including days, times, and location.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    </Form>
  );
}
