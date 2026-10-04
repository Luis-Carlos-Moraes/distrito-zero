import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../initial-state.js';
import { executeCommand } from '../commands/command-handler.js';
import { GameSimulation } from '../simulation.js';
import { Incident } from '@distrito-zero/shared-types';

describe('GameSimulation & Core Rules', () => {
  it('inicializa o estado do jogo com os valores previstos no Game Design', () => {
    const state = createInitialGameState(100);

    expect(state.districts['district-0']).toBeDefined();
    expect(state.districts['district-0'].metrics.security).toBe(22);
    expect(state.wallet.budget).toBe(1500);
    expect(Object.keys(state.officers).length).toBe(4);
    expect(state.vehicles['veh-1'].status).toBe('parked');
  });

  it('valida regras de despacho de viaturas (DISPATCH_UNIT)', () => {
    let state = createInitialGameState(100);

    // Mockar uma ocorrência inicial
    const mockIncident: Incident = {
      id: 'inc-test-1',
      districtId: 'district-0',
      crimeType: 'theft',
      title: 'Furto em Teste',
      description: 'Teste automatizado',
      severity: 'low',
      status: 'reported',
      location: { x: 5, y: 5 },
      createdAtTick: 0,
      expiresAtTick: 50,
      resolutionProgress: 0,
      requiredResolutionTime: 2,
      reward: { budget: 300, xp: 50, reputation: 2 }
    };
    state.incidents['inc-test-1'] = mockIncident;

    // Despacho bem-sucedido
    const result = executeCommand(state, {
      type: 'DISPATCH_UNIT',
      incidentId: 'inc-test-1',
      vehicleId: 'veh-1'
    });

    expect(result.success).toBe(true);
    expect(result.events.length).toBe(1);
    expect(result.events[0].type).toBe('UNIT_DISPATCHED');
    expect(result.state.vehicles['veh-1'].status).toBe('dispatched');
    expect(result.state.incidents['inc-test-1'].status).toBe('dispatched');

    // Tentar despachar a mesma viatura novamente deve falhar
    const failResult = executeCommand(result.state, {
      type: 'DISPATCH_UNIT',
      incidentId: 'inc-test-1',
      vehicleId: 'veh-1'
    });
    expect(failResult.success).toBe(false);
  });

  it('executa o ciclo completo determinístico de deslocamento, resolução e recompensas', () => {
    const simulation = new GameSimulation(1337);
    let state = createInitialGameState(1337);

    // Criar ocorrência próxima à delegacia (posição {4, 4})
    const incident: Incident = {
      id: 'inc-fast',
      districtId: 'district-0',
      crimeType: 'theft',
      title: 'Furto Rápido',
      description: 'Ocorrência de teste de ciclo',
      severity: 'low',
      status: 'reported',
      location: { x: 4.2, y: 4.2 },
      createdAtTick: 0,
      expiresAtTick: 60,
      resolutionProgress: 0,
      requiredResolutionTime: 2, // 2 segundos
      reward: { budget: 400, xp: 60, reputation: 5 }
    };
    state.incidents['inc-fast'] = incident;

    // Despachar viatura
    const dispatchResult = executeCommand(state, {
      type: 'DISPATCH_UNIT',
      incidentId: 'inc-fast',
      vehicleId: 'veh-1'
    });
    state = dispatchResult.state;

    const initialBudget = state.wallet.budget;
    const initialSecurity = state.districts['district-0'].metrics.security;

    // Simular alguns ticks até resolução completa
    let resolved = false;
    for (let i = 0; i < 15; i++) {
      const tickRes = simulation.tick(state);
      state = tickRes.state;

      const resolvedEvent = tickRes.events.find((e) => e.type === 'INCIDENT_RESOLVED');
      if (resolvedEvent) {
        resolved = true;
        break;
      }
    }

    expect(resolved).toBe(true);
    expect(state.wallet.budget).toBe(initialBudget + 400);
    // Bairro reagiu aumentando segurança
    expect(state.districts['district-0'].metrics.security).toBeGreaterThan(initialSecurity);
  });
});
