import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AesDetailComponent } from './pages/aes-detail/aes-detail.component';
import { DesDetailComponent } from './pages/des-detail/des-detail.component';
import { KuznechikDetailComponent } from './pages/kuznechik-detail/kuznechik-detail.component';
import { ExperimentsComponent } from './pages/experiments/experiments.component';
import { TheoryAesComponent } from './pages/theory-aes/theory-aes.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'algorithms/aes', component: AesDetailComponent },
  { path: 'algorithms/des', component: DesDetailComponent },
  { path: 'algorithms/kuznechik', component: KuznechikDetailComponent },
  { path: 'experiments', component: ExperimentsComponent },
  { path: 'theory/aes', component: TheoryAesComponent },
  { path: '**', redirectTo: '' }
];