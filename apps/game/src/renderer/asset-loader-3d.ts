import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache em memória de modelos base
const modelCache = new Map<string, THREE.Group>();
const loader = new GLTFLoader();

export async function loadGLBModel(path: string): Promise<THREE.Group> {
  if (modelCache.has(path)) {
    return modelCache.get(path)!.clone(true);
  }

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const root = gltf.scene;

        // Otimizar sombras e nitidez de texturas low-poly
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.max(0.35, mat.roughness ?? 0.5);
              mat.metalness = Math.min(0.2, mat.metalness ?? 0.1);
              if (mat.map) {
                mat.map.magFilter = THREE.NearestFilter;
                mat.map.minFilter = THREE.NearestMipmapLinearFilter;
                mat.map.colorSpace = THREE.SRGBColorSpace;
              }
            }
          }
        });

        modelCache.set(path, root);
        resolve(root.clone(true));
      },
      undefined,
      (error) => {
        console.error(`Erro ao carregar modelo GLB ${path}:`, error);
        reject(error);
      }
    );
  });
}

export interface LoadedCityAssets {
  policeCarBase: THREE.Group;
  roadStraight: THREE.Group;
  roadCrossroad: THREE.Group;
  roadBend: THREE.Group;
  streetLight: THREE.Group;
  trafficLight: THREE.Group;
  stationBuilding: THREE.Group;
  buildingA: THREE.Group;
  buildingB: THREE.Group;
  buildingC: THREE.Group;
  buildingD: THREE.Group;
  buildingE: THREE.Group;
  buildingSkyscraper: THREE.Group;
  taxi: THREE.Group;
  sedan: THREE.Group;
}

let cachedCityAssets: LoadedCityAssets | null = null;

export async function preloadCityAssets(): Promise<LoadedCityAssets> {
  if (cachedCityAssets) return cachedCityAssets;

  const [
    policeCarBase,
    roadStraight,
    roadCrossroad,
    roadBend,
    streetLight,
    trafficLight,
    stationBuilding,
    buildingA,
    buildingB,
    buildingC,
    buildingD,
    buildingE,
    buildingSkyscraper,
    taxi,
    sedan
  ] = await Promise.all([
    loadGLBModel('/models/vehicles/police.glb'),
    loadGLBModel('/models/roads/road-straight.glb'),
    loadGLBModel('/models/roads/road-crossroad.glb'),
    loadGLBModel('/models/roads/road-bend.glb'),
    loadGLBModel('/models/roads/light-curved.glb'),
    loadGLBModel('/models/roads/traffic-light.glb'),
    loadGLBModel('/models/buildings/building-h.glb'),
    loadGLBModel('/models/buildings/building-a.glb'),
    loadGLBModel('/models/buildings/building-b.glb'),
    loadGLBModel('/models/buildings/building-c.glb'),
    loadGLBModel('/models/buildings/building-d.glb'),
    loadGLBModel('/models/buildings/building-e.glb'),
    loadGLBModel('/models/buildings/building-skyscraper-a.glb'),
    loadGLBModel('/models/vehicles/taxi.glb'),
    loadGLBModel('/models/vehicles/sedan.glb')
  ]);

  cachedCityAssets = {
    policeCarBase,
    roadStraight,
    roadCrossroad,
    roadBend,
    streetLight,
    trafficLight,
    stationBuilding,
    buildingA,
    buildingB,
    buildingC,
    buildingD,
    buildingE,
    buildingSkyscraper,
    taxi,
    sedan
  };

  return cachedCityAssets;
}

/**
 * Monta o modelo completo da Viatura Policial com rodas funcionais e luzes do giroflex
 */
export function createPoliceCruiserFromAssets(assets: LoadedCityAssets): {
  mesh: THREE.Group;
  wheels: THREE.Object3D[];
  sirenLightRed: THREE.PointLight;
  sirenLightBlue: THREE.PointLight;
} {
  const root = new THREE.Group();
  const car = assets.policeCarBase.clone(true);
  car.scale.set(0.7, 0.7, 0.7);
  root.add(car);

  // Localizar as 4 rodas para permitir rotação realista na rolagem
  const wheels: THREE.Object3D[] = [];
  car.traverse((child) => {
    if (child.name.toLowerCase().includes('wheel')) {
      wheels.push(child);
    }
  });

  // Luzes do Giroflex na barra superior do teto (Y ~ 0.8 no espaço escalado)
  const sirenLightRed = new THREE.PointLight(0xef4444, 0, 8);
  sirenLightRed.position.set(0.2, 0.85, 0.0);
  root.add(sirenLightRed);

  const sirenLightBlue = new THREE.PointLight(0x38bdf8, 0, 8);
  sirenLightBlue.position.set(-0.2, 0.85, 0.0);
  root.add(sirenLightBlue);

  return { mesh: root, wheels, sirenLightRed, sirenLightBlue };
}
