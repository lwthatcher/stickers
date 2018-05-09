import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent {
  title = 'Stickers';
  databarHeight = 400;

  getDataHeight() {
    return this.databarHeight;
  }
}
