'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI scoring assistant that helps teachers grade open-ended questions.
 *
 * - aiScoringAssistant - A function that calls the AI scoring assistant flow.
 * - AIScoringAssistantInput - The input type for the aiScoringAssistant function.
 * - AIScoringAssistantOutput - The return type for the aiScoringAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIScoringAssistantInputSchema = z.object({
  studentAnswer: z.string().describe('The answer provided by the student.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  rubric: z.string().describe('The rubric to use for grading the answer.'),
  question: z.string().describe('The question that was asked.'),
});
export type AIScoringAssistantInput = z.infer<typeof AIScoringAssistantInputSchema>;

const AIScoringAssistantOutputSchema = z.object({
  score: z.number().describe('The score that the student should receive.'),
  feedback: z.string().describe('Feedback for the student.'),
});
export type AIScoringAssistantOutput = z.infer<typeof AIScoringAssistantOutputSchema>;

export async function aiScoringAssistant(input: AIScoringAssistantInput): Promise<AIScoringAssistantOutput> {
  return aiScoringAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiScoringAssistantPrompt',
  input: {schema: AIScoringAssistantInputSchema},
  output: {schema: AIScoringAssistantOutputSchema},
  prompt: `You are an AI scoring assistant that helps teachers grade open-ended questions.

  You will be provided with the student's answer, the correct answer, the rubric to use for grading, and the question that was asked.

  Based on this information, you will determine the score that the student should receive and provide feedback for the student.

  Question: {{{question}}}
  Correct Answer: {{{correctAnswer}}}
  Student Answer: {{{studentAnswer}}}
  Rubric: {{{rubric}}}

  Score: {{score}}
  Feedback: {{feedback}}`,
});

const aiScoringAssistantFlow = ai.defineFlow(
  {
    name: 'aiScoringAssistantFlow',
    inputSchema: AIScoringAssistantInputSchema,
    outputSchema: AIScoringAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
