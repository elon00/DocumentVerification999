import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { FileRecord, getAllFiles } from "@/view-functions/getAllFiles";
import { getTotalFiles } from "@/view-functions/getTotalFiles";
import { getFileByName } from "@/view-functions/getFileByName";

export function FileHashVerifier() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [verifyFileName, setVerifyFileName] = useState("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [allFiles, setAllFiles] = useState<FileRecord[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isStoring, setIsStoring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Handle file selection for storing
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      try {
        const hash = await calculateFileHash(selectedFile);
        setFileHash(uint8ArrayToHex(hash));
      } catch (error) {
        console.error("Error calculating file hash:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to calculate file hash",
        });
      }
    }
  }, [calculateFileHash, uint8ArrayToHex]);

  // Handle file selection for verification
  const handleVerifyFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setVerifyFile(selectedFile);
      setVerifyFileName(selectedFile.name);
    }
  }, []);

  // Store file hash on blockchain
  const handleStoreFileHash = useCallback(async () => {
    if (!account || !file || !fileName || !fileHash) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file and ensure wallet is connected",
      });
      return;
    }

    setIsStoring(true);
    try {
      const hash = await calculateFileHash(file);
      
      await signAndSubmitTransaction({
        data: {
          function: `${import.meta.env.VITE_MODULE_ADDRESS}::file_hash_verifier::store_file_hash`,
          functionArguments: [fileName, Array.from(hash)],
        },
      });

      toast({
        title: "Success",
        description: `File hash for "${fileName}" stored successfully!`,
      });

      // Refresh data
      await Promise.all([fetchAllFiles(), fetchTotalFiles()]);
      
      // Reset form
      setFile(null);
      setFileName("");
      setFileHash("");
    } catch (error) {
      console.error("Error storing file hash:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to store file hash on blockchain",
      });
    } finally {
      setIsStoring(false);
    }
  }, [account, file, fileName, fileHash, calculateFileHash, signAndSubmitTransaction]);

  // Verify file hash against blockchain
  const handleVerifyFileHash = useCallback(async () => {
    if (!account || !verifyFile || !verifyFileName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file for verification and ensure wallet is connected",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // First check if file exists on blockchain
      const storedFile = await getFileByName(verifyFileName);
      if (!storedFile) {
        toast({
          variant: "destructive",
          title: "File Not Found",
          description: `No record found for "${verifyFileName}" on the blockchain`,
        });
        return;
      }

      // Calculate hash of the uploaded file
      const hash = await calculateFileHash(verifyFile);
      
      // Convert stored hash from number array to Uint8Array for comparison
      const storedHashArray = Array.isArray(storedFile.file_hash) 
        ? new Uint8Array(storedFile.file_hash)
        : new Uint8Array(Array.from(String(storedFile.file_hash), c => c.charCodeAt(0)));
      
      // Compare hashes
      const hashesMatch = hash.every((byte, index) => byte === storedHashArray[index]);
      
      if (hashesMatch) {
        // Submit verification transaction
        await signAndSubmitTransaction({
          data: {
            function: `${import.meta.env.VITE_MODULE_ADDRESS}::file_hash_verifier::verify_file_hash`,
            functionArguments: [verifyFileName, Array.from(hash)],
          },
        });

        toast({
          title: "Verification Successful",
          description: `File "${verifyFileName}" is authentic and matches the stored hash!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: `File "${verifyFileName}" has been modified or corrupted!`,
        });
      }

      // Refresh data
      await fetchAllFiles();
      
      // Reset form
      setVerifyFile(null);
      setVerifyFileName("");
    } catch (error) {
      console.error("Error verifying file hash:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify file hash",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [account, verifyFile, verifyFileName, calculateFileHash, signAndSubmitTransaction]);

  // Fetch all files
  const fetchAllFiles = useCallback(async () => {
    try {
      const files = await getAllFiles();
      setAllFiles(files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);

  // Fetch total files count
  const fetchTotalFiles = useCallback(async () => {
    try {
      const total = await getTotalFiles();
      setTotalFiles(total);
    } catch (error) {
      console.error("Error fetching total files:", error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchAllFiles();
    fetchTotalFiles();
  }, [fetchAllFiles, fetchTotalFiles]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>File Hash Verifier dApp</CardTitle>
          <CardDescription>
            Store and verify file hashes on the Aptos blockchain to ensure file integrity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalFiles}</p>
              <p className="text-sm text-gray-600">Total Files Stored</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{allFiles.length}</p>
              <p className="text-sm text-gray-600">Files in Database</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {allFiles.reduce((sum, file) => sum + parseInt(file.verification_count), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Verifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store File Hash */}
        <Card>
          <CardHeader>
            <CardTitle>Store File Hash</CardTitle>
            <CardDescription>
              Upload a file to calculate and store its hash on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>
            
            {fileName && (
              <div>
                <Label>File Name</Label>
                <Input value={fileName} onChange={(e) => setFileName(e.target.value)} />
              </div>
            )}
            
            {fileHash && (
              <div>
                <Label>SHA-256 Hash</Label>
                <Input value={fileHash} readOnly className="font-mono text-xs" />
              </div>
            )}
            
            <Button 
              onClick={handleStoreFileHash} 
              disabled={!file || !fileName || isStoring}
              className="w-full"
            >
              {isStoring ? "Storing..." : "Store Hash on Blockchain"}
            </Button>
          </CardContent>
        </Card>

        {/* Verify File Hash */}
        <Card>
          <CardHeader>
            <CardTitle>Verify File Hash</CardTitle>
            <CardDescription>
              Upload a file to verify its integrity against stored blockchain records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verify-file-upload">Select File to Verify</Label>
              <Input
                id="verify-file-upload"
                type="file"
                onChange={handleVerifyFileSelect}
                className="mt-1"
              />
            </div>
            
            {verifyFileName && (
              <div>
                <Label>File Name</Label>
                <Input 
                  value={verifyFileName} 
                  onChange={(e) => setVerifyFileName(e.target.value)}
                  placeholder="Enter the original file name"
                />
              </div>
            )}
            
            <Button 
              onClick={handleVerifyFileHash} 
              disabled={!verifyFile || !verifyFileName || isVerifying}
              className="w-full"
              variant="outline"
            >
              {isVerifying ? "Verifying..." : "Verify File Integrity"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stored Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Stored Files</CardTitle>
          <CardDescription>
            Files with their hashes stored on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allFiles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No files stored yet</p>
          ) : (
            <div className="space-y-4">
              {allFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{file.file_name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Verified {file.verification_count} times
                    </span>
                  </div>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {Array.isArray(file.file_hash) 
                      ? uint8ArrayToHex(new Uint8Array(file.file_hash))
                      : String(file.file_hash)
                    }
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploader: {file.uploader.slice(0, 6)}...{file.uploader.slice(-4)}</span>
                    <span>Stored: {new Date(parseInt(file.timestamp) * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
