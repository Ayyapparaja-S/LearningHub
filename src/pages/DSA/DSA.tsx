import TopicPage from '../../components/TopicPage';
import sections from '../../data/DSA';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Data Structures & Algorithms',
  icon: '🧮',
  description: 'Arrays, Linked Lists, Trees, Graphs, DP, Sorting — Common Interview Problems',
};

export default function DSA() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
