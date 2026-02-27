"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-success",
    bg: "bg-success/10",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    color: "text-info",
    bg: "bg-info/10",
  },
  queued: {
    icon: Clock,
    label: "Queued",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export default function ProcessingPage() {
  const router = useRouter();

  const [batchId, setBatchId] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // ✅ Validate batch_id from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem("batch_id");

    if (!id) {
      router.replace("/"); // redirect if opened directly
      return;
    }

    setBatchId(id);
  }, [router]);

  // ✅ Poll backend
  useEffect(() => {
    if (!batchId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/status/${batchId}`
        );
        const data = await res.json();

        if (data.files) {
          setFiles(data.files);

          const mergedLogs = data.files.flatMap((f: any) =>
            f.logs?.map((log: string) => `[${f.filename}] ${log}`)
          );

          setLogs(mergedLogs);

          // Stop polling if fully completed
          if (data.status === "completed") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 500);

    return () => clearInterval(interval);
  }, [batchId]);

  // ✅ Calculate overall progress
  useEffect(() => {
    if (files.length === 0) return;

    const total =
      files.reduce((sum, f) => sum + f.progress, 0) / files.length;

    setOverallProgress(total);
  }, [files]);

  if (!batchId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Processing Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Batch ID: {batchId}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Files</p>
            <p className="text-2xl font-bold">{files.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-success">
              {files.filter(f => f.status === "completed").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total PHI Removed</p>
            <p className="text-2xl font-bold text-primary">
              {files.reduce((sum, f) => sum + (f.phi_removed || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between mb-3">
            <span>Overall Progress</span>
            <span className="font-bold">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Files */}
        <div className="lg:col-span-3 space-y-3">
          {files.map((file, i) => {
            const config = statusConfig[file.status] || statusConfig.processing;
            const Icon = config.icon;

            return (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-lg ${config.bg}`}
                    >
                      <Icon
                        className={`w-4 h-4 ${config.color} ${
                          file.status === "processing"
                            ? "animate-spin"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">
                          {file.filename}
                        </p>
                        <span className={`text-xs ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={file.progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {file.phi_removed} PHI removed
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Processing Logs
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2 max-h-96 overflow-auto font-mono text-xs">

              {logs.map((log, i) => {
                let color = "text-foreground/80";

                if (log.toLowerCase().includes("completed")) {
                  color = "text-success";
                } else if (log.toLowerCase().includes("detected")) {
                  color = "text-info";
                } else if (log.toLowerCase().includes("error")) {
                  color = "text-destructive";
                } else if (log.toLowerCase().includes("warning")) {
                  color = "text-warning";
                }

                return (
                  <div key={i} className={color}>
                    {log}
                  </div>
                );
              })}

            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}