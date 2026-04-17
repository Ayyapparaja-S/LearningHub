import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Alert,
} from '@mui/material';
import { PhaseCard, ResourceSection } from '../../components';
import { roadmapData, resourcesData } from '../../data/FrontEndSystemDesign';

type TabValue = 'roadmap' | 'resources';

export const FrontEndSystemDesign = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('roadmap');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const totalTopics = roadmapData.reduce(
    (acc, phase) => acc + phase.chapters.reduce((a, c) => a + c.topics.length, 0),
    0
  );

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 3,
        fontFamily: "inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4.5 }}>
        <Box
          sx={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#C62828',
            backgroundColor: '#FFEBEE',
            px: 1.75,
            py: 0.625,
            borderRadius: 0.75,
            mb: 1.5,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          5+ YOE → TOP PRODUCT COMPANIES
        </Box>

        <Typography
          variant="h1"
          sx={{
            mb: 1,
            fontSize: '32px',
            fontWeight: 900,
            color: 'text.primary',
          }}
        >
          Frontend System Design
          <br />
          <Box component="span" sx={{ color: 'error.main' }}>
            Complete Roadmap
          </Box>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '15px',
            maxWidth: '560px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          10 phases · {roadmapData.length * 3}+ chapters · {totalTopics} topics
          <br />
          <Typography
            component="span"
            variant="caption"
            sx={{
              fontSize: '13px',
              color: '#999',
              display: 'block',
              mt: 0.25,
            }}
          >
            Estimated: 28–32 weeks of focused preparation
          </Typography>
        </Typography>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          mb: 3.5,
          borderRadius: 1.25,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiTabs-indicator': {
              backgroundColor: 'text.primary',
            },
          }}
        >
          <Tab
            label="📋 Full Roadmap"
            value="roadmap"
            sx={{
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              py: 1.5,
              backgroundColor: activeTab === 'roadmap' ? '#1a1a1a' : '#fff',
              color: activeTab === 'roadmap' ? '#fff' : '#666',
              '&:hover': {
                backgroundColor: activeTab === 'roadmap' ? '#1a1a1a' : '#f5f5f5',
              },
            }}
          />
          <Tab
            label="📚 Resources & Courses"
            value="resources"
            sx={{
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              py: 1.5,
              backgroundColor: activeTab === 'resources' ? '#1a1a1a' : '#fff',
              color: activeTab === 'resources' ? '#fff' : '#666',
              '&:hover': {
                backgroundColor: activeTab === 'resources' ? '#1a1a1a' : '#f5f5f5',
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      {activeTab === 'roadmap' ? (
        <Box>
          <Alert
            severity="warning"
            sx={{
              mb: 3.5,
              borderRadius: 1.5,
              backgroundColor: '#FFFDE7',
              borderColor: '#FFF59D',
              borderWidth: 1,
              color: '#555',
              fontSize: '13.5px',
              lineHeight: 1.7,
            }}
          >
            <Typography component="strong" sx={{ color: '#F57F17' }}>
              How to use this roadmap:
            </Typography>
            {' '}
            Each phase builds on the previous one. Don't skip to Phase 10 practice
            without mastering Phases 1–9. Expand each chapter to see every topic you
            need to cover. The goal isn't to memorize — it's to build architectural
            intuition through deep understanding of tradeoffs.
          </Alert>
          <Stack spacing={0}>
            {roadmapData.map((phase, idx) => (
              <PhaseCard key={phase.id} phase={phase} isFirst={idx === 0} />
            ))}
          </Stack>
        </Box>
      ) : (
        <Box>
          <Stack spacing={0}>
            {resourcesData.map((section, idx) => (
              <ResourceSection key={idx} section={section} />
            ))}
          </Stack>

          <Alert
            severity="success"
            sx={{
              mt: 2.5,
              borderRadius: 1.5,
              backgroundColor: '#E8F5E9',
              borderColor: '#C8E6C9',
              borderWidth: 1,
              color: '#333',
              fontSize: '13px',
            }}
          >
            <Typography
              component="h4"
              sx={{
                mb: 1,
                fontSize: '15px',
                fontWeight: 800,
                color: '#2E7D32',
              }}
            >
              Recommended Learning Order
            </Typography>
            <Box sx={{ fontSize: '13.5px', color: '#333', lineHeight: 1.8 }}>
              <Box>
                <strong>Step 1:</strong> Read frontendmastery.com guide (free, 1 day)
              </Box>
              <Box>
                <strong>Step 2:</strong> Go through patterns.dev (free, 1 week)
              </Box>
              <Box>
                <strong>Step 3:</strong> Pick ONE paid course — GreatFrontEnd or Namaste FSD
              </Box>
              <Box>
                <strong>Step 4:</strong> Practice with the RADIO framework weekly
              </Box>
              <Box>
                <strong>Step 5:</strong> Mock interviews — pramp.com or peers
              </Box>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          mt: 4.5,
          p: '16px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: 1.5,
          fontSize: '12px',
          color: '#888',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Curated for 5+ YOE React+Node+TypeScript engineers targeting FAANG/top
        product companies · April 2026
      </Box>
    </Container>
  );
};

export default FrontEndSystemDesign;
