"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TaskDependencies } from "@/components/task-dependencies";

const taskSubmissionSchema = z.object({
  name: z.string().min(2, {
    message: "Task name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  dependencies: z.string().array().optional(),
});

interface TaskSubmissionFormProps {
    onSubmit: (task: { name: string; description?: string; dependencies?: string[] }) => void;
    availableTasks: string[];
}

export const TaskSubmissionForm: React.FC<TaskSubmissionFormProps> = ({ onSubmit, availableTasks }) => {
  const form = useForm<z.infer<typeof taskSubmissionSchema>>({
    resolver: zodResolver(taskSubmissionSchema),
    defaultValues: {
      name: "",
      description: "",
      dependencies: [],
    },
  });

  const [taskDependencies, setTaskDependencies] = useState<string[]>([]); // Local state for task dependencies

    async function handleSubmit(values: z.infer<typeof taskSubmissionSchema>) {
        onSubmit({
            name: values.name,
            description: values.description,
            dependencies: taskDependencies, // Use local state for dependencies
        });
        form.reset();
        setTaskDependencies([]);
    }

    // Function to update the local state of taskDependencies
    const handleTaskDependencyChange = (newDependencies: string[]) => {
        setTaskDependencies(newDependencies);
    };

  useEffect(() => {
    form.setValue("dependencies", taskDependencies);
  }, [taskDependencies, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter task name" {...field} />
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
              <FormLabel>Task Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="dependencies"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Dependencies (optional)</FormLabel>
                    <FormControl>
                        <TaskDependencies
                            availableTasks={availableTasks}
                            selectedTasks={taskDependencies} // Pass local state to TaskDependencies
                            onChange={handleTaskDependencyChange} // Use handler to update local state
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" disabled={!form.formState.isValid}>Submit Task</Button>
      </form>
    </Form>
  );
};


