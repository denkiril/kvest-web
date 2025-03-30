import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { GeolocationService } from '../../services/geolocation.service';

interface ContentPart {
  type: 'text' | 'geo';
  text: string;
}

@Component({
  selector: 'exokv-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionComponent {
  private readonly geolocationService = inject(GeolocationService);

  public readonly content = input.required<string | undefined>();
  public readonly geoPosition$ = this.geolocationService.geoPosition$;

  public readonly parts = computed<ContentPart[]>(() =>
    this.prepareParts(this.content()),
  );

  private prepareParts(content?: string): ContentPart[] {
    if (!content) return [];

    const parts: ContentPart[] = [];
    let index = 0;

    const reGeo = /\[geo\](.+)\[\/geo\]/g;
    const matchesGeo = content.matchAll(reGeo);
    // console.log('prepareParts', Array.from(matches));
    // for (const match of matches) {
    //   console.log(
    //     `Found ${match[0]} start=${match.index} end=${match.index + match[0].length}.`,
    //   );
    // }
    Array.from(matchesGeo).forEach(part => {
      // const partContent = part.replace(re, '$1');
      // console.log('part', part);
      const text = content.substring(index, part.index);
      parts.push({ text, type: 'text' });
      parts.push({ text: part[1], type: 'geo' });
      index += text.length + part[0].length;
    });
    parts.push({ text: content.substring(index), type: 'text' });

    // console.log('prepareParts', parts);
    return parts.filter(part => !!part.text.trim());
  }
}
