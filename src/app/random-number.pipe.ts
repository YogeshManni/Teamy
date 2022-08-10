import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'randomNumber',
})
export class RandomNumberPipe implements PipeTransform {
  transform(value: string, ...args: string[]): string {
    return `https://joeschmoe.io/api/v1/${Math.floor(Math.random() * 100 + 1)}`;
  }
}
