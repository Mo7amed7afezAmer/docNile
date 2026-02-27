"use client";

import {
  ClipboardCheck,
  Download,
  FileCheck,
  Users,
  Calendar,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const auditLogs = [
  {
    time: "2024-01-18 14:23:01",
    user: "Dr. Sarah Chen",
    action: "Uploaded CT_Chest_Series.dcm",
    result: "Success",
  },
  {
    time: "2024-01-18 14:23:12",
    user: "System",
    action: "De-identification completed — 47 PHI fields removed",
    result: "Success",
  },
  {
    time: "2024-01-18 13:10:45",
    user: "James Miller",
    action: "Downloaded audit certificate #AUD-2024-0142",
    result: "Success",
  },
  {
    time: "2024-01-18 11:30:22",
    user: "Dr. Sarah Chen",
    action: "Modified custom PHI rules template",
    result: "Success",
  },
  {
    time: "2024-01-17 16:45:10",
    user: "Admin",
    action: "Added user 'reviewer@hospital.org' with Reviewer role",
    result: "Success",
  },
  {
    time: "2024-01-17 14:20:33",
    user: "System",
    action: "Batch processing: 156 DICOM files de-identified",
    result: "Success",
  },
  {
    time: "2024-01-17 09:15:00",
    user: "System",
    action: "Daily compliance check completed",
    result: "Pass",
  },
];

const certificates = [
  {
    id: "AUD-2024-0142",
    date: "Jan 18, 2024",
    type: "HIPAA Compliance",
    files: 156,
    status: "Valid",
  },
  {
    id: "AUD-2024-0138",
    date: "Jan 15, 2024",
    type: "GDPR Data Processing",
    files: 89,
    status: "Valid",
  },
  {
    id: "AUD-2024-0130",
    date: "Jan 10, 2024",
    type: "De-identification Report",
    files: 342,
    status: "Valid",
  },
];

const AuditPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {"Audit & Compliance"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track activity and export compliance certificates
          </p>
        </div>
        <Button variant="outline" className="gap-2 font-semibold">
          <Download className="w-4 h-4" />
          Export Full Audit Log
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Compliance Score",
            value: "100%",
            icon: Shield,
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            title: "Audit Events (30d)",
            value: "1,247",
            icon: ClipboardCheck,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            title: "Active Users",
            value: "8",
            icon: Users,
            color: "text-info",
            bg: "bg-info/10",
          },
        ].map((stat) => (
          <Card key={stat.title} className="shadow-card border-border/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Certificates */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            Compliance Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-success/10">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {cert.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cert.id} · {cert.date} · {cert.files} files
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success border-0 font-semibold text-xs"
                >
                  {cert.status}
                </Badge>
                <Button variant="ghost" size="sm" className="text-primary">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            User Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {auditLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors text-sm"
              >
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap mt-0.5">
                  {log.time}
                </span>
                <span className="font-medium text-primary whitespace-nowrap">
                  {log.user}
                </span>
                <span className="text-foreground/80 flex-1">{log.action}</span>
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success border-0 text-xs"
                >
                  {log.result}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AuditPage;
