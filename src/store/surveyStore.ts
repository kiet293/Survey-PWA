// ─────────────────────────────────────────────
// Survey Store — Zustand
// ─────────────────────────────────────────────
import { create } from 'zustand';
import type { Survey, SurveyDraft } from '../types';
import {
  getAllSurveys,
  saveSurvey,
  deleteSurvey as dbDeleteSurvey,
  saveDraft,
  getLatestDraft,
  deleteDraft,
} from '../db/db';

interface SurveyState {
  surveys: Survey[];
  pendingCount: number;
  draft: SurveyDraft | null;
  loading: boolean;

  // Actions
  loadSurveys: () => Promise<void>;
  addSurvey: (survey: Survey) => Promise<void>;
  removeSurvey: (id: string) => Promise<void>;
  saveDraftState: (draft: SurveyDraft) => Promise<void>;
  loadDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;
  syncPendingSurveys: () => Promise<number>;
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  pendingCount: 0,
  draft: null,
  loading: false,

  loadSurveys: async () => {
    set({ loading: true });
    const surveys = await getAllSurveys();
    const pendingCount = surveys.filter((s) => s.syncStatus === 'pending').length;
    set({ surveys, pendingCount, loading: false });
  },

  addSurvey: async (survey: Survey) => {
    await saveSurvey(survey);
    await get().loadSurveys();
  },

  removeSurvey: async (id: string) => {
    await dbDeleteSurvey(id);
    await get().loadSurveys();
  },

  saveDraftState: async (draft: SurveyDraft) => {
    await saveDraft(draft);
    set({ draft });
  },

  loadDraft: async () => {
    const draft = await getLatestDraft();
    set({ draft: draft ?? null });
  },

  clearDraft: async () => {
    const { draft } = get();
    if (draft) {
      await deleteDraft(draft.id);
    }
    set({ draft: null });
  },

  syncPendingSurveys: async () => {
    const { surveys, loadSurveys } = get();
    const pending = surveys.filter(s => s.syncStatus === 'pending');
    if (pending.length === 0) return 0;

    // Simulate network sync delay
    await new Promise(r => setTimeout(r, 1000));

    // Update DB
    for (const s of pending) {
      await saveSurvey({ ...s, syncStatus: 'synced' });
    }

    await loadSurveys();
    return pending.length;
  },
}));
