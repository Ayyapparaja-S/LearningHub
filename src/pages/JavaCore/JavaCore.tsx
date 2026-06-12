import TopicPage from '../../components/TopicPage';
import sections from '../../data/JavaCore';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Core Java',
  icon: '☕',
  description: 'OOP, Collections, Streams, Multithreading, Exception Handling',
};

export default function JavaCore() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
