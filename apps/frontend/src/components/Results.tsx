import { Download, OpenInNew } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
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

  const generateSparqlQuery = () => {
    const conditions: string[] = [];

    if (filters.gender) {
      conditions.push(
        `?subject <http://lila-erc.eu/ontologies/lila/hasGender> <${filters.gender}> .`,
      );
    }

    if (filters.inflectionType) {
      conditions.push(
        `?subject <http://lila-erc.eu/ontologies/lila/hasInflectionType> <${filters.inflectionType}> .`,
      );
    }

    if (filters.pos) {
      conditions.push(
        `?subject <http://lila-erc.eu/ontologies/lila/hasPOS> <${filters.pos}> .`,
      );
    }

    if (filters.lemma) {
      conditions.push(
        `?subject <http://www.w3.org/ns/lemon/ontolex#writtenRep> ?wrp .`,
      );
      conditions.push(`FILTER regex(?wrp, "${filters.lemma}","i") .`);
    }

    const conditionsString = conditions.join(' ');

    return `
SELECT ?subject ?wrs ?pos ?lexicons where {
  {SELECT ?subject ?poslink ?pos (group_concat(distinct ?wr ; separator=" ") as ?wrs) (group_concat(distinct ?lexicon ; separator=" ") as ?lexicons) WHERE { 
      ${conditionsString}
      ?subject <http://lila-erc.eu/ontologies/lila/hasPOS> ?poslink . 
      BIND(?poslink AS ?pos) .
      ?subject <http://www.w3.org/ns/lemon/ontolex#writtenRep> ?wr .
      optional {
          ?le <http://www.w3.org/ns/lemon/ontolex#canonicalForm> ?subject.
          ?lexicon <http://www.w3.org/ns/lemon/lime#entry> ?le .
      }
  } GROUP BY ?subject ?poslink ?pos
  }
} order by ?wrs
    `.trim();
  };

  const handleDownloadCsv = () => {
    const query = generateSparqlQuery();
    const encodedQuery = encodeURIComponent(query);
    const csvUrl = `https://liita.it/sparql?query=${encodedQuery}&format=text%2Fcsv`;
    window.open(csvUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Search Results {results.length > 0 && `(${results.length})`}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download />}
          onClick={handleDownloadCsv}
          disabled={results.length === 0}
          sx={{ fontSize: '0.75rem', py: 0.5 }}
        >
          download csv file
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

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
