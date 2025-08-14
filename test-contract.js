import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const APTOS_NETWORK = Network.DEVNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const MODULE_ADDRESS = "0xc6520b2c175f13993261246861eee724db0ca45a17a14750285166298b6390b9";

async function testContract() {
  console.log("🧪 Testing contract deployment...");
  console.log("📍 Contract Address:", MODULE_ADDRESS);
  
  try {
    // Test if we can call the get_all_files function
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_all_files`,
        functionArguments: [],
      },
    });
    
    console.log("✅ Contract is deployed and working!");
    console.log("📊 Files found:", result[0]);
    return true;
  } catch (error) {
    console.error("❌ Contract test failed:", error);
    return false;
  }
}

testContract().then(success => {
  if (success) {
    console.log("🎉 Contract verification successful!");
  } else {
    console.log("💡 Contract might not be deployed or there's a configuration issue.");
  }
});
