"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batch_id");

  const [files, setFiles] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // ✅ Poll Backend
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

          // Merge all logs
          const allLogs = data.files.flatMap((f: any) =>
            f.logs?.map((log: string) => `[${f.filename}] ${log}`)
          );
          setLogs(allLogs);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [batchId]);

  // ✅ Calculate overall progress
  useEffect(() => {
    if (files.length === 0) return;
    const total =
      files.reduce((sum, f) => sum + f.progress, 0) / files.length;
    setOverallProgress(total);
  }, [files]);

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
                          file.status === "processing" ? "animate-spin" : ""
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
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}