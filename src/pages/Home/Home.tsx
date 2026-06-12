import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ROUTE_PATHS } from '../../constants/routes';

const topics = [
  { icon: '☕', title: 'Core Java', desc: 'OOP, Collections, Streams, Multithreading', path: ROUTE_PATHS.JAVA_CORE, color: '#f97316' },
  { icon: '⚙️', title: 'Advanced Java', desc: 'JVM Internals, GC, Memory, Design Patterns', path: ROUTE_PATHS.JAVA_ADVANCED, color: '#ef4444' },
  { icon: '🌱', title: 'Spring Boot', desc: 'Auto-config, Starters, Actuator, Security', path: ROUTE_PATHS.SPRING_BOOT, color: '#22c55e' },
  { icon: '🌐', title: 'Spring MVC', desc: 'REST APIs, Filters, Exception Handling', path: ROUTE_PATHS.SPRING_MVC, color: '#06b6d4' },
  { icon: '🗄️', title: 'Hibernate / JPA', desc: 'Mappings, Caching, N+1, Transactions', path: ROUTE_PATHS.HIBERNATE, color: '#8b5cf6' },
  { icon: '📨', title: 'Apache Kafka', desc: 'Producers, Consumers, Exactly-once, Streams', path: ROUTE_PATHS.KAFKA, color: '#f59e0b' },
  { icon: '⚡', title: 'Redis', desc: 'Data Structures, Caching, Pub/Sub, Clustering', path: ROUTE_PATHS.REDIS, color: '#dc2626' },
  { icon: '🔗', title: 'Microservices', desc: 'Patterns, Circuit Breaker, API Gateway', path: ROUTE_PATHS.MICROSERVICES, color: '#6366f1' },
  { icon: '🛢️', title: 'MySQL', desc: 'Indexing, Joins, Query Optimization, ACID', path: ROUTE_PATHS.MYSQL, color: '#0ea5e9' },
  { icon: '🐘', title: 'PostgreSQL', desc: 'MVCC, CTEs, Partitioning, JSON', path: ROUTE_PATHS.POSTGRESQL, color: '#3b82f6' },
  { icon: '📦', title: 'Git', desc: 'Branching, Rebasing, Conflicts, Workflows', path: ROUTE_PATHS.GIT, color: '#f43f5e' },
  { icon: '🏗️', title: 'Maven', desc: 'Lifecycle, Plugins, Profiles, Dependencies', path: ROUTE_PATHS.MAVEN, color: '#a855f7' },
  { icon: '🧮', title: 'DSA', desc: 'Arrays, Trees, Graphs, DP, Common Problems', path: ROUTE_PATHS.DSA, color: '#14b8a6' },
];

export default function Home() {
  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Backend Developer Interview Guide
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Comprehensive preparation for <strong>5+ years experienced</strong> Java backend developers
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
          <Chip label="13 Topics" variant="outlined" />
          <Chip label="200+ Questions" variant="outlined" />
          <Chip label="3 Levels" variant="outlined" />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {topics.map((topic) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.path}>
            <Paper
              component={Link}
              to={topic.path}
              variant="outlined"
              sx={{
                p: 3,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                borderTop: 3,
                borderTopColor: topic.color,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${topic.color}22`,
                },
              }}
            >
              <Typography variant="h4" component="span" sx={{ display: 'block', mb: 1 }}>
                {topic.icon}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {topic.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topic.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
