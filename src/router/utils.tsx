import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import type { RouteObject } from 'react-router-dom';
import type { RouteConfig } from './routes';

/**
 * Loading fallback component shown during route transitions
 */
export const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * Wraps a lazy component with Suspense and loading fallback
 */
export const LazyPageWrapper = (Component: React.ComponentType<any>) => () => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

/**
 * Converts RouteConfig array to React Router RouteObject array
 */
const convertRoutesToRouteObjects = (routes: RouteConfig[]): RouteObject[] => {
  return routes.map((route) => ({
    path: route.path,
    Component: route.Component,
    loader: route.loader,
    children: route.children ? convertRoutesToRouteObjects(route.children) : undefined,
  }));
};

/**
 * Creates and returns a browser router with the provided routes
 */
export const createRouter = (routes: RouteConfig[]) => {
  const routeObjects = convertRoutesToRouteObjects(routes);
  return createBrowserRouter(routeObjects);
};
