
export enum ExerciseType {
  HOME = 'HOME',
  BREATHING = 'BREATHING',
  SENSES = 'SENSES',
  GRATITUDE = 'GRATITUDE',
  MEDITATION = 'MEDITATION',
  VISUALIZATION = 'VISUALIZATION',
  BODY_SCAN = 'BODY_SCAN',
  MINDFUL_EATING = 'MINDFUL_EATING',
  WALKING_MEDITATION = 'WALKING_MEDITATION'
}

export interface ExerciseStep {
  text: string;
  duration?: number;
}
