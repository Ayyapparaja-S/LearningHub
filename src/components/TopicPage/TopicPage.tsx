import { Box, Typography, Paper, List, ListItemButton, ListItemText, Chip, Divider } from '@mui/material';
import QACard from '../QACard';
import type { Section } from '../../types';

type TopicPageProps = {
  title: string;
  icon: string;
  description: string;
  sections: Section[];
};

export default function TopicPage({ title, icon, description, sections }: TopicPageProps) {
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h3" component="span">
          {icon}
        </Typography>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2">Sections</Typography>
          <Chip label={`${totalQuestions} questions`} size="small" variant="outlined" />
        </Box>
        <Divider sx={{ mb: 1 }} />
        <List dense disablePadding>
          {sections.map((section, i) => (
            <ListItemButton key={i} component="a" href={`#section-${i}`} sx={{ borderRadius: 1 }}>
              <ListItemText primary={section.title} />
              <Chip label={`${section.questions.length} Q`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {sections.map((section, i) => (
        <Box key={i} id={`section-${i}`} sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {section.title}
          </Typography>
          {section.questions.map((q, j) => (
            <QACard key={j} question={q.q} answer={q.a} level={q.level || 'basic'} />
          ))}
        </Box>
      ))}
    </Box>
  );
}
