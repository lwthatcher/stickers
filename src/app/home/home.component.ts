import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <h2>Home</h2>
    <div>
      <ul class="list-group">
       <li *ngFor="let dataset of datasets" class="list-group-item">
        <a routerLink="/display/{{dataset}}">{{dataset}}</a>
       </li>
      </ul>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  datasets = ['pills-blue', 'run-pink'];

  constructor() { }

  ngOnInit() {
  }

}
