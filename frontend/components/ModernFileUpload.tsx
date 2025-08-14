import { useState, useCallback, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ModernFileUploadProps {
  onFileSelect: (file: File) => void;
  fileName?: string;
  fileHash?: string;
  onFileNameChange?: (name: string) => void;
  accept?: string;
  title: string;
  description: string;
}

export function ModernFileUpload({
  onFileSelect,
  fileName,
  fileHash,
  onFileNameChange,
  accept,
  title,
  description
}: ModernFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateUpload(() => onFileSelect(files[0]));
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(() => onFileSelect(files[0]));
    }
  }, [onFileSelect]);

  const simulateUpload = useCallback((callback: () => void) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            callback();
            setUploadProgress(0);
          }, 200);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  }, []);

  const clearFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileNameChange?.('');
    setUploadProgress(0);
  }, [onFileNameChange]);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-accent bg-accent/10 scale-105' 
            : 'border-border hover:border-accent/50 hover:bg-accent/5'
          }
          ${fileName ? 'border-green-500 bg-green-500/10' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept={accept}
          className="hidden"
        />
        
        {uploadProgress > 0 && uploadProgress < 100 ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Processing file...</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : fileName ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-400">File uploaded successfully!</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="btn-3d"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-xs text-muted-foreground">
                Click to browse or drag and drop files here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Name Input */}
      {fileName && onFileNameChange && (
        <div className="space-y-2 fade-in">
          <Label htmlFor="filename" className="text-sm font-medium">
            File Name
          </Label>
          <div className="relative">
            <File className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="filename"
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              className="input-modern w-full pl-10 pr-4 py-3 rounded-lg"
              placeholder="Enter file name..."
            />
          </div>
        </div>
      )}

      {/* File Hash Display */}
      {fileHash && (
        <div className="space-y-2 fade-in">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent" />
            SHA-256 Hash
          </Label>
          <div className="relative">
            <input
              type="text"
              value={fileHash}
              readOnly
              className="input-modern w-full px-4 py-3 rounded-lg font-mono text-xs bg-muted/50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent opacity-50 pointer-events-none rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
