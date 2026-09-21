import { create } from "zustand";
import {
  User,
  Branch,
  Region,
  RequestItem,
  RequestField,
  Assignment,
  RecordItem,
  ResponseValue,
  RequestTemplate,
  AuditLog,
  DeviceBinding,
  PasswordResetRequest,
} from "../types";

interface DataStore {
  // Collections Data
  users: User[];
  setUsers: (users: User[]) => void;

  branches: Branch[];
  setBranches: (branches: Branch[]) => void;

  regions: Region[];
  setRegions: (regions: Region[]) => void;

  requests: RequestItem[];
  setRequests: (requests: RequestItem[]) => void;

  fields: RequestField[];
  setFields: (fields: RequestField[]) => void;

  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;

  records: RecordItem[];
  setRecords: (records: RecordItem[]) => void;

  recordResponses: Record<string, Record<string, any>>;
  setRecordResponses: (responses: Record<string, Record<string, any>>) => void;

  templates: RequestTemplate[];
  setTemplates: (templates: RequestTemplate[]) => void;

  auditLogs: AuditLog[];
  setAuditLogs: (logs: AuditLog[]) => void;

  deviceBindings: DeviceBinding[];
  setDeviceBindings: (bindings: DeviceBinding[]) => void;

  passwordResetRequests: PasswordResetRequest[];
  setPasswordResetRequests: (requests: PasswordResetRequest[]) => void;

  // Add Item Optimistically / Helper functions (if needed)
  addAuditLogLocal: (log: AuditLog) => void;
  updateUserLocal: (user: User) => void;
  // Others can be added as necessary for offline or optimistic UI updates
}

export const useDataStore = create<DataStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),

  branches: [],
  setBranches: (branches) => set({ branches }),

  regions: [],
  setRegions: (regions) => set({ regions }),

  requests: [],
  setRequests: (requests) => set({ requests }),

  fields: [],
  setFields: (fields) => set({ fields }),

  assignments: [],
  setAssignments: (assignments) => set({ assignments }),

  records: [],
  setRecords: (records) => set({ records }),

  recordResponses: {},
  setRecordResponses: (responses) => set({ recordResponses: responses }),

  templates: [],
  setTemplates: (templates) => set({ templates }),

  auditLogs: [],
  setAuditLogs: (auditLogs) => set({ auditLogs }),

  deviceBindings: [],
  setDeviceBindings: (deviceBindings) => set({ deviceBindings }),

  passwordResetRequests: [],
  setPasswordResetRequests: (passwordResetRequests) =>
    set({ passwordResetRequests }),

  addAuditLogLocal: (log) =>
    set((state) => ({ auditLogs: [log, ...state.auditLogs] })),

  updateUserLocal: (updatedUser) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.userId === updatedUser.userId ? updatedUser : u,
      ),
    })),
}));
