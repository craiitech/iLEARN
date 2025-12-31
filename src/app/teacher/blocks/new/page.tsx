"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().optional(),
  code: z.string().min(3, "Block code must be at least 3 characters.").max(12, "Block code cannot exceed 12 characters."),
});

export default function NewBlockPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Block Created!",
      description: `The block "${values.title}" has been successfully created.`,
    });
    // Here you would typically redirect or clear the form
  }

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/teacher/blocks"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blocks</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Block</CardTitle>
          <CardDescription>Fill out the details for your new subject block.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Placement Literature" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the block and its learning objectives." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., APLIT-S24" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique code students will use to join.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                    <Link href="/teacher/blocks">Cancel</Link>
                </Button>
                <Button type="submit">Create Block</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
