import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";
import { FileRecord } from "./getAllFiles";

const APTOS_NETWORK: Network = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export const getFileByName = async (fileName: string): Promise<FileRecord | null> => {
  try {
    console.log("🔍 Fetching file by name:", fileName);
    
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_file_by_name`,
        functionArguments: [fileName],
      },
    });

    console.log("📄 File found:", result);
    
    if (!result || !result[0]) {
      return null;
    }
    
    const file = result[0] as FileRecord;
    
    // Keep the hex string format as returned from the blockchain
    return file;
  } catch (error) {
    console.error("❌ Error fetching file by name:", error);
    return null;
  }
};
