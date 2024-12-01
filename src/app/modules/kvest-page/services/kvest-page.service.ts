import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import { filterNullable } from '../../../shared/utils';

interface KvestPageData {
  title: string;
  description: string;
}

interface KvestData {
  name: string;
  pages: Record<number, KvestPageData>;
}

interface KvestPage extends KvestPageData {
  commonData: KvestData;
  last: boolean;
}

const LOCAL_KVESTS_URL = 'assets/data/kvests/';

const PAGES_COUNTER_PARAM_NAME = 'p';

@Injectable()
export class KvestPageService {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeId$ = this.route.paramMap.pipe(
    map(paramMap => paramMap.get('id')),
    filterNullable(),
  );

  private readonly pageId$ = this.route.queryParamMap.pipe(
    map(paramMap => paramMap.get(PAGES_COUNTER_PARAM_NAME)),
  );

  private readonly kvestData$: Observable<KvestData | null> = this.routeId$.pipe(
    switchMap(id => this.http.get<KvestData>(`${LOCAL_KVESTS_URL}${id}.json`)),
    catchError(() => of(null)),
  );

  private pagesCounter = 0;
  private readonly pagesCounter$ = new Subject<number>();

  public readonly page$: Observable<KvestPage | null> = combineLatest([
    this.kvestData$,
    this.pageId$,
  ]).pipe(map(([data, pageId]) => (data ? this.getKvestPage(data, pageId) : null)));

  constructor() {
    this.init();
  }

  public goNext(): void {
    this.pagesCounter$.next(this.pagesCounter + 1);
  }

  public goPrev(): void {
    this.pagesCounter$.next(this.pagesCounter - 1);
  }

  private init(): void {
    this.pagesCounter$
      .pipe(withLatestFrom(this.kvestData$))
      .subscribe(([pagesCounter, data]) => {
        const page = data?.pages[pagesCounter];
        if (page) {
          this.navigateToPagesCounter(pagesCounter || null);
        }
      });
  }

  private getKvestPage(data: KvestData, pageId: string | null): KvestPage {
    const { pages } = data;
    const pagesCount = Object.keys(pages).length;
    const pagesCounter = pageId ? parseInt(pageId) : 0;
    const page = !Number.isNaN(pagesCounter) ? pages[pagesCounter] : undefined;

    if (page) {
      this.pagesCounter = pagesCounter;
    } else {
      this.navigateToPagesCounter(this.pagesCounter);
    }

    return {
      ...pages[this.pagesCounter],
      commonData: data,
      last: this.pagesCounter === pagesCount - 1,
    };
  }

  private navigateToPagesCounter(pagesCounter: number | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [PAGES_COUNTER_PARAM_NAME]: pagesCounter || null },
    });
  }
}
