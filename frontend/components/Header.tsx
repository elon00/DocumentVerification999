import { WalletSelector } from "./WalletSelector";

export function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <div className="flex items-center gap-2">
        <h1 className="display">File Hash Verifier dApp</h1>
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
          Demo Mode - Free Testing
        </span>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  );
}
