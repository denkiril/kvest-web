import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  Observable,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';

import { NotificationService } from './notification.service';

const SHOW_GEOLOCATION_ALERT_DELAY = 2000;

const GEOLOCATION_POSITION_ERROR_MESSAGES: Record<number, string> = {
  [GeolocationPositionError.PERMISSION_DENIED]:
    'Доступ к геолокации заблокирован пользователем',
  [GeolocationPositionError.POSITION_UNAVAILABLE]: 'Ошибка определения геолокации',
  [GeolocationPositionError.TIMEOUT]: 'Ошибка определения геолокации',
};

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly notificationService = inject(NotificationService);

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
        this.notificationService.dispatch({
          type: 'show-error',
          payload: GEOLOCATION_POSITION_ERROR_MESSAGES[err.code],
        });
        this.geoPositionSubject.next(undefined);
      },
      {
        enableHighAccuracy: true,
        // timeout: 5000,
        // maximumAge: 0,
      },
    );
  }
}
