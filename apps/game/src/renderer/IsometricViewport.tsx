import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '@distrito-zero/shared-types';

interface IsometricViewportProps {
  state: GameState;
}

export const IsometricViewport: React.FC<IsometricViewportProps> = ({
  state
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estado da câmera
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    zoom: 1.0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
  });

  const tileWidth = 72;
  const tileHeight = 36;
  const gridSize = 12; // grid 12x12 de quarteirões

  // Projeção isométrica (Grid -> Tela)
  const toScreen = (gx: number, gy: number, camX: number, camY: number, zoom: number, originX: number, originY: number) => {
    const isoX = (gx - gy) * (tileWidth / 2) * zoom + originX + camX;
    const isoY = (gx + gy) * (tileHeight / 2) * zoom + originY + camY;
    return { x: isoX, y: isoY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Ajustar resolução para retina/dpi
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // Fundo escuro urbano
      const bgGrad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#050811');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const originX = width / 2;
      const originY = height / 4;
      const { x: camX, y: camY, zoom } = camera;

      // 1. Desenhar Grid Isométrico & Ruas (Chão)
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const pt = toScreen(c, r, camX, camY, zoom, originX, originY);

          // Culling com margem de segurança (evita pop-in conforme especificação LOD)
          const margin = 120 * zoom;
          if (pt.x < -margin || pt.x > width + margin || pt.y < -margin || pt.y > height + margin) {
            continue;
          }

          const isRoad = c % 3 === 0 || r % 3 === 0;

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x + (tileWidth / 2) * zoom, pt.y + (tileHeight / 2) * zoom);
          ctx.lineTo(pt.x, pt.y + tileHeight * zoom);
          ctx.lineTo(pt.x - (tileWidth / 2) * zoom, pt.y + (tileHeight / 2) * zoom);
          ctx.closePath();

          ctx.fillStyle = isRoad ? '#1e293b' : '#0f172a';
          ctx.fill();
          ctx.strokeStyle = isRoad ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const activeDistrict = state.districts[state.activeDistrictId];

      // 2. Renderizar Prédios
      if (activeDistrict) {
        for (const bldg of activeDistrict.buildings) {
          const pt = toScreen(bldg.position.x, bldg.position.y, camX, camY, zoom, originX, originY);
          const isStation = bldg.type === 'station';

          const bldgHeight = (isStation ? 50 : bldg.stage === 'abandoned' ? 24 : 38) * zoom;
          const bldgWidth = (tileWidth * 0.7) * zoom;

          // Sombra no chão
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y + (tileHeight / 2) * zoom, bldgWidth * 0.6, tileHeight * 0.4 * zoom, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bloco do Prédio (Fachada e Topo Isométrico)
          // Face Esquerda
          ctx.beginPath();
          ctx.moveTo(pt.x - bldgWidth / 2, pt.y + (tileHeight * 0.3) * zoom);
          ctx.lineTo(pt.x, pt.y + (tileHeight * 0.6) * zoom);
          ctx.lineTo(pt.x, pt.y + (tileHeight * 0.6) * zoom - bldgHeight);
          ctx.lineTo(pt.x - bldgWidth / 2, pt.y + (tileHeight * 0.3) * zoom - bldgHeight);
          ctx.closePath();
          ctx.fillStyle = isStation ? '#1e3a8a' : bldg.stage === 'abandoned' ? '#334155' : '#1e293b';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.stroke();

          // Face Direita
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y + (tileHeight * 0.6) * zoom);
          ctx.lineTo(pt.x + bldgWidth / 2, pt.y + (tileHeight * 0.3) * zoom);
          ctx.lineTo(pt.x + bldgWidth / 2, pt.y + (tileHeight * 0.3) * zoom - bldgHeight);
          ctx.lineTo(pt.x, pt.y + (tileHeight * 0.6) * zoom - bldgHeight);
          ctx.closePath();
          ctx.fillStyle = isStation ? '#2563eb' : bldg.stage === 'abandoned' ? '#475569' : '#334155';
          ctx.fill();
          ctx.stroke();

          // Topo
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y + (tileHeight * 0.6) * zoom - bldgHeight);
          ctx.lineTo(pt.x + bldgWidth / 2, pt.y + (tileHeight * 0.3) * zoom - bldgHeight);
          ctx.lineTo(pt.x, pt.y - bldgHeight);
          ctx.lineTo(pt.x - bldgWidth / 2, pt.y + (tileHeight * 0.3) * zoom - bldgHeight);
          ctx.closePath();
          ctx.fillStyle = isStation ? '#3b82f6' : bldg.stage === 'recovered' ? '#10b981' : '#64748b';
          ctx.fill();
          ctx.stroke();

          // Nome do Prédio se zoom for suficiente (LOD)
          if (zoom >= 0.8) {
            ctx.fillStyle = '#f8fafc';
            ctx.font = `600 ${Math.max(10, Math.floor(11 * zoom))}px var(--font-display)`;
            ctx.textAlign = 'center';
            ctx.fillText(bldg.name, pt.x, pt.y - bldgHeight - 8);

            ctx.fillStyle = isStation ? '#60a5fa' : bldg.stage === 'abandoned' ? '#ef4444' : '#10b981';
            ctx.font = `400 ${Math.max(9, Math.floor(9 * zoom))}px var(--font-mono)`;
            const statusLabel = isStation ? 'DELEGACIA CENTRAL' : bldg.stage.toUpperCase().replace('_', ' ');
            ctx.fillText(statusLabel, pt.x, pt.y - bldgHeight + 5);
          }
        }
      }

      // 3. Renderizar Ocorrências Ativas
      for (const inc of Object.values(state.incidents)) {
        if (inc.status === 'resolved' || inc.status === 'failed') continue;

        const pt = toScreen(inc.location.x, inc.location.y, camX, camY, zoom, originX, originY);
        const pulse = Math.sin(Date.now() / 200) * 4;

        // Círculo de Alerta Pulsante
        ctx.beginPath();
        ctx.arc(pt.x, pt.y + (tileHeight / 2) * zoom, (16 + pulse) * zoom, 0, Math.PI * 2);
        ctx.fillStyle = inc.status === 'on_scene' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.35)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y + (tileHeight / 2) * zoom, 8 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = inc.status === 'on_scene' ? '#10b981' : '#ef4444';
        ctx.fill();

        // Label da Ocorrência
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${Math.max(10, Math.floor(10 * zoom))}px var(--font-display)`;
        ctx.textAlign = 'center';
        ctx.fillText(`🚨 ${inc.title}`, pt.x, pt.y - 12 * zoom);
      }

      // 4. Renderizar Viaturas Policiais em Movimento
      for (const veh of Object.values(state.vehicles)) {
        const pt = toScreen(veh.position.x, veh.position.y, camX, camY, zoom, originX, originY);

        // Ícone / Sprite da Viatura
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y + (tileHeight * 0.4) * zoom, 7 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Giroflex azul/vermelho piscante se em trânsito/atendimento
        if (veh.status === 'dispatched' || veh.status === 'on_scene') {
          const isBlue = Math.floor(Date.now() / 150) % 2 === 0;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y + (tileHeight * 0.4) * zoom - 6 * zoom, 3 * zoom, 0, Math.PI * 2);
          ctx.fillStyle = isBlue ? '#38bdf8' : '#ef4444';
          ctx.fill();
        }

        if (zoom >= 0.75) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = `600 ${Math.max(9, Math.floor(9 * zoom))}px var(--font-mono)`;
          ctx.textAlign = 'center';
          ctx.fillText(veh.name, pt.x, pt.y + (tileHeight * 0.4) * zoom + 16 * zoom);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, camera]);

  // Controles de Câmera: Pan (Arrastar)
  const handleMouseDown = (e: React.MouseEvent) => {
    setCamera((prev) => ({
      ...prev,
      isDragging: true,
      dragStartX: e.clientX - prev.x,
      dragStartY: e.clientY - prev.y
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!camera.isDragging) return;
    setCamera((prev) => ({
      ...prev,
      x: e.clientX - prev.dragStartX,
      y: e.clientY - prev.dragStartY
    }));
  };

  const handleMouseUp = () => {
    setCamera((prev) => ({ ...prev, isDragging: false }));
  };

  // Zoom da Câmera (Roda do Mouse)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(2.2, prev.zoom * zoomFactor))
    }));
  };

  return (
    <div
      className="canvas-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: camera.isDragging ? 'grabbing' : 'grab' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Controles de Câmera na tela */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}
      >
        <button
          className="btn-ghost glass-panel"
          onClick={() => setCamera((prev) => ({ ...prev, zoom: Math.min(2.2, prev.zoom + 0.2) }))}
        >
          🔍 +
        </button>
        <button
          className="btn-ghost glass-panel"
          onClick={() => setCamera((prev) => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.2) }))}
        >
          🔍 -
        </button>
        <button
          className="btn-ghost glass-panel"
          onClick={() => setCamera({ x: 0, y: 0, zoom: 1.0, isDragging: false, dragStartX: 0, dragStartY: 0 })}
        >
          Centralizar
        </button>
      </div>
    </div>
  );
};
