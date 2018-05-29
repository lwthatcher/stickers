import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from './settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Stickers';
  version: Observable<string>;

  constructor(private settings: SettingsService) { }

  ngOnInit(): void {
    this.version = this.settings.version()
  }
}
