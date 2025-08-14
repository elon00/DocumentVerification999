import React from 'react';
import { FileHashVerifier } from './FileHashVerifier';

export const FileHashVerifierWithModes: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Mode Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-center space-x-4">
          <div className="px-6 py-3 bg-purple-600 rounded-lg shadow-lg">
            <span className="text-white font-semibold text-lg">🔗 Blockchain Mode</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Blockchain File Verification
          </h2>
          <p className="text-slate-300 text-lg mb-6">
            Secure, permanent file verification on the Aptos blockchain
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="text-white font-semibold mb-2">Immutable Storage</h3>
              <p className="text-slate-400 text-sm">
                File hashes permanently stored on blockchain
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-2">Instant Verification</h3>
              <p className="text-slate-400 text-sm">
                Real-time verification against blockchain records
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="text-white font-semibold mb-2">Decentralized Trust</h3>
              <p className="text-slate-400 text-sm">
                No central authority required for verification
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* File Hash Verifier Component */}
      <FileHashVerifier />
    </div>
  );
};
