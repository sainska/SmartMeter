'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { getRoleHome } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [consumer, setConsumer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const applyMe = useCallback((data) => {
    if (data?.profile) {
      setProfile(data.profile);
      setConsumer(data.consumer ?? null);
      if (typeof window !== 'undefined' && data.profile.role) {
        sessionStorage.setItem('smartmeter_role', data.profile.role);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.me();
      applyMe(data);
      return data;
    } catch {
      setProfile(null);
      setConsumer(null);
      return null;
    }
  }, [applyMe]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) refreshProfile().finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) refreshProfile();
      else {
        setProfile(null);
        setConsumer(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    const me = await refreshProfile();
    return me;
  };

  const signUp = async ({ email, password, fullName, phone, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: role || 'consumer' },
      },
    });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      const me = await refreshProfile();
      return me;
    }
    return { profile: { role: role || 'consumer' } };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setConsumer(null);
    sessionStorage.removeItem('smartmeter_role');
    router.push(ROUTES.login);
  };

  const setRole = async (role) => {
    await api.setRole(role);
    const me = await refreshProfile();
    router.push(getRoleHome(role));
    return me;
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    consumer,
    role: profile?.role ?? 'consumer',
    roleInfo: profile,
    loading,
    signIn,
    signUp,
    signOut,
    setRole,
    refreshProfile,
    isAuthenticated: !!session,
    isStaff: ['admin', 'manager', 'billing', 'technician'].includes(profile?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
