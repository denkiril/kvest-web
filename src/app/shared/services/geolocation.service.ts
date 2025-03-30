import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, tap } from 'rxjs';

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
      if (!this.watchInitialized) this.watchCurrentPosition();
    }),
  );

  private watchInitialized = false;

  private watchCurrentPosition(): void {
    console.log('watchCurrentPosition...');
    this.watchInitialized = true;

    window.navigator.geolocation.watchPosition(
      value => {
        console.log('watchPosition suc:', value);
        this.geoPositionSubject.next(value);
      },
      err => {
        console.warn('watchPosition err:', err);
        this.geoPositionSubject.next(undefined);
      },
      // {
      //   enableHighAccuracy: true,
      //   timeout: 5000,
      //   maximumAge: 0,
      // },
    );
  }
}
