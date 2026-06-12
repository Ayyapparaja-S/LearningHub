import TopicPage from '../../components/TopicPage';
import sections from '../../data/PostgreSQL';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'PostgreSQL',
  icon: '🐘',
  description: 'MVCC, CTEs, Window Functions, JSONB, Partitioning, Performance',
};

export default function PostgreSQL() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
