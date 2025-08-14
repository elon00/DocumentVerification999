import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";

export interface BlockchainEducationDocument {
  title: string;
  description: string;
  file_hash: number[];
  organization: string;
  uploader: string;
  timestamp: string;
}

export const getAllEducationDocuments = async (): Promise<BlockchainEducationDocument[]> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_all_education_documents`,
        functionArguments: [],
      },
    });

    return response[0] as BlockchainEducationDocument[];
  } catch (error) {
    console.error("Error fetching education documents:", error);
    return [];
  }
};

export const getDocumentsByOrganization = async (organizationId: string): Promise<BlockchainEducationDocument[]> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::complete_file_hash_verifier::get_education_documents_by_organization`,
        functionArguments: [organizationId],
      },
    });

    return response[0] as BlockchainEducationDocument[];
  } catch (error) {
    console.error("Error fetching documents by organization:", error);
    return [];
  }
};

export const getDocumentsByWallet = async (walletAddress: string): Promise<BlockchainEducationDocument[]> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_documents_by_wallet`,
        functionArguments: [walletAddress],
      },
    });

    return response[0] as BlockchainEducationDocument[];
  } catch (error) {
    console.error("Error fetching documents by wallet:", error);
    return [];
  }
};

export const getDocumentById = async (id: string): Promise<BlockchainEducationDocument | null> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_document_by_id`,
        functionArguments: [id],
      },
    });

    return response[0] as BlockchainEducationDocument;
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    return null;
  }
};

export const getTotalEducationDocuments = async (): Promise<number> => {
  try {
    const response = await aptosClient().view({
      payload: {
        function: `${MODULE_ADDRESS}::file_hash_verifier::get_total_education_documents`,
        functionArguments: [],
      },
    });

    return parseInt(response[0] as string);
  } catch (error) {
    console.error("Error fetching total education documents:", error);
    return 0;
  }
};
