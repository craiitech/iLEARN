'use server';

/**
 * @fileOverview AI-powered quiz question generator.
 *
 * - generateQuizQuestions - A function that generates quiz questions based on a topic and difficulty level.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the quiz questions.'),
  numberOfQuestions: z
    .number()
    .min(1)
    .max(10)
    .default(5)
    .describe('The number of questions to generate'),
});
export type GenerateQuizQuestionsInput = z.infer<
  typeof GenerateQuizQuestionsInputSchema
>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ),
});
export type GenerateQuizQuestionsOutput = z.infer<
  typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator that creates quizzes on a given topic and difficulty.

  Generate a quiz about the topic "{{topic}}" with difficulty "{{difficulty}}". Generate {{numberOfQuestions}} questions.

  Each question should have 4 possible answers, one of which is correct.  The "correctAnswer" should be the actual string of the correct answer, and MUST be present as one of the options.

  Here's an example of the output format:
  {
    "questions": [
      {
        "question": "What is the capital of France?",
        "options": ["London", "Paris", "Berlin", "Rome"],
        "correctAnswer": "Paris"
      },
      {
        "question": "What is the highest mountain in the world?",
        "options": ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
        "correctAnswer": "Mount Everest"
      }
    ]
  }

  Make sure that all questions are related to the specified topic, are the correct difficulty, and follow the output format exactly.
  `,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
