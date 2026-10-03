// This file is required by karma.conf.js.
// Spec files are discovered and loaded automatically by the karma builder's
// FindTestsPlugin - see https://github.com/angular/angular-cli/issues/24287
// for why the old manual `require.context(...)` glob broke under Angular 15.

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
