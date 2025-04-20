'use server';

/**
 * @fileOverview An AI agent that suggests optimal task parameters for Celery.
 *
 * - optimizeTaskParameters - A function that suggests optimal task parameters.
 * - OptimizeTaskParametersInput - The input type for the optimizeTaskParameters function.
 * - OptimizeTaskParametersOutput - The return type for the optimizeTaskParameters function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const OptimizeTaskParametersInputSchema = z.object({
  taskName: z.string().describe('The name of the task to optimize.'),
  averageCompletionTime: z.number().describe('The average completion time of the task in seconds.'),
  currentConcurrency: z.number().describe('The current concurrency level for the task.'),
  currentPriority: z.number().describe('The current priority of the task (higher is more important).'),
  availableResources: z.object({
    cpu: z.number().describe('The amount of CPU resources available.'),
    memory: z.number().describe('The amount of memory resources available in GB.'),
  }).describe('The available resources for the Celery workers.'),
});

export type OptimizeTaskParametersInput = z.infer<typeof OptimizeTaskParametersInputSchema>;

const OptimizeTaskParametersOutputSchema = z.object({
  recommendedConcurrency: z.number().describe('The recommended concurrency level for the task.'),
  recommendedPriority: z.number().describe('The recommended priority of the task.'),
  recommendedResources: z.object({
    cpu: z.number().describe('The recommended CPU resources for the task.'),
    memory: z.number().describe('The recommended memory resources for the task in GB.'),
  }).describe('The recommended resources for the task.'),
  explanation: z.string().describe('An explanation of why these parameters are recommended.'),
});

export type OptimizeTaskParametersOutput = z.infer<typeof OptimizeTaskParametersOutputSchema>;

export async function optimizeTaskParameters(input: OptimizeTaskParametersInput): Promise<OptimizeTaskParametersOutput> {
  return optimizeTaskParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeTaskParametersPrompt',
  input: {
    schema: z.object({
      taskName: z.string().describe('The name of the task to optimize.'),
      averageCompletionTime: z.number().describe('The average completion time of the task in seconds.'),
      currentConcurrency: z.number().describe('The current concurrency level for the task.'),
      currentPriority: z.number().describe('The current priority of the task (higher is more important).'),
      availableResources: z.object({
        cpu: z.number().describe('The amount of CPU resources available.'),
        memory: z.number().describe('The amount of memory resources available in GB.'),
      }).describe('The available resources for the Celery workers.'),
    }),
  },
  output: {
    schema: z.object({
      recommendedConcurrency: z.number().describe('The recommended concurrency level for the task.'),
      recommendedPriority: z.number().describe('The recommended priority of the task.'),
      recommendedResources: z.object({
        cpu: z.number().describe('The recommended CPU resources for the task.'),
        memory: z.number().describe('The recommended memory resources for the task in GB.'),
      }).describe('The recommended resources for the task.'),
      explanation: z.string().describe('An explanation of why these parameters are recommended.'),
    }),
  },
  prompt: `You are an expert in optimizing Celery task parameters. Given the following information about a task, suggest optimal parameters for concurrency, priority, and resource allocation.

Task Name: {{{taskName}}}
Average Completion Time: {{{averageCompletionTime}}} seconds
Current Concurrency: {{{currentConcurrency}}}
Current Priority: {{{currentPriority}}}
Available Resources: {{{availableResources}}}

Consider the trade-offs between concurrency, priority, and resource usage. Explain your reasoning for the suggested parameters.
`, 
});

const optimizeTaskParametersFlow = ai.defineFlow<
  typeof OptimizeTaskParametersInputSchema,
  typeof OptimizeTaskParametersOutputSchema
>({
  name: 'optimizeTaskParametersFlow',
  inputSchema: OptimizeTaskParametersInputSchema,
  outputSchema: OptimizeTaskParametersOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

