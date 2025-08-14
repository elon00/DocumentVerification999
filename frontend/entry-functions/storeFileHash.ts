import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

const APTOS_NETWORK: Network = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export type StoreFileHashArguments = {
  fileName: string;
  fileHash: Uint8Array;
};

export const storeFileHash = async (args: StoreFileHashArguments): Promise<string> => {
  const { fileName, fileHash } = args;
  const transaction = await aptos.transaction.build.simple({
    sender: MODULE_ADDRESS,
    data: {
      function: `${MODULE_ADDRESS}::complete_file_hash_verifier::store_file_hash`,
      functionArguments: [fileName, Array.from(fileHash)],
    },
  });

  return transaction.rawTransaction.toString();
};
