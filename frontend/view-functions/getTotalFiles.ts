import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

const APTOS_NETWORK: Network = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export const getTotalFiles = async (): Promise<number> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_total_files`,
        functionArguments: [],
      },
    });

    return parseInt(result[0] as string);
  } catch (error) {
    console.error("Error fetching total files:", error);
    return 0;
  }
};
