import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ModesToolboxComponent } from './modes/modes-toolbox.component';
import { TypesToolboxComponent } from './types/types-toolbox.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule
  ],
  declarations: [DataviewComponent, DatabarComponent, ModesToolboxComponent, TypesToolboxComponent],
  providers: []
})
export class DataviewModule { }
