import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ModesToolboxComponent } from './modes/modes-toolbox.component';
import { TypesToolboxComponent } from './types/types-toolbox.component';
import { LabelstreamToolboxComponent } from './labelstreams/labelstreams-toolbox.component';
import { SensorsToolboxComponent } from './sensors/sensors-toolbox.component';
import { SaveMenuComponent } from './save-menu/save-menu.component';
import { EnergyWellToolboxComponent } from './energy/energy-well-toolbox.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule
  ],
  declarations: [
    DataviewComponent, 
    DatabarComponent, 
    ModesToolboxComponent, 
    TypesToolboxComponent, 
    LabelstreamToolboxComponent, 
    SensorsToolboxComponent, SaveMenuComponent, EnergyWellToolboxComponent],
  providers: []
})
export class DataviewModule { }
