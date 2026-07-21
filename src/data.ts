import { Professional } from './types';

export const initialProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Maria da Silva',
    city: 'Picos',
    skills: ['Costura reta', 'Overlock', 'Acabamento'],
    availability: 'Integral',
    experience: '8 anos em confecção de jeanswear',
    whatsapp: '(89) 99999-0001',
  },
  {
    id: '2',
    name: 'Ana Beatriz Santos',
    city: 'Picos',
    skills: ['Bordado', 'Costura reta', 'Patchwork'],
    availability: 'Meio período',
    experience: '5 anos bordando para ateliês',
    whatsapp: '(89) 99999-0002',
  },
  {
    id: '3',
    name: 'Francisca Oliveira',
    city: 'São João do Piauí',
    skills: ['Modelagem', 'Costura reta', 'Corte'],
    availability: 'Integral',
    experience: '12 anos como modelista em fábrica',
    whatsapp: '(89) 99999-0003',
  },
  {
    id: '4',
    name: 'Luciana Ferreira',
    city: 'Picos',
    skills: ['Overlock', 'Interlock', 'Costura reta'],
    availability: 'Freelancer',
    experience: '6 anos em produção de camisetas',
    whatsapp: '(89) 99999-0004',
  },
  {
    id: '5',
    name: 'Rita de Cássia Lima',
    city: 'Caldeirão Grande do Piauí',
    skills: ['Bordado', 'Crochê', 'Costura reta'],
    availability: 'Meio período',
    experience: '3 anos em artesanato e bordado manual',
    whatsapp: '(89) 99999-0005',
  },
  {
    id: '6',
    name: 'Patrícia Almeida',
    city: 'Picos',
    skills: ['Modelagem', 'Risco', 'Encaixe'],
    availability: 'Integral',
    experience: '10 anos como modelista e risquista',
    whatsapp: '(89) 99999-0006',
  },
];

export const cities = [
  'Picos',
  'São João do Piauí',
  'Caldeirão Grande do Piauí',
  'Itainópolis',
  'São Braz do Piauí',
  'Massapê do Piauí',
];

export const skills = [
  'Costura reta',
  'Overlock',
  'Interlock',
  'Bordado',
  'Modelagem',
  'Corte',
  'Acabamento',
  'Risco',
  'Encaixe',
  'Patchwork',
  'Crochê',
];

export const availabilities = ['Integral', 'Meio período', 'Freelancer'];
