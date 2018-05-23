import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  trigger,
  state,
  style,
  animate,
  transition,query,stagger, keyframes
} from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styles: [],
  animations: [
    trigger("workspace", [
      transition(':enter', [
        query(':enter', style({ opacity: 0 }), {optional: true}),
        query(':enter', stagger('300ms', [
          animate('1s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: true})
    ])
  ]
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
