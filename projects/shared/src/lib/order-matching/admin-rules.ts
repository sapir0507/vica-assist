import { TripConfig } from '../config/trip.config';
import { Agent } from '../interfaces/agent.interface';
import { isValidFullName } from './id-and-name';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME = /^[A-Za-z0-9._-]{3,30}$/;

export type AgentProfile = Pick<Agent, 'username' | 'displayName' | 'title' | 'bio' | 'languages' | 'specialties' | 'yearsExperience' | 'email'>;

/** Everything wrong with an agent profile, in words the admin can act on. */
export function validateAgentProfile(profile: AgentProfile): string[] {
  const errors: string[] = [];
  if (!USERNAME.test(profile.username)) errors.push('The username needs 3 to 30 letters, digits, dots, dashes or underscores.');
  if (!isValidFullName(profile.displayName, 60)) errors.push('Use a first and a last name, letters only.');
  if (profile.title.trim().length < 3 || profile.title.trim().length > 80) errors.push('The title needs 3 to 80 characters.');
  if (profile.bio.trim().length > 400) errors.push('The bio can be up to 400 characters.');
  if (!EMAIL.test(profile.email) || profile.email.length > 254) errors.push('Enter a valid email address.');
  if (!Number.isInteger(profile.yearsExperience) || profile.yearsExperience < 0 || profile.yearsExperience > 60) errors.push('Years of experience must be a whole number from 0 to 60.');
  if (profile.languages.length === 0) errors.push('Add at least one language.');
  if (profile.specialties.some(item => item.trim() === '')) errors.push('Specialties cannot be empty.');
  return errors;
}

/** A short sentence for the audit log: what an admin save changed. */
export function describeConfigChange(before: TripConfig, after: TripConfig): string {
  const changes: string[] = [];

  const addedAirlines = after.airlines.filter(next => !before.airlines.some(old => old.id === next.id));
  addedAirlines.forEach(airline => changes.push(`added airline ${airline.name}`));
  for (const next of after.airlines) {
    const old = before.airlines.find(item => item.id === next.id);
    if (!old) continue;
    if (old.active !== next.active) changes.push(`${next.active ? 'reactivated' : 'deactivated'} airline ${next.name}`);
    else if (JSON.stringify(old) !== JSON.stringify(next)) changes.push(`edited airline ${next.name}`);
  }

  for (const list of ['cabins', 'stopsOptions', 'departureTimes', 'bedTypes', 'hotelAreas', 'meals', 'seatTypes'] as const) {
    for (const next of after[list]) {
      const old = before[list].find(item => item.id === next.id);
      if (!old) changes.push(`added "${next.label}" to ${list}`);
      else if (old.active !== next.active) changes.push(`${next.active ? 'reactivated' : 'deactivated'} "${next.label}" in ${list}`);
      else if (old.label !== next.label) changes.push(`renamed "${old.label}" to "${next.label}" in ${list}`);
    }
  }

  const compare = (group: 'limits' | 'assignment') => {
    const old = before[group] as unknown as Record<string, number>;
    const next = after[group] as unknown as Record<string, number>;
    for (const key of Object.keys(next)) if (old[key] !== next[key]) changes.push(`${key} ${old[key]} to ${next[key]}`);
  };
  compare('limits');
  compare('assignment');
  if (before.publicMinimum !== after.publicMinimum) changes.push(`publicMinimum ${before.publicMinimum} to ${after.publicMinimum}`);

  return changes.length > 0 ? changes.join('; ') : 'saved with no changes';
}
