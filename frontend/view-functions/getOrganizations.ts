import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

export interface BlockchainOrganization {
  name: string;
  description: string;
  owner: string;
  timestamp: string;
  document_count: string;
}

export const getAllOrganizations = async (): Promise<BlockchainOrganization[]> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_all_organizations`,
        functionArguments: [],
      },
    });

    return response[0] as BlockchainOrganization[];
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
};

export const getOrganizationByWallet = async (walletAddress: string): Promise<BlockchainOrganization | null> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_organization_by_wallet`,
        functionArguments: [walletAddress],
      },
    });

    return response[0] as BlockchainOrganization;
  } catch (error) {
    console.error("Error fetching organization by wallet:", error);
    return null;
  }
};

export const organizationExistsForWallet = async (walletAddress: string): Promise<boolean> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::organization_exists_for_wallet`,
        functionArguments: [walletAddress],
      },
    });

    return response[0] as boolean;
  } catch (error) {
    console.error("Error checking organization existence:", error);
    return false;
  }
};

export const getTotalOrganizations = async (): Promise<number> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_total_organizations`,
        functionArguments: [],
      },
    });

    return parseInt(response[0] as string);
  } catch (error) {
    console.error("Error fetching total organizations:", error);
    return 0;
  }
};
