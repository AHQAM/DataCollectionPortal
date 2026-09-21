import { useUserOps } from "./useUserOps";
import { logAudit } from "../utils/audit";
import { useRequestOps } from "./useRequestOps";
import { useRecordOps } from "./useRecordOps";
import { useBranchOps } from "./useBranchOps";
import { useSystemOps } from "./useSystemOps";

export { logAudit };

export const useAppOperations = () => {
  const userOps = useUserOps();
  const requestOps = useRequestOps();
  const recordOps = useRecordOps();
  const branchOps = useBranchOps();
  const systemOps = useSystemOps();

  return {
    ...userOps,
    ...requestOps,
    ...recordOps,
    ...branchOps,
    ...systemOps,
  };
};
