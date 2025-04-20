"use client";

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface TaskDependenciesProps {
    availableTasks: string[];
    selectedTasks: string[];
    onChange: (value: string[]) => void;
}

export const TaskDependencies: React.FC<TaskDependenciesProps> = ({ availableTasks, selectedTasks, onChange }) => {
    const handleTaskSelection = (task: string) => {
        if (selectedTasks.includes(task)) {
            onChange(selectedTasks.filter(t => t !== task));
        } else {
            onChange([...selectedTasks, task]);
        }
    };

    return (
        <Select onValueChange={(value) => handleTaskSelection(value)}>
            <SelectTrigger>
                <SelectValue placeholder="Select dependencies" />
            </SelectTrigger>
            <SelectContent>
                {availableTasks.map((task) => (
                    <SelectItem key={task} value={task}>
                        {task}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
