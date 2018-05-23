import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { DataloaderService } from './data-loader/data-loader.service';
import { AppComponent } from './app.component';
import { DatabarComponent } from './databar/databar.component';
import { DataviewComponent } from './dataview/dataview.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { WorkspaceResolver } from './data-loader/workspace-resolver.service';
import { WorkspaceLoaderService } from './data-loader/workspace-loader.service';


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
  providers: [DataloaderService, WorkspaceResolver, WorkspaceLoaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
