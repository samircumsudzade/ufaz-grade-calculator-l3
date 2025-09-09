export interface Assessment {
  label: string;
  coef: number;
  duration?: string;
  grade?: number;
}

export interface EC {
  name: string;
  ects?: number;
  coef: number;
  assessments: Assessment[];
  calculatedGrade?: number;
}

export interface UE {
  UE: string;
  ects: number;
  coef: number;
  ecs: EC[];
  calculatedGrade?: number;
}

export type SyllabusData = UE[];