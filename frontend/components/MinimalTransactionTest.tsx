import { useState } from 'react';
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";

const MODULE_ADDRESS = "0x1f1edd956dab0105738252eddc877fba00d36dcf1e230ba6fc848bf845e32547";

export function MinimalTransactionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const { signAndSubmitTransaction, account } = useWallet();

  const testTransaction = async () => {
    if (!account || !signAndSubmitTransaction) {
      alert("Please connect wallet first");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🧪 Testing minimal transaction...");
      
      const transaction: InputTransactionData = {
        data: {
          function: `${MODULE_ADDRESS}::complete_file_hash_verifier::store_file_hash`,
          functionArguments: [
            "test.txt",
            [1, 2, 3, 4]
          ],
        },
      };

      console.log("Transaction:", JSON.stringify(transaction, null, 2));
      
      const result = await signAndSubmitTransaction(transaction);
      console.log("✅ SUCCESS:", result);
      alert("Transaction successful!");
      
    } catch (error: any) {
      console.error("❌ FAILED:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      alert(`Failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded border">
      <h3 className="text-lg font-bold mb-4">Minimal Transaction Test</h3>
      <p className="mb-4">Test the simplest possible transaction to debug the issue.</p>
      <Button 
        onClick={testTransaction}
        disabled={isLoading || !account}
        className="w-full"
      >
        {isLoading ? "Testing..." : "Test Simple Transaction"}
      </Button>
    </div>
  );
}
