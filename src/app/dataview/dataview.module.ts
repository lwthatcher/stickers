import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ColorerService } from './colorer.service';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule
  ],
  declarations: [DataviewComponent, DatabarComponent],
  providers: [ColorerService]
})
export class DataviewModule { }
