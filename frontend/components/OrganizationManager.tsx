import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  Plus, 
  Edit2, 
  Save, 
  X,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  createdAt: string;
  memberCount: number;
  documentsCount: number;
  isVerified: boolean;
}

interface OrganizationManagerProps {
  onOrganizationSelect: (org: Organization | null) => void;
  selectedOrganization: Organization | null;
}

export function OrganizationManager({ onOrganizationSelect, selectedOrganization }: OrganizationManagerProps) {
  const { account, connected } = useWallet();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newOrgForm, setNewOrgForm] = useState({
    name: "",
    description: ""
  });

  // Load organizations from localStorage
  useEffect(() => {
    const savedOrgs = localStorage.getItem("organizations");
    if (savedOrgs) {
      setOrganizations(JSON.parse(savedOrgs));
    }
  }, []);

  // Save organizations to localStorage
  const saveOrganizations = (orgs: Organization[]) => {
    localStorage.setItem("organizations", JSON.stringify(orgs));
    setOrganizations(orgs);
  };

  // Create new organization (one per wallet)
  const createOrganization = () => {
    if (!connected || !account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if wallet already has an organization
    const existingOrg = organizations.find(org => org.walletAddress === account.address.toString());
    if (existingOrg) {
      alert("This wallet already has an organization. You can only have one organization per wallet.");
      return;
    }

    if (!newOrgForm.name.trim()) {
      alert("Please enter an organization name");
      return;
    }

    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: newOrgForm.name.trim(),
      description: newOrgForm.description.trim(),
      walletAddress: account.address.toString(),
      createdAt: new Date().toISOString(),
      memberCount: 1,
      documentsCount: 0,
      isVerified: false
    };

    const updatedOrgs = [...organizations, newOrg];
    saveOrganizations(updatedOrgs);
    
    setNewOrgForm({ name: "", description: "" });
    setIsCreateDialogOpen(false);
    onOrganizationSelect(newOrg);
  };

  // Update organization
  const updateOrganization = () => {
    if (!editingOrg) return;

    const updatedOrgs = organizations.map(org => 
      org.id === editingOrg.id ? editingOrg : org
    );
    saveOrganizations(updatedOrgs);
    
    if (selectedOrganization?.id === editingOrg.id) {
      onOrganizationSelect(editingOrg);
    }
    
    setEditingOrg(null);
    setIsEditDialogOpen(false);
  };

  // Get user's organization
  const userOrganization = connected && account?.address 
    ? organizations.find(org => org.walletAddress === account.address.toString())
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Organization Management</h2>
            <p className="text-gray-400">One wallet, one organization policy</p>
          </div>
        </div>
        
        {connected && !userOrganization && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName" className="text-white">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={newOrgForm.name}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter organization name"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="orgDesc" className="text-white">Description</Label>
                  <Input
                    id="orgDesc"
                    value={newOrgForm.description}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter organization description"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={createOrganization}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-700 text-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Wallet Status */}
      {!connected ? (
        <Card className="p-6 bg-red-900/20 border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Wallet Not Connected</h3>
              <p className="text-red-100">Please connect your wallet to create or manage your organization.</p>
            </div>
          </div>
        </Card>
      ) : userOrganization ? (
        <Card className="p-6 bg-green-900/20 border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {userOrganization.isVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Shield className="w-6 h-6 text-blue-400" />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-white">{userOrganization.name}</h3>
                  <p className="text-green-100">{userOrganization.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-green-200">
                    <span>Members: {userOrganization.memberCount}</span>
                    <span>Documents: {userOrganization.documentsCount}</span>
                    <span>Created: {new Date(userOrganization.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingOrg({...userOrganization});
                setIsEditDialogOpen(true);
              }}
              className="border-green-700 text-green-300 hover:bg-green-900/30"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-blue-900/20 border-blue-800">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">No Organization Found</h3>
              <p className="text-blue-100">Create an organization for your wallet to get started with the education hub.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Organization</DialogTitle>
          </DialogHeader>
          {editingOrg && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editOrgName" className="text-white">Organization Name</Label>
                <Input
                  id="editOrgName"
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editOrgDesc" className="text-white">Description</Label>
                <Input
                  id="editOrgDesc"
                  value={editingOrg.description}
                  onChange={(e) => setEditingOrg(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={updateOrganization}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-700 text-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Organization Stats */}
      {userOrganization && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{userOrganization.memberCount}</p>
                <p className="text-gray-400">Members</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{userOrganization.documentsCount}</p>
                <p className="text-gray-400">Documents</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gray-800/50 border-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {userOrganization.isVerified ? "Verified" : "Pending"}
                </p>
                <p className="text-gray-400">Status</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
