export type TopicCard = {
  icon: string;
  title: string;
  desc: string;
  path: string;
  color: string;
};

export type HomeCard = {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  color: string;
  accent: string;
};

export type HomePageData = {
  title: string;
  subtitle: string;
  cards: HomeCard[];
};
