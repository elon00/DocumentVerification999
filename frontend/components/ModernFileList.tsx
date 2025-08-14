import { useState } from "react";
import { File, Calendar, User, Eye, Hash, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileRecord {
  file_name: string;
  file_hash: string | number[];
  uploader: string;
  timestamp: string;
  verification_count: string;
}

interface ModernFileListProps {
  files: FileRecord[];
  onClearData?: () => void;
}

export function ModernFileList({ files, onClearData }: ModernFileListProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const uint8ArrayToHex = (array: number[]): string => {
    return array.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (files.length === 0) {
    return (
      <div className="card-3d p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
          <File className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No files stored yet</h3>
        <p className="text-muted-foreground mb-6">
          Upload your first file to start building your secure hash database
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Hash className="w-4 h-4" />
          <span>All files are stored locally in demo mode</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Stored Files
          </h2>
          <p className="text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} in your secure database
          </p>
        </div>
        {onClearData && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearData}
            className="text-red-400 border-red-500/30 hover:bg-red-500/10 btn-3d"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* File Grid */}
      <div className="grid gap-4">
        {files.map((file, index) => {
          const hash = typeof file.file_hash === 'string' 
            ? file.file_hash.startsWith('0x') 
              ? file.file_hash.slice(2) // Remove 0x prefix for display
              : file.file_hash
            : uint8ArrayToHex(file.file_hash);
          const isCopied = copiedHash === hash;
          
          return (
            <div
              key={index}
              className={`file-item p-6 space-y-4 slide-in-left animate-delay-${Math.min(index, 3)}`}
            >
              {/* File Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{file.file_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{formatAddress(file.uploader)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(file.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {file.verification_count} verification{file.verification_count !== '1' ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Hash Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    SHA-256 Hash
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hash)}
                    className="h-8 w-8 p-0 hover:bg-accent/20"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="font-mono text-xs bg-muted/50 p-3 rounded-lg border break-all leading-relaxed">
                    {hash}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Hash Length: {hash.length} chars</span>
                  <span>Algorithm: SHA-256</span>
                  <span>Status: ✅ Verified</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: #{index + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
