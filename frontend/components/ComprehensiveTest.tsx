import { useState } from 'react';
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { getAllFiles, FileRecord } from "@/view-functions/getAllFiles";
import { getAllOrganizations, BlockchainOrganization } from "@/view-functions/getOrganizations";
import { getAllEducationDocuments, BlockchainEducationDocument } from "@/view-functions/getEducationDocuments";

const MODULE_ADDRESS = "0x1f1edd956dab0105738252eddc877fba00d36dcf1e230ba6fc848bf845e32547";

export function ComprehensiveTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [organizations, setOrganizations] = useState<BlockchainOrganization[]>([]);
  const [documents, setDocuments] = useState<BlockchainEducationDocument[]>([]);
  
  const { signAndSubmitTransaction, account } = useWallet();

  const addLog = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const refreshData = async () => {
    try {
      addLog("📊 Refreshing blockchain data...");
      const [filesData, orgsData, docsData] = await Promise.all([
        getAllFiles(),
        getAllOrganizations(),
        getAllEducationDocuments()
      ]);
      
      setFiles(filesData);
      setOrganizations(orgsData);
      setDocuments(docsData);
      
      addLog(`✅ Data refreshed: ${filesData.length} files, ${orgsData.length} orgs, ${docsData.length} docs`);
    } catch (error: any) {
      addLog(`❌ Error refreshing data: ${error.message}`);
    }
  };

  const runComprehensiveTest = async () => {
    if (!account || !signAndSubmitTransaction) {
      addLog("❌ Please connect wallet first");
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    
    try {
      addLog("🚀 Starting comprehensive blockchain test...");

      // Test 1: Store a file hash
      addLog("📁 Test 1: Storing file hash...");
      const fileTransaction: InputTransactionData = {
        data: {
          function: `${MODULE_ADDRESS}::complete_file_hash_verifier::store_file_hash`,
          functionArguments: [
            "test-document.pdf",
            [72, 101, 108, 108, 111] // "Hello" as bytes
          ],
        },
      };

      await signAndSubmitTransaction(fileTransaction);
      addLog("✅ File hash stored successfully!");

      // Test 2: Register organization
      addLog("🏢 Test 2: Registering organization...");
      const orgTransaction: InputTransactionData = {
        data: {
          function: `${MODULE_ADDRESS}::complete_file_hash_verifier::register_organization`,
          functionArguments: [
            "Test University",
            "A test educational institution for blockchain verification"
          ],
        },
      };

      await signAndSubmitTransaction(orgTransaction);
      addLog("✅ Organization registered successfully!");

      // Test 3: Upload education document
      addLog("📜 Test 3: Uploading education document...");
      const docTransaction: InputTransactionData = {
        data: {
          function: `${MODULE_ADDRESS}::complete_file_hash_verifier::upload_education_document`,
          functionArguments: [
            "Computer Science Degree",
            "Bachelor's degree in Computer Science with blockchain specialization",
            [68, 101, 103, 114, 101, 101], // "Degree" as bytes
            "Test University"
          ],
        },
      };

      await signAndSubmitTransaction(docTransaction);
      addLog("✅ Education document uploaded successfully!");

      // Wait a moment for blockchain to process
      addLog("⏳ Waiting for blockchain to process...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Refresh and verify data
      await refreshData();
      
      addLog("🎉 Comprehensive test completed successfully!");
      
    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-xl font-bold mb-4">🧪 Comprehensive Blockchain Test</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button 
            onClick={runComprehensiveTest}
            disabled={isLoading || !account}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Testing..." : "🚀 Run Full Test"}
          </Button>
          
          <Button 
            onClick={refreshData}
            variant="outline"
            className="border-green-600 text-green-600"
          >
            🔄 Refresh Data
          </Button>
        </div>

        {/* Test Results */}
        <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto">
          <h4 className="font-semibold mb-2">📋 Test Log:</h4>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold mb-2">📁 Files ({files.length})</h4>
            {files.map((file, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-2">
                <div><strong>Name:</strong> {file.file_name}</div>
                <div><strong>Uploader:</strong> {file.uploader.slice(0, 10)}...</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold mb-2">🏢 Organizations ({organizations.length})</h4>
            {organizations.map((org, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-2">
                <div><strong>Name:</strong> {org.name}</div>
                <div><strong>Documents:</strong> {org.document_count}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold mb-2">📜 Documents ({documents.length})</h4>
            {documents.map((doc, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded mb-2">
                <div><strong>Title:</strong> {doc.title}</div>
                <div><strong>Organization:</strong> {doc.organization}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
