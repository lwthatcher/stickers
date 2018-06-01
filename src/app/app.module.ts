import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { DataviewComponent } from './dataview/dataview.component';
import { DatabarComponent } from './dataview/databar/databar.component';
import { HomeComponent } from './home/home.component';
import { KeysPipe } from './keys.pipe';
import { AppRoutingModule } from './app-routing.module';
import { SettingsModule } from './settings/settings.module';
import { DataLoaderModule } from './data-loader/data-loader.module';


@NgModule({
  declarations: [
    AppComponent,
    DatabarComponent,
    DataviewComponent,
    HomeComponent,
    KeysPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SettingsModule,
    DataLoaderModule,
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
