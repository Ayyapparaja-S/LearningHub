/**
 * Route path constants used throughout the application
 * Update these to change route paths globally
 */

export const ROUTE_PATHS = {
  HOME: '/',
  BACKEND_LEARNING: '/backend-learning',
  JAVA_CORE: '/backend-learning/java-core',
  JAVA_ADVANCED: '/backend-learning/java-advanced',
  SPRING_BOOT: '/backend-learning/spring-boot',
  SPRING_MVC: '/backend-learning/spring-mvc',
  HIBERNATE: '/backend-learning/hibernate',
  KAFKA: '/backend-learning/kafka',
  REDIS: '/backend-learning/redis',
  MICROSERVICES: '/backend-learning/microservices',
  MYSQL: '/backend-learning/mysql',
  POSTGRESQL: '/backend-learning/postgresql',
  GIT: '/backend-learning/git',
  MAVEN: '/backend-learning/maven',
  DSA: '/backend-learning/dsa',
  FRONTEND_SYSTEM_DESIGN: '/backend-learning/frontend-system-design',
} as const;

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];
