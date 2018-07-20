import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry, MatIconModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule
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
export class DataviewModule { 
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
