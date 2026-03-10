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

export default function AnalyticsPage() {
    const router = useRouter();

    const [batchId, setBatchId] = useState<string | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredFiles =
        statusFilter === "all"
            ? files
            : files.filter((f) => f.status === statusFilter);

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
            {/* Files Table */}
            <Card className="lg:col-span-3">

                {/* Header with Filter */}
                <CardHeader className="flex flex-row items-center justify-between">

                    <CardTitle className="text-lg font-semibold">
                        Files Analytics
                    </CardTitle>

                    <div className="flex items-center gap-2">

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm bg-background"
                        >
                            <option value="all">All</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="error">Error</option>
                        </select>

                    </div>
                </CardHeader>

                <CardContent>

                    <div className="overflow-x-auto rounded-md border">

                        <table className="w-full text-sm">

                            {/* Table Header */}
                            <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                                <tr className="text-left">
                                    <th className="py-3 px-4">File</th>
                                    <th className="px-4">Status</th>
                                    <th className="px-4">Diseases</th>
                                    <th className="px-4">Anatomy</th>
                                    <th className="px-4">Findings</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>

                                {filteredFiles.map((file, i) => {

                                    const config =
                                        statusConfig[file.status] || statusConfig.processing;

                                    const Icon = config.icon;

                                    return (
                                        <tr
                                            key={i}
                                            className="border-t hover:bg-muted/30 transition"
                                        >

                                            {/* File */}
                                            <td className="px-4 py-3 font-medium">
                                                {file.filename}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4">

                                                <div className="flex items-center gap-2">

                                                    <Icon
                                                        className={`w-4 h-4 ${config.color} ${file.status === "processing"
                                                                ? "animate-spin"
                                                                : ""
                                                            }`}
                                                    />

                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-md ${config.bg} ${config.color}`}
                                                    >
                                                        {config.label}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* Diseases */}
                                            <td className="px-4 max-w-[200px]">
                                                <div className="flex flex-wrap gap-1">
                                                    {file.analytics?.diseases?.length ? (
                                                        file.analytics.diseases.map((d: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded"
                                                            >
                                                                {d}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </td>

                                            {/* Anatomy */}
                                            <td className="px-4 max-w-[250px]">
                                                <div className="flex flex-wrap gap-1">
                                                    {file.analytics?.anatomy?.length ? (
                                                        file.analytics.anatomy.map((a: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded"
                                                            >
                                                                {a}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </td>

                                            {/* Findings */}
                                            <td className="px-4 max-w-[350px] truncate">
                                                {file.analytics?.findings?.join(", ") || "-"}
                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                </CardContent>
            </Card>
        </motion.div>
    );
}