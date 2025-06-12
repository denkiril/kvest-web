import { inject, Injectable } from '@angular/core';

import { FireworksService } from '../modules/fireworks';

type NotificationMessage = 'challenge-success' | 'challenge-fail';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private fireworksService = inject(FireworksService);

  public dispatch(msg: NotificationMessage): void {
    // console.log('[Notification] dispatch:', msg);
    if (msg === 'challenge-success') {
      this.fireworksService.fire();
    }
  }
}
