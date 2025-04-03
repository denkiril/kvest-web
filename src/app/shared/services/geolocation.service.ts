import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  Observable,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';

const SHOW_GEOLOCATION_ALERT_DELAY = 2000;

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly geoPositionSubject = new BehaviorSubject<
    GeolocationPosition | undefined
  >(undefined);

  public readonly geoPosition$ = this.geoPositionSubject.asObservable().pipe(
    debounceTime(500),
    tap(() => {
      if (!this.watchInitialized) {
        this.initWatchPosition$(true).subscribe({ error: () => {} });
      }
    }),
  );

  private watchInitialized = false;
  private watchId?: number;

  public initWatchPosition$(init?: boolean): Observable<unknown> {
    this.watchInitialized = true;

    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    return timer(init ? SHOW_GEOLOCATION_ALERT_DELAY : 200).pipe(
      tap(() => this.watchCurrentPosition()),
      switchMap(() => this.geoPosition$.pipe(take(1))),
    );
  }

  private watchCurrentPosition(): void {
    this.watchId = navigator.geolocation.watchPosition(
      value => {
        console.log('watchPosition suc:', value);
        this.geoPositionSubject.next(value);
      },
      err => {
        console.warn('watchPosition err:', err);
        this.geoPositionSubject.error(err);
      },
      {
        enableHighAccuracy: true,
        // timeout: 5000,
        // maximumAge: 0,
      },
    );
  }
}
