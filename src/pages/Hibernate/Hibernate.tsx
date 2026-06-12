import TopicPage from '../../components/TopicPage';
import sections from '../../data/Hibernate';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Hibernate / JPA',
  icon: '🗄️',
  description: 'Entity Mappings, N+1 Problem, Caching, Transactions, Performance',
};

export default function Hibernate() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
