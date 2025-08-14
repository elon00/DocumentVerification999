import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ModernFileUpload } from "@/components/ModernFileUpload";
import { ModernFileList } from "@/components/ModernFileList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, CheckCircle, Database, Wallet, Shield, Activity, TrendingUp, Hash } from "lucide-react";

// Demo blockchain file record
interface BlockchainFileRecord {
  file_name: string;
  file_hash: number[];
  uploader: string;
  timestamp: string;
  verification_count: string;
}

// Mock transaction record
interface MockTransaction {
  id: string;
  type: 'store' | 'verify';
  file_name: string;
  status: 'success' | 'failed';
  timestamp: number;
  gas_used: string;
  hash: string;
}

// Dynamic stats interface
interface DynamicStats {
  totalFiles: number;
  totalVerifications: number;
  successRate: number;
  totalTransactions: number;
  gasUsed: string;
}

export function MockBlockchainFileHashVerifier() {
  const { account, connected } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [verifyFileName, setVerifyFileName] = useState("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [allFiles, setAllFiles] = useState<BlockchainFileRecord[]>([]);
  const [isStoring, setIsStoring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [stats, setStats] = useState<DynamicStats>({
    totalFiles: 0,
    totalVerifications: 0,
    successRate: 100,
    totalTransactions: 0,
    gasUsed: "0"
  });

  // Mock blockchain storage keys
  const BLOCKCHAIN_STORAGE_KEY = "mock_blockchain_files";
  const TRANSACTIONS_STORAGE_KEY = "mock_blockchain_transactions";

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

  // Generate mock transaction hash
  const generateTxHash = useCallback((): string => {
    return `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('')}`;
  }, []);

  // Generate mock gas amount
  const generateGasAmount = useCallback((): string => {
    return (Math.random() * 0.001 + 0.0001).toFixed(6);
  }, []);

  // Add transaction to history
  const addTransaction = useCallback((transaction: MockTransaction) => {
    try {
      const existingTxs = JSON.parse(localStorage.getItem(TRANSACTIONS_STORAGE_KEY) || "[]");
      const newTxs = [transaction, ...existingTxs].slice(0, 50); // Keep last 50 transactions
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(newTxs));
      setTransactions(newTxs);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  }, []);

  // Calculate dynamic stats
  const calculateStats = useCallback(() => {
    try {
      const files = JSON.parse(localStorage.getItem(BLOCKCHAIN_STORAGE_KEY) || "[]");
      const txs = JSON.parse(localStorage.getItem(TRANSACTIONS_STORAGE_KEY) || "[]");
      
      const totalFiles = files.length;
      const totalVerifications = files.reduce((sum: number, file: BlockchainFileRecord) => 
        sum + parseInt(file.verification_count), 0);
      const totalTransactions = txs.length;
      const successfulTxs = txs.filter((tx: MockTransaction) => tx.status === 'success').length;
      const successRate = totalTransactions > 0 ? Math.round((successfulTxs / totalTransactions) * 100) : 100;
      const gasUsed = txs.reduce((sum: number, tx: MockTransaction) => 
        sum + parseFloat(tx.gas_used), 0).toFixed(6);

      setStats({
        totalFiles,
        totalVerifications,
        successRate,
        totalTransactions,
        gasUsed
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  }, []);

  // Load transactions from storage
  const loadTransactions = useCallback(() => {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (stored) {
        const txs = JSON.parse(stored);
        setTransactions(txs);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }, []);

  // Load mock blockchain files
  const loadBlockchainFiles = useCallback(() => {
    try {
      const stored = localStorage.getItem(BLOCKCHAIN_STORAGE_KEY);
      if (stored) {
        const files = JSON.parse(stored);
        setAllFiles(files);
      }
      calculateStats();
    } catch (error) {
      console.error("Error loading mock blockchain files:", error);
    }
  }, [calculateStats]);

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

  // Mock store file hash (simulates blockchain transaction)
  const handleStoreFileHash = useCallback(async () => {
    if (!file || !fileName || !connected || !account) {
      toast({
        title: "Error", 
        description: "Please connect wallet and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsStoring(true);
    try {
      const hash = await calculateFileHash(file);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txHash = generateTxHash();
      const gasUsed = generateGasAmount();
      
      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        const fileRecord: BlockchainFileRecord = {
          file_name: fileName,
          file_hash: Array.from(hash),
          uploader: account.address.toString(),
          timestamp: Math.floor(Date.now() / 1000).toString(),
          verification_count: "0",
        };

        // Store in mock blockchain
        const existingFiles = JSON.parse(localStorage.getItem(BLOCKCHAIN_STORAGE_KEY) || "[]");
        existingFiles.push(fileRecord);
        localStorage.setItem(BLOCKCHAIN_STORAGE_KEY, JSON.stringify(existingFiles));
        
        // Add successful transaction to history
        const transaction: MockTransaction = {
          id: txHash,
          type: 'store',
          file_name: fileName,
          status: 'success',
          timestamp: Date.now(),
          gas_used: gasUsed,
          hash: txHash
        };
        addTransaction(transaction);
        
        toast({
          title: "🎉 Blockchain Transaction Successful!",
          description: `File hash stored on mock blockchain. TX: ${txHash.slice(0, 16)}... | Gas: ${gasUsed} APT`,
        });
      } else {
        // Add failed transaction to history
        const transaction: MockTransaction = {
          id: txHash,
          type: 'store',
          file_name: fileName,
          status: 'failed',
          timestamp: Date.now(),
          gas_used: gasUsed,
          hash: txHash
        };
        addTransaction(transaction);
        
        toast({
          title: "❌ Transaction Failed",
          description: `Mock blockchain transaction failed. TX: ${txHash.slice(0, 16)}... | Gas: ${gasUsed} APT`,
          variant: "destructive",
        });
      }

      // Refresh the files list and stats
      loadBlockchainFiles();
      
      // Reset form
      setFile(null);
      setFileName("");
      setFileHash("");
    } catch (error) {
      console.error("Error storing file hash:", error);
      toast({
        title: "Error",
        description: "Failed to store file hash on mock blockchain",
        variant: "destructive",
      });
    } finally {
      setIsStoring(false);
    }
  }, [file, fileName, connected, account, calculateFileHash, generateTxHash, generateGasAmount, addTransaction, loadBlockchainFiles]);

  // Mock verify file hash
  const handleVerifyFileHash = useCallback(async () => {
    if (!verifyFile || !verifyFileName || !connected || !account) {
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
      
      // Simulate blockchain lookup delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const txHash = generateTxHash();
      const gasUsed = generateGasAmount();
      
      const existingFiles = JSON.parse(localStorage.getItem(BLOCKCHAIN_STORAGE_KEY) || "[]");
      const storedFile = existingFiles.find((f: BlockchainFileRecord) => f.file_name === verifyFileName);
      
      if (storedFile) {
        const storedHashHex = storedFile.file_hash.map((b: number) => b.toString(16).padStart(2, '0')).join('');
        const currentHashHex = uint8ArrayToHex(hash);
        const isValid = storedHashHex === currentHashHex;
        
        // Update verification count
        storedFile.verification_count = (parseInt(storedFile.verification_count) + 1).toString();
        localStorage.setItem(BLOCKCHAIN_STORAGE_KEY, JSON.stringify(existingFiles));
        
        // Add verification transaction to history
        const transaction: MockTransaction = {
          id: txHash,
          type: 'verify',
          file_name: verifyFileName,
          status: 'success',
          timestamp: Date.now(),
          gas_used: gasUsed,
          hash: txHash
        };
        addTransaction(transaction);
        
        toast({
          title: isValid ? "✅ File Verified on Blockchain!" : "❌ File Modified!",
          description: isValid 
            ? `File integrity confirmed on mock blockchain. TX: ${txHash.slice(0, 16)}... | Gas: ${gasUsed} APT`
            : `File has been modified or corrupted. TX: ${txHash.slice(0, 16)}... | Gas: ${gasUsed} APT`,
          variant: isValid ? "default" : "destructive",
        });

        loadBlockchainFiles();
      } else {
        // File not found - still charge gas
        const transaction: MockTransaction = {
          id: txHash,
          type: 'verify',
          file_name: verifyFileName,
          status: 'failed',
          timestamp: Date.now(),
          gas_used: gasUsed,
          hash: txHash
        };
        addTransaction(transaction);
        
        toast({
          title: "File Not Found",
          description: `No file with that name exists on the mock blockchain. TX: ${txHash.slice(0, 16)}... | Gas: ${gasUsed} APT`,
          variant: "destructive",
        });
        
        calculateStats();
      }

      // Reset form
      setVerifyFile(null);
      setVerifyFileName("");
    } catch (error) {
      console.error("Error verifying file hash:", error);
      toast({
        title: "Error",
        description: "Failed to verify file hash",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [verifyFile, verifyFileName, connected, account, calculateFileHash, uint8ArrayToHex, generateTxHash, generateGasAmount, addTransaction, loadBlockchainFiles, calculateStats]);

  // Load mock blockchain data on wallet connection
  useEffect(() => {
    if (connected) {
      loadBlockchainFiles();
      loadTransactions();
    } else {
      setAllFiles([]);
      setTransactions([]);
      setStats({
        totalFiles: 0,
        totalVerifications: 0,
        successRate: 100,
        totalTransactions: 0,
        gasUsed: "0"
      });
    }
  }, [connected, loadBlockchainFiles, loadTransactions]);

  if (!connected) {
    return (
      <div className="card-3d p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your Aptos wallet to experience blockchain-style file hash storage and verification.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Simulated Blockchain</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <span>Transaction Simulation</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mock Blockchain Status Banner with Dynamic Stats */}
      <div className="card-3d p-6 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-purple-400">Mock Blockchain Mode Active</h3>
              <p className="text-sm text-muted-foreground">
                Simulated Aptos Devnet • Address: {account?.address?.toString().slice(0, 8)}...{account?.address?.toString().slice(-6)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
              SIMULATION
            </div>
          </div>
        </div>
        
        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{stats.totalFiles}</span>
            </div>
            <p className="text-xs text-muted-foreground">Active Files</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{stats.totalVerifications}</span>
            </div>
            <p className="text-xs text-muted-foreground">Verifications</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">{stats.successRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{stats.totalTransactions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Hash className="w-4 h-4 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{stats.gasUsed}</span>
            </div>
            <p className="text-xs text-muted-foreground">Gas Used (APT)</p>
          </div>
        </div>
      </div>

      {/* Mock Blockchain Tabs Interface */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
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
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6 mt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Store File Hash on Mock Blockchain</h2>
            <p className="text-muted-foreground">
              Experience blockchain functionality with simulated transactions and storage
            </p>
          </div>
          
          <ModernFileUpload
            title="Drop files to store on mock blockchain"
            description="Upload a file to simulate storing its SHA-256 hash on blockchain"
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
                <h3 className="text-lg font-semibold">Ready for Mock Blockchain Storage</h3>
                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  Simulated Devnet
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
                {isStoring ? "Simulating Blockchain Transaction..." : "Store on Mock Blockchain (No Gas!)"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Verify Tab */}
        <TabsContent value="verify" className="space-y-6 mt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Verify File from Mock Blockchain</h2>
            <p className="text-muted-foreground">
              Check file integrity against simulated blockchain records
            </p>
          </div>

          <ModernFileUpload
            title="Drop file to verify against mock blockchain"
            description="Upload a file to verify its integrity against simulated blockchain"
            onFileSelect={(selectedFile) => {
              setVerifyFile(selectedFile);
              setVerifyFileName(selectedFile.name);
            }}
            fileName={verifyFileName}
            onFileNameChange={setVerifyFileName}
          />

          {verifyFile && verifyFileName && (
            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ready for Mock Blockchain Verification</h3>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  Integrity Check
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="verify-filename">Original File Name on Mock Blockchain</Label>
                  <Input
                    id="verify-filename"
                    value={verifyFileName}
                    onChange={(e) => setVerifyFileName(e.target.value)}
                    placeholder="Enter the exact file name stored on mock blockchain"
                    className="mt-2"
                  />
                </div>
              </div>

              <Button 
                onClick={handleVerifyFileHash} 
                disabled={!verifyFileName || isVerifying}
                className="w-full btn-3d"
                size="lg"
                variant="outline"
              >
                {isVerifying ? "Verifying on Mock Blockchain..." : "Verify on Mock Blockchain (No Gas!)"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6 mt-6">
          <ModernFileList 
            files={allFiles} 
            onClearData={() => {
              localStorage.removeItem(BLOCKCHAIN_STORAGE_KEY);
              setAllFiles([]);
              toast({
                title: "Mock Blockchain Data Cleared",
                description: "All simulated blockchain files have been removed",
              });
              calculateStats();
            }}
          />
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-6 mt-6">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-muted-foreground">
                Complete history of your mock blockchain transactions
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="card-3d p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
                  <Activity className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your transaction history will appear here after you store or verify files
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className={`card-3d p-4 space-y-3 slide-in-left animate-delay-${Math.min(index, 3)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'store' 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}>
                          {tx.type === 'store' ? (
                            <Upload className="w-4 h-4 text-white" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {tx.type === 'store' ? 'File Storage' : 'File Verification'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {tx.file_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'success' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {tx.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transaction Hash</p>
                        <p className="font-mono text-xs">{tx.hash.slice(0, 16)}...</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gas Used</p>
                        <p className="font-medium">{tx.gas_used} APT</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timestamp</p>
                        <p className="font-medium">
                          {new Date(tx.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Block Time</p>
                        <p className="font-medium">{(Date.now() - tx.timestamp) > 60000 ? 
                          Math.floor((Date.now() - tx.timestamp) / 60000) + 'm ago' : 
                          'Just now'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {transactions.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
                        setTransactions([]);
                        calculateStats();
                        toast({
                          title: "Transaction History Cleared",
                          description: "All transaction history has been removed",
                        });
                      }}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      Clear Transaction History
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
