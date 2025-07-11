import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  share,
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
import {
  GeoPoint,
  KvestData,
  KvestPage,
  KvestPageData,
} from '../models/kvest-page.model';

const PAGES_COUNTER_PARAM_NAME = 'p';
const INTRO_PAGE_ID = '0';
const PASSED_LS_KEY = 'kvest-passed-arr';
const SKIPPED_LS_KEY = 'kvest-skipped-arr';

// TODO
// easter eggs: for geolocation [+], etc.
// реакция на успех - салют, звук [+]
// просмотр картинок
// сторис?
// офлайн-режим (предзагрузка всех ассетов квеста в IDB)
// настройки (звук)?
// input-number - только целые положительные

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
    share(),
  );

  private passedIds: Set<string> = this.getPassedIds();
  private skippedIds: Set<string> = this.getPassedIds(true);
  /** Костыль, с kvestData$ с share() не получилось разобраться. TODO избавиться? */
  private currentPages: KvestPageData[] = [];
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

  public goNext(curPage: KvestPage, skip?: boolean): void {
    console.log('goNext', skip);
    if (!skip) {
      this.passPage(curPage);
    } else {
      this.skipPage(curPage);
    }

    const nextIndex = this.currentPages.findIndex(
      (item, index) => index > this.pagesCounter && !item.secret,
    );
    this.pagesCounter$.next(nextIndex);
  }

  public goToPage(curPage: KvestPage, targetPageId: string): void {
    console.log('goToPage', targetPageId);

    const targetIndex = this.currentPages.findIndex(item => item.id === targetPageId);
    if (targetIndex !== -1) {
      this.passPage(curPage);
      this.pagesCounter$.next(targetIndex);
    }
  }

  public restart(): void {
    localStorage.removeItem(PASSED_LS_KEY);
    this.passedIds.clear();
    this.skippedIds.clear();
    this.pagesCounter$.next(0);
  }

  private init(): void {
    this.pagesCounter$
      .pipe(withLatestFrom(this.kvestData$.pipe(filterNullable())))
      .subscribe(([pagesCounter, data]) => {
        const { pages } = data;
        const unpassedPage = pages.find(
          (page, index) =>
            !page.secret &&
            index <= pagesCounter &&
            !this.passedIds.has(page.id) &&
            !this.skippedIds.has(page.id),
        );
        console.log('pagesCounter', pagesCounter, unpassedPage);
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
    const { geopoints, pages } = commonData;

    this.currentPages = pages;
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

    const { canSkip, geopoint_ids, id, image } = pageData;
    const imageUrl: string | undefined = image
      ? KVEST_IMAGES_URL.replace(ID_STR, routeId) + image
      : undefined;
    const pageGeopoints: GeoPoint[] | undefined = geopoint_ids
      ?.map(pointId => geopoints.find(item => item.id === pointId))
      .filter(item => item !== undefined);

    const result: KvestPage = {
      ...pageData,
      canSkip: canSkip ?? !last,
      commonData,
      image: imageUrl,
      geopoints: pageGeopoints,
      last,
      passed: this.passedIds.has(id),
    };

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

  private getPassedIds(skipped?: boolean): Set<string> {
    const passedStr = !skipped
      ? localStorage.getItem(PASSED_LS_KEY)
      : sessionStorage.getItem(SKIPPED_LS_KEY);
    if (!passedStr) return new Set();

    let passedIds: unknown;
    try {
      passedIds = JSON.parse(passedStr);
    } catch (e) {
      console.warn(`getPassedIds (skipped=${skipped}) parse error:`, e);
    }

    const ids = Array.isArray(passedIds) ? passedIds : [];
    return new Set(ids);
  }

  private passPage(page: KvestPage): void {
    this.passedIds.add(page.id);
    localStorage.setItem(PASSED_LS_KEY, JSON.stringify(Array.from(this.passedIds)));
  }

  private skipPage(page: KvestPage): void {
    this.skippedIds.add(page.id);
    sessionStorage.setItem(SKIPPED_LS_KEY, JSON.stringify(Array.from(this.skippedIds)));
  }
}
