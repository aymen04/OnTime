import { useAuth } from '@/lib/context/AuthContext';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

type RoleContextValue = {
  isManager: boolean;
  isEmployee: boolean;
  roleName: string | null;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const value = useMemo(() => {
    const roleName = profile?.role?.name ?? null;
    return {
      roleName,
      isManager: roleName === 'manager',
      isEmployee: roleName === 'employee',
    };
  }, [profile]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
