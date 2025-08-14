import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { ProfessionalHeader } from './ProfessionalHeader';
import { FileHashVerifierWithModes } from './FileHashVerifierWithModes';
import { NetworkInfo } from './NetworkInfo';
import { AccountInfo } from './AccountInfo';
import { CleanEducationHub } from './CleanEducationHub';
import { ModernStatsDashboard } from './ModernStatsDashboard';
import { getAllFiles, FileRecord } from '../view-functions/getAllFiles';
import { calculateBlockchainStats, StatsData } from '../utils/statsCalculator';

export const DashboardLayout: React.FC = () => {
  const { account, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'home' | 'education'>('home');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalFiles: 0,
    totalVerifications: 0,
    filesInDatabase: 0,
    successRate: '0%',
    averageVerificationsPerFile: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load blockchain data when connected
  useEffect(() => {
    if (connected && account) {
      loadBlockchainData();
    }
  }, [connected, account]);

  const loadBlockchainData = async () => {
    setIsLoading(true);
    try {
      const blockchainFiles = await getAllFiles();
      setFiles(blockchainFiles);
      const blockchainStats = await calculateBlockchainStats();
      setStats(blockchainStats);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    if (connected && account) {
      loadBlockchainData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="text-center py-20">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700">
              <h2 className="text-3xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Connect your Aptos wallet to access the blockchain file verification system
              </p>
              <div className="flex justify-center gap-4">
                <div className="px-6 py-3 bg-purple-600 rounded-lg">
                  <span className="text-white font-semibold">🔗 Blockchain Mode</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'home'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  🏠 File Verification
                </button>
                <button
                  onClick={() => setActiveTab('education')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ml-2 ${
                    activeTab === 'education'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  🎓 Education Hub
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'home' ? (
              <div className="space-y-8">
                {/* Stats Dashboard */}
                <ModernStatsDashboard stats={stats} mode="blockchain" />
                
                {/* Account Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AccountInfo />
                  <NetworkInfo />
                </div>
                
                {/* File Hash Verifier */}
                <FileHashVerifierWithModes />
                
                {/* Recent Activity */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Recent Blockchain Activity</h3>
                    <button
                      onClick={refreshData}
                      disabled={isLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
                    >
                      {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
                    </button>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin text-4xl mb-4">⏳</div>
                      <p className="text-slate-300">Loading blockchain data...</p>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-3">
                      {files.slice(0, 10).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div>
                              <p className="text-white font-medium">{file.file_name}</p>
                              <p className="text-slate-400 text-sm">Hash: {
                                typeof file.file_hash === 'string' 
                                  ? file.file_hash.slice(0, 16) 
                                  : Array.isArray(file.file_hash) 
                                    ? file.file_hash.slice(0, 8).join('').slice(0, 16)
                                    : 'Unknown'
                              }...</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 text-sm">
                              {new Date(parseInt(file.timestamp) * 1000).toLocaleDateString()}
                            </p>
                            <p className="text-slate-400 text-xs">
                              Owner: {file.uploader.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📁</div>
                      <p className="text-slate-300">No files found on blockchain</p>
                      <p className="text-slate-400 text-sm mt-2">Upload your first file to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <CleanEducationHub />
            )}
          </>
        )}
      </div>
    </div>
  );
};
