import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergySettingsPopover } from './settings-popover.component';

describe('EnergySettingsPopover', () => {
  let component: EnergySettingsPopover;
  let fixture: ComponentFixture<EnergySettingsPopover>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergySettingsPopover ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergySettingsPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
