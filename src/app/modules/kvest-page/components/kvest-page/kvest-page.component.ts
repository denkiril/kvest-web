import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { tap, timer } from 'rxjs';

import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { KvestPageService } from '../../services/kvest-page.service';
import { KvestChallengeComponent } from '../kvest-challenge/kvest-challenge.component';

@Component({
  selector: 'exokv-kvest-page',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatMenuModule,
    KvestChallengeComponent,
    SpinnerComponent,
  ],
  providers: [KvestPageService],
  templateUrl: './kvest-page.component.html',
  styleUrl: './kvest-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KvestPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly kvestPageService = inject(KvestPageService);

  public readonly page = toSignal(
    this.kvestPageService.page$.pipe(tap(() => this.pageUpdated())),
  );
  public readonly challenge = computed(() => this.page()?.challenge);
  public readonly pending = signal(false);

  public readonly challengeControl = new FormControl<unknown>(null, Validators.required);

  ngOnInit(): void {
    this.challengeControl.valueChanges.subscribe(() => {
      console.log('challengeControl', this.challengeControl);
    });
  }

  public skip(): void {
    this.pending.set(true);
    this.kvestPageService.goNext();
  }

  public submit(): void {
    const challenge = this.page()?.challenge;
    console.log('submit', challenge);

    if (!challenge) {
      this.skip();
      return;
    }

    const challengeValue = String(this.challengeControl.value);

    this.pending.set(true);
    timer(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (challengeValue === challenge.answer) {
          console.log('success!');
          this.kvestPageService.goNext();
        } else {
          console.warn('FAIL!!');
          this.challengeControl.setErrors({ fail: true });
          console.log('challengeControl', this.challengeControl);
          this.pending.set(false);
        }
      });
  }

  private pageUpdated(): void {
    this.challengeControl.setValue(null);
    this.challengeControl.markAsUntouched();

    timer(500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.pending.set(false));
  }
}
