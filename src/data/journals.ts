export interface MedicalJournal {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  imageUrl: string;
}

export const BMC_JOURNALS: MedicalJournal[] = [
  {
    id: 'bmc-public-health',
    title: 'BMC Global and Public Health',
    description: 'An open access, peer-reviewed journal focused on the epidemiology of disease and the understanding of all aspects of public health.',
    category: 'Public Health',
    url: 'https://link.springer.com/journal/44263',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/44263?as=webp'
  },
  {
    id: 'bmc-cardiovascular',
    title: 'BMC Cardiovascular Disorders',
    description: 'Publishes original research articles in all aspects of the prevention, diagnosis and management of disorders of the heart and circulatory system.',
    category: 'Cardiology',
    url: 'https://link.springer.com/journal/12872',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12872?as=webp'
  },
  {
    id: 'bmc-neurology',
    title: 'BMC Neurology',
    description: 'A journal publishing original peer-reviewed research articles in all aspects of the prevention, diagnosis and management of neurological disorders.',
    category: 'Neurology',
    url: 'https://link.springer.com/journal/12883',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12883?as=webp'
  },
  {
    id: 'bmc-medicine',
    title: 'BMC Medicine',
    description: 'The flagship medical journal of the BMC series. An open access, transparent peer-reviewed, general medical journal.',
    category: 'General Medicine',
    url: 'https://link.springer.com/journal/12916',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12916?as=webp'
  },
  {
    id: 'bmc-pediatrics',
    title: 'BMC Pediatrics',
    description: 'Focuses on the prevention, diagnosis and management of disorders in infants, children and adolescents.',
    category: 'Pediatrics',
    url: 'https://link.springer.com/journal/12887',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12887?as=webp'
  },
  {
    id: 'bmc-psychiatry',
    title: 'BMC Psychiatry',
    description: 'An open access journal covering all aspects of the prevention, diagnosis and management of psychiatric disorders.',
    category: 'Psychiatry',
    url: 'https://link.springer.com/journal/12888',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12888?as=webp'
  },
  {
    id: 'bmc-cancer',
    title: 'BMC Cancer',
    description: 'Considers articles on all aspects of cancer research, including the pathophysiology, prevention, diagnosis and treatment of cancers.',
    category: 'Oncology',
    url: 'https://link.springer.com/journal/12885',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12885?as=webp'
  },
  {
    id: 'bmc-infectious',
    title: 'BMC Infectious Diseases',
    description: 'Research on the prevention, diagnosis and management of infectious and sexually transmitted diseases.',
    category: 'Infectious Diseases',
    url: 'https://link.springer.com/journal/12879',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12879?as=webp'
  },
  {
    id: 'bmc-musculoskeletal',
    title: 'BMC Musculoskeletal Disorders',
    description: 'Original research in all aspects of the prevention, diagnosis and management of musculoskeletal and associated disorders.',
    category: 'Orthopedics',
    url: 'https://link.springer.com/journal/12891',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12891?as=webp'
  },
  {
    id: 'alzheimers-research',
    title: "Alzheimer's Research & Therapy",
    description: 'The major forum for translational research into Alzheimer\'s disease and other neurodegenerative diseases.',
    category: 'Neurology',
    url: 'https://link.springer.com/journal/13195',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/13195?as=webp'
  },
  {
    id: 'arthritis-research',
    title: 'Arthritis Research & Therapy',
    description: 'An international, peer-reviewed journal publishing original research, reviews, and commentaries in rheumatology.',
    category: 'Rheumatology',
    url: 'https://link.springer.com/journal/13075',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/13075?as=webp'
  },
  {
    id: 'bmc-emergency',
    title: 'BMC Emergency Medicine',
    description: 'Broadly focuses on emergency medicine, trauma, pre-hospital care and related surgical specialties.',
    category: 'Emergency Medicine',
    url: 'https://link.springer.com/journal/12873',
    imageUrl: 'https://media.springernature.com/w158/springer-static/cover-hires/journal/12873?as=webp'
  }
];
