"use client";

import { useState, useEffect } from "react";
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

const initialFiles = [
  {
    name: "CT_Chest_Series.dcm",
    status: "completed" as const,
    progress: 100,
    phiRemoved: 47,
  },
  {
    name: "MRI_Brain_T2.nii.gz",
    status: "completed" as const,
    progress: 100,
    phiRemoved: 23,
  },
  {
    name: "Discharge_Summary.pdf",
    status: "processing" as const,
    progress: 67,
    phiRemoved: 12,
  },
  {
    name: "Patient_Demographics.csv",
    status: "processing" as const,
    progress: 34,
    phiRemoved: 8,
  },
  {
    name: "Xray_Report_001.pdf",
    status: "queued" as const,
    progress: 0,
    phiRemoved: 0,
  },
  {
    name: "Lab_Results_Batch.csv",
    status: "queued" as const,
    progress: 0,
    phiRemoved: 0,
  },
];

const logs = [
  {
    time: "14:23:01",
    msg: "Processing started for CT_Chest_Series.dcm",
    level: "info",
  },
  {
    time: "14:23:04",
    msg: "DICOM metadata parsed — 47 PHI fields detected",
    level: "info",
  },
  {
    time: "14:23:08",
    msg: "Patient Name, DOB, MRN successfully removed",
    level: "success",
  },
  {
    time: "14:23:12",
    msg: "Face anonymization applied to 3D reconstruction",
    level: "success",
  },
  {
    time: "14:23:15",
    msg: "MRI_Brain_T2.nii.gz — 23 PHI fields redacted",
    level: "success",
  },
  {
    time: "14:23:18",
    msg: "Discharge_Summary.pdf — text redaction in progress",
    level: "info",
  },
  {
    time: "14:23:20",
    msg: "Warning: Non-standard date format detected in row 42",
    level: "warning",
  },
  {
    time: "14:23:22",
    msg: "Applying custom PHI rules to clinical notes...",
    level: "info",
  },
];

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

const ProcessingPage = () => {
  const [files] = useState(initialFiles);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const total =
      files.reduce((sum, f) => sum + f.progress, 0) / files.length;
    const timer = setTimeout(() => setOverallProgress(total), 300);
    return () => clearTimeout(timer);
  }, [files]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Processing Pipeline
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time de-identification progress
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="shadow-card border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2.5" />
          <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
            <span>
              {files.filter((f) => f.status === "completed").length} completed
            </span>
            <span>
              {files.filter((f) => f.status === "processing").length} processing
            </span>
            <span>
              {files.filter((f) => f.status === "queued").length} queued
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* File List */}
        <div className="lg:col-span-3 space-y-2">
          {files.map((file, i) => {
            const config = statusConfig[file.status];
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-card border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-lg ${config.bg}`}
                      >
                        <Icon
                          className={`w-4 h-4 ${config.color} ${file.status === "processing" ? "animate-spin" : ""}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <span
                            className={`text-xs font-semibold ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Progress
                            value={file.progress}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {file.phiRemoved} PHI removed
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Logs */}
        <Card className="lg:col-span-2 shadow-card border-border/60 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Processing Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-foreground/[0.03] rounded-xl p-3 space-y-2 max-h-80 overflow-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">
                    [{log.time}]
                  </span>
                  <span
                    className={
                      log.level === "success"
                        ? "text-success"
                        : log.level === "warning"
                          ? "text-warning"
                          : "text-foreground/80"
                    }
                  >
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ProcessingPage;
