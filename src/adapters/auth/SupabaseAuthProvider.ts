/**
 * Adapter: Supabase Auth Provider
 * Implementación de autenticación usando Supabase Auth
 */

import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'

export interface AuthProvider {
  signUp(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }>
  signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }>
  signOut(): Promise<{ error: AuthError | null }>
  resetPassword(email: string): Promise<{ error: AuthError | null }>
  getCurrentUser(): Promise<User | null>
  onAuthStateChange(callback: (user: User | null) => void): () => void
}

export class SupabaseAuthProvider implements AuthProvider {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    return { user: data.user, error }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }
}

