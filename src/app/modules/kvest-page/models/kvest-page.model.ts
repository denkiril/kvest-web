interface KvestPageData {
  id: string;
  title: string;
  description: string;
  image?: string;
  canSkip?: boolean;
  challenge?: Challenge;
}

export interface Challenge {
  type: ChallengeType;
  answer: string;
  options?: ChallengeOption[];
}

type ChallengeType = 'input' | 'input-number' | 'radio' | 'arrange';

export interface ChallengeOption {
  id: number;
  title: string;
}

export interface KvestData {
  title: string;
  pages: KvestPageData[];
}

export interface KvestPage extends KvestPageData {
  commonData: KvestData;
  last: boolean;
  passed?: boolean;
}
