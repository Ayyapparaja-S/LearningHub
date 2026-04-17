/**
 * Route path constants used throughout the application
 * Update these to change route paths globally
 */

export const ROUTE_PATHS = {
  HOME: '/',
  FRONTEND_SYSTEM_DESIGN: '/frontend-system-design',
} as const;

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];
