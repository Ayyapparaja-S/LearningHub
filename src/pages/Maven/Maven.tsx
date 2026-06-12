import TopicPage from '../../components/TopicPage';
import sections from '../../data/Maven';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Maven',
  icon: '🏗️',
  description: 'Build Lifecycle, Dependency Management, Multi-Module, Profiles, Plugins',
};

export default function Maven() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
