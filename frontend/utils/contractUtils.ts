import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

const APTOS_NETWORK: Network = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export const initializeContract = async () => {
  try {
    console.log("🔧 Checking contract initialization...");
    
    // Try to get organizations to see if contract is initialized
    await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_all_organizations`,
        functionArguments: [],
      }
    });
    
    console.log("✅ Contract is already initialized");
    return true;
  } catch (error) {
    console.log("❌ Contract might not be initialized or deployed:", error);
    return false;
  }
};

export const checkContractStatus = async () => {
  try {
    const isInitialized = await initializeContract();
    if (!isInitialized) {
      console.warn("⚠️ Contract not accessible. Check if it's deployed correctly.");
    }
    return isInitialized;
  } catch (error) {
    console.error("Error checking contract status:", error);
    return false;
  }
};
