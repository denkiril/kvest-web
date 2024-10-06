import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'k/:id',
    loadChildren: () =>
      import('./modules/kvest-page/kvest-page.routes').then(
        module => module.kvestPageRoutes,
      ),
  },
];
