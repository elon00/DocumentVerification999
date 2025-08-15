import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { ProfessionalHeader } from './ProfessionalHeader';
import { CleanEducationHub } from './CleanEducationHub';
import { CleanFileHashVerifier } from './CleanFileHashVerifier';
import { getAllFiles, FileRecord } from '../view-functions/getAllFiles';
import { calculateBlockchainStats, StatsData } from '../utils/statsCalculator';
import { clearAllDemoData, hasDemoData } from '../utils/clearDemoData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Shield, 
  FileCheck, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Activity,
  Database,
  Zap,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  BarChart3,
  RefreshCw
} from "lucide-react";

export const CleanDashboardLayout: React.FC = () => {
  const { account, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'education'>('overview');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalFiles: 0,
    totalVerifications: 0,
    filesInDatabase: 0,
    successRate: '0%',
    averageVerificationsPerFile: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear demo data on component mount
  useEffect(() => {
    if (hasDemoData()) {
      console.log("🧹 Clearing existing demo data...");
      clearAllDemoData();
    }
  }, []);

  // Load blockchain data when connected
  useEffect(() => {
    if (connected && account) {
      loadBlockchainData();
      
      // Set up real-time updates every 30 seconds
      intervalRef.current = setInterval(() => {
        loadBlockchainData();
        console.log("🔄 Auto-refreshing blockchain data...");
      }, 30000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [connected, account]);

  const loadBlockchainData = async () => {
    setIsLoading(true);
    try {
      console.log("📊 Loading fresh blockchain data...");
      const blockchainFiles = await getAllFiles();
      setFiles(blockchainFiles);
      const blockchainStats = await calculateBlockchainStats();
      setStats(blockchainStats);
      setLastUpdate(new Date());
      console.log(`✅ Loaded ${blockchainFiles.length} files from blockchain`);
    } catch (error) {
      console.error('❌ Error loading blockchain data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    if (connected && account) {
      console.log("🔄 Manual refresh triggered");
      loadBlockchainData();
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <ProfessionalHeader />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                Welcome to DocVerify Pro
              </h2>
              <p className="text-slate-300 text-center mb-8 leading-relaxed">
                Secure, decentralized document verification powered by Aptos blockchain. 
                Connect your wallet to access enterprise-grade document management.
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <Database className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">Blockchain</p>
                  <p className="text-slate-400 text-xs">Powered</p>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">Instant</p>
                  <p className="text-slate-400 text-xs">Verification</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Ready to get started?</p>
                <p className="text-purple-300 text-sm font-medium">
                  👆 Click "Connect Wallet" above
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-slate-300 text-lg">
                Manage your documents and educational credentials securely on the blockchain
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-slate-400 text-sm">Connected Account</p>
                <p className="text-white font-medium">
                  {account?.address?.toString().slice(0, 8)}...{account?.address?.toString().slice(-6)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 p-1 h-auto">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="verification" 
              className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              <FileCheck className="h-5 w-5" />
              <span className="font-medium">File Verification</span>
            </TabsTrigger>
            <TabsTrigger 
              value="education" 
              className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="font-medium">Education Hub</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Total Files</p>
                      <p className="text-3xl font-bold text-white">{stats.totalFiles}</p>
                      <p className="text-blue-400 text-sm flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3" />
                        On Blockchain
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Verifications</p>
                      <p className="text-3xl font-bold text-white">{stats.totalVerifications}</p>
                      <p className="text-green-400 text-sm flex items-center gap-1 mt-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Success Rate: {stats.successRate}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Organizations</p>
                      <p className="text-3xl font-bold text-white">1</p>
                      <p className="text-purple-400 text-sm flex items-center gap-1 mt-2">
                        <Building2 className="h-3 w-3" />
                        Registered
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium mb-1">Avg. Verifications</p>
                      <p className="text-3xl font-bold text-white">{stats.averageVerificationsPerFile}</p>
                      <p className="text-orange-400 text-sm flex items-center gap-1 mt-2">
                        <Activity className="h-3 w-3" />
                        Per File
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                        Recent Activity
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Live</span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Real-time blockchain data • Last updated: {lastUpdate.toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={isLoading}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-3">
                      {files.slice(0, 5).map((file, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{file.file_name}</p>
                            <p className="text-slate-400 text-sm">
                              {new Date(parseInt(file.timestamp) * 1000).toLocaleDateString()}
                            </p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Get started with common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setActiveTab('verification')}
                    className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Verify Document</p>
                        <p className="text-blue-200 text-sm">Upload and verify files on blockchain</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('education')}
                    className="w-full justify-start h-auto p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Education Hub</p>
                        <p className="text-purple-200 text-sm">Manage academic credentials</p>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={refreshData}
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-slate-600 hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Refresh Data</p>
                        <p className="text-slate-400 text-sm">Sync with blockchain</p>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* File Verification Tab */}
          <TabsContent value="verification">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Document Verification</h2>
                <p className="text-slate-300 text-lg">
                  Upload documents to store their cryptographic hash on the Aptos blockchain for permanent verification
                </p>
              </div>
              <CleanFileHashVerifier onDataUpdate={refreshData} />
            </div>
          </TabsContent>

          {/* Education Hub Tab */}
          <TabsContent value="education">
            <CleanEducationHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
