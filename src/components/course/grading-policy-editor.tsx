
"use client";

import { useState, useEffect, useMemo } from "react";
import { DocumentReference, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Percent, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

type TermComponent = {
    assignments?: number;
    quizzes?: number;
    activities?: number;
    participation?: number;
    majorExamination?: number;
};

type GradingTerm = {
    id: string; // For React key prop
    term: string;
    weight: number;
    components: TermComponent;
};

type GradingPolicy = GradingTerm[];

type GradingPolicyEditorProps = {
    courseRef: DocumentReference;
    initialPolicy?: GradingPolicy;
};

const defaultComponents: TermComponent = {
    assignments: 25,
    quizzes: 25,
    activities: 10,
    participation: 10,
    majorExamination: 30,
};

const defaultPolicy: GradingPolicy = [
    { id: "midterm", term: "Midterm", weight: 50, components: defaultComponents },
    { id: "finals", term: "Finals", weight: 50, components: defaultComponents },
];

export function GradingPolicyEditor({ courseRef, initialPolicy }: GradingPolicyEditorProps) {
    const [policy, setPolicy] = useState<GradingPolicy>(initialPolicy && initialPolicy.length > 0 ? initialPolicy.map(p => ({...p, id: p.term.toLowerCase()})) : defaultPolicy);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setPolicy(initialPolicy && initialPolicy.length > 0 ? initialPolicy.map(p => ({...p, id: p.term.toLowerCase()})) : defaultPolicy);
    }, [initialPolicy]);

    const totalTermWeight = useMemo(() => {
        return policy.reduce((sum, term) => sum + (Number(term.weight) || 0), 0);
    }, [policy]);

    const handleTermChange = (index: number, field: 'term' | 'weight', value: string) => {
        const newPolicy = [...policy];
        const term = newPolicy[index];
        if(field === 'term') {
            term.term = value;
        } else {
            const numericValue = value === "" ? 0 : parseInt(value, 10);
            if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) return;
            term.weight = numericValue;
        }
        setPolicy(newPolicy);
    };

    const handleComponentChange = (termIndex: number, component: keyof TermComponent, value: string) => {
        const newPolicy = [...policy];
        const numericValue = value === "" ? 0 : parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) return;
        newPolicy[termIndex].components[component] = numericValue;
        setPolicy(newPolicy);
    }
    
    const getComponentTotal = (termIndex: number) => {
        const components = policy[termIndex].components;
        return Object.values(components).reduce((sum, value) => sum + (Number(value) || 0), 0);
    }

    const addTerm = () => {
        const newTermName = `New Term ${policy.length + 1}`;
        setPolicy([...policy, {
            id: newTermName.toLowerCase().replace(' ', '-'),
            term: newTermName,
            weight: 0,
            components: defaultComponents
        }]);
    }
    
    const removeTerm = (index: number) => {
        const newPolicy = policy.filter((_, i) => i !== index);
        setPolicy(newPolicy);
    }

    const handleSave = async () => {
        if (totalTermWeight !== 100) {
            toast({
                variant: "destructive",
                title: "Invalid Term Weights",
                description: `The total weight for all terms must be exactly 100%, but it is currently ${totalTermWeight}%.`,
            });
            return;
        }

        for (let i = 0; i < policy.length; i++) {
            const term = policy[i];
            const componentTotal = getComponentTotal(i);
            if (componentTotal !== 100) {
                 toast({
                    variant: "destructive",
                    title: `Invalid Components in "${term.term}"`,
                    description: `The component percentages for "${term.term}" must equal 100%, but they add up to ${componentTotal}%.`,
                });
                return;
            }
        }

        setIsSaving(true);
        try {
            // Remove the temporary 'id' field before saving to Firestore
            const policyToSave = policy.map(({id, ...rest}) => rest);

            await updateDoc(courseRef, {
                gradingPolicy: policyToSave
            });
            toast({
                title: "Grading Policy Saved!",
                description: "The new grading policy has been applied to the course.",
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

    const formatComponentKey = (key: string) => {
        if (key === 'majorExamination') return 'Major Examination';
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grading Policy</CardTitle>
                <CardDescription>Define grading terms (e.g., Midterm, Finals) and their weights.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Accordion type="multiple" className="w-full" defaultValue={policy.map(p => p.id)}>
                    {policy.map((term, termIndex) => (
                        <AccordionItem value={term.id} key={term.id}>
                            <AccordionTrigger className="text-base">
                               <div className="flex-1 text-left">{term.term} ({term.weight}%)</div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor={`term-name-${termIndex}`} className="text-right">Term Name</Label>
                                        <Input
                                            id={`term-name-${termIndex}`}
                                            value={term.term}
                                            onChange={(e) => handleTermChange(termIndex, 'term', e.target.value)}
                                            className="col-span-2"
                                        />
                                    </div>
                                     <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor={`term-weight-${termIndex}`} className="text-right">Term Weight</Label>
                                        <div className="col-span-2 relative">
                                             <Input
                                                id={`term-weight-${termIndex}`}
                                                type="number"
                                                value={term.weight || ""}
                                                onChange={(e) => handleTermChange(termIndex, 'weight', e.target.value)}
                                                className="pr-8"
                                            />
                                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <Separator/>
                                    <p className="text-sm text-muted-foreground pt-2">Define component weights for the <span className="font-semibold text-foreground">{term.term}</span> term. Must total 100%.</p>

                                    {Object.keys(term.components).map((key) => (
                                        <div key={key} className="grid grid-cols-3 items-center gap-4">
                                            <Label htmlFor={`comp-${termIndex}-${key}`} className="capitalize text-right">{formatComponentKey(key)}</Label>
                                            <div className="col-span-2 relative">
                                                <Input
                                                    id={`comp-${termIndex}-${key}`}
                                                    type="number"
                                                    value={term.components[key as keyof TermComponent] || ""}
                                                    onChange={(e) => handleComponentChange(termIndex, key as keyof TermComponent, e.target.value)}
                                                    className="pr-8"
                                                />
                                                <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 border-t font-medium">
                                        <Label>Component Total</Label>
                                        <div className={cn("text-base", getComponentTotal(termIndex) !== 100 && "text-destructive")}>
                                            {getComponentTotal(termIndex)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                     <Button variant="destructive" size="sm" onClick={() => removeTerm(termIndex)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove {term.term}
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Button variant="outline" onClick={addTerm} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Grading Term
                </Button>

                <Separator />
                
                <div className="flex justify-between items-center pt-2">
                    <Label className="font-bold text-lg">Final Grade Total</Label>
                    <div className={cn("font-bold text-xl", totalTermWeight !== 100 && "text-destructive")}>
                        {totalTermWeight}%
                    </div>
                </div>

                 <Button onClick={handleSave} disabled={isSaving || totalTermWeight !== 100} className="w-full">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Policy
                </Button>
            </CardContent>
        </Card>
    );
}
