import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { DataloaderService } from './dataloader.service';
import { AppComponent } from './app.component';
import { DatabarComponent } from './databar/databar.component';


@NgModule({
  declarations: [
    AppComponent,
    DatabarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [DataloaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
