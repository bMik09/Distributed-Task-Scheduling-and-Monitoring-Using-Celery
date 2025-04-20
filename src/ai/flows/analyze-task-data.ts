'use server';
/**
 * @fileOverview AI flow for analyzing task data to identify bottlenecks and suggest optimal scheduling parameters.
 *
 * - analyzeTaskData - Analyzes historical task data and suggests optimal scheduling parameters.
 * - AnalyzeTaskDataInput - The input type for the analyzeTaskData function.
 * - AnalyzeTaskDataOutput - The return type for the analyzeTaskData function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {CeleryTask} from '@/services/celery';

const AnalyzeTaskDataInputSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    args: z.array(z.any()),
    kwargs: z.record(z.any()),
    status: z.string(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    result: z.any().optional(),
  })).describe('Array of historical task data.'),
});
export type AnalyzeTaskDataInput = z.infer<typeof AnalyzeTaskDataInputSchema>;

const AnalyzeTaskDataOutputSchema = z.object({
  bottlenecks: z.array(z.string()).describe('Identified bottlenecks in task execution.'),
  predictedCompletionTimes: z.record(z.number()).describe('Predicted completion times for tasks.').default({}),
  suggestedSchedulingParameters: z.record(z.any()).describe('Suggested optimal scheduling parameters.').default({}),
});
export type AnalyzeTaskDataOutput = z.infer<typeof AnalyzeTaskDataOutputSchema>;

export async function analyzeTaskData(input: AnalyzeTaskDataInput): Promise<AnalyzeTaskDataOutput> {
  return analyzeTaskDataFlow(input);
}

const analyzeTaskDataPrompt = ai.definePrompt({
  name: 'analyzeTaskDataPrompt',
  input: {
    schema: z.object({
      tasks: z.array(z.object({
        id: z.string(),
        name: z.string(),
        args: z.array(z.any()),
        kwargs: z.record(z.any()),
        status: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        result: z.any().optional(),
      })).describe('Array of historical task data.'),
    }),
  },
  output: {
    schema: z.object({
      bottlenecks: z.array(z.string()).describe('Identified bottlenecks in task execution.'),
      predictedCompletionTimes: z.record(z.number()).describe('Predicted completion times for tasks.').default({}),
      suggestedSchedulingParameters: z.record(z.any()).describe('Suggested optimal scheduling parameters.').default({}),
    }),
  },
  prompt: `Analyze the following historical task data to identify bottlenecks, predict task completion times, and suggest optimal scheduling parameters.

Task Data:
{{#each tasks}}
  - Task ID: {{this.id}}
    Name: {{this.name}}
    Status: {{this.status}}
    Start Time: {{this.startTime}}
    End Time: {{this.endTime}}
    Result: {{this.result}}
{{/each}}

Based on this data, provide the following:

Bottlenecks: A list of identified bottlenecks in task execution.
Predicted Completion Times: Predicted completion times for each task, in seconds.
Suggested Scheduling Parameters: Suggested optimal scheduling parameters to improve efficiency, including concurrency and task prioritization.`,
});

const analyzeTaskDataFlow = ai.defineFlow<
  typeof AnalyzeTaskDataInputSchema,
  typeof AnalyzeTaskDataOutputSchema
>(
  {
    name: 'analyzeTaskDataFlow',
    inputSchema: AnalyzeTaskDataInputSchema,
    outputSchema: AnalyzeTaskDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeTaskDataPrompt(input);
    return output!;
  }
);
