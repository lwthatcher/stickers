import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataloaderService } from './data-loader.service';
import { WorkspaceLoaderService } from './workspace-loader.service';
import { WorkspaceResolver } from './workspace-resolver.service';
import { LabelsLoaderService } from './labels-loader.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [DataloaderService, WorkspaceLoaderService, WorkspaceResolver, LabelsLoaderService]
})
export class DataLoaderModule { }
