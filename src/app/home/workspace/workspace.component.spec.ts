import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceComponent } from './workspace.component';
import {APP_BASE_HREF} from '@angular/common';
import { AppModule } from '../../app.module';
import { WorkspaceInfo } from '../../data-loader/workspace-info';

// #region [Interfaces]
interface Info {
  workspace: string[]
  labels: {[label_key: string]: Object}
  data: {[data_key: string]: Object}
  video: {[video_key: string]: Object}
}
// #endregion

describe('WorkspaceComponent', () => {
  // #region [Variables]
  let component: WorkspaceComponent;
  let fixture: ComponentFixture<WorkspaceComponent>;
  let EXAMPLE_WORKSPACE: Info = {
    workspace: ['ex'], 
    labels: {}, 
    data: {'A': {path: "ex/data.csv", Hz:100, flashes: [0, 669470], channels: 'AG', format: 'csv', labelled:false},
           'B': {path: "ex/bdl.csv", Hz:1000, flashes: [0, 669470], channels: 'AGCLB', format: 'bdl', labelled:false},
           'C': {path: "ex/data.csv", Hz:100, flashes: [0, 669470], channels: 'AGCLB', format: 'csv', labelled:false}}, 
    video: {'V': {path: "ex/video.mp4", flashes: [4.288888]}}
  }
  let EX2: Info = Object.assign({}, EXAMPLE_WORKSPACE)
  EX2.video = {}
  let ws: WorkspaceInfo;
  // #endregion

  // #region [Before Each]
  beforeEach(async(() => {
    ws = new WorkspaceInfo(EXAMPLE_WORKSPACE);
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{provide: APP_BASE_HREF, useValue: '/localhost:4200/'}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    component.workspace = ws;
    fixture.detectChanges();
  });
  // #endregion

  // #region [Tests]
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('correct default datset', () => {
    expect(component.selected.dataset.name).toBe('C');
  });

  it('canSync = true (video has flashes)', () => {
    expect(component.canSync).toBe(true);
  });

  it('canSync = false (no video)', () => {
    let ws2 = new WorkspaceInfo(EX2);
    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    component.workspace = ws2;
    fixture.detectChanges();
    expect(component.canSync).toBe(false);
  });
  // #endregion
});
