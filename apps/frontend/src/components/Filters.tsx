import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import type React from 'react';
import { useState } from 'react';

// Placeholder data - will be replaced with API data
const INFLECTION_OPTIONS = [
  { value: 'nominative', label: 'Nominative' },
  { value: 'genitive', label: 'Genitive' },
  { value: 'dative', label: 'Dative' },
  { value: 'accusative', label: 'Accusative' },
  { value: 'ablative', label: 'Ablative' },
  { value: 'vocative', label: 'Vocative' },
];

const POS_OPTIONS = [
  { value: 'noun', label: 'Noun' },
  { value: 'verb', label: 'Verb' },
  { value: 'adjective', label: 'Adjective' },
  { value: 'adverb', label: 'Adverb' },
  { value: 'pronoun', label: 'Pronoun' },
  { value: 'preposition', label: 'Preposition' },
  { value: 'conjunction', label: 'Conjunction' },
];

const GENDER_OPTIONS = [
  { value: 'masculine', label: 'Masculine' },
  { value: 'feminine', label: 'Feminine' },
  { value: 'neuter', label: 'Neuter' },
];

const Filters: React.FC = () => {
  const [inflectionType, setInflectionType] = useState<string>('');
  const [pos, setPos] = useState<string>('');
  const [gender, setGender] = useState<string>('');

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
        {/* Inflection Type Filter */}
        <Autocomplete
          value={
            INFLECTION_OPTIONS.find(
              (option) => option.value === inflectionType,
            ) || null
          }
          onChange={(_, newValue) => setInflectionType(newValue?.value || '')}
          options={INFLECTION_OPTIONS}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={(params) => (
            <TextField {...params} label="Inflection Type" />
          )}
          clearOnEscape
          disableClearable={false}
        />

        {/* POS Filter */}
        <Autocomplete
          value={POS_OPTIONS.find((option) => option.value === pos) || null}
          onChange={(_, newValue) => setPos(newValue?.value || '')}
          options={POS_OPTIONS}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={(params) => <TextField {...params} label="POS" />}
          clearOnEscape
          disableClearable={false}
        />

        {/* Gender Filter */}
        <Autocomplete
          value={
            GENDER_OPTIONS.find((option) => option.value === gender) || null
          }
          onChange={(_, newValue) => setGender(newValue?.value || '')}
          options={GENDER_OPTIONS}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={(params) => <TextField {...params} label="Gender" />}
          clearOnEscape
          disableClearable={false}
        />
      </Box>
    </Box>
  );
};

export default Filters;
