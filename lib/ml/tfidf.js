const STOP_WORDS = new Set([
  "the","and","for","with","you","your","from","this","that","have","has","will",
  "are","was","were","but","not","can","our","all","any","how","who","why","what",
  "when","where","which","into","about","over","under","more","most","some","such",
  "than","then","they","them","their","there","these","those","also","being","been",
  "its","one","two","three","get","got","like","just","new","use","using","learn",
  "complete","course","courses","guide","practical","bootcamp","essentials","master",
  "class","intro","introduction","fundamentals","specialization","certificate","professional",
]);

export function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

export function buildVocabulary(documents) {
  const df = new Map();
  const tokenized = documents.map(tokenize);

  for (const tokens of tokenized) {
    const seen = new Set(tokens);
    for (const term of seen) df.set(term, (df.get(term) || 0) + 1);
  }

  const vocab = new Map();
  for (const term of df.keys()) vocab.set(term, vocab.size);

  const N = documents.length;
  const idf = new Float32Array(vocab.size);
  for (const [term, freq] of df) {
    idf[vocab.get(term)] = Math.log((1 + N) / (1 + freq)) + 1;
  }

  return { vocab, idf, tokenized };
}

export function vectorize(tokens, vocab, idf) {
  const vec = new Float32Array(vocab.size);
  if (!tokens.length) return vec;

  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);

  for (const [term, count] of tf) {
    const idx = vocab.get(term);
    if (idx === undefined) continue;
    vec[idx] = (count / tokens.length) * idf[idx];
  }

  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < vec.length; i++) vec[i] /= norm;

  return vec;
}

export function cosineUnit(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
