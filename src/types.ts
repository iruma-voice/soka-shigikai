export interface QuestionItem {
  meeting: string;
  date: string;
  type: string;
  details: string[];
  isCurrentTerm: boolean;
  newsletter?: {
    source: string;
    url?: string;
    title: string;
    qa: { type: string; text: string }[];
  };
}

export interface Councilor {
  councilor: string;
  faction: string;
  electedCount: number;
  tenureYears: number;
  currentTermCount: number;
  totalCount: number;
  officialPhoto: string | null;
  electionPhoto: string | null;
  sns: {
    twitter?: string;
    facebook?: string;
    youtube?: string;
    instagram?: string;
    line?: string;
    website?: string;
  };
  questions: QuestionItem[];
}
