import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DRAWER_WIDTH = 280;

type NavChild = { label: string; path: string };
type NavItem = { label: string; path?: string; children?: NavChild[] };

const navItems: NavItem[] = [
  { label: '🏠 Home', path: '/' },
  {
    label: '☕ Java',
    children: [
      { label: 'Core Java', path: '/java-core' },
      { label: 'Advanced Java', path: '/java-advanced' },
    ],
  },
  {
    label: '🌱 Spring',
    children: [
      { label: 'Spring Boot', path: '/spring-boot' },
      { label: 'Spring MVC', path: '/spring-mvc' },
    ],
  },
  { label: '🗄️ Hibernate / JPA', path: '/hibernate' },
  { label: '📨 Apache Kafka', path: '/kafka' },
  { label: '⚡ Redis', path: '/redis' },
  { label: '🔗 Microservices', path: '/microservices' },
  {
    label: '🛢️ Databases',
    children: [
      { label: 'MySQL', path: '/mysql' },
      { label: 'PostgreSQL', path: '/postgresql' },
    ],
  },
  { label: '📦 Git', path: '/git' },
  { label: '🏗️ Maven', path: '/maven' },
  { label: '🧮 DSA', path: '/dsa' },
];

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavClick = () => { if (isMobile) setMobileOpen(false); };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          📚 Interview Prep
        </Typography>
        <Chip label="5+ YOE" size="small" color="primary" variant="outlined" />
      </Box>
      <List component="nav" sx={{ px: 1 }}>
        {navItems.map((item) =>
          item.children ? (
            <NavGroup
              key={item.label}
              label={item.label}
              items={item.children}
              currentPath={location.pathname}
              onNavClick={handleNavClick}
            />
          ) : (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path!}
              onClick={handleNavClick}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.18)' },
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ position: 'fixed', top: 12, left: 12, zIndex: 1300 }}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function NavGroup({
  label,
  items,
  currentPath,
  onNavClick,
}: {
  label: string;
  items: NavChild[];
  currentPath: string;
  onNavClick: () => void;
}) {
  const isActive = items.some((item) => item.path === currentPath);
  const [open, setOpen] = useState(isActive);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          ...(isActive && { backgroundColor: 'rgba(56, 189, 248, 0.06)' }),
        }}
      >
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              sx: { fontWeight: isActive ? 600 : 400 },
            },
          }}
        />
        {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onNavClick}
              selected={currentPath === item.path}
              sx={{
                pl: 4,
                borderRadius: 1,
                mb: 0.25,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                },
              }}
            >
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: { fontSize: '0.9rem' },
                  },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
}
