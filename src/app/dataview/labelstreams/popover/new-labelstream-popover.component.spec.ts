import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLabelstreamPopoverComponent } from './new-labelstream-popover.component';

describe('NewLabelstreamPopoverComponent', () => {
  let component: NewLabelstreamPopoverComponent;
  let fixture: ComponentFixture<NewLabelstreamPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewLabelstreamPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLabelstreamPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
