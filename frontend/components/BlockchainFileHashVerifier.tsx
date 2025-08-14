import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ModernFileUpload } from "@/components/ModernFileUpload";
import { ModernFileList } from "@/components/ModernFileList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, CheckCircle, AlertCircle, Zap, Database, Wallet, FileCheck, FileX, Calendar, User, ExternalLink } from "lucide-react";

// Blockchain functions
import { getAllFiles, FileRecord } from "@/view-functions/getAllFiles";
import { MODULE_ADDRESS } from "@/constants";

export function BlockchainFileHashVerifier() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [verifyFileName, setVerifyFileName] = useState("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [allFiles, setAllFiles] = useState<FileRecord[]>([]);
  const [isStoring, setIsStoring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contractDeployed, setContractDeployed] = useState<boolean | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string>("");
  
  // Verification result modal state
  const [showVerificationResult, setShowVerificationResult] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    fileName: string;
    originalName?: string;
    uploadDate?: string;
    uploader?: string;
    message: string;
    txHash?: string;
  } | null>(null);

  // Function to calculate SHA-256 hash of a file
  const calculateFileHash = useCallback(async (file: File): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return new Uint8Array(hashBuffer);
  }, []);

  // Function to convert Uint8Array to hex string
  const uint8ArrayToHex = useCallback((array: Uint8Array): string => {
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }, []);

  // Load files from blockchain
  const loadBlockchainFiles = useCallback(async () => {
    if (!connected) return;
    
    setIsLoading(true);
    try {
      console.log("🔍 Checking contract deployment and loading files...");
      console.log("📍 MODULE_ADDRESS:", MODULE_ADDRESS);
      
      if (!MODULE_ADDRESS || MODULE_ADDRESS === "0x1") {
        console.error("❌ MODULE_ADDRESS not configured properly");
        setContractDeployed(false);
        toast({
          title: "❌ Configuration Error",
          description: "MODULE_ADDRESS not set in environment variables",
          variant: "destructive",
        });
        return;
      }
      
      const files = await getAllFiles();
      setAllFiles(files);
      setContractDeployed(true);
      toast({
        title: "✅ Blockchain Connected",
        description: `Loaded ${files.length} files from real Aptos blockchain`,
      });
    } catch (error) {
      console.error("Error loading files:", error);
      setContractDeployed(false);
      
      // Check if it's a module not found error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("module_not_found") || errorMessage.includes("Module not found") || errorMessage.includes("RESOURCE_NOT_FOUND")) {
        toast({
          title: "📋 Contract Not Found",
          description: "Smart contract not found at the configured address. Please check deployment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Blockchain Error",
          description: `Failed to connect to blockchain: ${errorMessage}`,
          variant: "destructive",
        });
      }
      setAllFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [connected]);

  // Handle file selection and hash calculation
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    try {
      const hash = await calculateFileHash(selectedFile);
      const hashHex = uint8ArrayToHex(hash);
      setFileHash(hashHex);
    } catch (error) {
      console.error("Error calculating hash:", error);
      toast({
        title: "Error",
        description: "Failed to calculate file hash",
        variant: "destructive",
      });
    }
  }, [calculateFileHash, uint8ArrayToHex]);

  // Store file hash on blockchain
  const handleStoreFileHash = useCallback(async () => {
    if (!file || !fileName || !connected || !account) {
      toast({
        title: "Error", 
        description: "Please connect wallet and select a file",
        variant: "destructive",
      });
      return;
    }

    if (contractDeployed === false) {
      toast({
        title: "📋 Contract Not Deployed",
        description: "Please deploy the smart contract first. Check the deployment guide above.",
        variant: "destructive",
      });
      return;
    }

    setIsStoring(true);
    try {
      const hash = await calculateFileHash(file);
      console.log("🔐 Calculated hash:", uint8ArrayToHex(hash));
      
      console.log("📝 Preparing real blockchain transaction...");
      
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::file_hash_verifier::store_file_hash`,
          functionArguments: [fileName, Array.from(hash)],
        },
      });

      console.log("✅ Real transaction submitted:", response);
      
      // Extract transaction hash
      const txHash = typeof response === 'string' ? response : response.hash;
      setLastTxHash(txHash);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confirmation
      
      toast({
        title: "🎉 Real Blockchain Success!",
        description: `File stored on Aptos! TX: ${txHash.slice(0, 16)}... Check your Petra wallet!`,
      });

      // Refresh the files list
      await loadBlockchainFiles();
      
      // Reset form
      setFile(null);
      setFileName("");
      setFileHash("");
      
      // Show explorer link after a delay
      setTimeout(() => {
        toast({
          title: "🔍 View on Aptos Explorer",
          description: `https://explorer.aptoslabs.com/txn/${txHash}`,
        });
      }, 1000);

    } catch (error) {
      console.error("Error storing file hash:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("module_not_found") || errorMessage.includes("Module not found")) {
        toast({
          title: "📋 Contract Not Deployed",
          description: "Smart contract needs to be deployed first. Check the deployment instructions above.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("insufficient funds") || errorMessage.includes("INSUFFICIENT_BALANCE")) {
        toast({
          title: "💰 Insufficient Funds",
          description: "You need APT tokens to pay for gas fees. Get some from the Aptos faucet.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("rejected") || errorMessage.includes("declined")) {
        toast({
          title: "🚫 Transaction Rejected",
          description: "Transaction was rejected in your wallet",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Transaction Failed",
          description: `Failed to store on blockchain: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsStoring(false);
    }
  }, [file, fileName, connected, account, contractDeployed, calculateFileHash, uint8ArrayToHex, signAndSubmitTransaction, loadBlockchainFiles]);

  // Verify file hash on blockchain - based on content, not filename
  const handleVerifyFileHash = useCallback(async () => {
    if (!verifyFile || !connected || !account) {
      toast({
        title: "Error",
        description: "Please connect wallet and select a file to verify",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const hash = await calculateFileHash(verifyFile);
      const currentHashHex = uint8ArrayToHex(hash);
      
      // Get all files from blockchain and find by hash content
      const allFiles = await getAllFiles();
      const storedFile = allFiles.find(file => {
        // Handle both hex string and number array formats
        const storedHashHex = typeof file.file_hash === 'string' 
          ? file.file_hash.startsWith('0x') 
            ? file.file_hash.slice(2)  // Remove 0x prefix
            : file.file_hash
          : file.file_hash.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return storedHashHex.toLowerCase() === currentHashHex.toLowerCase();
      });
      
      if (!storedFile) {
        setVerificationResult({
          success: false,
          fileName: verifyFile.name,
          message: "This file content has never been stored on the blockchain. The file may be new, modified, or corrupted."
        });
        setShowVerificationResult(true);
        return;
      }

      console.log("🔍 Content-based verification:");
      console.log("  Found matching file:", storedFile.file_name);
      console.log("  Original upload date:", new Date(parseInt(storedFile.timestamp) * 1000).toLocaleDateString());
      console.log("  Current hash matches stored hash ✅");

      // Submit verification transaction using the original filename
      try {
        console.log("📝 Submitting verification transaction to Aptos...");
        const response = await signAndSubmitTransaction({
          sender: account.address,
          data: {
            function: `${MODULE_ADDRESS}::file_hash_verifier::verify_file_hash`,
            functionArguments: [storedFile.file_name, Array.from(hash)],
          },
        });

        console.log("✅ Verification transaction submitted:", response);
        
        const txHash = typeof response === 'string' ? response : response.hash;
        setLastTxHash(txHash);

        setVerificationResult({
          success: true,
          fileName: verifyFile.name,
          originalName: storedFile.file_name,
          uploadDate: new Date(parseInt(storedFile.timestamp) * 1000).toLocaleDateString(),
          uploader: storedFile.uploader,
          message: "File content is authentic and verified on the blockchain!",
          txHash: txHash
        });
        setShowVerificationResult(true);

        // Refresh files list
        await loadBlockchainFiles();
      } catch (txError) {
        console.error("Transaction failed:", txError);
        // Still show the verification result even if transaction fails
        setVerificationResult({
          success: true,
          fileName: verifyFile.name,
          originalName: storedFile.file_name,
          uploadDate: new Date(parseInt(storedFile.timestamp) * 1000).toLocaleDateString(),
          uploader: storedFile.uploader,
          message: "File content is authentic! (Transaction failed but verification successful)"
        });
        setShowVerificationResult(true);
      }

      // Reset form
      setVerifyFile(null);
      setVerifyFileName("");
    } catch (error) {
      console.error("Error verifying file hash:", error);
      setVerificationResult({
        success: false,
        fileName: verifyFile?.name || "Unknown file",
        message: "Failed to verify file hash. Please check your connection and try again."
      });
      setShowVerificationResult(true);
    } finally {
      setIsVerifying(false);
    }
  }, [verifyFile, connected, account, calculateFileHash, uint8ArrayToHex, signAndSubmitTransaction, loadBlockchainFiles]);

  // Handle modal close with cleanup
  const handleModalClose = useCallback((open: boolean) => {
    setShowVerificationResult(open);
    if (!open) {
      setVerificationResult(null);
    }
  }, []);

  // Load blockchain data on wallet connection
  useEffect(() => {
    if (connected) {
      loadBlockchainFiles();
    } else {
      setAllFiles([]);
    }
  }, [connected, loadBlockchainFiles]);

  if (!connected) {
    return (
      <div className="card-3d p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your Aptos wallet to store and verify file hashes on the blockchain. 
          Your files will be permanently recorded on the devnet.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Real Blockchain Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <span>Immutable Records</span>
          </div>
        </div>
      </div>
    );
  }

  // Show deployment instructions if contract is not deployed
  if (contractDeployed === false && !isLoading) {
    return (
      <div className="space-y-6">
        {/* Contract Deployment Notice */}
        <div className="card-3d p-8 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-400 mb-2">Smart Contract Deployment Required</h3>
              <p className="text-muted-foreground mb-4">
                To use blockchain mode, you need to deploy the smart contract to the Aptos devnet first.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Open terminal and run: <code className="bg-muted/50 px-2 py-1 rounded text-xs">npm run move:compile</code></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Then run: <code className="bg-muted/50 px-2 py-1 rounded text-xs">npm run move:publish</code></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Copy the contract address and update <code className="bg-muted/50 px-2 py-1 rounded text-xs">VITE_MODULE_ADDRESS</code> in .env</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://aptos.dev/en/build/smart-contracts', '_blank')}
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  📚 Deployment Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadBlockchainFiles}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  🔄 Retry Connection
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative: Use Demo Mode */}
        <div className="card-3d p-6 text-center">
          <h4 className="font-semibold mb-2">Want to test immediately?</h4>
          <p className="text-muted-foreground mb-4">
            Switch back to Demo Mode for instant testing without blockchain deployment.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="btn-3d"
          >
            ← Switch to Demo Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Real Blockchain Status Banner */}
      <div className="card-3d p-6 border-green-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-green-400">Real Aptos Blockchain Connected</h3>
              <p className="text-sm text-muted-foreground">
                Live Devnet • Address: {account?.address?.toString().slice(0, 8)}...{account?.address?.toString().slice(-6)}
              </p>
              {lastTxHash && (
                <p className="text-xs text-blue-400 mt-1">
                  Last TX: {lastTxHash.slice(0, 16)}... • 
                  <button 
                    onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${lastTxHash}`, '_blank')}
                    className="ml-1 underline hover:text-blue-300"
                  >
                    View on Explorer
                  </button>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
              ✅ REAL BLOCKCHAIN
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadBlockchainFiles}
              disabled={isLoading}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
        
        {/* Live blockchain stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{allFiles.length}</div>
            <p className="text-xs text-muted-foreground">Files on Chain</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {allFiles.reduce((sum, file) => sum + parseInt(file.verification_count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Verifications</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">Devnet</div>
            <p className="text-xs text-muted-foreground">Network</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">Live</div>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </div>
      </div>

      {/* Blockchain Tabs Interface */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Store on Blockchain
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Verify from Blockchain
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Blockchain Records
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6 mt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Store File Hash on Real Blockchain</h2>
            <p className="text-muted-foreground">
              Permanently store your file's SHA-256 hash on the Aptos blockchain. Transactions will appear in your Petra wallet!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>💰 Need APT tokens?</span>
                <button 
                  onClick={() => window.open('https://aptoslabs.com/faucet', '_blank')}
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Get from Faucet
                </button>
              </div>
            </div>
          </div>
          
          <ModernFileUpload
            title="Drop files to store on blockchain"
            description="Upload a file to calculate and store its SHA-256 hash permanently"
            onFileSelect={(selectedFile) => {
              setFile(selectedFile);
              setFileName(selectedFile.name);
              handleFileSelect(selectedFile);
            }}
            fileName={fileName}
            fileHash={fileHash}
            onFileNameChange={setFileName}
          />

          {file && fileName && (
            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ready for Blockchain Storage</h3>
                <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  Aptos Devnet
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">File Name:</span>
                  <span className="font-medium">{fileName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wallet:</span>
                  <span className="font-medium">{account?.address?.toString().slice(0, 8)}...{account?.address?.toString().slice(-6)}</span>
                </div>
                {fileHash && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">SHA-256 Hash:</span>
                    <div className="font-mono text-xs bg-muted/50 p-3 rounded-lg border break-all">
                      {fileHash}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleStoreFileHash} 
                disabled={isStoring}
                className="w-full btn-3d"
                size="lg"
              >
                {isStoring ? "Storing on Blockchain..." : "Store on Blockchain (Gas Required)"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Verify Tab */}
        <TabsContent value="verify" className="space-y-6 mt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Verify File from Blockchain</h2>
            <p className="text-muted-foreground">
              Check file content integrity against immutable blockchain records
            </p>
          </div>

          <ModernFileUpload
            title="Drop file to verify against blockchain"
            description="Upload any file to verify its content against blockchain records"
            onFileSelect={(selectedFile) => {
              setVerifyFile(selectedFile);
              setVerifyFileName(selectedFile.name);
            }}
            fileName={verifyFileName}
            onFileNameChange={setVerifyFileName}
          />

          {verifyFile && (
            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ready for Blockchain Verification</h3>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  Content-Based Check
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">File Name:</span>
                  <span className="font-medium">{verifyFile.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">{(verifyFile.size / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verification Method:</span>
                  <span className="font-medium">SHA-256 Content Hash</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <strong>Note:</strong> Verification is based on file content, not filename. 
                  Even if the file has been renamed, we can still detect if its content matches any blockchain record.
                </div>
              </div>

              <Button 
                onClick={handleVerifyFileHash} 
                disabled={isVerifying}
                className="w-full btn-3d"
                size="lg"
                variant="outline"
              >
                {isVerifying ? "Verifying on Blockchain..." : "Verify on Blockchain (Gas Required)"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="card-3d p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading blockchain records...</p>
            </div>
          ) : (
            <ModernFileList 
              files={allFiles} 
              onClearData={() => {
                toast({
                  title: "Cannot Clear Blockchain Data",
                  description: "Blockchain records are immutable and cannot be deleted",
                  variant: "destructive",
                });
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Verification Result Modal */}
      <Dialog open={showVerificationResult} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {verificationResult?.success ? (
                <>
                  <div className="p-2 bg-green-500/20 text-green-400 rounded-full">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  Blockchain Verification Successful
                </>
              ) : (
                <>
                  <div className="p-2 bg-red-500/20 text-red-400 rounded-full">
                    <FileX className="w-6 h-6" />
                  </div>
                  Blockchain Verification Failed
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current File:</span>
                  <span className="font-medium">{verificationResult?.fileName}</span>
                </div>
                
                {verificationResult?.success && verificationResult.originalName && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Original Name:</span>
                      <span className="font-medium">{verificationResult.originalName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Upload Date:
                      </span>
                      <span className="font-medium">{verificationResult.uploadDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Uploader:
                      </span>
                      <span className="font-medium truncate">{verificationResult.uploader}</span>
                    </div>
                    {verificationResult.txHash && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction:</span>
                        <span className="font-mono text-xs">{verificationResult.txHash.slice(0, 16)}...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${verificationResult?.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-sm ${verificationResult?.success ? 'text-green-400' : 'text-red-400'}`}>
                {verificationResult?.message}
              </p>
            </div>

            <div className="flex gap-2">
              {verificationResult?.success && verificationResult.txHash && (
                <Button 
                  onClick={() => {
                    window.open(`https://explorer.aptoslabs.com/txn/${verificationResult.txHash}`, '_blank');
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Explorer
                </Button>
              )}
              <Button 
                onClick={() => handleModalClose(false)}
                className="flex-1"
                variant={verificationResult?.success ? "default" : "destructive"}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
