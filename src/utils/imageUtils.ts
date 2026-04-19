export const extractMedicalKeywords = (text: string) => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under', 'above', 
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 
    'that', 'which', 'who', 'whom', 'whose', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their', 'them', 'we', 'our', 'us', 'you', 'your', 'he', 'his', 'him', 'she', 'her', 'hers', 'i', 'my', 'mine', 
    'as', 'if', 'then', 'than', 'because', 'while', 'where', 'when', 'so', 
    'patients', 'study', 'effect', 'effects', 'clinical', 'trial', 'review', 'analysis', 'outcomes', 'outcome', 'results', 'using', 'based', 'randomized', 'controlled', 'group', 'groups', 'treatment', 'versus', 'vs', 'systematic', 'meta-analysis', 'adults', 'children', 'year', 'years', 'old', 'new', 'evaluation', 'management', 'prevention', 'detection', 'guideline', 'guidelines', 'care', 'practice', 'standards', 'update', 'among', 'associated', 'risk', 'factors', 'quality', 'disease', 'syndrome', 'evaluating', 'acute', 'chronic', 'severe', 'mild', 'moderate', 'early', 'late', 'long-term', 'short-term', 'impact', 'incidence', 'prevalence', 'mortality', 'morbidity', 'survival', 'safety', 'efficacy', 'effectiveness', 'comparison', 'comparing', 'compared', 'double-blind', 'placebo', 'multicenter', 'phase', 'post-hoc', 'follow-up', 'cohort', 'observational', 'prospective', 'retrospective'
  ]);
  
  const words = text.toLowerCase().replace(/[^a-z0-9\- \/]/g, ' ').split(/\s+/);
  const keywords = words.filter(word => word.length > 3 && !stopWords.has(word));
  
  // If we filtered out too much, just return the original text without weird characters
  if (keywords.length === 0) {
    return text.replace(/[^a-zA-Z0-9 ]/g, ' ').slice(0, 50);
  }
  
  return keywords.slice(0, 6).join(' ');
};

// Pollinations.ai strictly requires a numeric integer for the seed parameter to lock the image.
// Passing strings (like 'guideline-hypertension') causes it to ignore the seed and constantly regenerate randomness.
export const generateStableSeed = (str: string): number => {
  if (!str) return 42;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const guessAnatomyContext = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('eye') || t.includes('ophthalm') || t.includes('retin') || t.includes('vision') || t.includes('glaucoma') || t.includes('macular') || t.includes('cornea')) return 'human eye anatomy, retina, optical nerve, ophthalmology';
  if (t.includes('heart') || t.includes('cardio') || t.includes('myocardial') || t.includes('coronary') || t.includes('atrial') || t.includes('ventric') || t.includes('aort')) return 'heart, cardiovascular system, coronary arteries, cardiology';
  if (t.includes('brain') || t.includes('neuro') || t.includes('stroke') || t.includes('cereb') || t.includes('cognitive') || t.includes('alzheimer') || t.includes('parkinson')) return 'brain, neurons, nervous system, cerebral cortex, neurology';
  if (t.includes('cancer') || t.includes('oncol') || t.includes('tumor') || t.includes('carcinoma') || t.includes('leukemia') || t.includes('malignan')) return 'cancer cells, tumor microenvironment, cellular apoptosis, oncology';
  if (t.includes('lung') || t.includes('pulmon') || t.includes('respiratory') || t.includes('asthma') || t.includes('copd')) return 'lungs, alveoli, respiratory system, pulmonology';
  if (t.includes('skin') || t.includes('derma') || t.includes('melanoma') || t.includes('psoriasis')) return 'skin layers, epidermis, dermis, cutaneous tissue, dermatology';
  if (t.includes('bone') || t.includes('osteo') || t.includes('ortho') || t.includes('fracture') || t.includes('joint') || t.includes('cartilage') || t.includes('musculoskelet')) return 'human skeleton, bones, joints, musculoskeletal system, osteocytes';
  if (t.includes('kidney') || t.includes('renal') || t.includes('nephro')) return 'kidneys, nephrons, renal system, nephrology';
  if (t.includes('liver') || t.includes('hepat') || t.includes('cirrhosis')) return 'liver, hepatocytes, hepatic system, hepatology';
  if (t.includes('blood') || t.includes('hema') || t.includes('anemia') || t.includes('coagulation') || t.includes('thromb')) return 'red blood cells, white blood cells, platelets, bloodstream, hematology';
  if (t.includes('stomach') || t.includes('gastro') || t.includes('bowel') || t.includes('colon') || t.includes('intestin')) return 'digestive system, stomach, intestinal villi, gut microbiome, gastroenterology';
  if (t.includes('immune') || t.includes('immun') || t.includes('vaccin') || t.includes('infect') || t.includes('vir') || t.includes('bacteri')) return 'immune system, antibodies, macrophages, t-cells, pathogens, immunology';
  if (t.includes('gene') || t.includes('dna') || t.includes('rna') || t.includes('chromo') || t.includes('genom')) return 'DNA double helix, chromosomes, genetic code, molecular biology, genetics';
  if (t.includes('pregna') || t.includes('obstet') || t.includes('mater') || t.includes('fetal') || t.includes('neo')) return 'fetal development, placenta, maternal-fetal medicine, obstetrics';
  if (t.includes('pediatr') || t.includes('child') || t.includes('infant')) return 'pediatric structure, developing human biology, pediatrics';
  return 'human anatomy, cellular biology, microscopic medical science';
};

export const getImageUrl = (title: string, id: string, type: 'cover' | 'illustration') => {
  const keywords = extractMedicalKeywords(title);
  const numericSeed = generateStableSeed(id || title);
  const anatomyContext = guessAnatomyContext(title + ' ' + keywords);
  
  // Strong architectural prompt to force pollinations into generating clinical/biological visualizations
  // We use "3D render, photorealistic anatomy" to ensure it looks like a high-end medical journal and never like a literal book or weird cartoon.
  let medicalPrompt = `photorealistic 3D medical illustration, anatomy diagram, clinical view, focusing on ${anatomyContext}, concepts: ${keywords}`;
  
  // Truncate to avoid extremely long URLs that might get rejected by the browser or server
  if (medicalPrompt.length > 500) {
    medicalPrompt = medicalPrompt.substring(0, 500);
  }
  
  if (type === 'cover') {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(`${medicalPrompt}, dark moody background, glowing lighting`)}?width=800&height=600&seed=${numericSeed}&nologo=true&model=turbo`;
  }
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(`${medicalPrompt}, clinical lighting, macro photography`)}?width=800&height=800&seed=${numericSeed}&nologo=true&model=turbo`;
};
