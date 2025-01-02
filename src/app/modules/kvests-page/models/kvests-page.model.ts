export interface KvestsItem {
  id: string;
  title: string;
  backImgUrl: string;
  coverImgUrl: string;
}

export const LOCAL_KVEST_ITEMS_URL = 'assets/content/index.json';
export const ID_STR = '{id}';
export const KI_BACK_IMG_URL_TEMPLATE = `assets/content/images/poster_${ID_STR}.jpg`;
export const KI_COVER_IMG_URL_TEMPLATE = `assets/content/images/poster_${ID_STR}_0.png`;
export const KVESTS_INDEX_URL = `assets/content/kvests/${ID_STR}/index.json`;
export const KVEST_IMAGES_URL = `assets/content/kvests/${ID_STR}/`;
