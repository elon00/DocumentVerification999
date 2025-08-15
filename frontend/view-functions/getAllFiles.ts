import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

const APTOS_NETWORK: Network = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export type FileRecord = {
  file_name: string;
  file_hash: string | number[]; // Can be either hex string from blockchain or number array
  uploader: string;
  timestamp: string;
  verification_count: string;
};

export const getAllFiles = async (): Promise<FileRecord[]> => {
  try {
    console.log("🔍 Fetching files from contract:", MODULE_ADDRESS);
    
    if (!MODULE_ADDRESS || MODULE_ADDRESS === "0x1") {
      console.warn("⚠️ MODULE_ADDRESS not properly configured");
      return []; // Return empty array instead of throwing
    }
    
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_all_files`,
        functionArguments: [],
      },
    });

    console.log("✅ Successfully fetched files from blockchain");
    
    // The result comes as [FileRecord[]] so we need to access the first element
    const files = result[0] as FileRecord[];
    
    // Validate and clean the data
    const validFiles = files.filter(file => 
      file && 
      file.file_name && 
      file.file_hash && 
      file.uploader && 
      file.timestamp
    );
    
    console.log(`📊 Processed ${validFiles.length} valid files out of ${files.length} total`);
    
    return validFiles;
  } catch (error: any) {
    console.error("❌ Error fetching files:", error);
    
    // Don't throw error, return empty array to prevent app crash
    if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
      console.log("📝 Contract not deployed yet or no files stored");
      return [];
    }
    
    // For other errors, still return empty array but log the issue
    console.error("🔴 Unexpected error, returning empty array:", error.message);
    return [];
  }
};
