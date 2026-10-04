import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameState } from '@distrito-zero/shared-types';
import {
  createCommercialBuildingMesh,
  createIncidentMarkerMesh,
  createPoliceCruiserMesh,
  createPoliceStationMesh,
  createResidentialBuildingMesh,
  createRoadTile
} from './city-builder-3d.js';

interface IsometricViewport3DProps {
  state: GameState;
  onSelectIncident?: (incidentId: string) => void;
}

interface WorldLabel {
  id: string;
  text: string;
  subtext?: string;
  type: 'station' | 'commercial' | 'residential' | 'incident';
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const IsometricViewport3D: React.FC<IsometricViewport3DProps> = ({
  state
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [worldLabels, setWorldLabels] = useState<WorldLabel[]>([]);

  // Referências persistentes do Three.js
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    sunLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    cruiserObj?: {
      mesh: THREE.Group;
      sirenLightRed: THREE.PointLight;
      sirenLightBlue: THREE.PointLight;
    };
    incidentMarkers: Map<string, THREE.Group>;
    buildingMeshes: Map<string, THREE.Group>;
  } | null>(null);

  // Estado da Câmera (Pan e Zoom)
  const cameraState = useRef({
    targetX: 18,
    targetZ: 18,
    zoom: 28,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // 1. Inicialização da Cena Three.js (Apenas uma vez)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    // Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    // Câmera Ortográfica Isométrica
    const d = cameraState.current.zoom;
    const camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect, d, -d, 1, 1000
    );

    // Posição clássica isométrica: 45 graus de azimute e elevação
    camera.position.set(cameraState.current.targetX + 40, 40, cameraState.current.targetZ + 40);
    camera.lookAt(cameraState.current.targetX, 0, cameraState.current.targetZ);

    // Renderer WebGL com sombras suaves
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Iluminação do Sol 3D com sombras dinâmicas
    const sunLight = new THREE.DirectionalLight(0xfff3d6, 1.4);
    sunLight.position.set(30, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    const shadowDist = 35;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    scene.add(sunLight);

    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    scene.add(ambientLight);

    // 2. Construir Malha Viária 3D (Grid de Ruas e Quarteirões)
    const gridSize = 10;
    const tileSize = 4;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const isIntersection = r % 3 === 0 && c % 3 === 0;
        const tile = createRoadTile(isIntersection);
        tile.position.set(c * tileSize, 0, r * tileSize);
        scene.add(tile);
      }
    }

    // 3. Adicionar Viatura Policial
    const cruiser = createPoliceCruiserMesh();
    cruiser.mesh.position.set(16, 0.1, 16);
    scene.add(cruiser.mesh);

    threeRef.current = {
      scene,
      camera,
      renderer,
      sunLight,
      ambientLight,
      cruiserObj: cruiser,
      incidentMarkers: new Map(),
      buildingMeshes: new Map()
    };

    // Resize listener
    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const asp = w / h;
      const zm = cameraState.current.zoom;

      threeRef.current.camera.left = -zm * asp;
      threeRef.current.camera.right = zm * asp;
      threeRef.current.camera.top = zm;
      threeRef.current.camera.bottom = -zm;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Atualização dos Prédios da Cidade no Three.js
  useEffect(() => {
    if (!threeRef.current) return;
    const { scene, buildingMeshes } = threeRef.current;
    const activeDistrict = state.districts[state.activeDistrictId];
    if (!activeDistrict) return;

    // Atualizar ou instanciar prédios
    for (const bldg of activeDistrict.buildings) {
      if (!buildingMeshes.has(bldg.id)) {
        let mesh: THREE.Group;
        if (bldg.type === 'station') {
          mesh = createPoliceStationMesh();
        } else if (bldg.type === 'commercial') {
          mesh = createCommercialBuildingMesh(bldg.stage);
        } else {
          mesh = createResidentialBuildingMesh(bldg.stage);
        }

        // Posicionar na escala 3D (coordenada lógica * 4m)
        mesh.position.set(bldg.position.x * 4, 0.1, bldg.position.y * 4);
        scene.add(mesh);
        buildingMeshes.set(bldg.id, mesh);
      }
    }
  }, [state.districts, state.activeDistrictId]);

  // 3. Loop de Renderização e Animação 3D contínua
  useEffect(() => {
    let animId: number;

    const animate = () => {
      if (!threeRef.current || !containerRef.current) return;
      const { scene, camera, renderer, sunLight, ambientLight, cruiserObj, incidentMarkers } = threeRef.current;

      const timeMinutes = state.clock.timeOfDayMinutes;

      // Ciclo Dia/Noite na Iluminação 3D
      if (timeMinutes >= 360 && timeMinutes < 1080) {
        // Dia (06:00 - 18:00)
        sunLight.color.setHex(0xfff5e6);
        sunLight.intensity = 1.35;
        ambientLight.color.setHex(0x60a5fa);
        ambientLight.intensity = 0.5;
        scene.background = new THREE.Color(0x0c1222);
      } else if (timeMinutes >= 1080 && timeMinutes < 1200) {
        // Pôr do sol (18:00 - 20:00)
        sunLight.color.setHex(0xf59e0b);
        sunLight.intensity = 0.9;
        ambientLight.color.setHex(0xca8a04);
        ambientLight.intensity = 0.35;
        scene.background = new THREE.Color(0x180d24);
      } else {
        // Noite (20:00 - 06:00)
        sunLight.color.setHex(0x38bdf8);
        sunLight.intensity = 0.25;
        ambientLight.color.setHex(0x1e3a8a);
        ambientLight.intensity = 0.2;
        scene.background = new THREE.Color(0x030712);
      }

      // Atualizar Viatura Policial
      const primaryVehicle = Object.values(state.vehicles)[0];
      if (primaryVehicle && cruiserObj) {
        const targetWorldX = primaryVehicle.position.x * 4;
        const targetWorldZ = primaryVehicle.position.y * 4;

        // Suavização do movimento (lerp)
        const dx = targetWorldX - cruiserObj.mesh.position.x;
        const dz = targetWorldZ - cruiserObj.mesh.position.z;

        cruiserObj.mesh.position.x += dx * 0.15;
        cruiserObj.mesh.position.z += dz * 0.15;

        // Rotação natural da viatura alinhada ao movimento
        if (Math.hypot(dx, dz) > 0.05) {
          const targetRotation = Math.atan2(dx, dz);
          cruiserObj.mesh.rotation.y = THREE.MathUtils.lerp(
            cruiserObj.mesh.rotation.y,
            targetRotation,
            0.2
          );
        }

        // Giroflex piscante (Sirene policial)
        const isDispatched = primaryVehicle.status === 'dispatched' || primaryVehicle.status === 'on_scene';
        if (isDispatched) {
          const strobe = Math.floor(Date.now() / 120) % 2 === 0;
          cruiserObj.sirenLightRed.intensity = strobe ? 3.5 : 0.0;
          cruiserObj.sirenLightBlue.intensity = strobe ? 0.0 : 3.5;
        } else {
          cruiserObj.sirenLightRed.intensity = 0;
          cruiserObj.sirenLightBlue.intensity = 0;
        }
      }

      // Sincronizar Marcadores de Ocorrência 3D
      const activeIncidents = Object.values(state.incidents).filter(
        (i) => i.status !== 'resolved' && i.status !== 'failed'
      );

      for (const inc of activeIncidents) {
        if (!incidentMarkers.has(inc.id)) {
          const marker = createIncidentMarkerMesh();
          marker.position.set(inc.location.x * 4, 0.1, inc.location.y * 4);
          scene.add(marker);
          incidentMarkers.set(inc.id, marker);
        } else {
          const marker = incidentMarkers.get(inc.id);
          if (marker) {
            // Pulsação suave do holograma
            marker.rotation.y += 0.03;
          }
        }
      }

      // Remover marcadores finalizados
      for (const [id, marker] of incidentMarkers.entries()) {
        const stillActive = activeIncidents.some((i) => i.id === id);
        if (!stillActive) {
          scene.remove(marker);
          incidentMarkers.delete(id);
        }
      }

      // Calcular Posições das Etiquetas 2D no espaço da tela
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const labels: WorldLabel[] = [];

      const activeDistrict = state.districts[state.activeDistrictId];
      if (activeDistrict) {
        for (const bldg of activeDistrict.buildings) {
          const pos = new THREE.Vector3(bldg.position.x * 4, 2.5, bldg.position.y * 4);
          pos.project(camera);

          const screenX = (pos.x * 0.5 + 0.5) * w;
          const screenY = (pos.y * -0.5 + 0.5) * h;

          labels.push({
            id: bldg.id,
            text: bldg.name.toUpperCase(),
            subtext: bldg.type === 'station' ? 'DELEGACIA' : bldg.stage.toUpperCase().replace('_', ' '),
            type: bldg.type === 'station' ? 'station' : 'commercial',
            screenX,
            screenY,
            visible: pos.z < 1
          });
        }
      }

      for (const inc of activeIncidents) {
        const pos = new THREE.Vector3(inc.location.x * 4, 2.2, inc.location.y * 4);
        pos.project(camera);

        labels.push({
          id: inc.id,
          text: `🚨 ${inc.title.toUpperCase()}`,
          subtext: inc.status === 'on_scene' ? 'ATENDIMENTO EM CURSO' : 'CHAMADA DE EMERGÊNCIA',
          type: 'incident',
          screenX: (pos.x * 0.5 + 0.5) * w,
          screenY: (pos.y * -0.5 + 0.5) * h,
          visible: pos.z < 1
        });
      }

      setWorldLabels(labels);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animId);
  }, [state]);

  // Controles de Câmera: Pan (Arrastar com botão esquerdo ou direito)
  const handleMouseDown = (e: React.MouseEvent) => {
    cameraState.current.isDragging = true;
    cameraState.current.lastMouseX = e.clientX;
    cameraState.current.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cameraState.current.isDragging || !threeRef.current) return;

    const deltaX = e.clientX - cameraState.current.lastMouseX;
    const deltaY = e.clientY - cameraState.current.lastMouseY;
    cameraState.current.lastMouseX = e.clientX;
    cameraState.current.lastMouseY = e.clientY;

    const factor = 0.04;
    // Mover no plano X-Z isométrico
    cameraState.current.targetX -= (deltaX - deltaY) * factor;
    cameraState.current.targetZ -= (-deltaX - deltaY) * factor;

    const { camera } = threeRef.current;
    camera.position.set(cameraState.current.targetX + 40, 40, cameraState.current.targetZ + 40);
    camera.lookAt(cameraState.current.targetX, 0, cameraState.current.targetZ);
  };

  const handleMouseUp = () => {
    cameraState.current.isDragging = false;
  };

  // Zoom da Câmera
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!threeRef.current || !containerRef.current) return;

    const zoomStep = e.deltaY < 0 ? 0.9 : 1.1;
    cameraState.current.zoom = Math.max(12, Math.min(50, cameraState.current.zoom * zoomStep));

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const asp = w / h;
    const zm = cameraState.current.zoom;

    const { camera } = threeRef.current;
    camera.left = -zm * asp;
    camera.right = zm * asp;
    camera.top = zm;
    camera.bottom = -zm;
    camera.updateProjectionMatrix();
  };

  const centerOnStation = () => {
    if (!threeRef.current || !containerRef.current) return;
    cameraState.current.targetX = 16;
    cameraState.current.targetZ = 16;
    cameraState.current.zoom = 28;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const asp = w / h;

    const { camera } = threeRef.current;
    camera.position.set(56, 40, 56);
    camera.lookAt(16, 0, 16);
    camera.left = -28 * asp;
    camera.right = 28 * asp;
    camera.top = 28;
    camera.bottom = -28;
    camera.updateProjectionMatrix();
  };

  return (
    <div
      ref={containerRef}
      className="canvas-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: 'grab', position: 'relative', overflow: 'hidden' }}
    >
      {/* Pinos e Etiquetas Flutuantes no Mundo (World-Space UI Anchors) */}
      {worldLabels.map((lbl) => {
        if (!lbl.visible) return null;

        const isStation = lbl.type === 'station';
        const isIncident = lbl.type === 'incident';

        return (
          <div
            key={lbl.id}
            style={{
              position: 'absolute',
              left: lbl.screenX,
              top: lbl.screenY,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: isIncident ? 40 : 25
            }}
          >
            <div
              style={{
                background: isIncident
                  ? 'rgba(239, 68, 68, 0.9)'
                  : isStation
                  ? 'rgba(30, 58, 138, 0.9)'
                  : 'rgba(15, 23, 42, 0.85)',
                border: isIncident
                  ? '1px solid #f87171'
                  : isStation
                  ? '1px solid #60a5fa'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                padding: '3px 8px',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap'
              }}
            >
              <div
                style={{
                  fontSize: isIncident ? '0.75rem' : '0.65rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: '#ffffff',
                  letterSpacing: '0.05em'
                }}
              >
                {lbl.text}
              </div>
              {lbl.subtext && (
                <div
                  style={{
                    fontSize: '0.55rem',
                    fontFamily: 'var(--font-mono)',
                    color: isIncident ? '#fee2e2' : '#94a3b8',
                    textAlign: 'center'
                  }}
                >
                  {lbl.subtext}
                </div>
              )}
            </div>

            {/* Triângulo indicador apontando para o prédio */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: isIncident
                  ? '5px solid #ef4444'
                  : isStation
                  ? '5px solid #1e3a8a'
                  : '5px solid rgba(15, 23, 42, 0.85)'
              }}
            />
          </div>
        );
      })}

      {/* Controles de Câmera na tela */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          gap: '8px',
          zIndex: 30
        }}
      >
        <button
          className="btn-ghost glass-panel"
          onClick={() => {
            if (!threeRef.current || !containerRef.current) return;
            cameraState.current.zoom = Math.max(12, cameraState.current.zoom * 0.85);
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            const zm = cameraState.current.zoom;
            threeRef.current.camera.left = -zm * (w / h);
            threeRef.current.camera.right = zm * (w / h);
            threeRef.current.camera.top = zm;
            threeRef.current.camera.bottom = -zm;
            threeRef.current.camera.updateProjectionMatrix();
          }}
        >
          🔍 +
        </button>
        <button
          className="btn-ghost glass-panel"
          onClick={() => {
            if (!threeRef.current || !containerRef.current) return;
            cameraState.current.zoom = Math.min(50, cameraState.current.zoom * 1.15);
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            const zm = cameraState.current.zoom;
            threeRef.current.camera.left = -zm * (w / h);
            threeRef.current.camera.right = zm * (w / h);
            threeRef.current.camera.top = zm;
            threeRef.current.camera.bottom = -zm;
            threeRef.current.camera.updateProjectionMatrix();
          }}
        >
          🔍 -
        </button>
        <button className="btn-ghost glass-panel" onClick={centerOnStation}>
          Focar Delegacia
        </button>
      </div>
    </div>
  );
};
