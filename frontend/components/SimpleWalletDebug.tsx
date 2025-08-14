import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SimpleWalletDebug() {
  const { connect, account, connected, wallets, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log("Available wallets:", wallets);
      
      // Find Petra wallet
      const petraWallet = wallets.find(wallet => 
        wallet.name.toLowerCase().includes('petra') || 
        wallet.name.toLowerCase().includes('aptos')
      );
      
      console.log("Petra wallet found:", petraWallet);
      
      if (!petraWallet) {
        throw new Error("Petra wallet not found. Please install Petra wallet extension.");
      }

      console.log("Attempting to connect to:", petraWallet.name);
      await connect(petraWallet.name);
      console.log("✅ Wallet connected successfully!");
      
    } catch (err: any) {
      console.error("❌ Wallet connection failed:", err);
      setError(err.message || err.toString());
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setError(null);
    } catch (err: any) {
      console.error("❌ Disconnect failed:", err);
      setError(err.message || err.toString());
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔧 Wallet Connection Debug</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Connected:</strong> {connected ? "✅ Yes" : "❌ No"}</p>
        <p><strong>Account:</strong> {account?.address.toString() || "None"}</p>
        <p><strong>Available Wallets:</strong> {wallets.length}</p>
        <div className="text-sm">
          {wallets.map((wallet, index) => (
            <div key={index}>• {wallet.name} ({wallet.url})</div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700 mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="space-x-2">
        {!connected ? (
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "🔌 Connect Petra Wallet"}
          </Button>
        ) : (
          <Button onClick={handleDisconnect} variant="outline">
            🔌 Disconnect
          </Button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Troubleshooting Tips:</strong></p>
        <ul className="list-disc ml-4">
          <li>Make sure Petra wallet extension is installed</li>
          <li>Make sure Petra wallet is set to Devnet</li>
          <li>Try refreshing the page</li>
          <li>Check browser console for detailed errors</li>
        </ul>
      </div>
    </div>
  );
}
