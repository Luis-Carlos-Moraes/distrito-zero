import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Cache em memória de modelos base
const modelCache = new Map<string, THREE.Group>();
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader();

export async function loadGLBModel(path: string): Promise<THREE.Group> {
  if (modelCache.has(path)) {
    return modelCache.get(path)!.clone(true);
  }

  return new Promise((resolve, reject) => {
    gltfLoader.load(
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

async function safeLoadFBX(path: string): Promise<THREE.Group | null> {
  return new Promise((resolve) => {
    fbxLoader.load(
      path,
      (group) => resolve(group),
      undefined,
      (err) => {
        console.warn(`Aviso: não foi possível carregar FBX ${path}:`, err);
        resolve(null);
      }
    );
  });
}

async function safeLoadAnim(path: string): Promise<THREE.AnimationClip | null> {
  return new Promise((resolve) => {
    fbxLoader.load(
      path,
      (group) => {
        if (group.animations && group.animations.length > 0) {
          resolve(group.animations[0]);
        } else {
          resolve(null);
        }
      },
      undefined,
      (err) => {
        console.warn(`Aviso: não foi possível carregar animação ${path}:`, err);
        resolve(null);
      }
    );
  });
}

function loadTexture(path: string): THREE.Texture {
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapLinearFilter;
  return tex;
}

export interface CharacterSkinTextures {
  male: THREE.Texture;
  female: THREE.Texture;
  criminal: THREE.Texture;
  cyborg: THREE.Texture;
}

export interface LoadedCityAssets {
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
  // Veículo 01: Ford Crown Victoria Police Interceptor
  crownVicBase: THREE.Group | null;
  crownVicBodyTexture: THREE.Texture;
  crownVicWheelTexture: THREE.Texture;
  crownVicLightTexture: THREE.Texture;
  // Veículo 02: Blindado Tático 09 (Home Police)
  armoredCarBase: THREE.Group | null;
  armoredTexture: THREE.Texture;
  // Personagens e Animações
  characterBase: THREE.Group | null;
  idleClip: THREE.AnimationClip | null;
  runClip: THREE.AnimationClip | null;
  skins: CharacterSkinTextures;
  // Novos Modelos de Construção e Personagens
  delegaciaBase: THREE.Group | null;
  hospitalBase: THREE.Group | null;
  penitentiaryBase: THREE.Group | null;
  parkingBase: THREE.Group | null;
  suspectBase: THREE.Group | null;
  suspectTexture: THREE.Texture;
  cityPackBase: THREE.Group | null;
  cityPackTexture: THREE.Texture;
}

let cachedCityAssets: LoadedCityAssets | null = null;

export async function preloadCityAssets(): Promise<LoadedCityAssets> {
  if (cachedCityAssets) return cachedCityAssets;

  const [
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
    characterBase,
    idleClip,
    runClip,
    crownVicBase,
    armoredCarBase,
    delegaciaBase,
    hospitalBase,
    penitentiaryBase,
    parkingBase,
    suspectBase,
    cityPackBase
  ] = await Promise.all([
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
    safeLoadFBX('/models/characters/Model/characterMedium.fbx'),
    safeLoadAnim('/models/characters/Animations/idle.fbx'),
    safeLoadAnim('/models/characters/Animations/run.fbx'),
    safeLoadFBX('/models/vehicles/crown_vic/crown_vic.fbx'),
    safeLoadFBX('/models/vehicles/armored/armored_vehicle.fbx'),
    safeLoadFBX('/models/buildings/delegacia/delegacia.fbx'),
    safeLoadFBX('/models/buildings/hospital/hospital.fbx'),
    safeLoadFBX('/models/buildings/penitentiary/penitentiary.fbx'),
    safeLoadFBX('/models/buildings/parking/parking.fbx'),
    safeLoadFBX('/models/characters/suspect/suspect.fbx'),
    safeLoadFBX('/models/city_pack/LowPoly_City_01Ready.fbx')
  ]);

  const skins: CharacterSkinTextures = {
    male: loadTexture('/models/characters/Skins/skaterMaleA.png'),
    female: loadTexture('/models/characters/Skins/skaterFemaleA.png'),
    criminal: loadTexture('/models/characters/Skins/criminalMaleA.png'),
    cyborg: loadTexture('/models/characters/Skins/cyborgFemaleA.png')
  };

  const crownVicBodyTexture = loadTexture('/models/vehicles/crown_vic/body.png');
  const crownVicWheelTexture = loadTexture('/models/vehicles/crown_vic/wheel.png');
  const crownVicLightTexture = loadTexture('/models/vehicles/crown_vic/roof_light.png');
  const armoredTexture = loadTexture('/models/vehicles/armored/TEXTURE.png');
  const suspectTexture = loadTexture('/models/characters/suspect/texture.png');
  const cityPackTexture = loadTexture('/models/city_pack/textures/color_1024x1024.jpg');

  // Higieniza modelos importados removendo planos de demonstração e luzes/câmeras embutidas
  if (hospitalBase) {
    const toRemove: THREE.Object3D[] = [];
    hospitalBase.traverse((child) => {
      if (child.name.toLowerCase().includes('plane') || (child as any).isCamera || (child as any).isLight) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => {
      if (c.parent) c.parent.remove(c);
    });
  }

  if (penitentiaryBase) {
    const toRemove: THREE.Object3D[] = [];
    penitentiaryBase.traverse((child) => {
      if ((child as any).isCamera || (child as any).isLight) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => {
      if (c.parent) c.parent.remove(c);
    });
  }

  if (delegaciaBase) {
    const toRemove: THREE.Object3D[] = [];
    delegaciaBase.traverse((child) => {
      if ((child as any).isCamera || (child as any).isLight) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => {
      if (c.parent) c.parent.remove(c);
    });
  }

  cachedCityAssets = {
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
    crownVicBase,
    crownVicBodyTexture,
    crownVicWheelTexture,
    crownVicLightTexture,
    armoredCarBase,
    armoredTexture,
    characterBase,
    idleClip,
    runClip,
    skins,
    delegaciaBase,
    hospitalBase,
    penitentiaryBase,
    parkingBase,
    suspectBase,
    suspectTexture,
    cityPackBase,
    cityPackTexture
  };

  return cachedCityAssets;
}

/**
 * Monta o modelo da Viatura 01: Ford Crown Victoria Police Interceptor
 */
export function createCrownVictoriaFromAssets(assets: LoadedCityAssets): {
  mesh: THREE.Group;
  wheels: THREE.Object3D[];
  sirenLightRed: THREE.PointLight;
  sirenLightBlue: THREE.PointLight;
} | null {
  if (!assets.crownVicBase) return null;

  const root = new THREE.Group();
  const car = assets.crownVicBase.clone(true);

  const bodyTex = assets.crownVicBodyTexture;
  const wheelTex = assets.crownVicWheelTexture;
  const lightTex = assets.crownVicLightTexture;

  car.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const name = mesh.name.toLowerCase();
      let tex = bodyTex;
      if (name.includes('wheel') || name.includes('tire') || name.includes('rim') || name.includes('roda')) {
        tex = wheelTex;
      } else if (name.includes('light') || name.includes('siren') || name.includes('bar') || name.includes('roof')) {
        tex = lightTex;
      }

      mesh.material = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.45,
        metalness: 0.25
      });
    }
  });

  const bbox = new THREE.Box3().setFromObject(car);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  if (size.x > size.z) {
    car.rotation.y = Math.PI / 2;
  }

  // Sedan de patrulha proporcional: ~2.1 unidades de comprimento
  const lengthDim = Math.max(size.x, size.z);
  const targetLength = 2.1;
  const scale = targetLength / Math.max(0.001, lengthDim);
  car.scale.set(scale, scale, scale);

  const scaledBbox = new THREE.Box3().setFromObject(car);
  if (scaledBbox.min.y < -0.001) {
    car.position.y = -scaledBbox.min.y;
  }

  root.add(car);

  const wheels: THREE.Object3D[] = [];
  car.traverse((child) => {
    const name = child.name.toLowerCase();
    if (name.includes('wheel') || name.includes('tire') || name.includes('roda')) {
      wheels.push(child);
    }
  });

  const sirenLightRed = new THREE.PointLight(0xef4444, 0, 8);
  sirenLightRed.position.set(0.28, 0.95, 0.0);
  root.add(sirenLightRed);

  const sirenLightBlue = new THREE.PointLight(0x38bdf8, 0, 8);
  sirenLightBlue.position.set(-0.28, 0.95, 0.0);
  root.add(sirenLightBlue);

  return { mesh: root, wheels, sirenLightRed, sirenLightBlue };
}

/**
 * Monta o modelo da Viatura 02: Blindado Tático 09 (Home Police)
 */
export function createArmoredVehicleFromAssets(assets: LoadedCityAssets): {
  mesh: THREE.Group;
  wheels: THREE.Object3D[];
  sirenLightRed: THREE.PointLight;
  sirenLightBlue: THREE.PointLight;
} | null {
  if (!assets.armoredCarBase) return null;

  const root = new THREE.Group();
  const car = assets.armoredCarBase.clone(true);

  const tex = assets.armoredTexture;
  car.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.55,
        metalness: 0.35
      });
    }
  });

  const bbox = new THREE.Box3().setFromObject(car);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  if (size.x > size.z) {
    car.rotation.y = Math.PI / 2;
  }

  const maxDim = Math.max(size.x, size.z);
  const targetLength = 2.3;
  const scale = targetLength / Math.max(0.001, maxDim);
  car.scale.set(scale, scale, scale);

  const scaledBbox = new THREE.Box3().setFromObject(car);
  if (scaledBbox.min.y < -0.001) {
    car.position.y = -scaledBbox.min.y;
  }

  root.add(car);

  const wheels: THREE.Object3D[] = [];
  car.traverse((child) => {
    const name = child.name.toLowerCase();
    if (name.includes('wheel') || name.includes('tire') || name.includes('roda')) {
      wheels.push(child);
    }
  });

  const sirenLightRed = new THREE.PointLight(0xef4444, 0, 8);
  sirenLightRed.position.set(0.35, 1.25, 0.0);
  root.add(sirenLightRed);

  const sirenLightBlue = new THREE.PointLight(0x38bdf8, 0, 8);
  sirenLightBlue.position.set(-0.35, 1.25, 0.0);
  root.add(sirenLightBlue);

  return { mesh: root, wheels, sirenLightRed, sirenLightBlue };
}

export interface CharacterInstance {
  mesh: THREE.Group;
  mixer?: THREE.AnimationMixer;
  update: (delta: number) => void;
}

/**
 * Cria uma instância de personagem animado (civil, policial ou criminoso)
 */
export function createCharacterInstance(
  assets: LoadedCityAssets,
  skinType: 'male' | 'female' | 'criminal' | 'cyborg' = 'male',
  animation: 'idle' | 'run' = 'idle'
): CharacterInstance | null {
  if (!assets.characterBase) return null;

  // Clona com esqueleto independente
  const root = SkeletonUtils.clone(assets.characterBase) as THREE.Group;

  // Seleciona a textura
  const skinTexture = assets.skins[skinType] || assets.skins.male;

  // Aplica o material na malha com textura e sombras
  root.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
      const mesh = child as THREE.SkinnedMesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = new THREE.MeshStandardMaterial({
        map: skinTexture,
        roughness: 0.75,
        metalness: 0.05
      });
    }
  });

  // Normalização precisa de altura e alinhamento dos pés ao chão
  const bbox = new THREE.Box3().setFromObject(root);
  const currentHeight = Math.max(0.001, bbox.max.y - bbox.min.y);
  const targetHeight = 1.05; // Altura proporcional estilizada
  const scale = targetHeight / currentHeight;
  root.scale.set(scale, scale, scale);

  // Container pai para isolar a posição mundial do offset dos pés
  const container = new THREE.Group();
  container.add(root);

  // Se a origem do modelo estiver no quadril, elevar para que os pés fiquem no chão
  const minY = bbox.min.y * scale;
  if (minY < -0.001) {
    root.position.y = -minY;
  }

  // Animação FBX
  let mixer: THREE.AnimationMixer | undefined;
  const clip = animation === 'run' ? assets.runClip : assets.idleClip;

  if (clip) {
    mixer = new THREE.AnimationMixer(root);
    const action = mixer.clipAction(clip);
    action.play();
  }

  const update = (delta: number) => {
    if (mixer) {
      mixer.update(delta);
    }
  };

  return { mesh: container, mixer, update };
}

/**
 * Cria a nova Delegacia Policial Realista FBX
 */
export function createRealPoliceStation(assets: LoadedCityAssets): THREE.Group | null {
  if (!assets.delegaciaBase) return null;
  const root = new THREE.Group();
  const bldg = assets.delegaciaBase.clone(true);

  // Limpa câmeras e luzes embutidas no arquivo FBX se houver
  const toRemove: THREE.Object3D[] = [];
  bldg.traverse((child) => {
    if ((child as any).isCamera || (child as any).isLight) {
      toRemove.push(child);
    }
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  toRemove.forEach((c) => c.parent?.remove(c));

  const bbox = new THREE.Box3().setFromObject(bldg);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const targetHeight = 3.8;
  const currentHeight = Math.max(0.001, size.y);
  const scale = targetHeight / currentHeight;
  bldg.scale.set(scale, scale, scale);

  const scaledBbox = new THREE.Box3().setFromObject(bldg);
  if (scaledBbox.min.y < -0.001) {
    bldg.position.y = -scaledBbox.min.y;
  }

  root.add(bldg);
  return root;
}

/**
 * Cria o novo Hospital Geral Realista FBX (com letreiro e heliponto)
 */
export function createRealHospital(assets: LoadedCityAssets): THREE.Group | null {
  if (!assets.hospitalBase) return null;
  const root = new THREE.Group();
  const bldg = assets.hospitalBase.clone(true);

  // Remove chão escuro de demonstração ("Plane") e câmeras/luzes embutidas
  const toRemove: THREE.Object3D[] = [];
  bldg.traverse((child) => {
    if (child.name.toLowerCase() === 'plane' || (child as any).isCamera || (child as any).isLight) {
      toRemove.push(child);
    }
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  toRemove.forEach((c) => c.parent?.remove(c));

  const bbox = new THREE.Box3().setFromObject(bldg);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  // Proporção harmônica para o quarteirão
  const targetHeight = 4.2;
  const currentHeight = Math.max(0.001, size.y);
  const scale = targetHeight / currentHeight;
  bldg.scale.set(scale, scale, scale);

  // Centraliza a origem no chão
  const scaledBbox = new THREE.Box3().setFromObject(bldg);
  const center = new THREE.Vector3();
  scaledBbox.getCenter(center);
  bldg.position.x = -center.x;
  bldg.position.z = -center.z;
  if (scaledBbox.min.y < -0.001) {
    bldg.position.y = -scaledBbox.min.y;
  }

  root.add(bldg);
  return root;
}

/**
 * Cria o novo Presídio / Penitenciária Regional FBX
 */
export function createRealPenitentiary(assets: LoadedCityAssets): THREE.Group | null {
  if (!assets.penitentiaryBase) return null;
  const root = new THREE.Group();
  const bldg = assets.penitentiaryBase.clone(true);

  const toRemove: THREE.Object3D[] = [];
  bldg.traverse((child) => {
    if ((child as any).isCamera || (child as any).isLight) {
      toRemove.push(child);
    }
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  toRemove.forEach((c) => c.parent?.remove(c));

  const bbox = new THREE.Box3().setFromObject(bldg);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const targetWidth = 5.2;
  const currentWidth = Math.max(0.001, size.x, size.z);
  const scale = targetWidth / currentWidth;
  bldg.scale.set(scale, scale, scale);

  const scaledBbox = new THREE.Box3().setFromObject(bldg);
  if (scaledBbox.min.y < -0.001) {
    bldg.position.y = -scaledBbox.min.y;
  }

  root.add(bldg);
  return root;
}

/**
 * Cria o Estacionamento das Viaturas Policiais FBX
 */
export function createRealParkingLot(assets: LoadedCityAssets): THREE.Group | null {
  if (!assets.parkingBase) return null;
  const root = new THREE.Group();
  const park = assets.parkingBase.clone(true);

  park.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.receiveShadow = true;
      if (mesh.material) {
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const color = (mat as any).color ? (mat as any).color.clone() : new THREE.Color(0x334155);
        mesh.material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.85,
          metalness: 0.05
        });
      }
    }
  });

  const bbox = new THREE.Box3().setFromObject(park);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const targetWidth = 6.4;
  const currentMax = Math.max(0.001, size.x, size.z);
  const scale = targetWidth / currentMax;
  park.scale.set(scale, scale, scale);

  const scaledBbox = new THREE.Box3().setFromObject(park);
  if (scaledBbox.min.y < -0.001) {
    park.position.y = -scaledBbox.min.y;
  }

  root.add(park);
  return root;
}

/**
 * Cria o Suspeito / Criminoso urbano 3D com texturas e animação
 */
export function createSuspectInstance(assets: LoadedCityAssets): CharacterInstance | null {
  if (!assets.suspectBase) return null;
  const root = SkeletonUtils.clone(assets.suspectBase) as THREE.Group;

  root.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh || (child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = new THREE.MeshStandardMaterial({
        map: assets.suspectTexture,
        roughness: 0.65,
        metalness: 0.15
      });
    }
  });

  const bbox = new THREE.Box3().setFromObject(root);
  const currentHeight = Math.max(0.001, bbox.max.y - bbox.min.y);
  const targetHeight = 1.15;
  const scale = targetHeight / currentHeight;
  root.scale.set(scale, scale, scale);

  const container = new THREE.Group();
  container.add(root);

  const minY = bbox.min.y * scale;
  if (minY < -0.001) {
    root.position.y = -minY;
  }

  let mixer: THREE.AnimationMixer | undefined;
  if (assets.suspectBase.animations && assets.suspectBase.animations.length > 0) {
    mixer = new THREE.AnimationMixer(root);
    const clip = assets.suspectBase.animations[0];
    const action = mixer.clipAction(clip);
    action.play();
  }

  const update = (delta: number) => {
    if (mixer) {
      mixer.update(delta);
    }
  };

  return { mesh: container, mixer, update };
}

