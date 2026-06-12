import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { QuestionLevel } from '../../types';

type QACardProps = {
  question: string;
  answer: string;
  level?: QuestionLevel;
};

const levelColor: Record<QuestionLevel, 'success' | 'warning' | 'error'> = {
  basic: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

export default function QACard({ question, answer, level = 'basic' }: QACardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={level}
            size="small"
            color={levelColor[level]}
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 22 }}
          />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {question}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            '& p': { mb: 1, lineHeight: 1.7 },
            '& ul, & ol': { pl: 3, mb: 1 },
            '& li': { mb: 0.5 },
            '& .highlight': {
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 1,
              p: 1.5,
              my: 1,
            },
            '& .warning': {
              background: 'rgba(251, 146, 60, 0.08)',
              border: '1px solid rgba(251, 146, 60, 0.2)',
              borderRadius: 1,
              p: 1.5,
              my: 1,
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              my: 1,
            },
            '& th, & td': {
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
              textAlign: 'left',
            },
          }}
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      </AccordionDetails>
    </Accordion>
  );
}
