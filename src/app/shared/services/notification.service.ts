import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FireworksService } from '../modules/fireworks';

type NotificationMessageType = 'challenge-success' | 'challenge-fail' | 'show-error';

interface NotificationMessage {
  type: NotificationMessageType;
  payload?: string;
}

const EMPTY_PAYLOAD_ERROR = 'EMPTY_PAYLOAD_ERROR';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly fireworksService = inject(FireworksService);

  public dispatch(msg: NotificationMessage): void {
    // console.log('[Notification] dispatch:', msg);
    switch (msg.type) {
      case 'challenge-success':
        this.fireworksService.fire();
        break;
      case 'show-error':
        this.showError(msg.payload ?? EMPTY_PAYLOAD_ERROR);
        break;
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, '╳', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'snackbar-error',
    });
  }
}
