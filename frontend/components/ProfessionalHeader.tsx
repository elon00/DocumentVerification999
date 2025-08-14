import { WalletSelector } from "./WalletSelector";
import { Shield, FileCheck, Database, Wallet, Menu, X } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function ProfessionalHeader() {
  const { connected, account } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <FileCheck className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                DocVerify Pro
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full font-medium border border-purple-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Blockchain
                </span>
                {connected ? (
                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 rounded-full font-medium border border-green-500/30 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded-full font-medium border border-orange-500/30 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Disconnected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Aptos DevNet
            </span>
            {connected && account && (
              <span className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <Wallet className="w-3 h-3" />
                {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
              </span>
            )}
          </div>
        </nav>

        {/* Wallet Selector */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <WalletSelector />
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 max-w-7xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Aptos DevNet
                </span>
                {connected && account && (
                  <span className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Wallet className="w-3 h-3" />
                    {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-700/50">
                <WalletSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
