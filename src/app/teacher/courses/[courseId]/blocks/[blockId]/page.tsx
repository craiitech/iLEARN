
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, ClipboardCopy, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFirebase, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { doc, collectionGroup, query, where, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { EditBlockForm } from "@/components/course/edit-block-form";


// Function to generate a random, easy-to-read 6-character alphanumeric code.
function generateBlockCode() {    
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


function BlockDetailPage() {
    const params = useParams();
    const { firestore, user, isUserLoading } = useFirebase();
    const { toast } = useToast();
    const courseId = params.courseId as string;
    const blockId = params.blockId as string;
    const [isRevealingCode, setIsRevealingCode] = useState(false);

    const blockRef = useMemo(() => {
        if (isUserLoading || !user || !courseId || !blockId) return null;
        return doc(firestore, `users/${user.uid}/courses/${courseId}/blocks`, blockId);
    }, [firestore, user, courseId, blockId, isUserLoading]);

    const { data: block, isLoading: isBlockLoading } = useDoc(blockRef);
    
    const copyToClipboard = () => {
        if (block?.blockCode) {
            navigator.clipboard.writeText(block.blockCode);
            toast({
                title: "Copied to Clipboard",
                description: `Block code ${block.blockCode} has been copied.`
            });
        }
    };

    const handleRevealCode = async () => {
        if (block?.blockCode) return; // If code exists, do nothing.
        if (!blockRef) return;

        setIsRevealingCode(true);
        try {
            let newBlockCode = "";
            let isCodeUnique = false;
            let attempts = 0;

            // Attempt to generate a unique code up to 10 times
            while (!isCodeUnique && attempts < 10) {
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
                throw new Error("Could not generate a unique block code after several attempts. Please try again.");
            }

            updateDocumentNonBlocking(blockRef, { blockCode: newBlockCode });
            toast({
                title: "Block Code Generated",
                description: `New code is: ${newBlockCode}`
            });

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Failed to Generate Code",
                description: (error as Error).message,
            });
        } finally {
            setIsRevealingCode(false);
        }
    }


    if (isBlockLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!block || !blockRef) {
        return (
             <div className="text-center">
                <h2 className="text-xl font-semibold">Block not found</h2>
                <p className="text-muted-foreground">This block may have been deleted.</p>
                 <Button asChild variant="outline" className="mt-4">
                    <Link href={`/teacher/courses/${courseId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Course</Link>
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/teacher/courses/${courseId}`}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Course</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl font-headline">Manage Block</CardTitle>
                            <CardDescription>Edit the schedule and view the enrollment code for this section.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                             {block.blockCode ? (
                                <>
                                    <span className="font-mono text-lg font-semibold text-primary">{block.blockCode}</span>
                                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                        <ClipboardCopy className="h-5 w-5" />
                                        <span className="sr-only">Copy block code</span>
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={handleRevealCode} disabled={isRevealingCode}>
                                    {isRevealingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Eye className="mr-2 h-4 w-4" />}
                                    Reveal code
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    <EditBlockForm blockRef={blockRef} currentSchedule={block.schedule} />
                 </CardContent>
            </Card>
        </div>
    )
}

function BlockPage() {
    return <BlockDetailPage />;
}

export default BlockPage;
