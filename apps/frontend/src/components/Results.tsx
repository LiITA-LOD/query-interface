import { OpenInNew } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchFilters, SearchResult } from '../utils/sparql';
import { searchWithFilters } from '../utils/sparql';

interface ResultsProps {
  filters: SearchFilters;
}

const Results: React.FC<ResultsProps> = ({ filters }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    // Only search if at least one filter is provided
    const hasFilters = Object.values(searchFilters).some(
      (value) => value && value.trim() !== '',
    );

    if (!hasFilters) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchWithFilters(searchFilters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(filters);
    }, 500); // 500ms debounce delay

    // Cleanup timeout on unmount or filter change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters, performSearch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Search Results
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {Object.values(filters).some((value) => value && value.trim() !== '')
            ? 'No results found'
            : 'Enter search criteria to see results'}
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '48px' }}></TableCell>
                <TableCell>Written Representations</TableCell>
                <TableCell>POS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={`${result.subject}-${index}`}>
                  <TableCell sx={{ width: '48px' }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(
                          result.subject,
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }
                      title="Open data sheet"
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{result.wrs}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{result.pos}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Results;
