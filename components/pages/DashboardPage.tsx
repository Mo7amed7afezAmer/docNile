"use client";

import {
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Clock,
  Upload,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const stats = [
  {
    title: "Files Processed",
    value: "12,847",
    change: "+12.5%",
    icon: FileCheck,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "PHI Fields Removed",
    value: "284,391",
    change: "+8.2%",
    icon: ShieldCheck,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Success Rate",
    value: "99.7%",
    change: "+0.3%",
    icon: TrendingUp,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    title: "Pending Jobs",
    value: "23",
    change: "-5 today",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const recentJobs = [
  {
    name: "CT_Scan_Batch_042.zip",
    type: "DICOM",
    files: 156,
    status: "Completed",
    progress: 100,
  },
  {
    name: "Clinical_Notes_Q1.pdf",
    type: "PDF",
    files: 1,
    status: "Completed",
    progress: 100,
  },
  {
    name: "MRI_Research_Dataset.zip",
    type: "NIfTI",
    files: 89,
    status: "Processing",
    progress: 67,
  },
  {
    name: "Patient_Registry.csv",
    type: "CSV",
    files: 1,
    status: "Processing",
    progress: 34,
  },
  {
    name: "Radiology_Reports.zip",
    type: "PDF",
    files: 42,
    status: "Queued",
    progress: 0,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DashboardPage = () => {
  const router = useRouter();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your de-identification pipeline
          </p>
        </div>
        <Button
          onClick={() => router.push("/upload")}
          className="gradient-primary text-primary-foreground font-semibold gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload New Dataset
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs font-medium text-success">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Jobs */}
      <motion.div variants={item}>
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Processing Jobs
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-sm font-medium"
                onClick={() => router.push("/processing")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map((job, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                    <FileCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {job.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.type} · {job.files} file
                      {job.files > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="w-32 hidden sm:block">
                    <Progress value={job.progress} className="h-1.5" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      job.status === "Completed"
                        ? "bg-success/10 text-success"
                        : job.status === "Processing"
                          ? "bg-info/10 text-info"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
