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
import { Subject, takeUntil, tap, timer } from 'rxjs';

import { DescriptionComponent } from '../../../../shared/components/description/description.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { GeolocationService } from '../../../../shared/services/geolocation.service';
import { GeoPoint, KvestPage } from '../../models/kvest-page.model';
import { KvestPageService } from '../../services/kvest-page.service';
import { KvestChallengeComponent } from '../kvest-challenge/kvest-challenge.component';

const SHOW_PENDING_DELAY = 500;
const GEO_NEAR_DIFF = 0.00018;

@Component({
  selector: 'exokv-kvest-page',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatMenuModule,
    DescriptionComponent,
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
  private readonly geolocationService = inject(GeolocationService);
  private readonly kvestPageService = inject(KvestPageService);

  public readonly page = toSignal(
    this.kvestPageService.page$.pipe(tap(page => page && this.pageUpdated(page))),
  );
  public readonly mustPassChallenge = computed(
    () => this.page()?.challenge && !this.page()?.passed,
  );
  public readonly showSubmitButton = computed(() => !!this.submitButtonText());
  public readonly submitButtonText = signal('');
  public readonly pending = signal(false);

  public readonly challengeControl = new FormControl<unknown>(null, Validators.required);

  private readonly pageUpdated$ = new Subject<void>();

  ngOnInit(): void {
    this.challengeControl.valueChanges.subscribe(() => {
      console.log('challengeControl', this.challengeControl);
    });
  }

  public skip(): void {
    const curPage = this.page();
    if (!curPage) return;

    this.pending.set(true);
    this.kvestPageService.goNext(curPage, true);
  }

  public restart(): void {
    this.kvestPageService.restart();
  }

  public submit(): void {
    const curPage = this.page();
    if (!curPage) return;

    const { challenge } = curPage;

    if (!challenge || !this.mustPassChallenge()) {
      this.pending.set(true);
      this.kvestPageService.goNext(curPage);
      return;
    }

    const challengeValue = String(this.challengeControl.value);

    this.pending.set(true);
    timer(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (challengeValue === challenge.answer) {
          console.log('success!');
          this.kvestPageService.goNext(curPage);
        } else {
          console.warn('FAIL!!');
          this.challengeControl.setErrors({ fail: true });
          console.log('challengeControl', this.challengeControl);
          this.pending.set(false);
        }
      });
  }

  private pageUpdated(page: KvestPage): void {
    // console.log('pageUpdated', page);
    this.pageUpdated$.next();
    window.scrollTo(0, 0);

    this.initPageData(page);
    this.challengeControl.setValue(null);
    this.challengeControl.markAsUntouched();

    timer(page.passed ? 0 : SHOW_PENDING_DELAY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.pending.set(false));
  }

  private initPageData(page: KvestPage): void {
    const { geopoints } = page;

    if (geopoints) {
      this.geolocationService.geoPosition$
        .pipe(takeUntil(this.pageUpdated$), takeUntilDestroyed(this.destroyRef))
        .subscribe(geoPosition => {
          this.submitButtonText.set(geoPosition ? '' : 'Далее (без геолокации)');
          this.checkGeoPosition(geoPosition, geopoints);
        });
      return;
    }

    if (this.mustPassChallenge()) {
      this.submitButtonText.set('Ответить');
      return;
    }

    this.submitButtonText.set('Далее');
  }

  private checkGeoPosition(
    geoPosition: GeolocationPosition | undefined,
    geopoints: GeoPoint[],
  ): void {
    if (!geoPosition) return;

    const isNear = (a: number, b: number): boolean => Math.abs(a - b) < GEO_NEAR_DIFF;

    const curPage = this.page();
    const { latitude, longitude } = geoPosition.coords;

    const target = geopoints.find(
      ({ lat, lon }) => isNear(lat, latitude) && isNear(lon, longitude),
    );

    if (curPage && target) {
      this.kvestPageService.goToPage(curPage, target.id);
    }
  }
}
