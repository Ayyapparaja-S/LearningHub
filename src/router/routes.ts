import { lazy } from 'react';
import { LazyPageWrapper } from './utils';
import { ROUTE_PATHS } from '../constants/routes';

// Lazy load pages
const Home = lazy(() =>
  import('../pages/Home').then((module) => ({
    default: module.Home,
  }))
);

const FrontEndSystemDesign = lazy(() =>
  import('../pages/FrontEndSystemDesign').then((module) => ({
    default: module.FrontEndSystemDesign,
  }))
);

export interface RouteConfig {
  path: string;
  name: string;
  Component: React.ComponentType<any>;
  loader?: () => Promise<any>;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.HOME,
    name: 'Home',
    Component: LazyPageWrapper(Home),
  },
  {
    path: ROUTE_PATHS.FRONTEND_SYSTEM_DESIGN,
    name: 'Frontend System Design',
    Component: LazyPageWrapper(FrontEndSystemDesign),
  },
];
