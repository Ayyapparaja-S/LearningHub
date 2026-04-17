import { Card, CardHeader, CardContent, CardActions, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { HomeCard } from '../../pages/Home/types';

interface PageCardProps {
  card: HomeCard;
}

export const PageCard = ({ card }: PageCardProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(card.link);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardHeader
        sx={{
          backgroundColor: card.color,
          borderBottom: `3px solid ${card.accent}`,
          pb: 2,
        }}
        title={
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {card.image} {card.title}
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.7,
          }}
        >
          {card.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button
          onClick={handleNavigate}
          variant="contained"
          sx={{
            backgroundColor: card.accent,
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            '&:hover': {
              backgroundColor: card.accent,
              opacity: 0.9,
            },
          }}
        >
          Explore
        </Button>
      </CardActions>
    </Card>
  );
};
