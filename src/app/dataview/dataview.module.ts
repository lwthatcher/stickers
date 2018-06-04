import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgbModule
  ],
  declarations: [DataviewComponent, DatabarComponent]
})
export class DataviewModule { }
