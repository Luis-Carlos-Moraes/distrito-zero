import { CrimeCategory, IncidentSeverity } from '@distrito-zero/shared-types';

export interface CrimeDefinition {
  type: CrimeCategory;
  title: string;
  descriptionTemplates: string[];
  baseSeverity: IncidentSeverity;
  resolutionTimeSeconds: number;
  timeToLiveSeconds: number;
  rewardBudget: number;
  rewardXp: number;
  rewardReputation: number;
  criminalInfluenceMin: number; // Mínimo de criminalidade no distrito para acontecer
}

export const CRIME_DEFINITIONS: Record<CrimeCategory, CrimeDefinition> = {
  theft: {
    type: 'theft',
    title: 'Furto em Estabelecimento',
    descriptionTemplates: [
      'Suspeito subtraiu mercadorias de uma mercearia local.',
      'Carteirista agiu em ponto de ônibus movimentado.',
      'Furto de pertences em veículo estacionado.'
    ],
    baseSeverity: 'low',
    resolutionTimeSeconds: 10,
    timeToLiveSeconds: 50,
    rewardBudget: 250,
    rewardXp: 40,
    rewardReputation: 2,
    criminalInfluenceMin: 0
  },
  vandalism: {
    type: 'vandalism',
    title: 'Vandalismo e Perturbação',
    descriptionTemplates: [
      'Grupo depredando fachada de prédio público.',
      'Pichação e destruição de patrimônio comunitário.',
      'Perturbação do sossego e confronto verbal.'
    ],
    baseSeverity: 'low',
    resolutionTimeSeconds: 8,
    timeToLiveSeconds: 45,
    rewardBudget: 180,
    rewardXp: 30,
    rewardReputation: 2,
    criminalInfluenceMin: 10
  },
  robbery: {
    type: 'robbery',
    title: 'Roubo a Mão Armada',
    descriptionTemplates: [
      'Assalto a pedestre com ameaça ostensiva.',
      'Roubo em andamento em farmácia de esquina.',
      'Tentativa de assalto a comércio de bairro.'
    ],
    baseSeverity: 'medium',
    resolutionTimeSeconds: 15,
    timeToLiveSeconds: 40,
    rewardBudget: 500,
    rewardXp: 90,
    rewardReputation: 5,
    criminalInfluenceMin: 25
  },
  drug_trafficking: {
    type: 'drug_trafficking',
    title: 'Ponto de Tráfico de Drogas',
    descriptionTemplates: [
      'Denúncia de comercialização de entorpecentes em beco.',
      'Atividade suspeita frequente em imóvel degradado.'
    ],
    baseSeverity: 'high',
    resolutionTimeSeconds: 22,
    timeToLiveSeconds: 60,
    rewardBudget: 800,
    rewardXp: 160,
    rewardReputation: 8,
    criminalInfluenceMin: 40
  },
  corruption: {
    type: 'corruption',
    title: 'Suspeita de Desvio Interno',
    descriptionTemplates: [
      'Apreensão não documentada no plantão anterior.',
      'Denúncia anônima apontando vazamento de informação de patrulha.'
    ],
    baseSeverity: 'medium',
    resolutionTimeSeconds: 30,
    timeToLiveSeconds: 90,
    rewardBudget: 600,
    rewardXp: 200,
    rewardReputation: 10,
    criminalInfluenceMin: 30
  },
  homicide: {
    type: 'homicide',
    title: 'Ocorrência Gravíssima com Disparos',
    descriptionTemplates: [
      'Confronto entre grupos com vítima fatal na via pública.',
      'Disparos reportados por moradores em área residencial.'
    ],
    baseSeverity: 'critical',
    resolutionTimeSeconds: 35,
    timeToLiveSeconds: 35,
    rewardBudget: 1500,
    rewardXp: 350,
    rewardReputation: 15,
    criminalInfluenceMin: 60
  }
};
