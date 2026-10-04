import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameState } from '@distrito-zero/shared-types';
import {
  LoadedCityAssets,
  preloadCityAssets,
  createPoliceCruiserFromAssets
} from './asset-loader-3d.js';
import {
  createCityGroundWithKenneyAssets,
  createPoliceStationMeshFromAssets,
  createCommercialBuildingFromAssets,
  createResidentialBuildingFromAssets,
  createIncidentMarkerMesh
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
  state,
  onSelectIncident
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [worldPins, setWorldPins] = useState<WorldPin[]>([]);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Referência para os assets Kenney carregados
  const assetsRef = useRef<LoadedCityAssets | null>(null);

  // Referências persistentes do Three.js
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    sunLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    cruiserObj?: {
      mesh: THREE.Group;
      wheels: THREE.Object3D[];
      sirenLightRed: THREE.PointLight;
      sirenLightBlue: THREE.PointLight;
    };
    incidentMarkers: Map<string, THREE.Group>;
    buildingMeshes: Map<string, THREE.Group>;
    clock: THREE.Clock;
  } | null>(null);

  // Estado da Câmera: Centrada na Delegacia Central (16, 16)
  const cameraState = useRef({
    targetX: 18,
    targetZ: 18,
    zoom: 16,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // Estado dinâmico do jogo acessível pelo loop 60 FPS
  const gameStateRef = useRef(state);
  useEffect(() => {
    gameStateRef.current = state;
  }, [state]);

  // 1. Carregamento dos Modelos 3D Kenney
  useEffect(() => {
    let isCancelled = false;

    preloadCityAssets()
      .then((assets) => {
        if (!isCancelled) {
          assetsRef.current = assets;
          setAssetsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Falha ao pré-carregar modelos 3D Kenney:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Inicialização da Cena Three.js após o carregamento dos assets
  useEffect(() => {
    if (!assetsLoaded || !assetsRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;
    const assets = assetsRef.current;

    // Cena com cor de fundo profunda
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    // Câmera Ortográfica Isométrica Fixa (Projeção Axonométrica Limpa)
    const zm = cameraState.current.zoom;
    const camera = new THREE.OrthographicCamera(
      -zm * aspect, zm * aspect, zm, -zm, 1, 1000
    );
    camera.position.set(
      cameraState.current.targetX + 38,
      38,
      cameraState.current.targetZ + 38
    );
    camera.lookAt(cameraState.current.targetX, 0, cameraState.current.targetZ);

    // Renderer com sombras suaves e SRGB
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Iluminação Solar Direcional
    const sunLight = new THREE.DirectionalLight(0xfff6ea, 1.45);
    sunLight.position.set(35, 48, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 140;
    const shadowDist = 32;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Luz Ambiente e Hemisphere Fill Light para sombras suaves
    const ambientLight = new THREE.AmbientLight(0x7dd3fc, 0.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x1e293b, 0.65);
    scene.add(hemiLight);

    // Terreno e Ruas Kenney
    const cityGround = createCityGroundWithKenneyAssets(assets);
    scene.add(cityGround);

    // Viatura Policial Kenney
    const cruiser = createPoliceCruiserFromAssets(assets);
    cruiser.mesh.position.set(16, 0.05, 16);
    cruiser.mesh.rotation.y = Math.PI / 2; // Alinhada à pista
    scene.add(cruiser.mesh);

    const clock = new THREE.Clock();

    threeRef.current = {
      scene,
      camera,
      renderer,
      sunLight,
      ambientLight,
      cruiserObj: cruiser,
      incidentMarkers: new Map(),
      buildingMeshes: new Map(),
      clock
    };

    // Redimensionamento de janela
    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const asp = w / h;
      const currentZoom = cameraState.current.zoom;

      threeRef.current.camera.left = -currentZoom * asp;
      threeRef.current.camera.right = currentZoom * asp;
      threeRef.current.camera.top = currentZoom;
      threeRef.current.camera.bottom = -currentZoom;
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
      threeRef.current = null;
    };
  }, [assetsLoaded]);

  // 3. Atualização e Instanciação dos Prédios Kenney da Cidade
  useEffect(() => {
    if (!threeRef.current || !assetsRef.current) return;
    const { scene, buildingMeshes } = threeRef.current;
    const assets = assetsRef.current;
    const activeDistrict = state.districts[state.activeDistrictId];
    if (!activeDistrict) return;

    for (const bldg of activeDistrict.buildings) {
      if (!buildingMeshes.has(bldg.id)) {
        let mesh: THREE.Group;
        if (bldg.type === 'station') {
          mesh = createPoliceStationMeshFromAssets(assets);
        } else if (bldg.type === 'commercial') {
          mesh = createCommercialBuildingFromAssets(bldg.id, bldg.stage, assets);
        } else {
          mesh = createResidentialBuildingFromAssets(bldg.id, bldg.stage, assets);
        }

        mesh.position.set(bldg.position.x * 4, 0.02, bldg.position.y * 4);
        scene.add(mesh);
        buildingMeshes.set(bldg.id, mesh);
      }
    }
  }, [assetsLoaded, state.districts, state.activeDistrictId]);

  // 4. Loop de Renderização e Animação Fluida a 60 FPS
  useEffect(() => {
    if (!assetsLoaded) return;
    let animId: number;

    const animate = () => {
      if (!threeRef.current || !containerRef.current) return;
      const {
        scene,
        camera,
        renderer,
        sunLight,
        ambientLight,
        cruiserObj,
        incidentMarkers,
        clock
      } = threeRef.current;

      const delta = Math.min(clock.getDelta(), 0.1);
      const currentState = gameStateRef.current;
      const timeMinutes = currentState.clock.timeOfDayMinutes;

      // Ciclo de Iluminação Dia / Entardecer / Noite
      if (timeMinutes >= 360 && timeMinutes < 1080) {
        // Dia (06:00 - 18:00)
        sunLight.color.setHex(0xfff7ed);
        sunLight.intensity = 1.4;
        ambientLight.color.setHex(0x93c5fd);
        ambientLight.intensity = 0.5;
        scene.background = new THREE.Color(0x0b1329);
      } else if (timeMinutes >= 1080 && timeMinutes < 1200) {
        // Pôr do sol (18:00 - 20:00)
        sunLight.color.setHex(0xf59e0b);
        sunLight.intensity = 1.0;
        ambientLight.color.setHex(0xb45309);
        ambientLight.intensity = 0.38;
        scene.background = new THREE.Color(0x1a102f);
      } else {
        // Noite (20:00 - 06:00)
        sunLight.color.setHex(0x38bdf8);
        sunLight.intensity = 0.32;
        ambientLight.color.setHex(0x1e3a8a);
        ambientLight.intensity = 0.22;
        scene.background = new THREE.Color(0x030712);
      }

      // 5. Movimentação Contínua da Viatura Policial a 60 FPS (Zero Pulos)
      const primaryVehicle = Object.values(currentState.vehicles)[0];
      if (primaryVehicle && cruiserObj) {
        const targetWorldX = primaryVehicle.position.x * 4;
        const targetWorldZ = primaryVehicle.position.y * 4;

        const dx = targetWorldX - cruiserObj.mesh.position.x;
        const dz = targetWorldZ - cruiserObj.mesh.position.z;
        const dist = Math.hypot(dx, dz);

        // Velocidade suave no mundo 3D proporcional à velocidade da viatura
        const speed = 7.0 * (primaryVehicle.speed || 1.8);
        const maxMove = speed * delta;

        if (dist > 0.04) {
          const step = Math.min(dist, maxMove);
          cruiserObj.mesh.position.x += (dx / dist) * step;
          cruiserObj.mesh.position.z += (dz / dist) * step;

          // Rotação suave contínua em direção ao deslocamento
          const targetAngle = Math.atan2(dx, dz);
          let diff = targetAngle - cruiserObj.mesh.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          cruiserObj.mesh.rotation.y += diff * Math.min(1.0, 12.0 * delta);

          // Rotação física realista das 4 rodas ao andar
          for (const wheel of cruiserObj.wheels) {
            wheel.rotation.x += step * 3.5;
          }
        }

        // Giroflex Policial (Giro alternado vermelho e azul quando em missão)
        const isDispatched =
          primaryVehicle.status === 'dispatched' || primaryVehicle.status === 'on_scene';

        if (isDispatched) {
          const strobe = Math.floor(Date.now() / 110) % 2 === 0;
          cruiserObj.sirenLightRed.intensity = strobe ? 4.5 : 0.0;
          cruiserObj.sirenLightBlue.intensity = strobe ? 0.0 : 4.5;
        } else {
          cruiserObj.sirenLightRed.intensity = 0;
          cruiserObj.sirenLightBlue.intensity = 0;
        }
      }

      // 6. Marcadores 3D de Ocorrência na Pista
      const activeIncidents = Object.values(currentState.incidents).filter(
        (i) => i.status !== 'resolved' && i.status !== 'failed'
      );

      for (const inc of activeIncidents) {
        if (!incidentMarkers.has(inc.id)) {
          const marker = createIncidentMarkerMesh();
          marker.position.set(inc.location.x * 4, 0.04, inc.location.y * 4);
          scene.add(marker);
          incidentMarkers.set(inc.id, marker);
        } else {
          const marker = incidentMarkers.get(inc.id);
          if (marker) {
            marker.rotation.y += 0.035;
          }
        }
      }

      for (const [id, marker] of incidentMarkers.entries()) {
        if (!activeIncidents.some((i) => i.id === id)) {
          scene.remove(marker);
          incidentMarkers.delete(id);
        }
      }

      // 7. Cálculo das Posições dos Pinos de Interface na Tela
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const pins: WorldPin[] = [];

      const activeDistrict = currentState.districts[currentState.activeDistrictId];
      if (activeDistrict) {
        for (const bldg of activeDistrict.buildings) {
          const pos = new THREE.Vector3(bldg.position.x * 4, 3.4, bldg.position.y * 4);
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
  }, [assetsLoaded]);

  // Controles de Câmera: Pan (Arrastar pelo mouse)
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
    camera.position.set(
      cameraState.current.targetX + 38,
      38,
      cameraState.current.targetZ + 38
    );
    camera.lookAt(cameraState.current.targetX, 0, cameraState.current.targetZ);
  };

  const handleMouseUp = () => {
    cameraState.current.isDragging = false;
  };

  // Zoom da Câmera por Scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!threeRef.current || !containerRef.current) return;

    const zoomStep = e.deltaY < 0 ? 0.92 : 1.08;
    cameraState.current.zoom = Math.max(10, Math.min(32, cameraState.current.zoom * zoomStep));

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

  // Centralizar na Delegacia
  const centerOnStation = () => {
    if (!threeRef.current || !containerRef.current) return;
    cameraState.current.targetX = 18;
    cameraState.current.targetZ = 18;
    cameraState.current.zoom = 16;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const asp = w / h;

    const { camera } = threeRef.current;
    camera.position.set(56, 38, 56);
    camera.lookAt(18, 0, 18);
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
      {/* Tela de Carregamento dos Assets Kenney 3D */}
      {!assetsLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            color: '#f8fafc',
            fontFamily: 'var(--font-display)'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '16px'
            }}
          />
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em' }}>
            CARREGANDO DISTRITO ZERO 3D
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
            Inicializando modelos Kenney Low Poly, asfalto e viaturas...
          </div>
        </div>
      )}

      {/* Pinos Sutis Flutuantes sobre os Prédios e Ocorrências */}
      {worldPins.map((pin) => {
        if (!pin.visible) return null;

        const isStation = pin.badgeType === 'station';
        const isIncident = pin.badgeType === 'incident';

        return (
          <div
            key={pin.id}
            onClick={() => isIncident && onSelectIncident && onSelectIncident(pin.id)}
            style={{
              position: 'absolute',
              left: pin.screenX,
              top: pin.screenY,
              transform: 'translate(-50%, -100%)',
              cursor: isIncident ? 'pointer' : 'default',
              pointerEvents: isIncident ? 'auto' : 'none',
              zIndex: isIncident ? 40 : 20,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: isIncident
                ? 'rgba(220, 38, 38, 0.92)'
                : isStation
                ? 'rgba(30, 58, 138, 0.92)'
                : 'rgba(15, 23, 42, 0.82)',
              border: isIncident
                ? '1px solid #ef4444'
                : isStation
                ? '1px solid #3b82f6'
                : '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '20px',
              padding: '2px 8px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(5px)',
              transition: 'transform 0.1s ease'
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>{pin.icon}</span>
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
            cameraState.current.zoom = Math.min(32, cameraState.current.zoom * 1.12);
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
          🎯 Focar Delegacia
        </button>
      </div>
    </div>
  );
};
