import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection, isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Material from '@primeuix/themes/material';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

// Define a custom theme preset extending Material theme with brand-specific blue shades
const MasroufyThemePreset = definePreset(Material, {
  semantic: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#1e88e5', // Primary Brand Blue
      600: '#1976d2',
      700: '#1565c0',
      800: '#0d47a1',
      900: '#0d3c8c',
      950: '#061d4a',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MasroufyThemePreset,
        options: {
          darkModeSelector: '.app-dark',
          ripple: true,
        },
      },
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
