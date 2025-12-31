
"use client";

import { useState, useEffect, useMemo } from "react";
import { DocumentReference, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

type GradingPolicy = {
    assignments?: number;
    quizzes?: number;
    activities?: number;
    participation?: number;
};

type GradingPolicyEditorProps = {
    courseRef: DocumentReference;
    initialPolicy?: GradingPolicy;
};

const defaultPolicy: GradingPolicy = {
    assignments: 40,
    quizzes: 30,
    activities: 20,
    participation: 10,
};

export function GradingPolicyEditor({ courseRef, initialPolicy }: GradingPolicyEditorProps) {
    const [policy, setPolicy] = useState<GradingPolicy>(initialPolicy || defaultPolicy);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setPolicy(initialPolicy || defaultPolicy);
    }, [initialPolicy]);

    const totalPercentage = useMemo(() => {
        return Object.values(policy).reduce((sum, value) => sum + (Number(value) || 0), 0);
    }, [policy]);

    const handlePolicyChange = (category: keyof GradingPolicy, value: string) => {
        const numericValue = value === "" ? 0 : parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) return;

        setPolicy(prev => ({
            ...prev,
            [category]: numericValue,
        }));
    };

    const handleSave = async () => {
        if (totalPercentage !== 100) {
            toast({
                variant: "destructive",
                title: "Invalid Percentages",
                description: `The total percentage must be exactly 100%, but it is currently ${totalPercentage}%.`,
            });
            return;
        }

        setIsSaving(true);
        try {
            await updateDoc(courseRef, {
                gradingPolicy: policy
            });
            toast({
                title: "Grading Policy Saved!",
                description: "The new grading weights have been applied to the course.",
            });
        } catch (error) {
            console.error("Error saving grading policy:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save the grading policy. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grading Policy</CardTitle>
                <CardDescription>Define the weight of each category. The total must equal 100%.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.keys(policy).map((key) => (
                    <div key={key} className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor={key} className="capitalize text-right">{key}</Label>
                        <div className="col-span-2 relative">
                            <Input
                                id={key}
                                type="number"
                                value={policy[key as keyof GradingPolicy] || ""}
                                onChange={(e) => handlePolicyChange(key as keyof GradingPolicy, e.target.value)}
                                className="pr-8"
                            />
                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                    <Label className="font-bold">Total</Label>
                    <div className={cn("font-bold text-lg", totalPercentage !== 100 && "text-destructive")}>
                        {totalPercentage}%
                    </div>
                </div>
                 <Button onClick={handleSave} disabled={isSaving || totalPercentage !== 100} className="w-full">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Policy
                </Button>
            </CardContent>
        </Card>
    );
}
