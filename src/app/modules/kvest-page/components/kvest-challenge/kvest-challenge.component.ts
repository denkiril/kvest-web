import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  Self,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { filter } from 'rxjs';

import { Challenge, ChallengeOption } from '../../models/kvest-page.model';

type KvestChallengeValue = string;

const SHUFFLE_COUNT = 20;

@Component({
  selector: 'exokv-kvest-challenge',
  standalone: true,
  imports: [ReactiveFormsModule, DragDropModule, MatInputModule, MatRadioModule],
  templateUrl: './kvest-challenge.component.html',
  styleUrl: './kvest-challenge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class KvestChallengeComponent implements OnInit, ControlValueAccessor {
  public readonly challenge = input<Challenge>();
  public readonly mustPassChallenge = input<boolean>();

  public readonly options = computed<ChallengeOption[]>(() =>
    this.prepareOptions(this.challenge()),
  );

  public readonly failedOptions = new Set<number>();

  private readonly destroyRef = inject(DestroyRef);

  private onChange?: (value: KvestChallengeValue) => void;
  private onTouched?: () => void;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Self() private readonly ngControl: NgControl,
  ) {
    this.ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    this.watchControl();
  }

  writeValue(value: KvestChallengeValue | null): void {
    console.log('[Challenge] writeValue', value);
    this.failedOptions.clear();
  }

  registerOnChange(fn: (value: KvestChallengeValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public onInputText(value: string): void {
    this.pushValue(value);
  }

  public onInputNumber(value: string): void {
    const val = value ? parseInt(value, 10) : null;
    this.pushValue(val);
  }

  public onRadioChange(event: MatRadioChange): void {
    this.pushValue(event.value);
  }

  public onDrop(event: CdkDragDrop<ChallengeOption[]>): void {
    moveItemInArray(this.options(), event.previousIndex, event.currentIndex);
    this.pushValue(this.getOptionsValue(this.options()));
  }

  private watchControl(): void {
    const { control } = this.ngControl;
    if (!control) return;

    control.statusChanges
      .pipe(
        filter(status => status === 'INVALID'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.challenge()?.type === 'radio') {
          this.failedOptions.add(Number(control.value));
          this.cdr.markForCheck();
        }
      });
  }

  private pushValue(value: string | number | null): void {
    this.onChange?.(String(value));
    this.onTouched?.();
  }

  private prepareOptions(challenge?: Challenge): ChallengeOption[] {
    if (!challenge) return [];

    const { answer, options, type } = challenge;
    if (!options) return [];

    let counter = 0;
    do {
      this.shuffleOptions(options);
      counter++;
    } while (counter < SHUFFLE_COUNT);

    if (type === 'arrange') {
      do {
        this.shuffleOptions(options);
      } while (this.getOptionsValue(options) === answer);

      this.pushValue(this.getOptionsValue(options));
    }

    return options;
  }

  private shuffleOptions(options: ChallengeOption[]): void {
    const idxA = Math.floor(Math.random() * options.length);
    const idxB = Math.floor(Math.random() * options.length);

    [options[idxA], options[idxB]] = [options[idxB], options[idxA]];
  }

  private getOptionsValue(options: ChallengeOption[]): string {
    const ids = options.map(item => item.id);
    return String(ids);
  }
}
