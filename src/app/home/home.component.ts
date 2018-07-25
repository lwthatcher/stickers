import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition, query, stagger, keyframes } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
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
    ])
  ]
})
export class HomeComponent implements OnInit {
  workspaces;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.workspaces = this.route.snapshot.data.workspaces;
    console.info('workspaces', this.workspaces);
  }
}
