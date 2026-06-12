import TopicPage from '../../components/TopicPage';
import sections from '../../data/JavaAdvanced';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Advanced Java',
  icon: '⚙️',
  description: 'JVM Internals, GC, Memory Management, Design Patterns, Java 8-21 Features',
};

export default function JavaAdvanced() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
