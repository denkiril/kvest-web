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
const INTRO_PAGE_ID = '0';
const PASSED_LS_KEY = 'kvest-passed-arr';

// TODO
// easter eggs: for geolocation, etc.

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

  private passedIds = this.getPassedIds();
  private pagesCounter = 0;
  private readonly pagesCounter$ = new Subject<number>();

  public readonly page$: Observable<KvestPage | undefined> = combineLatest([
    this.kvestData$,
    this.routeId$,
    this.pageId$,
  ]).pipe(
    map(([data, routeId, pageId]) =>
      data ? this.prepareKvestPage(data, routeId, pageId) : undefined,
    ),
  );

  constructor() {
    this.init();
  }

  public goNext(page?: KvestPage): void {
    if (page) this.passPage(page);
    this.pagesCounter$.next(this.pagesCounter + 1);
  }

  public restart(): void {
    localStorage.removeItem(PASSED_LS_KEY);
    this.passedIds = [];
    this.pagesCounter$.next(0);
  }

  private init(): void {
    this.pagesCounter$
      .pipe(withLatestFrom(this.kvestData$.pipe(filterNullable())))
      .subscribe(([pagesCounter, data]) => {
        const { pages } = data;
        const unpassedPage = pages.find(
          (page, index) => index <= pagesCounter && !this.passedIds.includes(page.id),
        );
        const page = unpassedPage ?? pages[pagesCounter];
        if (page) {
          this.navigateToPage(page.id);
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
  ): KvestPage | undefined {
    const { pages } = commonData;
    const pagesCount = pages.length;
    const pagesCounter =
      pageId === null ? 0 : pages.findIndex(page => page.id === pageId);

    if (pagesCounter === -1) {
      const id = pages[this.pagesCounter]?.id ?? INTRO_PAGE_ID;
      this.navigateToPage(id);
      return;
    }

    this.pagesCounter = pagesCounter;
    const last = this.pagesCounter === pagesCount - 1;
    const pageData = pages[this.pagesCounter];
    console.log('pageData:', this.pagesCounter, pageData);

    const { canSkip, id, image } = pageData;
    const imageUrl: string | undefined = image
      ? KVEST_IMAGES_URL.replace(ID_STR, routeId) + image
      : undefined;

    const result: KvestPage = {
      ...pageData,
      canSkip: canSkip ?? !last,
      commonData,
      image: imageUrl,
      // index: this.pagesCounter,
      last,
      passed: this.passedIds.includes(id),
    };

    console.log('KvestPage:', result);
    return result;
  }

  private navigateToPage(id: string): void {
    console.log('navigateToPage', id);
    const pageId = id === INTRO_PAGE_ID ? null : id;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [PAGES_COUNTER_PARAM_NAME]: pageId },
    });
  }

  private getPassedIds(): string[] {
    const passedStr = localStorage.getItem(PASSED_LS_KEY);
    if (!passedStr) return [];

    let passedIds: unknown;
    try {
      passedIds = JSON.parse(passedStr);
    } catch (e) {
      console.warn('getPassedNames parse error:', e);
    }

    return Array.isArray(passedIds) ? passedIds : [];
  }

  private passPage(page: KvestPage): void {
    const { id } = page;

    if (!this.passedIds.includes(id)) {
      this.passedIds.push(id);
      localStorage.setItem(PASSED_LS_KEY, JSON.stringify(this.passedIds));
    }
  }
}
