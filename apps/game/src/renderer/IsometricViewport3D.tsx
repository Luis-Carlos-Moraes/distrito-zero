import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameState } from '@distrito-zero/shared-types';
import {
  LoadedCityAssets,
  preloadCityAssets,
  createCrownVictoriaFromAssets,
  createArmoredVehicleFromAssets,
  createCharacterInstance,
  createSuspectInstance
} from './asset-loader-3d.js';
import {
  createCityGroundWithKenneyAssets,
  createPoliceStationMeshFromAssets,
  createCommercialBuildingFromAssets,
  createResidentialBuildingFromAssets,
  createHospitalBuildingFromAssets,
  createPenitentiaryBuildingFromAssets,
  createIncidentMarkerMesh
} from './city-builder-3d.js';

interface PedestrianTrack {
  mesh: THREE.Group;
  update: (delta: number) => void;
  walkData?: {
    axis: 'x' | 'z';
    min: number;
    max: number;
    speed: number;
    dir: number;
  };
}

interface Vehicle3DObject {
  mesh: THREE.Group;
  wheels: THREE.Object3D[];
  sirenLightRed: THREE.PointLight;
  sirenLightBlue: THREE.PointLight;
  parkOffset: { x: number; z: number };
}

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
    vehicles: Map<string, Vehicle3DObject>;
    incidentMarkers: Map<string, THREE.Group>;
    suspectCharacters: Map<string, { mesh: THREE.Group; update: (delta: number) => void }>;
    buildingMeshes: Map<string, THREE.Group>;
    pedestrians: PedestrianTrack[];
    clock: THREE.Clock;
  } | null>(null);

  // Estado da Câmera: Centrada na Delegacia com zoom aproximado para ver detalhes ricos
  const cameraState = useRef({
    targetX: 16.5,
    targetZ: 16.5,
    zoom: 7.2, // Câmera bem mais perto para ver todos os detalhes dos veículos e personagens
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

    // 3. Viaturas da Delegacia (Viatura 01 Sedan e Viatura 02 Blindado 09 Tático)
    const vehiclesMap = new Map<string, Vehicle3DObject>();

    // Viatura 01: Ford Crown Victoria Police Interceptor
    const crownVic = createCrownVictoriaFromAssets(assets);
    if (crownVic) {
      crownVic.mesh.position.set(16.0, 0.05, 15.4);
      crownVic.mesh.rotation.y = Math.PI / 2;
      scene.add(crownVic.mesh);
      vehiclesMap.set('veh-1', { ...crownVic, parkOffset: { x: 0, z: -0.6 } });
    }

    // Viatura 02: Blindado 09 Tático (Home Police)
    const armored = createArmoredVehicleFromAssets(assets);
    if (armored) {
      armored.mesh.position.set(17.3, 0.05, 15.4);
      armored.mesh.rotation.y = Math.PI / 2;
      scene.add(armored.mesh);
      vehiclesMap.set('veh-2', { ...armored, parkOffset: { x: 1.3, z: -0.6 } });
    }

    // 4. Criação de Personagens e Pedestres Animados (Kenney)
    const pedestrians: PedestrianTrack[] = [];

    // Oficial 1: Portaria da Delegacia (Guarda)
    const officer1 = createCharacterInstance(assets, 'male', 'idle');
    if (officer1) {
      officer1.mesh.position.set(14.4, 0.05, 14.2);
      officer1.mesh.rotation.y = Math.PI / 4;
      scene.add(officer1.mesh);
      pedestrians.push(officer1);
    }

    // Oficial 2: Pátio de Viaturas
    const officer2 = createCharacterInstance(assets, 'cyborg', 'idle');
    if (officer2) {
      officer2.mesh.position.set(17.6, 0.05, 14.8);
      officer2.mesh.rotation.y = -Math.PI / 3;
      scene.add(officer2.mesh);
      pedestrians.push(officer2);
    }

    // Pedestre 1: Calçada da Mercearia do Zé (Homem caminhando)
    const ped1 = createCharacterInstance(assets, 'male', 'run');
    if (ped1) {
      ped1.mesh.position.set(29.2, 0.04, 11.0);
      ped1.mesh.rotation.y = 0;
      scene.add(ped1.mesh);
      pedestrians.push({
        ...ped1,
        walkData: { axis: 'z', min: 10.0, max: 20.0, speed: 1.5, dir: 1 }
      });
    }

    // Pedestre 2: Calçada do Bloco Residencial Sul (Mulher caminhando)
    const ped2 = createCharacterInstance(assets, 'female', 'run');
    if (ped2) {
      ped2.mesh.position.set(24.0, 0.04, 29.2);
      ped2.mesh.rotation.y = Math.PI / 2;
      scene.add(ped2.mesh);
      pedestrians.push({
        ...ped2,
        walkData: { axis: 'x', min: 22.0, max: 32.0, speed: 1.4, dir: 1 }
      });
    }

    // Pedestre 3: Calçada da Oficina Central
    const ped3 = createCharacterInstance(assets, 'cyborg', 'run');
    if (ped3) {
      ped3.mesh.position.set(9.2, 0.04, 18.0);
      ped3.mesh.rotation.y = 0;
      scene.add(ped3.mesh);
      pedestrians.push({
        ...ped3,
        walkData: { axis: 'z', min: 16.0, max: 25.0, speed: 1.5, dir: 1 }
      });
    }

    // Pedestre 4: Calçada da Vila Esperança
    const ped4 = createCharacterInstance(assets, 'female', 'run');
    if (ped4) {
      ped4.mesh.position.set(11.0, 0.04, 5.2);
      ped4.mesh.rotation.y = Math.PI / 2;
      scene.add(ped4.mesh);
      pedestrians.push({
        ...ped4,
        walkData: { axis: 'x', min: 10.0, max: 18.0, speed: 1.3, dir: 1 }
      });
    }

    const clock = new THREE.Clock();

    threeRef.current = {
      scene,
      camera,
      renderer,
      sunLight,
      ambientLight,
      vehicles: vehiclesMap,
      incidentMarkers: new Map(),
      suspectCharacters: new Map(),
      buildingMeshes: new Map(),
      pedestrians,
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
        } else if (bldg.id === 'bldg-hospital') {
          mesh = createHospitalBuildingFromAssets(assets);
        } else if (bldg.id === 'bldg-penitentiary') {
          mesh = createPenitentiaryBuildingFromAssets(assets);
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

      // 5. Movimentação Contínua de Todas as Viaturas Policiais a 60 FPS
      const { vehicles } = threeRef.current;
      for (const [vehId, vehObj] of vehicles.entries()) {
        const vehState = currentState.vehicles[vehId];
        if (!vehState) continue;

        if (vehState.status === 'parked') {
          // Estacionado no pátio demarcado
          vehObj.mesh.position.set(
            16.0 + vehObj.parkOffset.x,
            0.05,
            16.0 + vehObj.parkOffset.z
          );
          vehObj.mesh.rotation.y = Math.PI / 2;
          vehObj.sirenLightRed.intensity = 0;
          vehObj.sirenLightBlue.intensity = 0;
        } else {
          // Deslocamento para ocorrência / retorno
          const targetWorldX = vehState.position.x * 4;
          const targetWorldZ = vehState.position.y * 4;

          const dx = targetWorldX - vehObj.mesh.position.x;
          const dz = targetWorldZ - vehObj.mesh.position.z;
          const dist = Math.hypot(dx, dz);

          const speed = 7.0 * (vehState.speed || 1.6);
          const maxMove = speed * delta;

          if (dist > 0.04) {
            const step = Math.min(dist, maxMove);
            vehObj.mesh.position.x += (dx / dist) * step;
            vehObj.mesh.position.z += (dz / dist) * step;

            const targetAngle = Math.atan2(dx, dz);
            let diff = targetAngle - vehObj.mesh.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            vehObj.mesh.rotation.y += diff * Math.min(1.0, 12.0 * delta);

            for (const wheel of vehObj.wheels) {
              wheel.rotation.x += step * 3.5;
            }
          }

          const isDispatched =
            vehState.status === 'dispatched' || vehState.status === 'on_scene';

          if (isDispatched) {
            const strobe = Math.floor(Date.now() / 110) % 2 === 0;
            vehObj.sirenLightRed.intensity = strobe ? 5.0 : 0.0;
            vehObj.sirenLightBlue.intensity = strobe ? 0.0 : 5.0;
          } else {
            vehObj.sirenLightRed.intensity = 0;
            vehObj.sirenLightBlue.intensity = 0;
          }
        }
      }

      // 6. Atualização dos Pedestres e Personagens (Movimentação e Animações)
      const { pedestrians, suspectCharacters } = threeRef.current;
      for (const char of pedestrians) {
        char.update(delta);

        if (char.walkData) {
          const { axis, min, max, speed } = char.walkData;
          if (axis === 'z') {
            char.mesh.position.z += char.walkData.dir * speed * delta;
            if (char.mesh.position.z >= max) {
              char.walkData.dir = -1;
              char.mesh.rotation.y = Math.PI;
            } else if (char.mesh.position.z <= min) {
              char.walkData.dir = 1;
              char.mesh.rotation.y = 0;
            }
          } else {
            char.mesh.position.x += char.walkData.dir * speed * delta;
            if (char.mesh.position.x >= max) {
              char.walkData.dir = -1;
              char.mesh.rotation.y = -Math.PI / 2;
            } else if (char.mesh.position.x <= min) {
              char.walkData.dir = 1;
              char.mesh.rotation.y = Math.PI / 2;
            }
          }
        }
      }

      for (const [_, susp] of suspectCharacters.entries()) {
        susp.update(delta);
      }

      // 7. Marcadores 3D e Suspeitos de Ocorrência na Pista
      const activeIncidents = Object.values(currentState.incidents).filter(
        (i) => i.status !== 'resolved' && i.status !== 'failed'
      );

      for (const inc of activeIncidents) {
        if (!incidentMarkers.has(inc.id)) {
          const marker = createIncidentMarkerMesh();
          marker.position.set(inc.location.x * 4, 0.04, inc.location.y * 4);
          scene.add(marker);
          incidentMarkers.set(inc.id, marker);

          // Suspeito na cena do crime (Modelo urbano 3D com texturas)
          if (assetsRef.current) {
            const suspect =
              createSuspectInstance(assetsRef.current) ||
              createCharacterInstance(assetsRef.current, 'criminal', 'idle');
            if (suspect) {
              suspect.mesh.position.set(
                inc.location.x * 4 + 0.6,
                0.04,
                inc.location.y * 4 + 0.6
              );
              suspect.mesh.rotation.y = Math.random() * Math.PI * 2;
              scene.add(suspect.mesh);
              suspectCharacters.set(inc.id, suspect);
            }
          }
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

          const suspect = suspectCharacters.get(id);
          if (suspect) {
            scene.remove(suspect.mesh);
            suspectCharacters.delete(id);
          }
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

          let label = bldg.name.replace(/ \(.*\)/, '');
          let icon = '🏠';
          let badgeType: 'station' | 'commercial' | 'residential' | 'incident' = 'residential';

          if (bldg.type === 'station') {
            label = 'DELEGACIA CENTRAL';
            icon = '🛡️';
            badgeType = 'station';
          } else if (bldg.id === 'bldg-hospital') {
            label = 'HOSPITAL GERAL';
            icon = '🏥';
            badgeType = 'commercial';
          } else if (bldg.id === 'bldg-penitentiary') {
            label = 'PRESÍDIO REGIONAL';
            icon = '⛓️';
            badgeType = 'station';
          } else if (bldg.type === 'commercial') {
            icon = '🏪';
            badgeType = 'commercial';
          }

          pins.push({
            id: bldg.id,
            label,
            icon,
            badgeType,
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

    const zoomStep = e.deltaY < 0 ? 0.90 : 1.10;
    cameraState.current.zoom = Math.max(3.5, Math.min(22, cameraState.current.zoom * zoomStep));

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
    cameraState.current.targetX = 16.5;
    cameraState.current.targetZ = 16.5;
    cameraState.current.zoom = 7.2;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const asp = w / h;
    const zm = cameraState.current.zoom;

    const { camera } = threeRef.current;
    camera.position.set(16.5 + 38, 38, 16.5 + 38);
    camera.lookAt(16.5, 0, 16.5);
    camera.left = -zm * asp;
    camera.right = zm * asp;
    camera.top = zm;
    camera.bottom = -zm;
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
            cameraState.current.zoom = Math.max(3.5, cameraState.current.zoom * 0.85);
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
            cameraState.current.zoom = Math.min(22, cameraState.current.zoom * 1.15);
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
