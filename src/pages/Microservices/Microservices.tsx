import TopicPage from '../../components/TopicPage';
import sections from '../../data/Microservices';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Microservices',
  icon: '🔗',
  description: 'Architecture Patterns, Circuit Breaker, Communication, Tracing, 12-Factor',
};

export default function Microservices() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
