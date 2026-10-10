import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { APP_ICONS } from './app-icons';
import { provideAppIcons } from './provide-app-icons';

describe('provideAppIcons', () => {
  it('registers every inlined icon with the Material icon registry', async () => {
    TestBed.configureTestingModule({ providers: [provideAppIcons()] });
    const registry = TestBed.inject(MatIconRegistry);

    for (const name of Object.keys(APP_ICONS)) {
      const svg = await firstValueFrom(registry.getNamedSvgIcon(name));
      expect(svg.tagName.toLowerCase(), name).toBe('svg');
      expect(svg.getAttribute('viewBox'), name).toBe('0 0 24 24');
    }
  });

  it('does not ship icon markup that can run script', () => {
    for (const [name, svg] of Object.entries(APP_ICONS)) {
      expect(svg, name).not.toMatch(/<script|\son[a-z]+=|javascript:/i);
    }
  });
});
