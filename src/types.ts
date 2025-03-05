export interface Criteria {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
}

export interface Category {
  id: string;
  name: string;
  criteria: Criteria[];
  weight: number;
}

export interface Score {
  criteriaId: string;
  value: number;
}

export interface EntityScore {
  entityId: string;
  entityName: string;
  scores: Score[];
  totalScore?: number;
  categoryScores?: Record<string, number>;
}

export interface ScorecardConfig {
  categories: Category[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}