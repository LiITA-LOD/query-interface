import { Box, Paper } from '@mui/material';
import type React from 'react';
import Filters from './Filters';
import Results from './Results';

const Search: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filters Block */}
      <Paper elevation={0}>
        <Filters />
      </Paper>

      {/* Results List */}
      <Paper elevation={0}>
        <Results />
      </Paper>
    </Box>
  );
};

export default Search;
