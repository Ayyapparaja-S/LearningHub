import { ROUTE_PATHS } from '../../constants/routes';
import type { HomePageData } from '../../pages/Home/types';

export const homePageData: HomePageData = {
  title: 'Learning Hub',
  subtitle: 'Master modern frontend architecture and system design through structured learning paths',
  cards: [
    {
      id: 1,
      title: 'Frontend System Design',
      description: 'Complete roadmap for mastering frontend system design interviews. 10 phases covering fundamentals, rendering strategies, state management, component architecture, performance engineering, security, scalability, testing, accessibility, and real-world design questions.',
      image: '📋',
      link: ROUTE_PATHS.FRONTEND_SYSTEM_DESIGN,
      color: '#E3F2FD',
      accent: '#1565C0',
    },
  ],
};
