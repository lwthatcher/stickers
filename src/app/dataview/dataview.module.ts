import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [DataviewComponent, DatabarComponent]
})
export class DataviewModule { }
