import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AppRoutingModule } from '../app-routing.module';
import { SettingsModule } from '../settings/settings.module';
import { DataLoaderModule } from '../data-loader/data-loader.module';

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    SettingsModule,
    DataLoaderModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule { }
