import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { DataloaderService } from './dataloader.service';
import { AppComponent } from './app.component';
import { DatabarComponent } from './databar/databar.component';
import { DataviewComponent } from './dataview/dataview.component';
import { AppRoutingModule } from './/app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    DatabarComponent,
    DataviewComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [DataloaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
