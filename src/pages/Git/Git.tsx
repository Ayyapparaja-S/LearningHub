import TopicPage from '../../components/TopicPage';
import sections from '../../data/Git';
import type { TopicMeta } from './types';

export const meta: TopicMeta = {
  title: 'Git',
  icon: '📦',
  description: 'Branching, Merging, Rebasing, Workflows, Cherry-pick, Bisect, Internals',
};

export default function Git() {
  return (
    <TopicPage
      title={meta.title}
      icon={meta.icon}
      description={meta.description}
      sections={sections}
    />
  );
}
