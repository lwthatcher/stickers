import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AppRoutingModule } from '../app-routing.module';
import { SettingsModule } from '../settings/settings.module';
import { DataLoaderModule } from '../data-loader/data-loader.module';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    SettingsModule,
    DataLoaderModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule { }
