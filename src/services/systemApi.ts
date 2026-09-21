import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export const systemApi = {
  wipeDemoData: async (
    confirmationToken: string,
    wipeBranchesAndRegions: boolean = false,
  ) => {
    const fn = httpsCallable(functions, "wipeDemoData");
    const res = await fn({ confirmationToken, wipeBranchesAndRegions });
    return res.data as {
      success: boolean;
      messageAr?: string;
      messageEn?: string;
    };
  },
};
