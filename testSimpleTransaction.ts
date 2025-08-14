// Test simple transaction with proper encoding

const MODULE_ADDRESS = "0x7b25ac456fa189fc17dfd2509d6b0335d1463526b3df78e5b556709ae590016b";

// Test with BCS encoding for the string (what Move expects)
const simpleTestTransaction = {
  data: {
    function: `${MODULE_ADDRESS}::file_hash_verifier::store_file_hash`,
    functionArguments: [
      "simple_test.txt", // Direct string - Aptos SDK should handle conversion
      [1, 2, 3, 4] // Simple 4-byte array
    ],
  },
};

console.log("Simple test transaction:", JSON.stringify(simpleTestTransaction, null, 2));

// Alternative with proper BCS string encoding
import { BCS } from "aptos";

// If we need to encode the string properly
const properlyEncodedTransaction = {
  data: {
    function: `${MODULE_ADDRESS}::file_hash_verifier::store_file_hash`,
    functionArguments: [
      "test.txt", // The SDK should auto-encode strings
      [255, 0, 127, 64] // Different test bytes
    ],
  },
};

console.log("Properly encoded transaction:", JSON.stringify(properlyEncodedTransaction, null, 2));
