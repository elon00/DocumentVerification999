import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type UploadEducationDocumentArguments = {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  grade: string;
  instructor: string;
  organizationId: string;
  organizationName: string;
  fileName: string;
  fileSize: number;
  fileHash: Uint8Array;
  tags: string[];
  certificateNumber: string;
  creditsEarned: number;
  gpa: string;
  expiryDate: number;
  qrCodeData: string;
};

export const uploadEducationDocument = (
  args: UploadEducationDocumentArguments
): InputTransactionData => {
  const {
    title,
    description,
    fileHash,
    organizationName
  } = args;
  
  return {
    data: {
      function: `${MODULE_ADDRESS}::complete_file_hash_verifier::upload_education_document`,
      functionArguments: [
        title,
        description,
        Array.from(fileHash),
        organizationName
      ],
    },
  };
};
