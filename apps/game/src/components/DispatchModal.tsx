import React from 'react';
import { Incident, PoliceVehicle } from '@distrito-zero/shared-types';

interface DispatchModalProps {
  incident: Incident;
  availableVehicles: PoliceVehicle[];
  onConfirmDispatch: (incidentId: string, vehicleId: string) => void;
  onClose: () => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  incident,
  availableVehicles,
  onConfirmDispatch,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="card-header">
          <span>CENTRAL DE DESPACHO TÁTICO</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px',
              borderRadius: '6px'
            }}
          >
            <div style={{ fontWeight: 600, color: '#fca5a5', fontSize: '0.85rem' }}>
              {incident.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '4px' }}>
              {incident.description}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
              Recompensa: R$ {incident.reward.budget} • +{incident.reward.reputation}% Confiança
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
              SELECIONE A VIATURA DISPONÍVEL:
            </span>

            {availableVehicles.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#f87171',
                  fontSize: '0.8rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}
              >
                Nenhuma viatura disponível no pátio no momento! Aguarde o retorno de unidades.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {availableVehicles.map((veh) => (
                  <div
                    key={veh.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                        🚓 {veh.name} ({veh.plate})
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Tripulação: {veh.assignedOfficerIds.length} policiais • Integridade: {veh.health}%
                      </div>
                    </div>

                    <button
                      className="btn-dispatch"
                      onClick={() => onConfirmDispatch(incident.id, veh.id)}
                    >
                      Autorizar Saída
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
