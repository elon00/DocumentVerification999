import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type RegisterOrganizationArguments = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  contactEmail: string;
  accreditation: string;
  establishedYear: number;
};

export const registerOrganization = (
  args: RegisterOrganizationArguments
): InputTransactionData => {
  const { name, description } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::complete_file_hash_verifier::register_organization`,
      functionArguments: [
        name,
        description
      ],
    },
  };
};
