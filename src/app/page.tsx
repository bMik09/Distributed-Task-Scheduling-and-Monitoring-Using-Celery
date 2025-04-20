"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { Button } from "@/components/ui/button";
import { UploadTasks } from "@/components/upload-tasks";
import { TaskMonitoringDashboard } from "@/components/task-monitoring-dashboard";
import { WorkerManagement } from "@/components/worker-management";
import { useState, useEffect } from "react";
import { HelpCircle, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  addWorker
} from "@/services/celery";
import { useToast } from "@/hooks/use-toast";
import { TaskSubmissionForm } from "@/components/task-submission-form";
import { TaskDependencies } from "@/components/task-dependencies";

const workerSchema = z.object({
  name: z.string().min(2, {
    message: "Worker name must be at least 2 characters.",
  }),
});

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [workersUpdated, setWorkersUpdated] = useState(false); // State to trigger worker update
  const { toast } = useToast();
    const [availableTasks, setAvailableTasks] = useState<string[]>([]);

  const filteredTasks = tasks.filter((task) =>
    task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const form = useForm<z.infer<typeof workerSchema>>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof workerSchema>) {
    try {
      await addWorker(values.name);
      toast({
        title: "Worker Registered",
        description: `Worker "${values.name}" has been registered.`,
      });
      form.reset();
      setWorkersUpdated(prev => !prev);
    } catch (error) {
      console.error("Error adding worker:", error);
      toast({
        title: "Error",
        description: "Failed to register worker.",
        variant: "destructive",
      });
    }
  }

  const handleTaskSubmit = (newTask: { name: string; description?: string; dependencies?: string[] }) => {
        setTasks(prevTasks => [...prevTasks, newTask.name]);
        setAvailableTasks(prevTasks => [...prevTasks, newTask.name]); // Update available tasks
        toast({
            title: "Task Submitted",
            description: `Task "${newTask.name}" has been submitted.`,
        });
    };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            CeleryFlow
          </CardTitle>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Task Monitoring</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Worker Management</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator />
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>
              Configuration
            </SidebarGroupLabel>
            <UploadTasks setTasks={setTasks} setAvailableTasks={setAvailableTasks} />
            <SidebarGroupLabel>
              Add Worker
            </SidebarGroupLabel>
            <WorkerRegistrationForm form={form} onSubmit={onSubmit} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <Grid numColumns={2}>
            <Button variant="ghost" size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Grid>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Card>
          <CardHeader>
            <CardTitle>Task Monitoring Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskSubmissionForm onSubmit={handleTaskSubmit} availableTasks={availableTasks} />
            <div className="mb-4 flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TaskMonitoringDashboard tasks={filteredTasks} taskStatusFilter={taskStatusFilter} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Worker Management</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkerManagement workersUpdated={workersUpdated} />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}

const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 py-2 font-medium text-sm text-muted-foreground">
      {children}
    </div>
  );
};

interface WorkerRegistrationFormProps {
  form: any;
  onSubmit: (values: z.infer<typeof workerSchema>) => Promise<void>;
}

function WorkerRegistrationForm({ form, onSubmit }: WorkerRegistrationFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worker Name</FormLabel>
              <FormControl>
                <Input placeholder="worker3@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!form.formState.isValid}>Register Worker</Button>
      </form>
    </Form>
  );
}
