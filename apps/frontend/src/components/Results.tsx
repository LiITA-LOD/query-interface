import { Box, Typography } from '@mui/material';
import type React from 'react';

const Results: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Search Results
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Search results will be displayed here
      </Typography>
    </Box>
  );
};

export default Results;
