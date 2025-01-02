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
import {
  ID_STR,
  KI_BACK_IMG_URL_TEMPLATE,
  KI_COVER_IMG_URL_TEMPLATE,
  KVEST_IMAGES_URL,
  KVESTS_INDEX_URL,
  KvestsItem,
  LOCAL_KVEST_ITEMS_URL,
} from '../../kvests-page/models/kvests-page.model';
import { KvestData, KvestPage } from '../models/kvest-page.model';

const PAGES_COUNTER_PARAM_NAME = 'p';

@Injectable()
export class KvestPageService {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public kvestsItems$: Observable<KvestsItem[]> = this.http
    .get<KvestsItem[]>(LOCAL_KVEST_ITEMS_URL)
    .pipe(map(items => this.prepareKvestItems(items)));

  private readonly routeId$ = this.route.paramMap.pipe(
    map(paramMap => paramMap.get('id')),
    filterNullable(),
  );

  private readonly pageId$ = this.route.queryParamMap.pipe(
    map(paramMap => paramMap.get(PAGES_COUNTER_PARAM_NAME)),
  );

  private readonly kvestData$: Observable<KvestData | null> = this.routeId$.pipe(
    switchMap(id => this.http.get<KvestData>(KVESTS_INDEX_URL.replace(ID_STR, id))),
    catchError(() => of(null)),
  );

  private pagesCounter = 0;
  private readonly pagesCounter$ = new Subject<number>();

  public readonly page$: Observable<KvestPage | null> = combineLatest([
    this.kvestData$,
    this.routeId$,
    this.pageId$,
  ]).pipe(
    map(([data, routeId, pageId]) =>
      data ? this.prepareKvestPage(data, routeId, pageId) : null,
    ),
  );

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

  private prepareKvestItems(items: KvestsItem[]): KvestsItem[] {
    return items.map(item => ({
      ...item,
      backImgUrl: KI_BACK_IMG_URL_TEMPLATE.replace(ID_STR, item.id),
      coverImgUrl: KI_COVER_IMG_URL_TEMPLATE.replace(ID_STR, item.id),
    }));
  }

  private prepareKvestPage(
    commonData: KvestData,
    routeId: string,
    pageId: string | null,
  ): KvestPage {
    const { pages } = commonData;
    const pagesCount = Object.keys(pages).length;
    const pagesCounter = pageId ? parseInt(pageId) : 0;
    const page = !Number.isNaN(pagesCounter) ? pages[pagesCounter] : undefined;

    if (page) {
      this.pagesCounter = pagesCounter;
    } else {
      this.navigateToPagesCounter(this.pagesCounter);
    }

    const last = this.pagesCounter === pagesCount - 1;
    const pageData = pages[this.pagesCounter];
    console.log('pageData:', pageData);
    const image: string | undefined = pageData.image
      ? KVEST_IMAGES_URL.replace(ID_STR, routeId) + pageData.image
      : undefined;

    const result: KvestPage = {
      commonData,
      ...pageData,
      image,
      last,
      canSkip: pageData.canSkip ?? !last,
    };

    console.log('KvestPage:', result);
    return result;
  }

  private navigateToPagesCounter(pagesCounter: number | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [PAGES_COUNTER_PARAM_NAME]: pagesCounter || null },
    });
  }
}
