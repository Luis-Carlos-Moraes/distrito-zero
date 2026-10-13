import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  LoadedCityAssets,
  createRealPoliceStation,
  createRealHospital,
  createRealPenitentiary
} from './asset-loader-3d.js';

export const CITY_MATERIALS = {
  grass: new THREE.MeshStandardMaterial({
    color: 0x4a8a3f,
    roughness: 0.9,
    metalness: 0.05
  }),
  groundPedestal: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.95
  }),
  sidewalkTile: new THREE.MeshStandardMaterial({
    color: 0xa1a1aa,
    roughness: 0.85
  }),
  stationYard: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.75
  }),
  parkingYellow: new THREE.MeshBasicMaterial({
    color: 0xfbbf24
  }),
  treeTrunk: new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.9
  }),
  treeFoliage: new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.85
  }),
  treeFoliageDark: new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.85
  }),
  incidentRed: new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide
  })
};

export function createTreeMesh(scale: number = 1.0): THREE.Group {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 0.8 * scale, 5),
    CITY_MATERIALS.treeTrunk
  );
  trunk.position.y = 0.4 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const foliage1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.85 * scale, 1.2 * scale, 6),
    CITY_MATERIALS.treeFoliage
  );
  foliage1.position.y = 1.1 * scale;
  foliage1.castShadow = true;
  tree.add(foliage1);

  const foliage2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.6 * scale, 0.9 * scale, 6),
    CITY_MATERIALS.treeFoliageDark
  );
  foliage2.position.y = 1.6 * scale;
  foliage2.castShadow = true;
  tree.add(foliage2);

  return tree;
}

/**
 * Gerador pseudo-aleatório determinístico (mesma cidade a cada carregamento)
 */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Funde todas as malhas estáticas de um grupo em poucas malhas (uma por material),
 * reduzindo centenas de draw calls para algumas unidades.
 */
function mergeStaticGroup(group: THREE.Group, receiveShadow = true): THREE.Group {
  group.updateMatrixWorld(true);
  const buckets = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[] }>();
  let ok = true;

  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) {
      if (mesh.isMesh) ok = false;
      return;
    }
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    const key = mesh.material.uuid;
    if (!buckets.has(key)) buckets.set(key, { material: mesh.material, geometries: [] });
    buckets.get(key)!.geometries.push(geo);
  });

  if (!ok) return group;

  const merged = new THREE.Group();
  for (const { material, geometries } of buckets.values()) {
    const geo = mergeGeometries(geometries, false);
    if (!geo) return group; // atributos incompatíveis: mantém o grupo original
    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = receiveShadow;
    mesh.castShadow = false;
    merged.add(mesh);
  }
  geometriesDispose(buckets);
  return merged;
}

function geometriesDispose(
  buckets: Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[] }>
) {
  for (const { geometries } of buckets.values()) geometries.forEach((g) => g.dispose());
}

// Malha viária: núcleo original + avenidas externas para a cidade continuar além da tela
const CORE_X_ROADS = [8, 12, 16, 28, 32];
const CORE_Z_ROADS = [4, 12, 16, 24, 28];
const X_ROADS = [-16, -4, ...CORE_X_ROADS, 44, 56];
const Z_ROADS = [-20, -8, ...CORE_Z_ROADS, 40, 52];
const ROAD_MIN = -28;
const ROAD_MAX = 66;

/**
 * Cria a malha urbana completa e contínua com os modelos Kenney GLTF
 */
export function createCityGroundWithKenneyAssets(assets: LoadedCityAssets): THREE.Group {
  const city = new THREE.Group();
  const rand = seededRandom(1337);

  // 1. Chão contínuo (sem "ilha" flutuante): a cidade se estende além das bordas da tela
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2),
    CITY_MATERIALS.grass
  );
  ground.position.set(20, -0.01, 16);
  ground.receiveShadow = true;
  city.add(ground);

  // 2. Ruas e Avenidas Contínuas da Cidade
  const roadScale = 2.0; // 1 tile Kenney = 2.0 unidades de largura (2 faixas perfeitas)
  const roads = new THREE.Group();

  // Conjunto de cruzamentos
  const intersectionSet = new Set<string>();
  for (const rx of X_ROADS) {
    for (const rz of Z_ROADS) {
      intersectionSet.add(`${rx},${rz}`);

      // Cruzamento 4 vias Kenney
      const cross = assets.roadCrossroad.clone(true);
      cross.scale.set(roadScale, roadScale, roadScale);
      cross.position.set(rx, 0.01, rz);
      roads.add(cross);

      // Semáforos nos cruzamentos de grande fluxo
      if ((rx === 16 && rz === 16) || (rx === 28 && rz === 16)) {
        const trafficLight = assets.trafficLight.clone(true);
        trafficLight.scale.set(1.8, 1.8, 1.8);
        trafficLight.position.set(rx + 1.25, 0.02, rz + 1.25);
        trafficLight.rotation.y = Math.PI / 4;
        city.add(trafficLight);
      }
    }
  }

  // Segmentos de ruas horizontais (ao longo do eixo X)
  // road-straight por padrão estende ao longo do eixo X (rotation.y = 0)
  for (const rz of Z_ROADS) {
    for (let rx = ROAD_MIN; rx <= ROAD_MAX; rx += 2) {
      if (intersectionSet.has(`${rx},${rz}`)) continue;

      const roadSeg = assets.roadStraight.clone(true);
      roadSeg.scale.set(roadScale, roadScale, roadScale);
      roadSeg.position.set(rx, 0.01, rz);
      roadSeg.rotation.y = 0; // Perfeitamente alinhado com o eixo X!
      roads.add(roadSeg);
    }
  }

  // Segmentos de ruas verticais (ao longo do eixo Z)
  // Girar 90 graus para estender ao longo do eixo Z (rotation.y = Math.PI / 2)
  for (const rx of X_ROADS) {
    for (let rz = ROAD_MIN; rz <= ROAD_MAX; rz += 2) {
      if (intersectionSet.has(`${rx},${rz}`)) continue;

      const roadSeg = assets.roadStraight.clone(true);
      roadSeg.scale.set(roadScale, roadScale, roadScale);
      roadSeg.position.set(rx, 0.01, rz);
      roadSeg.rotation.y = Math.PI / 2; // Perfeitamente alinhado com o eixo Z!
      roads.add(roadSeg);
    }
  }

  // Centenas de peças de rua viram poucas malhas (desempenho)
  city.add(mergeStaticGroup(roads));

  // 3. Postes de Iluminação Curvados Kenney ao longo das calçadas
  const streetLightPositions = [
    [16, 8], [16, 20],
    [10, 16], [22, 16], [26, 16],
    [28, 8], [28, 20],
    [8, 20], [32, 20]
  ];

  for (const [lx, lz] of streetLightPositions) {
    const light = assets.streetLight.clone(true);
    light.scale.set(1.8, 1.8, 1.8);
    light.position.set(lx + 1.2, 0.02, lz);
    light.rotation.y = -Math.PI / 2;
    city.add(light);
  }

  // 4. Árvores Urbanas Decorativas nos Quarteirões
  const treePositions = [
    [6, 6], [10, 6], [14, 6], [18, 6], [22, 6],
    [6, 14], [10, 10], [14, 10], [22, 10], [26, 10],
    [6, 18], [10, 18], [14, 18], [22, 18], [26, 18],
    [6, 26], [10, 26], [14, 26], [22, 26], [26, 26]
  ];

  for (const [tx, tz] of treePositions) {
    const tree = createTreeMesh(0.75 + rand() * 0.35);
    tree.position.set(tx, 0.02, tz);
    city.add(tree);
  }

  // 5. Quarteirões externos preenchidos (cidade continua além do bairro jogável)
  const fillerModels = [
    assets.buildingA,
    assets.buildingB,
    assets.buildingC,
    assets.buildingD,
    assets.buildingE
  ];
  const isCore = (x: number, z: number) => x > 5 && x < 35 && z > 1 && z < 31;

  for (let i = 0; i < X_ROADS.length - 1; i++) {
    for (let j = 0; j < Z_ROADS.length - 1; j++) {
      const x0 = X_ROADS[i] + 1.4;
      const x1 = X_ROADS[i + 1] - 1.4;
      const z0 = Z_ROADS[j] + 1.4;
      const z1 = Z_ROADS[j + 1] - 1.4;
      if (x1 - x0 < 5 || z1 - z0 < 5) continue;

      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      if (isCore(cx, cz)) continue;

      // Até 4 lotes por quarteirão (2x2), cada um com prédio ou bosque
      const lotsX = x1 - x0 >= 9 ? [x0 + (x1 - x0) * 0.27, x0 + (x1 - x0) * 0.73] : [cx];
      const lotsZ = z1 - z0 >= 9 ? [z0 + (z1 - z0) * 0.27, z0 + (z1 - z0) * 0.73] : [cz];

      for (const lx of lotsX) {
        for (const lz of lotsZ) {
          if (rand() < 0.72) {
            const model = fillerModels[Math.floor(rand() * fillerModels.length)];
            const bldg = model.clone(true);
            const s = 2.3 + rand() * 0.6;
            bldg.scale.set(s, s, s);
            bldg.position.set(lx, 0.02, lz);
            bldg.rotation.y = Math.floor(rand() * 4) * (Math.PI / 2);
            city.add(bldg);
          } else {
            for (let k = 0; k < 3; k++) {
              const tree = createTreeMesh(0.7 + rand() * 0.4);
              tree.position.set(lx + (rand() - 0.5) * 2.4, 0.02, lz + (rand() - 0.5) * 2.4);
              city.add(tree);
            }
          }
        }
      }
    }
  }

  // Arranha-céu no horizonte leste (skyline de fundo, sem cobrir a delegacia)
  const skyscraper = assets.buildingSkyscraper.clone(true);
  skyscraper.scale.set(2.4, 2.4, 2.4);
  skyscraper.position.set(36.0, 0.02, 8.0);
  city.add(skyscraper);

  return city;
}

/**
 * Cria a Delegacia de Polícia 3D Central
 * Posicionada ao lado do cruzamento (16, 16) com pátio de estacionamento voltado para a avenida
 */
export function createPoliceStationMeshFromAssets(assets: LoadedCityAssets): THREE.Group {
  const station = new THREE.Group();

  // Pátio com vaga e calçada da delegacia
  const yardGeo = new THREE.BoxGeometry(6.6, 0.06, 6.6);
  const yardMesh = new THREE.Mesh(yardGeo, CITY_MATERIALS.stationYard);
  yardMesh.position.set(-1.0, 0.03, -1.0);
  yardMesh.receiveShadow = true;
  station.add(yardMesh);

  // Faixas amarelas das vagas de viatura
  const lineGeo = new THREE.BoxGeometry(0.1, 0.02, 2.2);
  const l1 = new THREE.Mesh(lineGeo, CITY_MATERIALS.parkingYellow);
  l1.position.set(-0.2, 0.07, -0.6);
  const l2 = new THREE.Mesh(lineGeo, CITY_MATERIALS.parkingYellow);
  l2.position.set(0.9, 0.07, -0.6);
  const l3 = new THREE.Mesh(lineGeo, CITY_MATERIALS.parkingYellow);
  l3.position.set(2.0, 0.07, -0.6);
  station.add(l1, l2, l3);

  // Prédio da Delegacia: Usa o modelo realista FBX
  const realBldg = createRealPoliceStation(assets);
  if (realBldg) {
    realBldg.position.set(-2.0, 0.06, -2.0);
    realBldg.rotation.y = -Math.PI / 4;
    station.add(realBldg);
  } else {
    const bldg = assets.stationBuilding.clone(true);
    bldg.scale.set(2.8, 2.8, 2.8);
    bldg.position.set(-2.2, 0.06, -2.2);
    station.add(bldg);
  }

  return station;
}

/**
 * Cria o Hospital Geral Regional com heliponto
 */
export function createHospitalBuildingFromAssets(assets: LoadedCityAssets): THREE.Group {
  const group = new THREE.Group();

  const lot = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.06, 6.4),
    CITY_MATERIALS.sidewalkTile
  );
  lot.position.set(0, 0.03, 0);
  lot.receiveShadow = true;
  group.add(lot);

  const realHosp = createRealHospital(assets);
  if (realHosp) {
    realHosp.position.set(0, 0.06, 0);
    realHosp.rotation.y = -Math.PI / 4;
    group.add(realHosp);
  } else {
    const bldg = assets.buildingC.clone(true);
    bldg.scale.set(2.8, 2.8, 2.8);
    bldg.position.set(0, 0.06, 0);
    group.add(bldg);
  }

  return group;
}

/**
 * Cria a Penitenciária / Presídio Regional
 */
export function createPenitentiaryBuildingFromAssets(assets: LoadedCityAssets): THREE.Group {
  const group = new THREE.Group();

  const lot = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 0.06, 6.6),
    CITY_MATERIALS.stationYard
  );
  lot.position.set(0, 0.03, 0);
  lot.receiveShadow = true;
  group.add(lot);

  const realPen = createRealPenitentiary(assets);
  if (realPen) {
    realPen.position.set(0, 0.06, 0);
    realPen.rotation.y = Math.PI / 4;
    group.add(realPen);
  } else {
    const bldg = assets.buildingA.clone(true);
    bldg.scale.set(2.8, 2.8, 2.8);
    bldg.position.set(0, 0.06, 0);
    group.add(bldg);
  }

  return group;
}

/**
 * Cria Prédio Comercial (Mercearia, Oficina) voltado para a pista
 */
export function createCommercialBuildingFromAssets(
  bldgId: string,
  stage: string,
  assets: LoadedCityAssets
): THREE.Group {
  const group = new THREE.Group();

  // Calçada do lote comercial
  const lot = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.06, 4.4),
    CITY_MATERIALS.sidewalkTile
  );
  lot.position.set(0, 0.03, 0);
  lot.receiveShadow = true;
  group.add(lot);

  const baseModel = bldgId.includes('com-2') ? assets.buildingB : assets.buildingA;
  const bldg = baseModel.clone(true);
  bldg.scale.set(2.6, 2.6, 2.6);
  bldg.position.set(0, 0.06, 0);

  if (stage === 'abandoned') {
    bldg.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = (mesh.material as THREE.MeshStandardMaterial)?.clone();
        if (mat) {
          mat.color.multiplyScalar(0.75);
          mesh.material = mat;
        }
      }
    });
  }

  group.add(bldg);
  return group;
}

/**
 * Cria Bloco Residencial ou Casa usando modelos Kenney
 */
export function createResidentialBuildingFromAssets(
  bldgId: string,
  stage: string,
  assets: LoadedCityAssets
): THREE.Group {
  const group = new THREE.Group();

  // Quintal gramado
  const yard = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.06, 4.4),
    CITY_MATERIALS.grass
  );
  yard.position.set(0, 0.03, 0);
  yard.receiveShadow = true;
  group.add(yard);

  const baseModel = bldgId.includes('res-2') ? assets.buildingE : assets.buildingD;
  const bldg = baseModel.clone(true);
  bldg.scale.set(2.6, 2.6, 2.6);
  bldg.position.set(0, 0.06, 0);

  if (stage === 'abandoned') {
    bldg.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = (mesh.material as THREE.MeshStandardMaterial)?.clone();
        if (mat) {
          mat.color.multiplyScalar(0.72);
          mesh.material = mat;
        }
      }
    });
  }

  group.add(bldg);

  const tree = createTreeMesh(0.65);
  tree.position.set(1.4, 0.06, 1.4);
  group.add(tree);

  return group;
}

export function createIncidentMarkerMesh(): THREE.Group {
  const marker = new THREE.Group();

  // Anel pulsante no asfalto da ocorrência
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 1.1, 24).rotateX(-Math.PI / 2),
    CITY_MATERIALS.incidentRed
  );
  ring.position.y = 0.08;
  marker.add(ring);

  // Pin de alerta flutuante
  const pin = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.8, 6).rotateX(Math.PI),
    CITY_MATERIALS.incidentRed
  );
  pin.position.y = 2.4;
  marker.add(pin);

  return marker;
}
