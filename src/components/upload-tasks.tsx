"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

interface UploadTasksProps {
    setTasks: (tasks: string[]) => void;
    setAvailableTasks: (tasks: string[]) => void;
}

export const UploadTasks: React.FC<UploadTasksProps> = ({ setTasks, setAvailableTasks }) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file.name.endsWith(".txt")) {
        setFileError("Please upload a .txt file");
        return;
      }
      setFileError(null);

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const tasks = text.split("\n").map((task) => task.trim()).filter(Boolean);
        setTasks(tasks);
          setAvailableTasks(tasks);
      };
      reader.readAsText(file);
    },
    [setTasks, setAvailableTasks]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
      <div {...getRootProps()} className="w-full text-center">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <>
            <File className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p>
              Drag 'n' drop some files here, or click to select files
            </p>
            {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
          </>
        )}
      </div>
    </div>
  );
};
