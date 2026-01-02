
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
import { collection, DocumentReference, getDocs, query, where, collectionGroup } from "firebase/firestore";
import { useFirebase } from "@/firebase";

const formSchema = z.object({
  schedule: z.string().min(5, "Schedule must be at least 5 characters."),
});

type CreateBlockDialogProps = {
    courseRef: DocumentReference;
}

// Function to generate a random, easy-to-read 6-character code (e.g., AB-12-CD)
function generateBlockCode() {    
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ"; // Omitting O
    const nums = "123456789"; // Omitting 0

    const randomChar = () => chars.charAt(Math.floor(Math.random() * chars.length));
    const randomNum = () => nums.charAt(Math.floor(Math.random() * nums.length));

    const part1 = randomChar() + randomChar();
    const part2 = randomNum() + randomNum();
    const part3 = randomChar() + randomChar();

    return `${part1}-${part2}-${part3}`;
}


export function CreateBlockDialog({ courseRef }: CreateBlockDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schedule: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      let newBlockCode = "";
      let isCodeUnique = false;
      let attempts = 0;

      // Attempt to generate a unique code up to 5 times
      while (!isCodeUnique && attempts < 5) {
        newBlockCode = generateBlockCode();
        const blocksRef = collectionGroup(firestore, 'blocks');
        const q = query(blocksRef, where("blockCode", "==", newBlockCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          isCodeUnique = true;
        }
        attempts++;
      }

      if (!isCodeUnique) {
          throw new Error("Could not generate a unique block code. Please try again.");
      }

      const blocksCollection = collection(courseRef, 'blocks');
      await addDocumentNonBlocking(blocksCollection, {
        ...values,
        blockCode: newBlockCode,
        courseId: courseRef.id,
        createdAt: new Date(),
      });
      
      toast({
        title: "Block Created!",
        description: `The block has been created with code: ${newBlockCode}.`,
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
            Create a new section for this course. A unique block code will be automatically generated.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
