export interface Professional {
  id: string;
  name: string;
  city: string;
  skills: string[];
  availability: string;
  experience: string;
  whatsapp: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
  createdAt: string;
  companyName?: string;
  companyPhone?: string;
}

export type View = 'landing' | 'company' | 'professional' | 'jobs';
