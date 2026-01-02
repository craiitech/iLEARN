
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

const formSchema = z.object({
  blockCode: z.string().min(3, "Block code must be at least 3 characters long."),
});

export function JoinClassDialog() {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockCode: "",
    },
  });

  // In a real app, this function would find the block by its code and create an enrollment record.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    console.log("Attempting to join block with code:", values.blockCode);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here you would add the logic to find the block and enroll the user.
    // For now, we'll just show a success toast.
    
    setIsSaving(false);
    setOpen(false);
    toast({
      title: "Successfully Joined Class!",
      description: `You are now enrolled in block ${values.blockCode}.`,
    });
    form.reset();

    // You would likely want to refresh the page or re-fetch data here.
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
                      <Input placeholder="e.g., APLIT-S24" {...field} />
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
