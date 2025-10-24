/**
 * Voice Store (Zustand)
 * Gestiona el estado del reconocimiento de voz
 */

import { create } from 'zustand'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

interface VoiceStore {
  // State
  state: VoiceState
  transcript: string
  isRecording: boolean
  error: string | null
  
  // Mode: 'ptt' (push-to-talk) o 'toggle' (tap on/off)
  mode: 'ptt' | 'toggle'
  
  // Actions
  setState: (state: VoiceState) => void
  setTranscript: (transcript: string) => void
  setIsRecording: (isRecording: boolean) => void
  setError: (error: string | null) => void
  setMode: (mode: 'ptt' | 'toggle') => void
  reset: () => void
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  // Initial state
  state: 'idle',
  transcript: '',
  isRecording: false,
  error: null,
  mode: 'toggle', // Default to toggle for better mobile UX

  // Actions
  setState: (state) => set({ state }),
  
  setTranscript: (transcript) => set({ transcript }),
  
  setIsRecording: (isRecording) => set({ isRecording }),
  
  setError: (error) => set({ error, state: error ? 'error' : 'idle' }),
  
  setMode: (mode) => {
    localStorage.setItem('foxy-voice-mode', mode)
    set({ mode })
  },
  
  reset: () =>
    set({
      state: 'idle',
      transcript: '',
      isRecording: false,
      error: null,
    }),
}))

