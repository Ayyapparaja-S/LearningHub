import TopicPage from '../../components/TopicPage';
import sections from '../../data/Redis';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Redis',
  icon: '⚡',
  description: 'Data Structures, Caching Patterns, Distributed Locking, Cluster, Sentinel',
};

export default function Redis() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
