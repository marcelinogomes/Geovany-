export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  goal?: string;
  weight?: number;
  height?: number;
  createdAt: any;
}

export interface Workout {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  videoUrl?: string;
  notes?: string;
  order: number;
}

export interface ProgressEntry {
  id: string;
  studentId: string;
  date: any;
  weight: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  biceps?: number;
  thigh?: number;
  notes?: string;
}
