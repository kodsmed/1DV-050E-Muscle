import { TRAINING_DAY_STATUS } from './enums';

export interface Program {
  id?: number;
  created_at?: string;
  owner_uuid?: string;
  training_day_id: number;
  date?: string;
  status?: TRAINING_DAY_STATUS;
  comment?: string;
  session_name?: string;
}

