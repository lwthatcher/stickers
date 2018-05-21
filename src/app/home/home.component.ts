import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <h3>Home</h3>
    <div>
      <ul class="list-group">
       <li *ngFor="let dataset of datasets" class="list-group-item d-flex justify-content-between align-items-center">
        <a routerLink="/display/{{dataset.name}}/{{dataset.format}}">{{dataset.name}}</a>
        <span class="badge badge-primary badge-pill">{{dataset.format}}</span>
       </li>
      </ul>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  datasets = [{name:'pills-blue', format:'tensor'},
              {name:'pills-blue', format:'csv'},
              {name:'run-pink', format:'csv'}];

  constructor() { }

  ngOnInit() {
  }

}