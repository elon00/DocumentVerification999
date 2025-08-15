import { useState, useCallback, useEffect } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { MODULE_ADDRESS } from "@/constants";
import { submitTransactionWithToast } from "@/utils/transactionHelpers";
import { getAllFiles } from "@/view-functions/getAllFiles";
import { 
  Upload, 
  FileCheck, 
  Hash, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  File,
  Database,
  Lock,
  Calendar,
  User,
  Search,
  FileText,
  HardDrive
} from "lucide-react";

export function CleanFileHashVerifier({ onDataUpdate }: { onDataUpdate?: () => void }) {
  const { account, signAndSubmitTransaction } = useWallet();
  
  // Store tab state
  const [storeFile, setStoreFile] = useState<File | null>(null);
  const [storeFileHash, setStoreFileHash] = useState("");
  const [isStoring, setIsStoring] = useState(false);
  
  // Verify tab state
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyFileHash, setVerifyFileHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    exists: boolean;
    hashMatch: boolean;
    message: string;
    fileContent?: string;
    timestamp?: string;
    uploader?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Database state
  const [blockchainFiles, setBlockchainFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
    type: string;
    content: string;
    hash: string;
  } | null>(null);

  // Calculate SHA-256 hash of a file
  const calculateFileHash = useCallback(async (file: File): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return new Uint8Array(hashBuffer);
  }, []);

  // Convert Uint8Array to hex string
  const uint8ArrayToHex = useCallback((array: Uint8Array): string => {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  // Helper function to normalize hash format for comparison
  const normalizeHashToHex = useCallback((hash: string | number[] | Uint8Array): string => {
    if (typeof hash === 'string') {
      return hash;
    } else if (Array.isArray(hash)) {
      return hash.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    } else if (hash instanceof Uint8Array) {
      return uint8ArrayToHex(hash);
    }
    return '';
  }, [uint8ArrayToHex]);

  // Enhanced file content analysis
  const analyzeFileContent = useCallback(async (file: File): Promise<{
    preview: string;
    type: string;
    size: number;
    isText: boolean;
  }> => {
    const isTextFile = file.type.startsWith('text/') || 
                      file.name.endsWith('.txt') || 
                      file.name.endsWith('.md') || 
                      file.name.endsWith('.json') ||
                      file.name.endsWith('.csv');
    
    let preview = '';
    if (isTextFile && file.size < 1024 * 100) { // Max 100KB for preview
      try {
        preview = await file.text();
        if (preview.length > 500) {
          preview = preview.substring(0, 500) + '...';
        }
      } catch (error) {
        preview = '[Unable to read file content]';
      }
    } else {
      preview = `[Binary file: ${file.type || 'Unknown type'}]`;
    }

    return {
      preview,
      type: file.type || 'Unknown',
      size: file.size,
      isText: isTextFile
    };
  }, []);

  // Load blockchain files
  const loadBlockchainFiles = useCallback(async () => {
    if (!account) return;
    
    setIsLoadingFiles(true);
    try {
      const files = await getAllFiles();
      setBlockchainFiles(files);
    } catch (error) {
      console.error("Error loading blockchain files:", error);
      toast({
        title: "Error",
        description: "Failed to load blockchain files",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [account]);

  // Load files on component mount and account change
  useEffect(() => {
    if (account) {
      loadBlockchainFiles();
    }
  }, [account, loadBlockchainFiles]);

  // Handle file selection for storing
  const handleStoreFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setStoreFile(selectedFile);
      
      try {
        const hash = await calculateFileHash(selectedFile);
        setStoreFileHash(uint8ArrayToHex(hash));
        
        // Analyze file content for better verification
        const contentAnalysis = await analyzeFileContent(selectedFile);
        setFilePreview({
          name: selectedFile.name,
          size: selectedFile.size,
          type: contentAnalysis.type,
          content: contentAnalysis.preview,
          hash: uint8ArrayToHex(hash)
        });
        
        toast({
          title: "✅ File analyzed",
          description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)}KB) ready for blockchain storage`,
        });
      } catch (error) {
        console.error("Error calculating file hash:", error);
        toast({
          title: "Error",
          description: "Failed to calculate file hash",
          variant: "destructive",
        });
      }
    }
  }, [calculateFileHash, uint8ArrayToHex, analyzeFileContent]);

  // Handle file selection for verification
  const handleVerifyFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setVerifyFile(selectedFile);
      setVerificationResult(null); // Reset previous results
      
      try {
        const hash = await calculateFileHash(selectedFile);
        setVerifyFileHash(uint8ArrayToHex(hash));
        
        // Analyze file content for comprehensive verification
        const contentAnalysis = await analyzeFileContent(selectedFile);
        
        // Check if file exists in blockchain
        console.log('🔍 Looking for file:', selectedFile.name);
        console.log('🔍 Computed hash for search:', normalizeHashToHex(hash));
        console.log('🔍 Available blockchain files:', blockchainFiles.map(f => ({
          name: f.file_name,
          hash: normalizeHashToHex(f.file_hash)
        })));
        
        const existingFile = blockchainFiles.find(file => {
          const nameMatch = file.file_name === selectedFile.name;
          const hashMatch = normalizeHashToHex(file.file_hash) === normalizeHashToHex(hash);
          console.log(`🔍 Checking file ${file.file_name}: nameMatch=${nameMatch}, hashMatch=${hashMatch}`);
          return nameMatch || hashMatch;
        });
        
        if (existingFile) {
          console.log('🔍 Raw existingFile.file_hash:', existingFile.file_hash);
          console.log('🔍 Type of existingFile.file_hash:', typeof existingFile.file_hash);
          console.log('🔍 Is array:', Array.isArray(existingFile.file_hash));
          console.log('🔍 Raw computed hash:', hash);
          console.log('🔍 Type of computed hash:', typeof hash);
          
          const existingFileHashHex = normalizeHashToHex(existingFile.file_hash);
          const computedHashHex = normalizeHashToHex(hash);
          console.log('🔍 Hash comparison:');
          console.log('  Existing file hash:', existingFileHashHex);
          console.log('  Computed hash:', computedHashHex);
          console.log('  Match:', existingFileHashHex === computedHashHex);
          
          setVerificationResult({
            exists: true,
            hashMatch: existingFileHashHex === computedHashHex,
            message: `✅ File found in blockchain! Uploaded by ${existingFile.uploader} on ${new Date(parseInt(existingFile.timestamp) * 1000).toLocaleDateString()}`,
            fileContent: contentAnalysis.preview,
            timestamp: existingFile.timestamp,
            uploader: existingFile.uploader
          });
        } else {
          setVerificationResult({
            exists: false,
            hashMatch: false,
            message: "❌ File not found in blockchain database",
            fileContent: contentAnalysis.preview
          });
        }
        
        toast({
          title: "🔍 File analyzed",
          description: `Content verification complete for ${selectedFile.name}`,
        });
      } catch (error) {
        console.error("Error calculating file hash:", error);
        toast({
          title: "Error",
          description: "Failed to calculate file hash",
          variant: "destructive",
        });
      }
    }
  }, [calculateFileHash, uint8ArrayToHex, analyzeFileContent, blockchainFiles, normalizeHashToHex]);

  // Store file hash on blockchain
  const handleStoreFile = async () => {
    if (!storeFile || !account || !signAndSubmitTransaction) {
      toast({
        title: "Error",
        description: "Please select a file and ensure your wallet is connected",
        variant: "destructive",
      });
      return;
    }

    setIsStoring(true);
    try {
      const hash = await calculateFileHash(storeFile);
      console.log("📁 Storing file:", storeFile.name, "Hash bytes:", hash.length);
      
      const transaction: InputTransactionData = {
        data: {
          function: `${MODULE_ADDRESS}::complete_file_hash_verifier::store_file_hash`,
          functionArguments: [storeFile.name, Array.from(hash)],
        },
      };

      await submitTransactionWithToast(
        signAndSubmitTransaction,
        transaction,
        {
          successTitle: "🔒 File Stored!",
          successDescription: `File "${storeFile.name}" hash has been permanently stored on the Aptos blockchain`,
          onSuccess: () => {
            // Reset form
            setStoreFile(null);
            setStoreFileHash("");
            setFilePreview(null);
            // Reload blockchain files to show the newly added file
            loadBlockchainFiles();
            // Notify parent component to refresh data
            if (onDataUpdate) {
              console.log("🔄 Notifying parent to refresh data...");
              onDataUpdate();
            }
          }
        }
      );
      
    } catch (error: any) {
      console.error("❌ Error storing file hash:", error);
      // Error handling is done in submitTransactionWithToast
    } finally {
      setIsStoring(false);
    }
  };

  // Verify file hash against blockchain
  const handleVerifyFile = async () => {
    if (!verifyFile || !account) {
      toast({
        title: "Error",
        description: "Please select a file and ensure your wallet is connected",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // The verification has already been done in handleVerifyFileSelect
      // Just show the result that was already calculated
      if (verificationResult) {
        toast({
          title: verificationResult.hashMatch ? "✅ Verification Successful!" : "❌ Verification Failed",
          description: verificationResult.message,
          variant: verificationResult.hashMatch ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Please select a file first to verify",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during verification:", error);
      toast({
        title: "Error",
        description: "Failed to verify file",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
          <TabsTrigger value="store" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900">
            <Upload className="h-4 w-4" />
            Store Document
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900">
            <FileCheck className="h-4 w-4" />
            Verify Document
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900">
            <HardDrive className="h-4 w-4" />
            File Database
          </TabsTrigger>
        </TabsList>

        {/* Store Document Tab */}
        <TabsContent value="store" className="space-y-6">
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                Store Document on Blockchain
              </CardTitle>
              <CardDescription>
                Upload a document to store its cryptographic hash permanently on the Aptos blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="store-file" className="text-white">Select Document</Label>
                <Input
                  id="store-file"
                  type="file"
                  onChange={handleStoreFileSelect}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {storeFile && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <File className="h-4 w-4" />
                    <span>{storeFile.name} ({(storeFile.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}
              </div>

              {/* File Hash Display */}
              {storeFileHash && (
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Document Hash (SHA-256)
                  </Label>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <code className="text-green-400 text-xs break-all font-mono">
                      {storeFileHash}
                    </code>
                  </div>
                  <p className="text-slate-400 text-sm">
                    This cryptographic hash will be stored on the blockchain for verification
                  </p>
                </div>
              )}

              {/* File Content Preview */}
              {filePreview && (
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content Preview
                  </Label>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-slate-300">
                      <span>📄 {filePreview.name}</span>
                      <span>📦 {(filePreview.size / 1024).toFixed(1)}KB</span>
                      <span>🔍 {filePreview.type}</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto bg-slate-800/50 p-2 rounded text-xs text-slate-300 font-mono">
                      {filePreview.content}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    ℹ️ Only the cryptographic hash is stored on blockchain, not the actual content
                  </p>
                </div>
              )}

              {/* Store Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleStoreFile}
                  disabled={!storeFile || isStoring}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isStoring ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Storing on Blockchain...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Store on Blockchain
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-medium mb-1">Blockchain Security</p>
                    <p className="text-blue-200 text-sm">
                      Once stored, the document hash becomes immutable proof of existence and integrity.
                      Only the hash is stored - not the actual document content.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verify Document Tab */}
        <TabsContent value="verify" className="space-y-6">
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Verify Document Authenticity
              </CardTitle>
              <CardDescription>
                Upload a document to verify its authenticity against the blockchain record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="verify-file" className="text-white">Select Document to Verify</Label>
                <Input
                  id="verify-file"
                  type="file"
                  onChange={handleVerifyFileSelect}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {verifyFile && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <File className="h-4 w-4" />
                    <span>{verifyFile.name} ({(verifyFile.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}
              </div>

              {/* File Hash Display */}
              {verifyFileHash && (
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Computed Hash
                  </Label>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <code className="text-green-400 text-xs break-all font-mono">
                      {verifyFileHash}
                    </code>
                  </div>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <div className={`p-4 rounded-lg border ${
                  verificationResult.exists && verificationResult.hashMatch
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    {verificationResult.exists && verificationResult.hashMatch ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className={`font-medium mb-1 ${
                          verificationResult.exists && verificationResult.hashMatch
                            ? 'text-green-300'
                            : 'text-red-300'
                        }`}>
                          {verificationResult.exists && verificationResult.hashMatch 
                            ? 'Document Verified' 
                            : 'Verification Failed'
                          }
                        </p>
                        <p className={`text-sm ${
                          verificationResult.exists && verificationResult.hashMatch
                            ? 'text-green-200'
                            : 'text-red-200'
                        }`}>
                          {verificationResult.message}
                        </p>
                      </div>
                      
                      {/* Additional verification details */}
                      {verificationResult.exists && verificationResult.uploader && (
                        <div className="text-xs text-slate-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>Uploader: {verificationResult.uploader}</span>
                          </div>
                          {verificationResult.timestamp && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Stored: {new Date(parseInt(verificationResult.timestamp) * 1000).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Content preview for verification */}
                      {verificationResult.fileContent && (
                        <div className="border-t border-slate-600 pt-3">
                          <Label className="text-slate-300 text-xs flex items-center gap-1 mb-2">
                            <FileText className="h-3 w-3" />
                            Content Analysis
                          </Label>
                          <div className="max-h-24 overflow-y-auto bg-slate-800/50 p-2 rounded text-xs text-slate-300 font-mono">
                            {verificationResult.fileContent}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleVerifyFile}
                  disabled={!verifyFile || isVerifying}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Document
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-300 font-medium mb-1">How Verification Works</p>
                    <p className="text-green-200 text-sm">
                      We calculate your document's hash and compare it with the blockchain record.
                      A match confirms the document hasn't been altered since it was stored.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-purple-400" />
                Blockchain File Database
              </CardTitle>
              <CardDescription>
                View all documents stored on the Aptos blockchain with their verification details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Stats */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    onClick={loadBlockchainFiles}
                    disabled={isLoadingFiles}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-700"
                  >
                    {isLoadingFiles ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-slate-400">
                  {blockchainFiles.length} files in database
                </div>
              </div>

              {/* Files List */}
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  <span className="ml-2 text-slate-300">Loading blockchain files...</span>
                </div>
              ) : blockchainFiles.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No files found in the blockchain database</p>
                  <p className="text-sm mt-1">Upload files using the "Store Document" tab</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockchainFiles
                    .filter(file => 
                      !searchTerm || 
                      file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      file.uploader.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((file, index) => (
                      <div key={index} className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-400" />
                              <span className="text-white font-medium">{file.file_name}</span>
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                                <Lock className="h-3 w-3" />
                                Verified
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Uploader: {file.uploader.slice(0, 8)}...{file.uploader.slice(-6)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Stored: {new Date(parseInt(file.timestamp) * 1000).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-slate-400 text-xs">SHA-256 Hash:</Label>
                              <code className="block p-2 bg-slate-800/50 rounded text-green-400 text-xs font-mono break-all">
                                {Array.isArray(file.file_hash) 
                                  ? file.file_hash.map((b: number) => b.toString(16).padStart(2, '0')).join('')
                                  : file.file_hash
                                }
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
