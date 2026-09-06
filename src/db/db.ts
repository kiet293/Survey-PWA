// ─────────────────────────────────────────────
// IndexedDB — VKU Survey DB
// ─────────────────────────────────────────────
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Survey, SurveyDraft } from '../types';

interface VKUSurveyDB extends DBSchema {
  surveys: {
    key: string;
    value: Survey;
    indexes: {
      'by-status': string;
      'by-building': string;
      'by-priority': string;
      'by-date': string;
    };
  };
  drafts: {
    key: string;
    value: SurveyDraft;
  };
}

const DB_NAME = 'vku-survey-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VKUSurveyDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VKUSurveyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Surveys store
        const surveyStore = db.createObjectStore('surveys', { keyPath: 'id' });
        surveyStore.createIndex('by-status', 'syncStatus');
        surveyStore.createIndex('by-building', 'step1.building');
        surveyStore.createIndex('by-priority', 'step4.priority');
        surveyStore.createIndex('by-date', 'createdAt');

        // Drafts store
        db.createObjectStore('drafts', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

// ─── Survey CRUD ──────────────────────────────

export async function saveSurvey(survey: Survey): Promise<void> {
  const db = await getDB();
  await db.put('surveys', survey);
}

export async function getAllSurveys(): Promise<Survey[]> {
  const db = await getDB();
  const surveys = await db.getAll('surveys');
  // Sort by createdAt descending
  return surveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSurveyById(id: string): Promise<Survey | undefined> {
  const db = await getDB();
  return db.get('surveys', id);
}

export async function deleteSurvey(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('surveys', id);
}

export async function getPendingSurveys(): Promise<Survey[]> {
  const db = await getDB();
  const surveys = await db.getAllFromIndex('surveys', 'by-status', 'pending');
  return surveys;
}

export async function updateSurveySync(id: string, status: 'synced' | 'failed'): Promise<void> {
  const db = await getDB();
  const survey = await db.get('surveys', id);
  if (survey) {
    survey.syncStatus = status;
    survey.updatedAt = new Date().toISOString();
    await db.put('surveys', survey);
  }
}

// ─── Draft CRUD ───────────────────────────────

export async function saveDraft(draft: SurveyDraft): Promise<void> {
  const db = await getDB();
  await db.put('drafts', draft);
}

export async function getLatestDraft(): Promise<SurveyDraft | undefined> {
  const db = await getDB();
  const all = await db.getAll('drafts');
  if (all.length === 0) return undefined;
  return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('drafts', id);
}

export async function clearAllDrafts(): Promise<void> {
  const db = await getDB();
  await db.clear('drafts');
}
