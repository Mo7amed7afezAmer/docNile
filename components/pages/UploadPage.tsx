"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload as UploadIcon,
  FileUp,
  X,
  Settings2,
  Scan,
  FileText,
  Database,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const formatIcons: Record<string, typeof FileText> = {
  DICOM: Database,
  NIFTI: Scan,
  PDF: FileText,
  CSV: FileText,
};

const UploadPage = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // ---------------------------
  // Upload Files
  // ---------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files).map((file: any) => {
      file.relativePath = file.name;
      return file;
    });

    setFiles((prev) => [...prev, ...selected]);
  };

  // ---------------------------
  // Upload Folder
  // ---------------------------
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const folderFiles = Array.from(e.target.files).map((file: any) => {
      file.relativePath = file.webkitRelativePath;
      return file;
    });

    setFiles((prev) => [...prev, ...folderFiles]);
  };

  // ---------------------------
  // Drag & Drop
  // ---------------------------
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).map((file: any) => {
      file.relativePath = file.webkitRelativePath || file.name;
      return file;
    });

    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  // ---------------------------
  // Upload to API
  // ---------------------------
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();

    files.forEach((file) => {
      const path =
        file.relativePath || file.webkitRelativePath || file.name;

      formData.append("files", file, path);
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.batch_id) {
        sessionStorage.setItem("batch_id", data.batch_id);
        router.push("/processing");
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload error");
    }

    setIsUploading(false);
  };
  const handleUploadReports = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();

    files.forEach((file) => {
      const path =
        file.relativePath || file.webkitRelativePath || file.name;

      formData.append("files", file, path);
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/upreports", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.batch_id) {
        sessionStorage.setItem("batch_id", data.batch_id);
        router.push("/analysis");
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload error");
    }

    setIsUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Upload Data</h1>
        <p className="text-sm text-muted-foreground">
          Upload medical files for secure de-identification
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-4">

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition ${isDragging
              ? "border-primary bg-primary/5"
              : "border-border"
              }`}
          >
            <div className="flex flex-col items-center gap-3">
              <UploadIcon className="w-8 h-8 text-primary" />

              <p className="font-semibold">
                Drag files or folder here
              </p>

              <div className="flex gap-3">

                <Button
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Files
                </Button>

                <Button
                  onClick={() => folderInputRef.current?.click()}
                >
                  Upload Folder
                </Button>

              </div>
            </div>
          </div>

          {/* hidden inputs */}

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          <input
            type="file"
            multiple
            //@ts-ignore
            webkitdirectory="true"
            ref={folderInputRef}
            onChange={handleFolderSelect}
            className="hidden"
          />

          {/* File List */}

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div className="space-y-2">

                {files.map((file, i) => {
                  const type =
                    file.name.split(".").pop()?.toUpperCase() || "UNKNOWN";

                  const Icon = formatIcons[type] || FileText;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                    >
                      <Icon className="w-4 h-4 text-primary" />

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {file.relativePath}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setFiles((prev) =>
                            prev.filter((_, index) => index !== i)
                          )
                        }
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

        {/* Upload Button */}

        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
          </CardHeader>

          <CardContent>

            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="w-full"
            >
              <FileUp className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Start Processing"}
            </Button>

          </CardContent>
          <CardContent>

            <Button
              onClick={handleUploadReports}
              disabled={files.length === 0 || isUploading}
              className="w-full"
            >
              <FileUp className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Start analysis"}
            </Button>

          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UploadPage;