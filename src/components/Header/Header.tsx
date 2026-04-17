import { Box, Container, Typography, Stack } from '@mui/material';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <Box sx={{ py: 6, textAlign: 'center', mb: 6 }}>
      <Container maxWidth="md">
        <Stack spacing={2}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '24px', sm: '32px', md: '40px' },
              fontWeight: 900,
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '16px',
              color: 'text.secondary',
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            {subtitle}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
