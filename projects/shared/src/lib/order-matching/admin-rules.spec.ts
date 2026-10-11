import { TRIP_CONFIG_DEFAULTS, TripConfig } from '../config/trip.config';
import { AgentProfile, describeConfigChange, validateAgentProfile } from './admin-rules';

const profile = (overrides: Partial<AgentProfile> = {}): AgentProfile => ({
  username: 'maya.cohen',
  displayName: 'Maya Cohen',
  title: 'Senior travel agent',
  bio: 'Loves Europe.',
  languages: ['Hebrew'],
  specialties: ['Paris'],
  yearsExperience: 9,
  email: 'maya@example.com',
  ...overrides
});

describe('validateAgentProfile', () => {
  it('accepts a complete profile', () => {
    expect(validateAgentProfile(profile())).toEqual([]);
  });

  it('flags a bad username, name, title, email and years', () => {
    const errors = validateAgentProfile(profile({ username: 'a b', displayName: 'Maya', title: 'x', email: 'nope', yearsExperience: 70 }));

    expect(errors).toHaveLength(5);
  });

  it('needs a language and no empty specialties, and limits the bio', () => {
    expect(validateAgentProfile(profile({ languages: [] }))).toEqual(['Add at least one language.']);
    expect(validateAgentProfile(profile({ specialties: ['Paris', ' '] }))).toEqual(['Specialties cannot be empty.']);
    expect(validateAgentProfile(profile({ bio: 'a'.repeat(401) }))).toEqual(['The bio can be up to 400 characters.']);
  });

  it('wants whole numbers of years', () => {
    expect(validateAgentProfile(profile({ yearsExperience: 2.5 }))).toHaveLength(1);
    expect(validateAgentProfile(profile({ yearsExperience: -1 }))).toHaveLength(1);
  });
});

describe('describeConfigChange', () => {
  const copy = (): TripConfig => structuredClone(TRIP_CONFIG_DEFAULTS);

  it('says nothing changed when nothing did', () => {
    expect(describeConfigChange(TRIP_CONFIG_DEFAULTS, copy())).toBe('saved with no changes');
  });

  it('describes airlines that were added, edited and switched off or on', () => {
    const after = copy();
    after.airlines.push({ ...after.airlines[0], id: 'xx', code: 'XX', name: 'Test Air' });
    after.airlines[1].active = false;
    after.airlines[2].country = 'Cyprus';
    const back = copy();
    back.airlines[0].active = false;

    expect(describeConfigChange(TRIP_CONFIG_DEFAULTS, after)).toBe('added airline Test Air; deactivated airline Israir; edited airline Arkia');
    expect(describeConfigChange(back, TRIP_CONFIG_DEFAULTS)).toBe('reactivated airline El Al');
  });

  it('describes option list changes', () => {
    const after = copy();
    after.cabins[2].active = false;
    after.cabins[0].label = 'Coach';
    after.cabins.push({ id: 'first', label: 'First', active: true });

    expect(describeConfigChange(TRIP_CONFIG_DEFAULTS, after)).toBe('renamed "Economy" to "Coach" in cabins; deactivated "Business" in cabins; added "First" to cabins');
  });

  it('describes limits, assignment rules and the public minimum', () => {
    const after = copy();
    after.limits.maxTravelers = 6;
    after.assignment.responseHours = 12;
    after.publicMinimum = 10;

    expect(describeConfigChange(TRIP_CONFIG_DEFAULTS, after)).toBe('maxTravelers 9 to 6; responseHours 24 to 12; publicMinimum 5 to 10');
  });
});
