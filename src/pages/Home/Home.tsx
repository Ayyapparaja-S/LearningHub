import { Container, Grid, Box } from '@mui/material';
import { Header, PageCard } from '../../components';
import { homePageData } from '../../data/Home';

export const Home = () => {
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Header title={homePageData.title} subtitle={homePageData.subtitle} />

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {homePageData.cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <PageCard card={card} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
