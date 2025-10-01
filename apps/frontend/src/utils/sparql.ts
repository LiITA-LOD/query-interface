interface SparqlResponse {
  head: unknown;
  results: {
    distinct: boolean;
    ordered: boolean;
    bindings: SparqlBinding[];
  };
}

interface SparqlBinding {
  [key: string]: {
    type: 'uri' | 'literal';
    value: string;
  };
}

async function client(
  query: string,
  endpointUrl = 'https://liita.it/sparql',
): Promise<SparqlResponse> {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/sparql-results+json',
    },
    body: new URLSearchParams({ query: query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: SparqlResponse = await response.json();

  return data;
}

export interface SearchResult {
  uri: string;
  upos: string;
  label: string;
  writtenRepresentations: string[];
}

function uriToUPOS(uri: string): string {
  return POS_URI_TO_UPOS[uri] || uri.split('/').pop() || '';
}

function uriToLabel(uri: string, mapping: Record<string, string>): string {
  return mapping[uri] || uri.split('/').pop() || uri;
}

function uriToGenderLabel(uri: string): string {
  return uriToLabel(uri, GENDER_URI_TO_LABEL);
}

function uriToInflectionTypeLabel(uri: string): string {
  return uriToLabel(uri, INFLECTION_TYPE_URI_TO_LABEL);
}

function uriToPosLabel(uri: string): string {
  return uriToLabel(uri, POS_URI_TO_LABEL);
}

const POS_URI_TO_UPOS: Record<string, string> = {
  'http://lila-erc.eu/ontologies/lila/adjective': 'ADJ',
  'http://lila-erc.eu/ontologies/lila/adposition': 'ADP',
  'http://lila-erc.eu/ontologies/lila/adverb': 'ADV',
  'http://lila-erc.eu/ontologies/lila/coordinating_conjunction': 'CCONJ',
  'http://lila-erc.eu/ontologies/lila/determiner': 'DET',
  'http://lila-erc.eu/ontologies/lila/interjection': 'INTJ',
  'http://lila-erc.eu/ontologies/lila/noun': 'NOUN',
  'http://lila-erc.eu/ontologies/lila/numeral': 'NUM',
  'http://lila-erc.eu/ontologies/lila/other': 'X',
  'http://lila-erc.eu/ontologies/lila/particle': 'PART',
  'http://lila-erc.eu/ontologies/lila/pronoun': 'PRON',
  'http://lila-erc.eu/ontologies/lila/proper_noun': 'PROPN',
  'http://lila-erc.eu/ontologies/lila/subordinating_conjunction': 'SCONJ',
  'http://lila-erc.eu/ontologies/lila/verb': 'VERB',
};

const GENDER_URI_TO_LABEL: Record<string, string> = {
  'http://lila-erc.eu/ontologies/lila/feminine': 'Feminine',
  'http://lila-erc.eu/ontologies/lila/masculine': 'Masculine',
  'http://lila-erc.eu/ontologies/lila/neuter': 'Neuter',
};

const INFLECTION_TYPE_URI_TO_LABEL: Record<string, string> = {
  'http://liita.it/ontologies/liita/c1': '1st Conjugation',
  'http://liita.it/ontologies/liita/c1i': '1st Conj. Irregular',
  'http://liita.it/ontologies/liita/c1p': '1st Conj. Procomplementary',
  'http://liita.it/ontologies/liita/c1r': '1st Conj. Pronominal',
  'http://liita.it/ontologies/liita/c2': '2nd Conjugation',
  'http://liita.it/ontologies/liita/c2i': '2nd Conj. Irregular',
  'http://liita.it/ontologies/liita/c2p': '2nd Conj. Procomplementary',
  'http://liita.it/ontologies/liita/c2r': '2nd Conj. Pronominal',
  'http://liita.it/ontologies/liita/c3': '3rd Conjugation',
  'http://liita.it/ontologies/liita/c3i': '3rd Conj. Irregular',
  'http://liita.it/ontologies/liita/c3p': '3rd Conj. Procomplementary',
  'http://liita.it/ontologies/liita/c3r': '3rd Conj. Pronominal',
};

const POS_URI_TO_LABEL: Record<string, string> = {
  'http://lila-erc.eu/ontologies/lila/adjective': 'Adjective',
  'http://lila-erc.eu/ontologies/lila/adposition': 'Adposition',
  'http://lila-erc.eu/ontologies/lila/adverb': 'Adverb',
  'http://lila-erc.eu/ontologies/lila/coordinating_conjunction': 'Coordinating Conjunction',
  'http://lila-erc.eu/ontologies/lila/determiner': 'Determiner',
  'http://lila-erc.eu/ontologies/lila/interjection': 'Interjection',
  'http://lila-erc.eu/ontologies/lila/noun': 'Noun',
  'http://lila-erc.eu/ontologies/lila/numeral': 'Numeral',
  'http://lila-erc.eu/ontologies/lila/other': 'Other',
  'http://lila-erc.eu/ontologies/lila/particle': 'Particle',
  'http://lila-erc.eu/ontologies/lila/pronoun': 'Pronoun',
  'http://lila-erc.eu/ontologies/lila/proper_noun': 'Proper Noun',
  'http://lila-erc.eu/ontologies/lila/subordinating_conjunction': 'Subordinating Conjunction',
  'http://lila-erc.eu/ontologies/lila/verb': 'Verb',
};

export async function search(regex: string): Promise<SearchResult[]> {
  const query = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX lila: <http://lila-erc.eu/ontologies/lila/>

SELECT ?uri ?uposUri ?label (GROUP_CONCAT(DISTINCT ?wr; SEPARATOR="\\u0000") AS ?wrs)
FROM <http://liita.it/data>
WHERE {
  ?uri lila:hasPOS ?uposUri ;
         ontolex:writtenRep ?wr ;
         rdfs:label ?label .
  FILTER regex(?wr, "${regex}","i")
}
GROUP BY ?uri ?uposUri ?label
ORDER BY ?wrs
LIMIT 100
`;

  try {
    const data = await client(query);

    // Parse SPARQL JSON results and return simplified structure
    const results: SearchResult[] = data.results.bindings.map((binding) => ({
      uri: binding.uri.value,
      upos: uriToUPOS(binding.uposUri.value),
      label: binding.label.value,
      writtenRepresentations: binding.wrs.value.split('\u0000'),
    }));

    return results;
  } catch (error) {
    console.error('SPARQL query failed:', error);
    return [];
  }
}

export async function getAllPredicates(uri: string): Promise<SparqlBinding[]> {
  const query = `SELECT * WHERE { <${uri}> ?predicate ?object }`;

  try {
    const data = await client(query);
    return data.results.bindings;
  } catch (error) {
    console.error('SPARQL fetch failed:', error);
    return [];
  }
}

export interface FilterOption {
  value: string;
  label: string;
}

async function getFilterOptions(predicate: string): Promise<FilterOption[]> {
  const query = `
    SELECT DISTINCT ?object ?label WHERE {
      ?subject <${predicate}> ?object .
      BIND(?object AS ?label)
    } ORDER BY ?label
  `;

  try {
    const data = await client(query);
    return data.results.bindings.map((binding) => {
      const uri = binding.object.value;
      let label: string;

      // Choose the appropriate label mapping based on the predicate
      if (predicate === 'http://lila-erc.eu/ontologies/lila/hasGender') {
        label = uriToGenderLabel(uri);
      } else if (predicate === 'http://lila-erc.eu/ontologies/lila/hasInflectionType') {
        label = uriToInflectionTypeLabel(uri);
      } else if (predicate === 'http://lila-erc.eu/ontologies/lila/hasPOS') {
        label = uriToPosLabel(uri);
      } else {
        // Fallback to the original URI or last part of URI
        label = uri.split('/').pop() || uri;
      }

      return {
        value: uri,
        label: label,
      };
    });
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return [];
  }
}

export async function getInflectionOptions(): Promise<FilterOption[]> {
  return getFilterOptions(
    'http://lila-erc.eu/ontologies/lila/hasInflectionType',
  );
}

export async function getPosOptions(): Promise<FilterOption[]> {
  return getFilterOptions('http://lila-erc.eu/ontologies/lila/hasPOS');
}

export async function getGenderOptions(): Promise<FilterOption[]> {
  return getFilterOptions('http://lila-erc.eu/ontologies/lila/hasGender');
}

export interface SearchFilters {
  lemma?: string;
  inflectionType?: string;
  pos?: string;
  gender?: string;
}

export interface SearchResult {
  subject: string;
  wrs: string;
  pos: string;
  lexicons: string;
}

export async function searchWithFilters(
  filters: SearchFilters,
): Promise<SearchResult[]> {
  const conditions: string[] = [];

  // Add filter conditions based on provided values
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

  const query = `
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
  `;

  try {
    const data = await client(query);
    return data.results.bindings.map((binding) => ({
      subject: binding.subject.value,
      wrs: binding.wrs.value,
      pos: uriToPosLabel(binding.pos.value),
      lexicons: binding.lexicons.value,
    }));
  } catch (error) {
    console.error('Search query failed:', error);
    return [];
  }
}
