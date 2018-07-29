import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergySettingsPopoverComponent } from './energy-settings-popover.component';

describe('EnergySettingsPopoverComponent', () => {
  let component: EnergySettingsPopoverComponent;
  let fixture: ComponentFixture<EnergySettingsPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergySettingsPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergySettingsPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
