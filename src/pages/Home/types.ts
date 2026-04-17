export interface HomeCard {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  color: string;
  accent: string;
}

export interface HomePageData {
  title: string;
  subtitle: string;
  cards: HomeCard[];
}
