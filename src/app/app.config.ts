import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';
import { FireworksService } from './shared/modules/fireworks';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([BrowserAnimationsModule]),
    provideHttpClient(),
    provideRouter(appRoutes),
    FireworksService,
  ],
};
