import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameState } from '@distrito-zero/shared-types';
import {
  createCityGround,
  createCommercialBuildingMesh,
  createIncidentMarkerMesh,
  createPoliceCruiserMesh,
  createPoliceStationMesh,
  createResidentialBuildingMesh
} from './city-builder-3d.js';

interface IsometricViewport3DProps {
  state: GameState;
  onSelectIncident?: (incidentId: string) => void;
}

interface WorldPin {
  id: string;
  label: string;
  icon: string;
  badgeType: 'station' | 'commercial' | 'residential' | 'incident';
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const IsometricViewport3D: React.FC<IsometricViewport3DProps> = ({
  state
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [worldPins, setWorldPins] = useState<WorldPin[]>([]);

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

  // Câmera centrada na Delegacia Central (16, 16)
  const cameraState = useRef({
    targetX: 16,
    targetZ: 16,
    zoom: 16, // Zoom proporcional agradável
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // 1. Inicialização da Cena
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    // Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1726);

    // Câmera Ortográfica Isométrica Fixa (Ângulo de 45° horizontal e 35.264° vertical)
    const d = cameraState.current.zoom;
    const camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect, d, -d, 1, 1000
    );

    camera.position.set(cameraState.current.targetX + 35, 35, cameraState.current.targetZ + 35);
    camera.lookAt(cameraState.current.targetX, 0, cameraState.current.targetZ);

    // Renderer com sombras suaves
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Luz Solar Direcional 3D
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    sunLight.position.set(30, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    const shadowDist = 30;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    scene.add(sunLight);

    // Luz Ambiente
    const ambientLight = new THREE.AmbientLight(0x60a5fa, 0.45);
    scene.add(ambientLight);

    // 2. Adicionar o Terreno da Cidade (Grama, Avenidas Reais, Calçadas e Árvores)
    const cityGround = createCityGround();
    scene.add(cityGround);

    // 3. Adicionar a Viatura Policial
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

  // 2. Instanciação e Atualização dos Prédios 3D
  useEffect(() => {
    if (!threeRef.current) return;
    const { scene, buildingMeshes } = threeRef.current;
    const activeDistrict = state.districts[state.activeDistrictId];
    if (!activeDistrict) return;

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

        mesh.position.set(bldg.position.x * 4, 0.1, bldg.position.y * 4);
        scene.add(mesh);
        buildingMeshes.set(bldg.id, mesh);
      }
    }
  }, [state.districts, state.activeDistrictId]);

  // 3. Loop de Renderização e Animação
  useEffect(() => {
    let animId: number;

    const animate = () => {
      if (!threeRef.current || !containerRef.current) return;
      const { scene, camera, renderer, sunLight, ambientLight, cruiserObj, incidentMarkers } = threeRef.current;

      const timeMinutes = state.clock.timeOfDayMinutes;

      // Ciclo Dia / Noite Suave
      if (timeMinutes >= 360 && timeMinutes < 1080) {
        // Dia (06:00 - 18:00)
        sunLight.color.setHex(0xfff7ed);
        sunLight.intensity = 1.35;
        ambientLight.color.setHex(0x60a5fa);
        ambientLight.intensity = 0.5;
        scene.background = new THREE.Color(0x0e1726);
      } else if (timeMinutes >= 1080 && timeMinutes < 1200) {
        // Pôr do sol (18:00 - 20:00)
        sunLight.color.setHex(0xf59e0b);
        sunLight.intensity = 0.95;
        ambientLight.color.setHex(0xb45309);
        ambientLight.intensity = 0.35;
        scene.background = new THREE.Color(0x1e102a);
      } else {
        // Noite (20:00 - 06:00)
        sunLight.color.setHex(0x38bdf8);
        sunLight.intensity = 0.3;
        ambientLight.color.setHex(0x1e3a8a);
        ambientLight.intensity = 0.2;
        scene.background = new THREE.Color(0x030712);
      }

      // Atualizar Viatura Policial 3D
      const primaryVehicle = Object.values(state.vehicles)[0];
      if (primaryVehicle && cruiserObj) {
        const targetWorldX = primaryVehicle.position.x * 4;
        const targetWorldZ = primaryVehicle.position.y * 4;

        const dx = targetWorldX - cruiserObj.mesh.position.x;
        const dz = targetWorldZ - cruiserObj.mesh.position.z;

        cruiserObj.mesh.position.x += dx * 0.15;
        cruiserObj.mesh.position.z += dz * 0.15;

        // Rotação suave do veículo alinhada à direção do movimento
        if (Math.hypot(dx, dz) > 0.05) {
          const targetRotation = Math.atan2(dx, dz);
          cruiserObj.mesh.rotation.y = THREE.MathUtils.lerp(
            cruiserObj.mesh.rotation.y,
            targetRotation,
            0.2
          );
        }

        // Giroflex piscante apenas se em missão
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

      // Marcadores de Ocorrência 3D no Mapa
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
            marker.rotation.y += 0.04;
          }
        }
      }

      for (const [id, marker] of incidentMarkers.entries()) {
        if (!activeIncidents.some((i) => i.id === id)) {
          scene.remove(marker);
          incidentMarkers.delete(id);
        }
      }

      // Calcular Posições de Pinos Sutis (Discretos e Não Sobrepostos)
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const pins: WorldPin[] = [];

      const activeDistrict = state.districts[state.activeDistrictId];
      if (activeDistrict) {
        for (const bldg of activeDistrict.buildings) {
          const pos = new THREE.Vector3(bldg.position.x * 4, 3.8, bldg.position.y * 4);
          pos.project(camera);

          const screenX = (pos.x * 0.5 + 0.5) * w;
          const screenY = (pos.y * -0.5 + 0.5) * h;

          pins.push({
            id: bldg.id,
            label: bldg.type === 'station' ? 'DELEGACIA' : bldg.name.replace(/ \(.*\)/, ''),
            icon: bldg.type === 'station' ? '🛡️' : bldg.type === 'commercial' ? '🏪' : '🏠',
            badgeType: bldg.type === 'station' ? 'station' : 'commercial',
            screenX,
            screenY,
            visible: pos.z < 1
          });
        }
      }

      for (const inc of activeIncidents) {
        const pos = new THREE.Vector3(inc.location.x * 4, 3.2, inc.location.y * 4);
        pos.project(camera);

        pins.push({
          id: inc.id,
          label: inc.title.split(' ')[0].toUpperCase(),
          icon: '🚨',
          badgeType: 'incident',
          screenX: (pos.x * 0.5 + 0.5) * w,
          screenY: (pos.y * -0.5 + 0.5) * h,
          visible: pos.z < 1
        });
      }

      setWorldPins(pins);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animId);
  }, [state]);

  // Controles de Câmera: Pan (Arrastar suavemente)
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

    const factor = 0.035;
    cameraState.current.targetX -= (deltaX - deltaY) * factor;
    cameraState.current.targetZ -= (-deltaX - deltaY) * factor;

    const { camera } = threeRef.current;
    camera.position.set(cameraState.current.targetX + 35, 35, cameraState.current.targetZ + 35);
    camera.lookAt(cameraState.current.targetX, 0, cameraState.current.targetZ);
  };

  const handleMouseUp = () => {
    cameraState.current.isDragging = false;
  };

  // Zoom da Câmera
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!threeRef.current || !containerRef.current) return;

    const zoomStep = e.deltaY < 0 ? 0.92 : 1.08;
    cameraState.current.zoom = Math.max(10, Math.min(35, cameraState.current.zoom * zoomStep));

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
    cameraState.current.zoom = 16;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const asp = w / h;

    const { camera } = threeRef.current;
    camera.position.set(51, 35, 51);
    camera.lookAt(16, 0, 16);
    camera.left = -16 * asp;
    camera.right = 16 * asp;
    camera.top = 16;
    camera.bottom = -16;
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
      {/* Pinos Sutis e Elegantes (Estilo Mockup Limpo) */}
      {worldPins.map((pin) => {
        if (!pin.visible) return null;

        const isStation = pin.badgeType === 'station';
        const isIncident = pin.badgeType === 'incident';

        return (
          <div
            key={pin.id}
            style={{
              position: 'absolute',
              left: pin.screenX,
              top: pin.screenY,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: isIncident ? 40 : 20,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isIncident
                ? 'rgba(220, 38, 38, 0.9)'
                : isStation
                ? 'rgba(30, 58, 138, 0.9)'
                : 'rgba(15, 23, 42, 0.75)',
              border: isIncident
                ? '1px solid #ef4444'
                : isStation
                ? '1px solid #3b82f6'
                : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '2px 8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <span style={{ fontSize: '0.65rem' }}>{pin.icon}</span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}
            >
              {pin.label}
            </span>
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
            cameraState.current.zoom = Math.max(10, cameraState.current.zoom * 0.88);
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
            cameraState.current.zoom = Math.min(35, cameraState.current.zoom * 1.12);
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
