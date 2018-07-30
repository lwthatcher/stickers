import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewLabelstreamPopover } from './new-labelstream-popover.component';

describe('NewLabelstreamPopover', () => {
  // #region [Variables]
  let component: NewLabelstreamPopover;
  let fixture: ComponentFixture<NewLabelstreamPopover>;
  let streams = ["move", "pills"];
  const declarations = [ NewLabelstreamPopover ]
  // #endregion

  // #region [Before Each]
  beforeEach(async(() => {
    TestBed.configureTestingModule({declarations}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLabelstreamPopover);
    component = fixture.componentInstance;
    component.streams = streams;
    fixture.detectChanges();
  });
  // #endregion

  // #region [Tests]
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('validName = true', () => {
    expect(component.validName('ducks')).toBe(true);
  });

  it('validName = false -- (length > 0)', () => {
    expect(component.validName('')).toBe(false);
  });

  it('validName = false -- (undefined/null input)', () => {
    expect(component.validName(undefined)).toBe(false);
    expect(component.validName(null)).toBe(false);
  });

  it('validName = false -- (already exists)', () => {
    expect(component.validName('pills')).toBe(false);
    expect(component.validName('move')).toBe(false);
  });

  it('create() -- (emits event)', () => {
    let response: string;
    component.submit.subscribe((name: string) => response = name);
    component.create('ducks');
    expect(response).toBe('ducks');
  })

  it('create() -- (invalid name does not submit event)', () => {
    let response: string;
    component.submit.subscribe((name: string) => response = name);
    component.create('');
    expect(response).toBeUndefined();
  })
  // #endregion
});
