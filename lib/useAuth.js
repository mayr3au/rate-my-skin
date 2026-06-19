import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from './supabase';

/* ════════════════════════════════════════════════════════════════════════
   useAuth — Supabase Auth (Google OAuth) wrapper
   Exposes { session, user, loading, signInWithGoogle, signOut }.
   The session is auto-detected from the URL hash on OAuth return
   (Supabase `detectSessionInUrl` is on by default), so no callback route
   is needed — the user lands back on /compte already authenticated.
   ════════════════════════════════════════════════════════════════════════ */

export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setConfigured(false);
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
      // Keep email in localStorage so /mes-rapports + identity stay in sync
      try {
        if (sess?.user?.email) {
          localStorage.setItem('rms_user_email', sess.user.email.toLowerCase());
        }
      } catch (e) {}
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: new Error('Auth unavailable') };
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/compte`
            : undefined,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    try {
      localStorage.removeItem('rms_user_email');
    } catch (e) {}
    setSession(null);
    setUser(null);
  }, []);

  return { session, user, loading, configured, signInWithGoogle, signOut };
}
