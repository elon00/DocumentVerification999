import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { submitTransactionWithToast } from "@/utils/transactionHelpers";
import { 
  getAllOrganizations, 
  BlockchainOrganization 
} from "@/view-functions/getOrganizations";
import { 
  getAllEducationDocuments, 
  BlockchainEducationDocument 
} from "@/view-functions/getEducationDocuments";
import { registerOrganization as registerOrganizationOnBlockchain } from "@/entry-functions/registerOrganization";
import { uploadEducationDocument as uploadEducationDocumentToBlockchain } from "@/entry-functions/uploadEducationDocument";

import { 
  Building2, 
  FileText, 
  Upload, 
  GraduationCap, 
  Award, 
  CheckCircle, 
  Loader2,
  User,
  Calendar,
  Star,
  Plus,
  BookOpen,
  Shield
} from 'lucide-react'; 

export const CleanEducationHub: React.FC = () => {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'documents'>('overview');
  const [organizations, setOrganizations] = useState<BlockchainOrganization[]>([]);
  const [userOrganization, setUserOrganization] = useState<BlockchainOrganization | null>(null);
  const [documents, setDocuments] = useState<BlockchainEducationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isUploadDocDialogOpen, setIsUploadDocDialogOpen] = useState(false);
  
  // Form states
  const [orgForm, setOrgForm] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    contactEmail: '',
    accreditation: '',
    establishedYear: new Date().getFullYear().toString()
  });
  
  const [docForm, setDocForm] = useState({
    title: '',
    description: '',
    category: 'certificate',
    subject: '',
    grade: '',
    instructor: '',
    tags: '',
    certificateNumber: '',
    creditsEarned: '0',
    gpa: '0.0'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load blockchain data
  const loadData = useCallback(async () => {
    if (!connected || !account) return;
    
    setIsLoading(true);
    try {
      const [allOrgs, allDocs] = await Promise.all([
        getAllOrganizations(),
        getAllEducationDocuments()
      ]);
      
      setOrganizations(allOrgs);
      setDocuments(allDocs);
      
      // Find user's organization
      const userOrg = allOrgs.find(org => org.owner === account.address.toString());
      setUserOrganization(userOrg || null);
      
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      toast({
        title: "Error",
        description: "Failed to load blockchain data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [connected, account]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // File hash calculation
  const calculateFileHash = useCallback(async (file: File): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return new Uint8Array(hashBuffer);
  }, []);

  // Handle organization registration
  const handleCreateOrganization = async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!orgForm.name.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const transaction = registerOrganizationOnBlockchain({
        id: `org_${Date.now()}`,
        name: orgForm.name.trim(),
        description: orgForm.description.trim(),
        websiteUrl: orgForm.websiteUrl.trim(),
        contactEmail: orgForm.contactEmail.trim(),
        accreditation: orgForm.accreditation.trim(),
        establishedYear: parseInt(orgForm.establishedYear) || new Date().getFullYear()
      });

      await submitTransactionWithToast(
        signAndSubmitTransaction,
        transaction,
        {
          successTitle: "�️ Organization Registered!",
          successDescription: "Your organization has been successfully registered on the blockchain",
          onSuccess: async () => {
            // Reset form and close dialog
            setOrgForm({
              name: '',
              description: '',
              websiteUrl: '',
              contactEmail: '',
              accreditation: '',
              establishedYear: new Date().getFullYear().toString()
            });
            setIsCreateOrgDialogOpen(false);
            
            // Reload data
            await loadData();
          }
        }
      );
      
    } catch (error: any) {
      console.error('Error registering organization:', error);
      // Error handling is done in submitTransactionWithToast
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!connected || !account || !signAndSubmitTransaction || !selectedFile || !userOrganization) {
      toast({
        title: "Error",
        description: "Please ensure you're connected, have an organization, and selected a file.",
        variant: "destructive",
      });
      return;
    }

    if (!docForm.title.trim()) {
      toast({
        title: "Error",
        description: "Document title is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const hash = await calculateFileHash(selectedFile);
      
      const transaction = uploadEducationDocumentToBlockchain({
        id: `doc_${Date.now()}`,
        title: docForm.title.trim(),
        description: docForm.description.trim(),
        category: '',
        subject: '',
        grade: '',
        instructor: '',
        organizationId: userOrganization.name,
        organizationName: userOrganization.name,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileHash: hash,
        tags: [],
        certificateNumber: `CERT-${Date.now()}`,
        creditsEarned: 0,
        gpa: '',
        expiryDate: 0,
        qrCodeData: ''
      });

      await submitTransactionWithToast(
        signAndSubmitTransaction,
        transaction,
        {
          successTitle: "📄 Document Uploaded!",
          successDescription: "Your education document has been securely stored on the blockchain",
          onSuccess: async () => {
            // Reset form and close dialog
            setDocForm({
              title: '',
              description: '',
              category: 'certificate',
              subject: '',
              grade: '',
              instructor: '',
              tags: '',
              certificateNumber: '',
              creditsEarned: '0',
              gpa: '0.0'
            });
            setSelectedFile(null);
            setIsUploadDocDialogOpen(false);
            
            // Reload data
            await loadData();
          }
        }
      );
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      // Error handling is done in submitTransactionWithToast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-center">
              Please connect your Aptos wallet to access the Education Hub
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-purple-400" />
            Education Hub
          </h1>
          <p className="text-slate-300 mt-2">
            Manage educational institutions and verify academic documents on the blockchain
          </p>
        </div>
        
        {userOrganization && (
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <Building2 className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">{userOrganization.name}</p>
              <p className="text-slate-400 text-sm">Verified Organization</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Organizations</p>
                    <p className="text-2xl font-bold text-white">{organizations.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Documents</p>
                    <p className="text-2xl font-bold text-white">{documents.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Your Organization</p>
                    <p className="text-2xl font-bold text-white">{userOrganization ? '1' : '0'}</p>
                  </div>
                  <User className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Your Documents</p>
                    <p className="text-2xl font-bold text-white">
                      {documents.filter(doc => doc.uploader === account?.address?.toString()).length}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!userOrganization ? (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Building2 className="h-5 w-5" />
                    Create Your Organization
                  </CardTitle>
                  <CardDescription>
                    Register your educational institution on the blockchain to start issuing verified documents.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isCreateOrgDialogOpen} onOpenChange={setIsCreateOrgDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Organization</DialogTitle>
                        <DialogDescription>
                          Register your educational institution permanently on the blockchain.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Organization Name *</Label>
                            <Input
                              id="name"
                              value={orgForm.name}
                              onChange={(e) => setOrgForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="University of Example"
                            />
                          </div>
                          <div>
                            <Label htmlFor="year">Established Year</Label>
                            <Input
                              id="year"
                              type="number"
                              value={orgForm.establishedYear}
                              onChange={(e) => setOrgForm(prev => ({ ...prev, establishedYear: e.target.value }))}
                              placeholder="1950"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="org-description">Description</Label>
                          <textarea
                            id="org-description"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={orgForm.description}
                            onChange={(e) => setOrgForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of your organization"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="website">Website URL</Label>
                            <Input
                              id="website"
                              type="url"
                              value={orgForm.websiteUrl}
                              onChange={(e) => setOrgForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                              placeholder="https://university.edu"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Contact Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={orgForm.contactEmail}
                              onChange={(e) => setOrgForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                              placeholder="admin@university.edu"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="accreditation">Accreditation</Label>
                          <Input
                            id="accreditation"
                            value={orgForm.accreditation}
                            onChange={(e) => setOrgForm(prev => ({ ...prev, accreditation: e.target.value }))}
                            placeholder="Regional Accreditation Body"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateOrgDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateOrganization}
                            disabled={isSubmitting || !orgForm.name.trim()}
                            className="flex-1"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Create Organization
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Upload className="h-5 w-5" />
                    Upload Document
                  </CardTitle>
                  <CardDescription>
                    Upload and verify academic documents to the blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isUploadDocDialogOpen} onOpenChange={setIsUploadDocDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Upload Education Document</DialogTitle>
                        <DialogDescription>
                          Upload an academic document to verify and store on the blockchain.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="file">Document File *</Label>
                          <Input
                            id="file"
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Document Title *</Label>
                            <Input
                              id="title"
                              value={docForm.title}
                              onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Bachelor's Degree Certificate"
                            />
                          </div>
                          <div>
                            <Label htmlFor="doc-category">Category</Label>
                            <select
                              id="doc-category"
                              title="Document Category"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={docForm.category}
                              onChange={(e) => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                            >
                              <option value="certificate">Certificate</option>
                              <option value="diploma">Diploma</option>
                              <option value="degree">Degree</option>
                              <option value="transcript">Transcript</option>
                              <option value="license">License</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="doc-description">Description</Label>
                          <textarea
                            id="doc-description"
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={docForm.description}
                            onChange={(e) => setDocForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of the document"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              value={docForm.subject}
                              onChange={(e) => setDocForm(prev => ({ ...prev, subject: e.target.value }))}
                              placeholder="Computer Science"
                            />
                          </div>
                          <div>
                            <Label htmlFor="grade">Grade/Level</Label>
                            <Input
                              id="grade"
                              value={docForm.grade}
                              onChange={(e) => setDocForm(prev => ({ ...prev, grade: e.target.value }))}
                              placeholder="Bachelor's"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="instructor">Instructor/Issuer</Label>
                            <Input
                              id="instructor"
                              value={docForm.instructor}
                              onChange={(e) => setDocForm(prev => ({ ...prev, instructor: e.target.value }))}
                              placeholder="Dr. John Smith"
                            />
                          </div>
                          <div>
                            <Label htmlFor="certificateNumber">Certificate Number</Label>
                            <Input
                              id="certificateNumber"
                              value={docForm.certificateNumber}
                              onChange={(e) => setDocForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                              placeholder="CERT-2024-001"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="tags">Tags (comma-separated)</Label>
                          <Input
                            id="tags"
                            value={docForm.tags}
                            onChange={(e) => setDocForm(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="computer science, bachelor, degree"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsUploadDocDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUploadDocument}
                            disabled={isSubmitting || !selectedFile || !docForm.title.trim()}
                            className="flex-1"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : documents.slice(0, 3).map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 mb-2 last:mb-0">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-slate-400 text-xs">{doc.organization}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                ))}
                {!isLoading && documents.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No documents uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Blockchain Organizations</h2>
            {!userOrganization && (
              <Dialog open={isCreateOrgDialogOpen} onOpenChange={setIsCreateOrgDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {/* Same dialog content as above */}
                </DialogContent>
              </Dialog>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org, index) => (
                <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {org.name}
                      </CardTitle>
                      {org.owner === account?.address?.toString() && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          Your Org
                        </span>
                      )}
                    </div>
                    <CardDescription>{org.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">Created: {new Date(parseInt(org.timestamp) * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{org.document_count} documents</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Education Documents</h2>
            {userOrganization && (
              <Dialog open={isUploadDocDialogOpen} onOpenChange={setIsUploadDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  {/* Same dialog content as above */}
                </DialogContent>
              </Dialog>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {doc.title}
                      </CardTitle>
                      {doc.uploader === account?.address?.toString() && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          Your Doc
                        </span>
                      )}
                    </div>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{doc.organization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{doc.description}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{doc.uploader}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-300">Verified on Blockchain</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
