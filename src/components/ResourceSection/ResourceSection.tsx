import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { BookIcon, LinkIcon } from '../Icons';
import type { ResourceSection as ResourceSectionType } from '../../pages/FrontEndSystemDesign/types';

interface ResourceSectionProps {
  section: ResourceSectionType;
}

export const ResourceSection = ({ section }: ResourceSectionProps) => {
  return (
    <Box sx={{ mb: 3.5 }}>
      <Typography
        variant="h3"
        sx={{
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'text.primary',
        }}
      >
        <BookIcon sx={{ fontSize: '16px' }} />
        {section.category}
      </Typography>
      <Stack spacing={1}>
        {section.items.map((item, idx) => (
          <Card key={idx} sx={{ borderRadius: 1.5 }}>
            <CardContent sx={{ p: '14px 18px' }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 0.5,
                  fontSize: '14px',
                  color: 'text.primary',
                }}
              >
                {item.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <LinkIcon sx={{ fontSize: '14px', color: 'primary.main' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '12px',
                    color: 'primary.main',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {item.url}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '13px',
                  color: 'text.secondary',
                  lineHeight: 1.5,
                }}
              >
                {item.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
