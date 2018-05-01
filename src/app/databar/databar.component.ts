import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-databar',
  template: `
    <svg width="960" height="600"></svg>
  `,
  styles: []
})
export class DatabarComponent implements OnInit {
  width = 960;
  height = 600;

  constructor() { }

  ngOnInit() {
    console.log('init databar', this);
  }

}
