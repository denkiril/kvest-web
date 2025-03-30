import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'k',
    loadChildren: () =>
      import('./modules/kvests-page/kvests-page.routes').then(
        module => module.kvestsPageRoutes,
      ),
  },
  {
    path: 'k/:id',
    loadChildren: () =>
      import('./modules/kvest-page/kvest-page.routes').then(
        module => module.kvestPageRoutes,
      ),
  },
  {
    path: '**',
    redirectTo: 'k',
  },
];
