import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { toast } from "@/components/ui/use-toast";

export interface TransactionSubmissionOptions {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export const submitTransactionWithToast = async (
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<any>,
  transaction: InputTransactionData,
  options: TransactionSubmissionOptions = {}
): Promise<any> => {
  const {
    onSuccess,
    onError,
    successTitle = "✅ Success!",
    successDescription = "Transaction submitted successfully to blockchain",
    errorTitle = "❌ Transaction Failed",
    errorDescription = "Failed to submit transaction. Please try again."
  } = options;

  try {
    console.log("🔄 Submitting transaction to blockchain...", transaction);
    console.log("🔍 Transaction details:", JSON.stringify(transaction, null, 2));
    
    const response = await signAndSubmitTransaction(transaction);
    
    console.log("✅ Transaction successful:", response);
    
    toast({
      title: successTitle,
      description: successDescription,
    });

    if (onSuccess) {
      onSuccess(response);
    }

    return response;
    
  } catch (error: any) {
    console.error("❌ Transaction failed:", error);
    console.error("❌ Error details:", JSON.stringify(error, null, 2));
    
    // Handle specific wallet errors
    if (error.message?.includes("User rejected")) {
      toast({
        title: "🚫 Transaction Rejected",
        description: "Transaction was rejected in your wallet",
        variant: "destructive",
      });
    } else if (error.message?.includes("Insufficient")) {
      toast({
        title: "💰 Insufficient Funds",
        description: "Not enough APT to cover transaction fees",
        variant: "destructive",
      });
    } else if (error.message?.includes("simulation")) {
      toast({
        title: "⚠️ Simulation Failed",
        description: `Simulation error: ${error.message || error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: errorTitle,
        description: `${error.message || errorDescription}. Check console for details.`,
        variant: "destructive",
      });
    }

    if (onError) {
      onError(error);
    }

    throw error;
  }
};

export const createFileHashTransaction = (
  functionName: "store_file_hash" | "verify_file_hash",
  fileName: string,
  fileHash: Uint8Array,
  moduleAddress: string
): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress}::file_hash_verifier::${functionName}`,
      functionArguments: [fileName, Array.from(fileHash)],
    },
  };
};
