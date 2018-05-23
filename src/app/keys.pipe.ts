import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let keys = [];
    for (let pair of Object.entries(value))
      keys.push({key: pair[0], value: pair[1]});
    console.debug('keys pipe', keys, value);
    return keys;
  }

}
