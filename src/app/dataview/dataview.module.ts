import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataviewComponent } from './dataview.component';
import { DatabarComponent } from './databar/databar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry, MatIconModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { ModesToolboxComponent } from './modes/modes-toolbox.component';
import { TypesToolboxComponent } from './types/types-toolbox.component';
import { LabelstreamToolboxComponent } from './labelstreams/labelstreams-toolbox.component';
import { SensorsToolboxComponent } from './sensors/sensors-toolbox.component';
import { SaveMenuComponent } from './save-menu/save-menu.component';
import { EnergyWellToolboxComponent } from './energy/energy-well-toolbox.component';
import { VideoComponent } from './video/video.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule
  ],
  declarations: [
    DataviewComponent, 
    DatabarComponent, 
    ModesToolboxComponent, 
    TypesToolboxComponent, 
    LabelstreamToolboxComponent, 
    SensorsToolboxComponent, SaveMenuComponent, EnergyWellToolboxComponent, VideoComponent],
  providers: []
})
export class DataviewModule { 
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
