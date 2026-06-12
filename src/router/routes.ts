import { lazy } from 'react';
import { LazyPageWrapper } from './utils';
import { ROUTE_PATHS } from '../constants/routes';

// Lazy load pages
const Main = lazy(() => import('../pages/Main/Main'));

const Home = lazy(() => import('../pages/Home/Home'));

const BackendLearning = lazy(() => import('../pages/BackendLearning/BackendLearning'));

const JavaCore = lazy(() => import('../pages/JavaCore/JavaCore'));

const JavaAdvanced = lazy(() => import('../pages/JavaAdvanced/JavaAdvanced'));

const SpringBoot = lazy(() => import('../pages/SpringBoot/SpringBoot'));

const SpringMVC = lazy(() => import('../pages/SpringMVC/SpringMVC'));

const Hibernate = lazy(() => import('../pages/Hibernate/Hibernate'));

const Kafka = lazy(() => import('../pages/Kafka/Kafka'));

const Redis = lazy(() => import('../pages/Redis/Redis'));

const Microservices = lazy(() => import('../pages/Microservices/Microservices'));

const MySQL = lazy(() => import('../pages/MySQL/MySQL'));

const PostgreSQL = lazy(() => import('../pages/PostgreSQL/PostgreSQL'));

const Git = lazy(() => import('../pages/Git/Git'));

const Maven = lazy(() => import('../pages/Maven/Maven'));

const DSA = lazy(() => import('../pages/DSA/DSA'));

const FrontEndSystemDesign = lazy(() => import('../pages/FrontEndSystemDesign/FrontEndSystemDesign'));

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
    Component: LazyPageWrapper(Main),
  },
  {
    path: ROUTE_PATHS.BACKEND_LEARNING,
    name: 'Backend Learning',
    Component: LazyPageWrapper(BackendLearning),
    children: [
      {
        path: '',
        name: 'Backend Topics',
        Component: LazyPageWrapper(Home),
      },
      {
        path: ROUTE_PATHS.JAVA_CORE,
        name: 'Java Core',
        Component: LazyPageWrapper(JavaCore),
      },
      {
        path: ROUTE_PATHS.JAVA_ADVANCED,
        name: 'Java Advanced',
        Component: LazyPageWrapper(JavaAdvanced),
      },
      {
        path: ROUTE_PATHS.SPRING_BOOT,
        name: 'Spring Boot',
        Component: LazyPageWrapper(SpringBoot),
      },
      {
        path: ROUTE_PATHS.SPRING_MVC,
        name: 'Spring MVC',
        Component: LazyPageWrapper(SpringMVC),
      },
      {
        path: ROUTE_PATHS.HIBERNATE,
        name: 'Hibernate',
        Component: LazyPageWrapper(Hibernate),
      },
      {
        path: ROUTE_PATHS.KAFKA,
        name: 'Kafka',
        Component: LazyPageWrapper(Kafka),
      },
      {
        path: ROUTE_PATHS.REDIS,
        name: 'Redis',
        Component: LazyPageWrapper(Redis),
      },
      {
        path: ROUTE_PATHS.MICROSERVICES,
        name: 'Microservices',
        Component: LazyPageWrapper(Microservices),
      },
      {
        path: ROUTE_PATHS.MYSQL,
        name: 'MySQL',
        Component: LazyPageWrapper(MySQL),
      },
      {
        path: ROUTE_PATHS.POSTGRESQL,
        name: 'PostgreSQL',
        Component: LazyPageWrapper(PostgreSQL),
      },
      {
        path: ROUTE_PATHS.GIT,
        name: 'Git',
        Component: LazyPageWrapper(Git),
      },
      {
        path: ROUTE_PATHS.MAVEN,
        name: 'Maven',
        Component: LazyPageWrapper(Maven),
      },
      {
        path: ROUTE_PATHS.DSA,
        name: 'Data Structures & Algorithms',
        Component: LazyPageWrapper(DSA),
      },
      {
        path: ROUTE_PATHS.FRONTEND_SYSTEM_DESIGN,
        name: 'Frontend System Design',
        Component: LazyPageWrapper(FrontEndSystemDesign),
      },
    ],
  },
];
