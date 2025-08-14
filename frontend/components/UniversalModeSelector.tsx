import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMode } from "@/context/ModeContext";
import { 
  Zap, 
  Shield, 
  ToggleLeft, 
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff
} from "lucide-react";

export function UniversalModeSelector() {
  const { connected } = useWallet();
  const { toggleMode, isDemoMode } = useMode();

  return (
    <Card className="p-4 bg-gray-900/50 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-blue-400' : 'bg-purple-400'}`} />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isDemoMode ? 'Demo Mode' : 'Blockchain Mode'}
            </h3>
            <p className="text-sm text-gray-400">
              {isDemoMode 
                ? 'Test features without blockchain transactions' 
                : 'Real blockchain transactions on Aptos network'
              }
            </p>
          </div>
        </div>
        
        <Button
          onClick={toggleMode}
          variant="outline"
          size="sm"
          className={`border-2 transition-colors ${
            isDemoMode 
              ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' 
              : 'border-purple-500 text-purple-400 hover:bg-purple-500/10'
          }`}
        >
          {isDemoMode ? (
            <ToggleLeft className="w-4 h-4 mr-2" />
          ) : (
            <ToggleRight className="w-4 h-4 mr-2" />
          )}
          Switch to {isDemoMode ? 'Blockchain' : 'Demo'}
        </Button>
      </div>

      {/* Mode-specific information */}
      <div className="space-y-3">
        {isDemoMode ? (
          <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Demo Mode Features</h4>
              <ul className="text-xs text-blue-100 space-y-1">
                <li>• Test all features without wallet connection</li>
                <li>• Data stored locally in browser</li>
                <li>• No gas fees or blockchain transactions</li>
                <li>• Perfect for learning and exploration</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-purple-300 mb-1">Blockchain Mode Features</h4>
                <ul className="text-xs text-purple-100 space-y-1">
                  <li>• Immutable storage on Aptos blockchain</li>
                  <li>• Cryptographic proof of document authenticity</li>
                  <li>• Permanent timestamp verification</li>
                  <li>• Global accessibility and transparency</li>
                </ul>
              </div>
            </div>

            {/* Wallet connection status for blockchain mode */}
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              connected 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-red-900/20 border-red-800'
            }`}>
              {connected ? (
                <>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-300">Wallet Connected</p>
                    <p className="text-xs text-green-100">Ready for blockchain transactions</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-300">Wallet Not Connected</p>
                    <p className="text-xs text-red-100">Connect your wallet to use blockchain features</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
