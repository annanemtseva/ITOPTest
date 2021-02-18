import {Component, OnDestroy} from '@angular/core';
import {Subscription, Subject, timer} from 'rxjs';
import {buffer, debounceTime, filter, map, repeatWhen, takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  constructor() {
  }

  time = '00:00:00';
  subscribe: Subscription;
  click$ = new Subject();
  disabled = true;
  doubleClick$ = this.click$.pipe(
    buffer(
      this.click$.pipe(debounceTime(300))
    ),
    map(list => {
      return list.length;
    }),
    filter(x => x === 2)
  );

  start() {
    this.disabled = !this.disabled;
    this.subscribe = timer(0, 1000)
      .pipe(
        takeUntil(this.doubleClick$),
        repeatWhen(() => this.doubleClick$),
        map(val => this.numberToTimeString(val))
      )
      .subscribe(x => {
        this.time = x;
      });
  }

  stop() {
    this.disabled = !this.disabled;
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

  wait() {
    this.click$.next();
  }

  reset() {
    this.stop();
    this.start();
  }
  numberToTimeString(valTimer: number): string {
    const secNum = valTimer;
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor((secNum - (hours * 3600)) / 60);
    const seconds = secNum - (hours * 3600) - (minutes * 60);
    return `${this.convertNumberToMilitary(hours)}:${this.convertNumberToMilitary(minutes)}:${this.convertNumberToMilitary(seconds)}`;
  }

  convertNumberToMilitary(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  ngOnDestroy() {
    this.subscribe.unsubscribe();
  }
}
