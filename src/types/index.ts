// ─────────────────────────────────────────────
// VKU Field Survey PWA — Type Definitions
// ─────────────────────────────────────────────

export type Campus = 'K' | 'V';

export type Building = 'A' | 'B' | 'C' | 'D1' | 'D2' | 'E1' | 'E2' | 'V';

export type RoomType = 'theory' | 'lab' | 'auditorium' | 'meeting';

export type EquipmentCondition = 'good' | 'needs_repair' | 'broken';

export type Priority = 'urgent' | 'normal' | 'low';

export type SyncStatus = 'pending' | 'synced' | 'failed';

export type SurveyStatus = 'draft' | 'submitted';

// ─── Building Info ────────────────────────────
export const BUILDINGS: { value: Building; label: string; campus: Campus }[] = [
  { value: 'A', label: 'Tòa A', campus: 'K' },
  { value: 'B', label: 'Tòa B', campus: 'K' },
  { value: 'C', label: 'Tòa C', campus: 'K' },
  { value: 'D1', label: 'Tòa D1', campus: 'K' },
  { value: 'D2', label: 'Tòa D2', campus: 'K' },
  { value: 'E1', label: 'Tòa E1', campus: 'K' },
  { value: 'E2', label: 'Tòa E2', campus: 'K' },
  { value: 'V', label: 'Khu V', campus: 'V' },
];

export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'theory', label: 'Phòng học lý thuyết' },
  { value: 'lab', label: 'Phòng thực hành' },
  { value: 'auditorium', label: 'Hội trường' },
  { value: 'meeting', label: 'Phòng họp' },
];

export const PRIORITY_OPTIONS: { value: Priority; label: string; subtitle: string; color: string }[] = [
  { value: 'urgent', label: 'Khẩn cấp', subtitle: 'Cần sửa ngay', color: '#ef4444' },
  { value: 'normal', label: 'Bình thường', subtitle: 'Trong tuần', color: '#f97316' },
  { value: 'low', label: 'Thấp', subtitle: 'Khi có thể', color: '#22c55e' },
];

// ─── Facility Items ───────────────────────────
export interface FacilityItem {
  id: string;
  name: string;
  condition: EquipmentCondition;
  note?: string;
}

// ─── Broken Equipment ─────────────────────────
export interface BrokenEquipment {
  id: string;
  name: string;
  severity: EquipmentCondition;
  description?: string;
  photos?: string[]; // base64 encoded
}

// ─── Survey Data ──────────────────────────────
export interface SurveyStep1 {
  building: Building;
  floor: number;
  roomNumber: string;
  surveyDate: string; // ISO date string
}

export interface SurveyStep2 {
  roomType: RoomType;
  capacity: number;
  overallRating: number; // 1–5
  airConditioner: EquipmentCondition;
  projector: EquipmentCondition;
  whiteboard: EquipmentCondition;
  lighting: EquipmentCondition;
  doors: EquipmentCondition;
  photos?: string[]; // base64 images
}

export interface SurveyStep3 {
  brokenEquipment: BrokenEquipment[];
}

export interface SurveyStep4 {
  priority: Priority;
  estimatedRepairTime?: string;
  additionalNotes?: string;
}

export interface Survey {
  id: string;
  createdAt: string; // ISO datetime
  updatedAt: string;
  surveyorEmail: string;
  surveyorName: string;
  status: SurveyStatus;
  syncStatus: SyncStatus;
  step1: SurveyStep1;
  step2: SurveyStep2;
  step3: SurveyStep3;
  step4: SurveyStep4;
}

// ─── Draft ───────────────────────────────────
export interface SurveyDraft {
  id: string;
  updatedAt: string;
  currentStep: number;
  step1?: Partial<SurveyStep1>;
  step2?: Partial<SurveyStep2>;
  step3?: Partial<SurveyStep3>;
  step4?: Partial<SurveyStep4>;
}

// ─── Auth ────────────────────────────────────
export interface User {
  email: string;
  name: string;
  studentId?: string;
}

// ─── Dashboard Stats ─────────────────────────
export interface DashboardStats {
  total: number;
  urgent: number;
  normal: number;
  low: number;
  pending: number;
  byBuilding: Record<Building, number>;
  byWeek: { week: string; count: number }[];
}
