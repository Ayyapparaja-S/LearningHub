import TopicPage from '../../components/TopicPage';
import sections from '../../data/SpringMVC';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Spring MVC',
  icon: '🌐',
  description: 'REST APIs, Request Lifecycle, Exception Handling, Filters, Interceptors',
};

export default function SpringMVC() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
