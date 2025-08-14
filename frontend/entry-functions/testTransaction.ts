import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export const testSimpleTransaction = (): InputTransactionData => {
  return {
    data: {
      function: `${MODULE_ADDRESS}::file_hash_verifier::store_file_hash`,
      functionArguments: ["test_file.txt", [1, 2, 3, 4, 5]],
    },
  };
};
