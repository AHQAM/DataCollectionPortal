import React, { createContext } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { useUIStore } from '../stores/uiStore';
import { useAppOperations } from '../hooks/useAppOperations';
import { useFirestoreSync } from '../hooks/useFirestoreSync';

// This provider just renders children and calls the sync hook
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize real-time listeners
  useFirestoreSync();
  return <>{children}</>;
};

// Facade for backward compatibility. 
// Warning: using this hook subscribes the component to ALL state changes in all stores.
// Refactor heavy components to use the specific stores directly (e.g., useDataStore(s => s.requests)).
export const useApp = () => {
  const authStore = useAuthStore();
  const dataStore = useDataStore();
  const uiStore = useUIStore();
  const operations = useAppOperations();

  // Selected region for representative with multi-region access (local to the hook in the old context, but better to keep in authStore)
  const selectedRegionNo = authStore.currentUser?.regionNo || '101';
  const setSelectedRegionNo = () => {};

  return {
    ...authStore,
    ...dataStore,
    ...uiStore,
    ...operations,
    selectedRegionNo,
    setSelectedRegionNo,
    deviceBindings: dataStore.deviceBindings,
    passwordResetRequests: dataStore.passwordResetRequests,
    offlineQueue: [],
    createUser: operations.addUser,
    resetUserPassword: authStore.adminResetPassword,
    unlockUser: authStore.adminUnlockAccount,
    releaseUserDevice: authStore.releaseDeviceBinding,
  };
};

export const AppContext = createContext<any>(undefined);
