import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
  // #region [Constructors]
  workspaces;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.workspaces = this.route.snapshot.data.workspaces;
    console.info('workspaces', this.workspaces);
  }
  // #endregion
}
