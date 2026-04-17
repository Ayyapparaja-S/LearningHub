export interface Topic {
  name: string;
  topics: string[];
}

export interface Phase {
  id: number;
  phase: string;
  title: string;
  subtitle: string;
  weeks: string;
  color: string;
  accent: string;
  chapters: Topic[];
}

export interface Resource {
  name: string;
  url: string;
  note: string;
}

export interface ResourceSection {
  category: string;
  items: Resource[];
}
