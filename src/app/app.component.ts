import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from './settings/settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Stickers';
  version: Observable<string>;

  constructor(private settings: SettingsService) { }

  ngOnInit(): void {
    this.version = this.settings.version()
  }
}
