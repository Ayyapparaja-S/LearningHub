export type QuestionLevel = 'basic' | 'intermediate' | 'advanced';

export type Question = {
  q: string;
  a: string;
  level: QuestionLevel;
};

export type Section = {
  title: string;
  questions: Question[];
};

export type TopicConfig = {
  title: string;
  icon: string;
  description: string;
  path: string;
  color: string;
};
