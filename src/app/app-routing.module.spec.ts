import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppModule } from './app.module';

describe('AppRoutingModule', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppModule] });
    router = TestBed.inject(Router);
  });

  it('redirects the root path to the homepage', async () => {
    await router.navigateByUrl('/');

    expect(router.url).toBe('/homepage');
  });

  it('sends a logged-out visitor away from an agent-only route', async () => {
    await router.navigateByUrl('/add-flight');

    expect(router.url).toBe('/login');
  });
});
