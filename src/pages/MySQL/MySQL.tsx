import TopicPage from '../../components/TopicPage';
import sections from '../../data/MySQL';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'MySQL',
  icon: '🛢️',
  description: 'Indexing, Query Optimization, Transactions, Locking, Schema Design',
};

export default function MySQL() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
