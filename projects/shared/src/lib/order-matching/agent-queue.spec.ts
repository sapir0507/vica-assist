import { isVisibleToAgent } from './agent-queue';

describe('isVisibleToAgent', () => {
  it('shows an agent their own requests', () => {
    expect(isVisibleToAgent({ agent: 'dana' }, 'dana')).toBe(true);
  });

  it('hides another agent\'s requests', () => {
    expect(isVisibleToAgent({ agent: 'noa' }, 'dana')).toBe(false);
  });

  it('shows requests that were never assigned to every agent', () => {
    expect(isVisibleToAgent({}, 'dana')).toBe(true);
  });

  it('shows nothing for a missing request', () => {
    expect(isVisibleToAgent(undefined, 'dana')).toBe(false);
  });
});
