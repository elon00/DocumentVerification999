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
    console.log("🔍 Attempting to fetch files from contract:", MODULE_ADDRESS);
    
    if (!MODULE_ADDRESS || MODULE_ADDRESS === "0x1") {
      throw new Error("MODULE_ADDRESS not configured");
    }
    
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_all_files`,
        functionArguments: [],
      },
    });

    console.log("✅ Successfully fetched files from blockchain:", result);
    
    // The result comes as [FileRecord[]] so we need to access the first element
    const files = result[0] as FileRecord[];
    
    // Keep the hex string format as returned from the blockchain
    return files;
  } catch (error) {
    console.error("❌ Error fetching all files:", error);
    throw error; // Re-throw the error so the component can handle it
  }
};
