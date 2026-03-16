import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/campaign-list/campaign-list.component').then(
        (m) => m.CampaignListComponent,
      ),
  },
  {
    path: 'campaigns/new',
    loadComponent: () =>
      import('./pages/campaign-form/campaign-form.component').then(
        (m) => m.CampaignFormComponent,
      ),
  },
  {
    path: 'campaigns/:id',
    loadComponent: () =>
      import('./pages/campaign-detail/campaign-detail.component').then(
        (m) => m.CampaignDetailComponent,
      ),
  },
  {
    path: 'campaigns/:id/edit',
    loadComponent: () =>
      import('./pages/campaign-form/campaign-form.component').then(
        (m) => m.CampaignFormComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
