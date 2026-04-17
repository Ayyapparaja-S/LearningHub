import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Chip,
  Button,
  Typography,
  Collapse
} from '@mui/material';
import { ChevronDownIcon, ChevronRightIcon } from '../Icons';
import type { Phase } from '../../pages/FrontEndSystemDesign/types';

interface PhaseCardProps {
  phase: Phase;
  isFirst?: boolean;
}

export const PhaseCard = ({ phase, isFirst = false }: PhaseCardProps) => {
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>(
    isFirst ? { 0: true } : {}
  );

  const toggleChapter = (idx: number) => {
    setOpenChapters((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <Card
      sx={{
        mb: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <CardHeader
        sx={{
          backgroundColor: phase.color,
          borderBottom: `3px solid ${phase.accent}`,
          pb: 2,
        }}
        title={
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
              <Chip
                label={phase.phase}
                size="small"
                sx={{
                  backgroundColor: phase.accent,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  color: phase.accent,
                  fontWeight: 600,
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {phase.weeks}
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ mb: 0.25, color: 'text.primary' }}>
              {phase.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              {phase.subtitle}
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ p: 0 }}>
        {phase.chapters.map((chapter, idx) => (
          <Box key={idx}>
            <Button
              onClick={() => toggleChapter(idx)}
              fullWidth
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 4,
                py: 1.75,
                textAlign: 'left',
                justifyContent: 'flex-start',
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '15px',
                textTransform: 'none',
                transition: 'background 0.15s ease',
                '&:hover': {
                  backgroundColor: '#f8f8f8',
                },
              }}
            >
              <Box sx={{ color: phase.accent, display: 'flex', alignItems: 'center' }}>
                {openChapters[idx] ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </Box>
              <Box sx={{ flex: 1 }}>{chapter.name}</Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px',
                  color: '#999',
                  fontWeight: 500,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {chapter.topics.length} topics
              </Typography>
            </Button>
            <Collapse in={openChapters[idx]}>
              <Box sx={{ px: 7, pb: 2 }}>
                {chapter.topics.map((topic, tIdx) => (
                  <Box
                    key={tIdx}
                    sx={{
                      display: 'flex',
                      gap: 1.25,
                      alignItems: 'flex-start',
                      py: 1,
                      fontSize: '13.5px',
                      color: '#333',
                      lineHeight: 1.6,
                      borderBottom:
                        tIdx < chapter.topics.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: 0.75,
                        backgroundColor: phase.color,
                        color: phase.accent,
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 0.125,
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}
                    >
                      {tIdx + 1}
                    </Box>
                    <Typography variant="body2">{topic}</Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
