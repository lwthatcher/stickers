import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { DataloaderService } from './data-loader.service';
import { AppComponent } from './app.component';
import { DatabarComponent } from './databar/databar.component';
import { DataviewComponent } from './dataview/dataview.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { WorkspaceResolver } from './workspace-resolver.service';


@NgModule({
  declarations: [
    AppComponent,
    DatabarComponent,
    DataviewComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [DataloaderService, WorkspaceResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
