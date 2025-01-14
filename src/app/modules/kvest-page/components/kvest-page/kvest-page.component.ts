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
import { KvestPage } from '../../models/kvest-page.model';
import { KvestPageService } from '../../services/kvest-page.service';
import { KvestChallengeComponent } from '../kvest-challenge/kvest-challenge.component';

const SHOW_PENDING_DELAY = 500;

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
    this.kvestPageService.page$.pipe(tap(page => page && this.pageUpdated(page))),
  );
  public readonly mustPassChallenge = computed(
    () => this.page()?.challenge && !this.page()?.passed,
  );
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

  public restart(): void {
    this.kvestPageService.restart();
  }

  public submit(): void {
    const page = this.page();
    if (!page) return;

    const { challenge } = page;

    if (!challenge || !this.mustPassChallenge()) {
      this.pending.set(true);
      this.kvestPageService.goNext(page);
      return;
    }

    const challengeValue = String(this.challengeControl.value);

    this.pending.set(true);
    timer(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (challengeValue === challenge.answer) {
          console.log('success!');
          this.kvestPageService.goNext(page);
        } else {
          console.warn('FAIL!!');
          this.challengeControl.setErrors({ fail: true });
          console.log('challengeControl', this.challengeControl);
          this.pending.set(false);
        }
      });
  }

  private pageUpdated(page: KvestPage): void {
    this.challengeControl.setValue(null);
    this.challengeControl.markAsUntouched();

    timer(page.passed ? 0 : SHOW_PENDING_DELAY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.pending.set(false));
  }
}
