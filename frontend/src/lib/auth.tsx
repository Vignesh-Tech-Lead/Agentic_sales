import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const APP_ROLES = ['Super Admin','Organization Admin','Sales Manager','Sales Executive','Marketing Manager','Marketing Executive','Knowledge Manager','Analyst/Auditor'] as const;
export type AppRole = typeof APP_ROLES[number];
const roleModules: Partial<Record<AppRole, string[]>> = {
  'Super Admin': ['*'], 'Organization Admin': ['*'], 'Analyst/Auditor': ['*'],
  'Sales Manager': ['dashboard','leads','companies','forms','email','campaigns','willingness','tasks','proposals','predictive','forecasting','recovery','funnel','workflows','calendar','whatsapp','inbox','referrals','reports'],
  'Sales Executive': ['dashboard','leads','companies','forms','inbox','funnel','tasks','proposals','calendar','willingness'],
  'Marketing Manager': ['dashboard','leads','companies','forms','email','campaigns','inbox','tasks','whatsapp','referrals','reports'],
  'Marketing Executive': ['dashboard','leads','forms','email','campaigns','inbox','whatsapp'],
  'Knowledge Manager': ['dashboard','knowledge','agents','meeting-intel','multilingual','workflows'],
};
export function canAccessModule(role: AppRole | null, path: string) {
  if (!role) return false;
  const module = path.split('/').filter(Boolean)[0] ?? '';
  const allowed = roleModules[role] ?? [];
  return allowed.includes('*') || allowed.includes(module);
}
type AuthValue = { user: User | null; session: Session | null; role: AppRole | null; loading: boolean };
const AuthContext = createContext<AuthValue>({ user: null, session: null, role: null, loading: true });

function resolveRole(user: User | null): AppRole | null {
  if (!user) return null;
  const role = user.app_metadata?.role;
  return APP_ROLES.includes(role) ? role : 'Sales Executive';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,setSession]=useState<Session|null>(null);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    let alive=true;
    supabase.auth.getSession().then(({data})=>{if(alive){setSession(data.session);setLoading(false);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setLoading(false);});
    return()=>{alive=false;subscription.unsubscribe();};
  },[]);
  const value=useMemo(()=>({session,user:session?.user??null,role:resolveRole(session?.user??null),loading}),[session,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
