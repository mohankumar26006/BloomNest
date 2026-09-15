import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { ScanMilestone, ScanReportAttachment } from "../types";
import {
  Card,
  Button,
  Badge,
  CardHeading,
  BodyText,
  Caption,
} from "./ui";
import {
  UploadCloud,
  FileText,
  X,
  Trash2,
  Eye,
  FileCheck,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";

interface ScanReportUploadModalProps {
  scan: ScanMilestone;
  onClose: () => void;
}

export const ScanReportUploadModal: React.FC<ScanReportUploadModalProps> = ({
  scan,
  onClose,
}) => {
  const { addScanReport, deleteScanReport, getScanReportsByScanId, showToast } = useApp();
  const existingReports = getScanReportsByScanId(scan.id);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileType: "pdf" | "image";
    fileSize: string;
    fileDataUrl: string;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [previewFile, setPreviewFile] = useState<ScanReportAttachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      showToast("File size exceeds 15 MB limit.");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      showToast("Please upload a valid PDF or Image file (.pdf, .png, .jpg, .jpeg).");
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedFile({
          fileName: file.name,
          fileType: isPdf ? "pdf" : "image",
          fileSize: `${sizeMb} MB`,
          fileDataUrl: reader.result,
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveReport = () => {
    if (!selectedFile) return;

    setIsUploading(true);

    setTimeout(() => {
      addScanReport({
        scanId: scan.id,
        fileName: selectedFile.fileName,
        fileType: selectedFile.fileType,
        fileSize: selectedFile.fileSize,
        fileDataUrl: selectedFile.fileDataUrl,
        notes: notes.trim() || undefined,
      });

      setIsUploading(false);
      setSelectedFile(null);
      setNotes("");
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* FULL IMAGE / PDF PREVIEW MODAL */}
      {previewFile ? (
        <div className="w-full max-w-3xl bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-rose-200 dark:border-rose-900/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm">
                {previewFile.fileType.toUpperCase()}
              </Badge>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100 truncate max-w-md">
                {previewFile.fileName}
              </h3>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="p-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl flex items-center justify-center min-h-[300px]">
            {previewFile.fileType === "image" ? (
              <img
                src={previewFile.fileDataUrl}
                alt={previewFile.fileName}
                className="max-h-[60vh] object-contain rounded-xl shadow-md"
              />
            ) : (
              <iframe
                src={previewFile.fileDataUrl}
                title={previewFile.fileName}
                className="w-full h-[60vh] rounded-xl border border-gray-300"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Caption className="text-gray-500">Uploaded on {previewFile.uploadedAt}</Caption>
            <a
              href={previewFile.fileDataUrl}
              download={previewFile.fileName}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </a>
          </div>
        </div>
      ) : (
        /* MAIN ATTACHMENT MODAL */
        <Card
          variant="glass"
          radius="3xl"
          className="w-full max-w-2xl bg-white dark:bg-[#1A1523] p-6 sm:p-8 space-y-6 shadow-2xl relative border border-rose-200 dark:border-rose-900/50"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rose-100 dark:border-rose-900/40 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="rose" size="sm">
                  {scan.type || "ULTRASOUND"}
                </Badge>
                <Badge variant="sage" size="sm">
                  {scan.weeks}
                </Badge>
              </div>
              <CardHeading text-2xl className="pt-1">{scan.title}</CardHeading>
              <Caption>Attach diagnostic scan reports (PDF or Images) stored securely on your device.</Caption>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Existing Attached Reports List */}
          {existingReports.length > 0 && (
            <div className="space-y-2">
              <Caption className="uppercase font-bold text-gray-500 dark:text-rose-300 block">
                Attached Reports ({existingReports.length})
              </Caption>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {existingReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#15111C] border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shrink-0">
                        {report.fileType === "pdf" ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs text-gray-900 dark:text-rose-100 truncate max-w-xs">
                          {report.fileName}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-rose-300">
                          {report.fileSize} · Uploaded {report.uploadedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewFile(report)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </Button>

                      <button
                        onClick={() => deleteScanReport(report.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                        title="Remove report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Dropzone */}
          <div className="space-y-3">
            <Caption className="uppercase font-bold text-gray-500 dark:text-rose-300 block">
              Attach New Report File
            </Caption>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 transition-all cursor-pointer text-center space-y-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-0.5">
                <div className="font-serif font-bold text-sm text-gray-900 dark:text-rose-100">
                  Drag & Drop report file here
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-300 font-semibold underline">
                  or browse from your device
                </div>
              </div>

              <Caption>Supported formats: PDF, JPG, JPEG, PNG (Max 15 MB)</Caption>
            </div>
          </div>

          {/* Selected New File Details */}
          {selectedFile && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#15111C] border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                    {selectedFile.fileType === "pdf" ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-rose-100 truncate max-w-xs">
                      {selectedFile.fileName}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-rose-300">{selectedFile.fileSize}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-full text-rose-600 hover:bg-rose-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Optional Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Add optional note (e.g. Normal Doppler, Dr. Sharma consultation)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#120E18] border border-rose-200 dark:border-rose-900/50 text-gray-900 dark:text-rose-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Save Trigger Button */}
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleSaveReport}
                isLoading={isUploading}
                leftIcon={<FileCheck className="w-4 h-4" />}
              >
                Save Report to {scan.title}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ScanReportUploadModal;
