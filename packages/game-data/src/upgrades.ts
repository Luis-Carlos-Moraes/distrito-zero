import { StationModuleType } from '@distrito-zero/shared-types';

export interface StationUpgradeDef {
  type: StationModuleType;
  name: string;
  description: string;
  cost: number;
  buildTimeSeconds: number;
  benefits: string[];
}

export const STATION_UPGRADES: Record<StationModuleType, StationUpgradeDef> = {
  reception: {
    type: 'reception',
    name: 'Recepção e Atendimento',
    description: 'Melhora a relação e a confiança imediata da população ao registrar ocorrências.',
    cost: 800,
    buildTimeSeconds: 20,
    benefits: ['+15% confiança por ocorrência resolvida', 'Capacidade de atendimento ampliada']
  },
  holding_cells: {
    type: 'holding_cells',
    name: 'Expansão de Celas',
    description: 'Amplia a capacidade carcerária temporária da delegacia.',
    cost: 1200,
    buildTimeSeconds: 30,
    benefits: ['+4 vagas de carceragem', 'Redução do risco de superlotação']
  },
  garage: {
    type: 'garage',
    name: 'Pátio & Garagem',
    description: 'Amplia o espaço para viaturas operacionais.',
    cost: 1500,
    buildTimeSeconds: 25,
    benefits: ['+2 vagas de viatura', 'Tempo de resposta de saída reduzido']
  },
  workshop: {
    type: 'workshop',
    name: 'Oficina Mecânica',
    description: 'Permite reparar viaturas danificadas na própria delegacia.',
    cost: 2200,
    buildTimeSeconds: 40,
    benefits: ['Reparo automático de viaturas danificadas', '-50% custo de manutenção']
  },
  armory: {
    type: 'armory',
    name: 'Arsenal & Equipamentos',
    description: 'Fornece equipamentos táticos e coletes de proteção aos policiais.',
    cost: 2500,
    buildTimeSeconds: 45,
    benefits: ['+20% precisão em confrontos', '-30% dano sofrido por policiais']
  },
  administration: {
    type: 'administration',
    name: 'Centro Administrativo',
    description: 'Otimiza a gestão orçamentária e a folha de pagamento.',
    cost: 1800,
    buildTimeSeconds: 35,
    benefits: ['+10% de rendimento orçamentário', 'Desbloqueia contratação de oficiais experientes']
  },
  investigation: {
    type: 'investigation',
    name: 'Sala de Investigação',
    description: 'Permite desmantelar esquemas criminosos maiores e investigar desvios.',
    cost: 3000,
    buildTimeSeconds: 50,
    benefits: ['Desbloqueia investigação de quadrilhas', 'Acesso à apuração da Corregedoria']
  }
};
