import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {
  datasets = [{name:'pills-blue', format:'tensor'},
              {name:'pills-blue', format:'csv'},
              {name:'run-pink', format:'csv'}];
  workspaces;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe((data) => {this.workspaces = data.workspaces});
    console.log('workspaces', this.workspaces);
  }

}
