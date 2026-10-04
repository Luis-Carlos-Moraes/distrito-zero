import React, { useState } from 'react';

interface BottomNavigationDockProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  incidentsCount: number;
}

export const BottomNavigationDock: React.FC<BottomNavigationDockProps> = ({
  activeTab,
  onSelectTab,
  incidentsCount
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const TABS = [
    { id: 'map', label: 'Mapa', icon: '🗺️' },
    { id: 'station', label: 'Delegacia', icon: '🏢' },
    { id: 'officers', label: 'Policiais', icon: '👮' },
    { id: 'vehicles', label: 'Viaturas', icon: '🚓' },
    { id: 'incidents', label: 'Ocorrências', icon: '🚨', badge: incidentsCount > 0 ? incidentsCount : undefined },
    { id: 'investigation', label: 'Investigações', icon: '🔍' },
    { id: 'buildings', label: 'Construções', icon: '🔨' },
    { id: 'prisons', label: 'Prisões', icon: '⚖️' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' }
  ];

  const ROOMS = [
    { id: 'reception', label: 'RECEPÇÃO', icon: '📋', desc: 'Atendimento e triagem' },
    { id: 'investigation', label: 'INVESTIGAÇÃO', icon: '💻', desc: 'Análise de evidências' },
    { id: 'armory', label: 'ARSENAL', icon: '🛡️', desc: 'Equipamentos táticos' },
    { id: 'cells', label: 'CELAS', icon: '🔒', desc: 'Carceragem provisória' },
    { id: 'garage', label: 'GARAGEM', icon: '🚘', desc: 'Pátio e manutenção' },
    { id: 'briefing', label: 'SALA DE REUNIÃO', icon: '🗺️', desc: 'Planejamento tático' }
  ];

  return (
    <footer className="dock-container">
      {/* Barra Principal de Abas */}
      <nav className="dock-tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`dock-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span className="dock-tab-icon">{tab.icon}</span>
              <span className="dock-tab-label">{tab.label}</span>
              {tab.badge && <span className="dock-tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Strip de Cômodos da Delegacia Viva (exibido apenas ao selecionar a aba 'Delegacia') */}
      {activeTab === 'station' && (
        <div className="dock-rooms-strip">
          {ROOMS.map((room) => {
            const isSelected = selectedRoom === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(isSelected ? null : room.id)}
                className={`room-strip-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="room-icon-box">{room.icon}</div>
                <div className="room-info">
                  <span className="room-title">{room.label}</span>
                  <span className="room-desc">{room.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </footer>
  );
};
