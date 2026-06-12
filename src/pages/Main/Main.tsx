import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ROUTE_PATHS } from '../../constants/routes';

const categories = [
  {
    icon: '🚀',
    title: 'Backend Learning',
    desc: 'Java, Spring Boot, Databases, Messaging & Microservices',
    path: ROUTE_PATHS.BACKEND_LEARNING,
    color: '#3b82f6',
  },
  {
    icon: '🎨',
    title: 'Frontend System Design',
    desc: 'UI Architecture, Performance, State Management & Best Practices',
    path: ROUTE_PATHS.FRONTEND_SYSTEM_DESIGN,
    color: '#ec4899',
  },
];

export default function Main() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Interview Preparation Hub
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Comprehensive learning guide for software engineers
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {categories.map((category) => (
            <Grid size={{ xs: 12, sm: 10, md: 5 }} key={category.path}>
              <Paper
                component={Link}
                to={category.path}
                variant="outlined"
                sx={{
                  p: 5,
                  display: 'flex',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderTop: 5,
                  borderTopColor: category.color,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  minHeight: 300,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 32px ${category.color}33`,
                  },
                }}
              >
                <Typography variant="h2" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
                  {category.icon}
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {category.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  {category.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
