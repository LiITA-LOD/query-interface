import { Box, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { SearchFilters } from '../utils/sparql';
import {
  getGenderOptions,
  getInflectionOptions,
  getPosOptions,
} from '../utils/sparql';
import FilterRegexp from './FilterRegexp';
import FilterSelect from './FilterSelect';

interface FiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFiltersChange }) => {
  const [lemma, setLemma] = useState<string>('');
  const [inflectionType, setInflectionType] = useState<string>('');
  const [pos, setPos] = useState<string>('');
  const [gender, setGender] = useState<string>('');

  // Notify parent component when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      lemma: lemma || undefined,
      inflectionType: inflectionType || undefined,
      pos: pos || undefined,
      gender: gender || undefined,
    };
    onFiltersChange(filters);
  }, [lemma, inflectionType, pos, gender, onFiltersChange]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Search Filters
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        <FilterRegexp
          label="Lemma (regexp)"
          value={lemma}
          onChange={setLemma}
        />

        <FilterSelect
          label="Inflection Type"
          value={inflectionType}
          fetchOptions={getInflectionOptions}
          onChange={setInflectionType}
        />

        <FilterSelect
          label="POS"
          value={pos}
          fetchOptions={getPosOptions}
          onChange={setPos}
        />

        <FilterSelect
          label="Gender"
          value={gender}
          fetchOptions={getGenderOptions}
          onChange={setGender}
        />
      </Box>
    </Box>
  );
};

export default Filters;
