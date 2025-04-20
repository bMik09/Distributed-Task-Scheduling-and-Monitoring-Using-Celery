"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { analyzeTaskData } from "@/ai/flows/analyze-task-data";
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TaskMonitoringDashboardProps {
  tasks: string[];
  taskStatusFilter: string;
}

interface Task {
  id: string;
  name: string;
  status: string;
    dependencies?: string[]; // Mock dependencies
}

export const TaskMonitoringDashboard: React.FC<TaskMonitoringDashboardProps> = ({ tasks, taskStatusFilter }) => {
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<{ bottlenecks: string[]; predictedCompletionTimes: { [key: string]: number; }; suggestedSchedulingParameters: { [key: string]: any; }; } | null>(null);

  useEffect(() => {
    // Simulate fetching task data (replace with actual Celery API calls)
    const initialTaskData = tasks.map((task, index) => ({
      id: `task-${index + 1}`,
      name: task,
      status: "PENDING", // Initial status
        dependencies: index % 2 === 0 ? [`task-${index}`] : [], // Mock dependencies
    }));
    setTaskData(initialTaskData);
  }, [tasks]);

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTaskData((prevTaskData) =>
      prevTaskData.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const simulateTaskExecution = (taskId: string) => {
    // Simulate task execution with a delay
    updateTaskStatus(taskId, "RUNNING");
    setTimeout(() => {
      const randomStatus = Math.random() > 0.5 ? "COMPLETED" : "FAILED";
      updateTaskStatus(taskId, randomStatus);
    }, 2000 + Math.random() * 3000);
  };

  useEffect(() => {
      taskData.forEach(task => {
          if (task.status === 'PENDING') {
              simulateTaskExecution(task.id);
          }
      });
  }, [taskData]);

  // Prepare data for AI analysis (simulated)
  const aiInput = {
    tasks: taskData.map(task => ({
      id: task.id,
      name: task.name,
      args: [],
      kwargs: {},
      status: task.status,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      result: null,
    })),
  };

  useEffect(() => {
    const analyzeTasks = async () => {
      try {
        const analysisResult = await analyzeTaskData(aiInput);
        setAiAnalysis(analysisResult);
        console.log("AI Analysis Result:", analysisResult);
      } catch (error) {
        console.error("Error during AI analysis:", error);
      }
    };

    analyzeTasks();
  }, [taskData]); // Re-run when taskData changes

  const filteredTaskData = taskStatusFilter === "ALL"
    ? taskData
    : taskData.filter(task => task.status === taskStatusFilter);

  // Prepare data for the pie chart
  const chartData = [
    { name: 'Pending', value: taskData.filter(task => task.status === 'PENDING').length },
    { name: 'Running', value: taskData.filter(task => task.status === 'RUNNING').length },
    { name: 'Completed', value: taskData.filter(task => task.status === 'COMPLETED').length },
    { name: 'Failed', value: taskData.filter(task => task.status === 'FAILED').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Task Status Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <Table>
        <TableCaption>A list of your tasks.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Task Name</TableHead>
              <TableHead>Dependencies</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTaskData.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.id}</TableCell>
              <TableCell>{task.name}</TableCell>
                <TableCell>
                    {task.dependencies && task.dependencies.length > 0
                        ? task.dependencies.join(', ')
                        : 'None'}
                </TableCell>
              <TableCell>
                {task.status === "PENDING" && (
                  <Badge variant="secondary">Pending</Badge>
                )}
                {task.status === "RUNNING" && (
                  <Badge variant="accent">Running</Badge>
                )}
                {task.status === "COMPLETED" && (
                  <Badge>Completed</Badge>
                )}
                {task.status === "FAILED" && (
                  <Badge variant="destructive">Failed</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {aiAnalysis && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">AI Analysis</h2>
          <div>
            <h3>Bottlenecks:</h3>
            <ul>
              {aiAnalysis.bottlenecks.map((bottleneck, index) => (
                <li key={index}>{bottleneck}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Predicted Completion Times:</h3>
            <ul>
              {Object.entries(aiAnalysis.predictedCompletionTimes).map(([taskName, time]) => (
                <li key={taskName}>{taskName}: {time} seconds</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Suggested Scheduling Parameters:</h3>
            <ul>
              {Object.entries(aiAnalysis.suggestedSchedulingParameters).map(([parameter, value]) => (
                <li key={parameter}>{parameter}: {JSON.stringify(value)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
