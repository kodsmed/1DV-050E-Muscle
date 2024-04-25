import { ExerciseInterface } from '../types/exercise';

export interface TrainingsSession {
  id: number | null;
  session_name: string;
  sets: Set[];
  created_at: string | null;
  owner_uuid: string | null;
}

export interface Set {
  id: number;
  exercise: ExerciseInterface;
  repetitions: number | null;
  weight: number | null;
  duration_minutes: number | null;
  owner_uuid: string;
  sets: number;
  rest_seconds: number | null;
  date?: string;
}