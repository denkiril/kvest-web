import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { Challenge, ChallengeOption } from '../../models/kvest-page.model';

type KvestChallengeValue = string;

const SHUFFLE_COUNT = 20;

@Component({
  selector: 'exokv-kvest-challenge',
  standalone: true,
  imports: [ReactiveFormsModule, DragDropModule, MatInputModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: KvestChallengeComponent,
    },
  ],
  templateUrl: './kvest-challenge.component.html',
  styleUrl: './kvest-challenge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class KvestChallengeComponent implements ControlValueAccessor {
  public readonly challenge = input<Challenge>();
  public readonly mustPassChallenge = input<boolean>();

  public readonly options = computed<ChallengeOption[]>(() =>
    this.prepareOptions(this.challenge()),
  );

  private onChange?: (value: KvestChallengeValue) => void;
  private onTouched?: () => void;

  writeValue(value: KvestChallengeValue | null): void {
    console.log('[Challenge] writeValue', value);
    // TODO ?
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
    this.pushValue(String(val));
  }

  public onDrop(event: CdkDragDrop<ChallengeOption[]>): void {
    moveItemInArray(this.options(), event.previousIndex, event.currentIndex);
    this.pushValue(this.getOptionsValue(this.options()));
  }

  private pushValue(value: KvestChallengeValue): void {
    this.onChange?.(value);
    this.onTouched?.();
  }

  private prepareOptions(challenge?: Challenge): ChallengeOption[] {
    if (!challenge) return [];

    const { answer, options } = challenge;
    if (!options) return [];

    let counter = 0;
    do {
      this.shuffleOptions(options);
      counter++;
    } while (counter < SHUFFLE_COUNT || this.getOptionsValue(options) === answer);

    this.pushValue(this.getOptionsValue(options));

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
