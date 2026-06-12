import TopicPage from '../../components/TopicPage';
import sections from '../../data/SpringBoot';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Spring Boot',
  icon: '🌱',
  description: 'Auto-configuration, Bean Lifecycle, Security, Actuator, Profiles',
};

export default function SpringBoot() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
