"use client";

import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { getWorkers, startWorker, stopWorker } from "@/services/celery";

interface WorkerManagementProps {
  workersUpdated: boolean;
}

export const WorkerManagement: React.FC<WorkerManagementProps> = ({ workersUpdated }) => {
  const [workers, setWorkers] = useState<{ name: string; status: string; activeTasks: number; }[]>([]);

  useEffect(() => {
    const fetchWorkers = async () => {
      const workerData = await getWorkers();
      setWorkers(workerData);
    };

    fetchWorkers();
  }, [workersUpdated]);

  const handleStartWorker = async (workerName: string) => {
    await startWorker(workerName);
    // Optimistically update the UI
    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.name === workerName ? { ...worker, status: "online" } : worker
      )
    );
  };

  const handleStopWorker = async (workerName: string) => {
    await stopWorker(workerName);
    // Optimistically update the UI
    setWorkers(prevWorkers =>
      prevWorkers.map(worker =>
        worker.name === workerName ? { ...worker, status: "offline" } : worker
      )
    );
  };

  return (
    <div className="container mx-auto">
      <Table>
        <TableCaption>List of Celery Workers and their Status</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Worker Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Tasks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.name}>
              <TableCell className="font-medium">{worker.name}</TableCell>
              <TableCell>
                {worker.status === "online" && (
                  <Badge>Online</Badge>
                )}
                {worker.status === "offline" && (
                  <Badge variant="secondary">Offline</Badge>
                )}
              </TableCell>
              <TableCell>{worker.activeTasks}</TableCell>
              <TableCell>
                {worker.status === "offline" ? (
                  <Button size="sm" onClick={() => handleStartWorker(worker.name)}>
                    Start
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => handleStopWorker(worker.name)}>
                    Stop
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
