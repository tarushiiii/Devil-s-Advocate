export type Protocol = 'polite' | 'brutal';

export type Screen = 'chamber' | 'case' | 'protocol' | 'loading' | 'cross' | 'verdict' | 'compare';

export interface DecisionCase {
  decision: string;
  objective: string;
  stakeholders: string;
  stakes?: string;
  depositionId?: string;
  timestamp?: string;
  attempts?: AttemptRecord[];
}

export interface AttemptRecord {
  id: number;
  decision: string;
  objective: string;
  stakeholders: string;
  stakes?: string;
  protocol: Protocol;
  personaKey: string;
  transcript: TranscriptEntry[];
  verdict: VerdictReport;
  timestamp: string;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  style: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  speakerType: 'adversary' | 'defendant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ScoreItem {
  score: number;
  max: number;
  critique: string;
}

export interface PreMortemItem {
  number: string;
  title: string;
  detail?: string;
}

export interface PreMortemBrief {
  howThisFails: PreMortemItem[];
  warningMetric: string;
  warningSubtext: string;
  unaddressedBlindspot: string;
  concludingDictum: string;
}

export interface VerdictReport {
  score: number;
  status: string;
  diagnosis: string;
  scores: {
    specificity: ScoreItem;
    consistency: ScoreItem;
    falsifiability: ScoreItem;
  };
  preMortem: PreMortemBrief;
}
