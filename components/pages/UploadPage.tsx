"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload as UploadIcon,
  FileUp,
  X,
  Settings2,
  Shield,
  Scan,
  FileText,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const formatIcons: Record<string, typeof FileText> = {
  DICOM: Database,
  NIFTI: Scan,
  PDF: FileText,
  CSV: FileText,
};

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [options, setOptions] = useState({
    removeMetadata: true,
    faceAnonymization: true,
    textRedaction: true,
    customPHI: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ✅ Handle File Selection (from PC)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  // ✅ Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  // ✅ Upload to API
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file); // Must match backend key
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.batch_id) {
        sessionStorage.setItem("batch_id", data.batch_id);
        router.push(`/processing`);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading files");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Data</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload medical files for secure de-identification
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            {/* Hidden Input */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <UploadIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-semibold">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports DICOM, NIfTI, PDF, CSV · Max 2GB per file
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {files.map((file, i) => {
                  const type =
                    file.name.split(".").pop()?.toUpperCase() || "UNKNOWN";
                  const Icon = formatIcons[type] || FileText;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {type} · {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setFiles((prev) =>
                            prev.filter((_, index) => index !== i)
                          )
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options + Button */}
        <Card className="shadow-card border-border/60 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              De-identification Options
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="w-full gradient-primary text-primary-foreground font-semibold gap-2"
            >
              <FileUp className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Start Processing"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UploadPage;