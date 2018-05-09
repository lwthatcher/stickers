import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <h2>Home</h2>
    <div>
      <ul class="list-group">
       <li class="list-group-item"><a routerLink="/display">Display</a></li>
      </ul>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
