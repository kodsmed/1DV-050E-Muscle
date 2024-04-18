export interface ExerciseInterface {
  id: number
  name: string
  muscle_group: MuscleGroup[]
}

export interface MuscleGroup {
  id: number;
  name: string;
  icon_component: string | null;
  uri: string | null;
}
