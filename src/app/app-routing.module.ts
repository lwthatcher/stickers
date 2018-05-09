import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataviewComponent } from './dataview/dataview.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'display/:dataset', component: DataviewComponent }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }