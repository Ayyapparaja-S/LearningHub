import TopicPage from '../../components/TopicPage';
import sections from '../../data/Kafka';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Apache Kafka',
  icon: '📨',
  description: 'Architecture, Spring Integration, Exactly-Once, DLT, Sagas, Performance',
};

export default function Kafka() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
