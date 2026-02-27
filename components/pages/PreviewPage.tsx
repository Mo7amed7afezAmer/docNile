"use client";

import { Eye, EyeOff, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const metadataFields = [
  {
    tag: "(0010,0010)",
    name: "Patient Name",
    before: "John Michael Smith",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0010,0020)",
    name: "Patient ID",
    before: "MRN-2024-88421",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0010,0030)",
    name: "Date of Birth",
    before: "19850315",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0010,0040)",
    name: "Patient Sex",
    before: "M",
    after: "M",
    redacted: false,
  },
  {
    tag: "(0008,0020)",
    name: "Study Date",
    before: "20240115",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0008,0050)",
    name: "Accession Number",
    before: "ACC-2024-00142",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0008,0060)",
    name: "Modality",
    before: "CT",
    after: "CT",
    redacted: false,
  },
  {
    tag: "(0008,0070)",
    name: "Manufacturer",
    before: "SIEMENS",
    after: "SIEMENS",
    redacted: false,
  },
  {
    tag: "(0008,1030)",
    name: "Study Description",
    before: "CT CHEST W/O CONTRAST",
    after: "CT CHEST W/O CONTRAST",
    redacted: false,
  },
  {
    tag: "(0008,0090)",
    name: "Referring Physician",
    before: "Dr. Sarah Williams",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0008,1070)",
    name: "Operators' Name",
    before: "TECH_JOHNSON_R",
    after: "ANONYMIZED",
    redacted: true,
  },
  {
    tag: "(0010,1010)",
    name: "Patient Age",
    before: "039Y",
    after: "ANONYMIZED",
    redacted: true,
  },
];

const textComparison = {
  before: `DISCHARGE SUMMARY
Patient: John Michael Smith, MRN: 88421
DOB: March 15, 1985 | Attending: Dr. Sarah Williams
Admitted: 01/15/2024 | Discharged: 01/18/2024

CHIEF COMPLAINT: Persistent chest pain with shortness of breath.

HISTORY: Patient presented to ED on 01/15/2024 with substernal chest pain radiating to the left arm. Patient's wife, Jane Smith (contact: 555-0142), was present.`,

  after: `DISCHARGE SUMMARY
Patient: [REDACTED], MRN: [REDACTED]
DOB: [REDACTED] | Attending: [REDACTED]
Admitted: [REDACTED] | Discharged: [REDACTED]

CHIEF COMPLAINT: Persistent chest pain with shortness of breath.

HISTORY: Patient presented to ED on [REDACTED] with substernal chest pain radiating to the left arm. Patient's [REDACTED], [REDACTED] (contact: [REDACTED]), was present.`,
};

const PreviewPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {"Before / After Preview"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare original and de-identified data side by side
        </p>
      </div>

      {/* DICOM Metadata Comparison */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              {"DICOM Metadata — CT_Chest_Series.dcm"}
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-success/10 text-success border-0 font-semibold"
            >
              {metadataFields.filter((f) => f.redacted).length} PHI Fields
              Redacted
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-0 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2 px-4 py-2.5">Tag</div>
              <div className="col-span-2 px-4 py-2.5">Field</div>
              <div className="col-span-3 px-4 py-2.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Original
              </div>
              <div className="col-span-3 px-4 py-2.5 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" /> De-identified
              </div>
              <div className="col-span-2 px-4 py-2.5 text-right">Status</div>
            </div>
            {/* Rows */}
            {metadataFields.map((field, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-0 text-sm border-t border-border ${
                  field.redacted ? "bg-destructive/[0.03]" : ""
                }`}
              >
                <div className="col-span-2 px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {field.tag}
                </div>
                <div className="col-span-2 px-4 py-2.5 text-foreground font-medium">
                  {field.name}
                </div>
                <div
                  className={`col-span-3 px-4 py-2.5 font-mono text-xs ${field.redacted ? "text-destructive line-through" : "text-foreground"}`}
                >
                  {field.before}
                </div>
                <div
                  className={`col-span-3 px-4 py-2.5 font-mono text-xs ${field.redacted ? "text-success font-semibold" : "text-foreground"}`}
                >
                  {field.after}
                </div>
                <div className="col-span-2 px-4 py-2.5 text-right">
                  {field.redacted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                      Redacted
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Preserved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Text Comparison */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
            {"Clinical Notes — Discharge_Summary.pdf"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-foreground">
                  Original
                </span>
              </div>
              <pre className="text-xs leading-relaxed p-4 rounded-xl bg-destructive/[0.04] border border-destructive/10 text-foreground whitespace-pre-wrap font-mono">
                {textComparison.before}
              </pre>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-foreground">
                  De-identified
                </span>
              </div>
              <pre className="text-xs leading-relaxed p-4 rounded-xl bg-success/[0.04] border border-success/10 text-foreground whitespace-pre-wrap font-mono">
                {textComparison.after}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PreviewPage;
