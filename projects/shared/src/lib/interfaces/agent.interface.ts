export interface Agent {
  id: number;
  username: string;
  displayName: string;
  title: string;
  bio: string;
  languages: string[];
  /** Destinations or trip types (`both`, `hotel`, `flight`) this agent is best at. */
  specialties: string[];
  yearsExperience: number;
  email: string;
  available: boolean;
  active: boolean;
}

export type AssignmentReason = 'initial' | 'overdue' | 'agent-unavailable' | 'manual';

export interface Assignment {
  agent: string;
  at: string;
  reason: AssignmentReason;
}
