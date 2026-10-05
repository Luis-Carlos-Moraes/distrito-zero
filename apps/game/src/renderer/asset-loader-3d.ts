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
  // Veículo Blindado Tático 09
  armoredCarBase: THREE.Group | null;
  armoredTexture: THREE.Texture;
  // Personagens e Animações
  characterBase: THREE.Group | null;
  idleClip: THREE.AnimationClip | null;
  runClip: THREE.AnimationClip | null;
  skins: CharacterSkinTextures;
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
    sedan,
    characterBase,
    idleClip,
    runClip,
    armoredCarBase
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
    loadGLBModel('/models/vehicles/sedan.glb'),
    safeLoadFBX('/models/characters/Model/characterMedium.fbx'),
    safeLoadAnim('/models/characters/Animations/idle.fbx'),
    safeLoadAnim('/models/characters/Animations/run.fbx'),
    safeLoadFBX('/models/vehicles/armored/armored_vehicle.fbx')
  ]);

  const skins: CharacterSkinTextures = {
    male: loadTexture('/models/characters/Skins/skaterMaleA.png'),
    female: loadTexture('/models/characters/Skins/skaterFemaleA.png'),
    criminal: loadTexture('/models/characters/Skins/criminalMaleA.png'),
    cyborg: loadTexture('/models/characters/Skins/cyborgFemaleA.png')
  };

  const armoredTexture = loadTexture('/models/vehicles/armored/TEXTURE.png');

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
    sedan,
    armoredCarBase,
    armoredTexture,
    characterBase,
    idleClip,
    runClip,
    skins
  };

  return cachedCityAssets;
}

/**
 * Monta o modelo do Blindado Tático 09 (Home Police) com texturas e giroflex
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

  // Aplicar a textura tática extraída do TEXTURE.rar
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

  // Normalização de dimensões do modelo FBX
  const bbox = new THREE.Box3().setFromObject(car);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  // Se o modelo estiver orientado ao longo de X, rotacionar para +Z
  if (size.x > size.z) {
    car.rotation.y = Math.PI / 2;
  }

  // Comprimento proporcional tático (~2.3 unidades no mapa)
  const maxDim = Math.max(size.x, size.z);
  const targetLength = 2.3;
  const scale = targetLength / Math.max(0.001, maxDim);
  car.scale.set(scale, scale, scale);

  // Alinhar ao nível do chão
  const scaledBbox = new THREE.Box3().setFromObject(car);
  if (scaledBbox.min.y < -0.001) {
    car.position.y = -scaledBbox.min.y;
  }

  root.add(car);

  // Localizar rodas para rolagem
  const wheels: THREE.Object3D[] = [];
  car.traverse((child) => {
    const name = child.name.toLowerCase();
    if (name.includes('wheel') || name.includes('tire') || name.includes('roda')) {
      wheels.push(child);
    }
  });

  // Giroflex tático de alta intensidade no teto
  const sirenLightRed = new THREE.PointLight(0xef4444, 0, 8);
  sirenLightRed.position.set(0.35, 1.25, 0.0);
  root.add(sirenLightRed);

  const sirenLightBlue = new THREE.PointLight(0x38bdf8, 0, 8);
  sirenLightBlue.position.set(-0.35, 1.25, 0.0);
  root.add(sirenLightBlue);

  return { mesh: root, wheels, sirenLightRed, sirenLightBlue };
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
