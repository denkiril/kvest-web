interface KvestPageData {
  title: string;
  description: string;
  image: string;
  canSkip?: boolean;
}

export interface KvestData {
  name: string;
  pages: Record<number, KvestPageData>;
}

export interface KvestPage extends KvestPageData {
  commonData: KvestData;
  last: boolean;
}
