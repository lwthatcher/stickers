import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <h3>Home</h3>
    <div>
      <ul class="list-group">
       <li *ngFor="let dataset of datasets" class="list-group-item">
        <a routerLink="/display/{{dataset.name}}">{{dataset.name}}</a>
       </li>
      </ul>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  datasets = [{name:'pills-blue', format:'tensor'}, 
              {name:'run-pink', format:'csv'}];

  constructor() { }

  ngOnInit() {
  }

}
