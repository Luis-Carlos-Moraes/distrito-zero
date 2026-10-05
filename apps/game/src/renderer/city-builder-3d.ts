import * as THREE from 'three';
import { LoadedCityAssets } from './asset-loader-3d.js';

export const CITY_MATERIALS = {
  grass: new THREE.MeshStandardMaterial({
    color: 0x336b3b,
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
 * Cria a malha urbana completa e contínua com os modelos Kenney GLTF
 */
export function createCityGroundWithKenneyAssets(assets: LoadedCityAssets): THREE.Group {
  const city = new THREE.Group();

  // 1. Pedestal do Diorama da Cidade (Base Limpa e Sólida)
  const baseGeo = new THREE.BoxGeometry(46, 0.4, 46);
  const baseMesh = new THREE.Mesh(baseGeo, CITY_MATERIALS.grass);
  baseMesh.position.set(20, -0.2, 16);
  baseMesh.receiveShadow = true;
  city.add(baseMesh);

  const pedestalGeo = new THREE.BoxGeometry(46.8, 1.2, 46.8);
  const pedestalMesh = new THREE.Mesh(pedestalGeo, CITY_MATERIALS.groundPedestal);
  pedestalMesh.position.set(20, -1.0, 16);
  city.add(pedestalMesh);

  // 2. Ruas e Avenidas Contínuas da Cidade
  // Coordenadas dos eixos viários principais
  const X_ROADS = [8, 12, 16, 28, 32];
  const Z_ROADS = [4, 12, 16, 24, 28];
  const roadScale = 2.0; // 1 tile Kenney = 2.0 unidades de largura (2 faixas perfeitas)

  // Conjunto de cruzamentos
  const intersectionSet = new Set<string>();
  for (const rx of X_ROADS) {
    for (const rz of Z_ROADS) {
      intersectionSet.add(`${rx},${rz}`);

      // Cruzamento 4 vias Kenney
      const cross = assets.roadCrossroad.clone(true);
      cross.scale.set(roadScale, roadScale, roadScale);
      cross.position.set(rx, 0.01, rz);
      city.add(cross);

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
    for (let rx = 6; rx <= 34; rx += 2) {
      if (intersectionSet.has(`${rx},${rz}`)) continue;

      const roadSeg = assets.roadStraight.clone(true);
      roadSeg.scale.set(roadScale, roadScale, roadScale);
      roadSeg.position.set(rx, 0.01, rz);
      roadSeg.rotation.y = 0; // Perfeitamente alinhado com o eixo X!
      city.add(roadSeg);
    }
  }

  // Segmentos de ruas verticais (ao longo do eixo Z)
  // Girar 90 graus para estender ao longo do eixo Z (rotation.y = Math.PI / 2)
  for (const rx of X_ROADS) {
    for (let rz = 2; rz <= 30; rz += 2) {
      if (intersectionSet.has(`${rx},${rz}`)) continue;

      const roadSeg = assets.roadStraight.clone(true);
      roadSeg.scale.set(roadScale, roadScale, roadScale);
      roadSeg.position.set(rx, 0.01, rz);
      roadSeg.rotation.y = Math.PI / 2; // Perfeitamente alinhado com o eixo Z!
      city.add(roadSeg);
    }
  }

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
    const tree = createTreeMesh(0.75 + Math.random() * 0.35);
    tree.position.set(tx, 0.02, tz);
    city.add(tree);
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
  const yardGeo = new THREE.BoxGeometry(5.8, 0.06, 5.8);
  const yardMesh = new THREE.Mesh(yardGeo, CITY_MATERIALS.stationYard);
  yardMesh.position.set(-1.8, 0.03, -1.8);
  yardMesh.receiveShadow = true;
  station.add(yardMesh);

  // Faixas amarelas da vaga de viatura
  const lineGeo = new THREE.BoxGeometry(0.1, 0.02, 2.2);
  const l1 = new THREE.Mesh(lineGeo, CITY_MATERIALS.parkingYellow);
  l1.position.set(0.2, 0.07, -0.6);
  const l2 = new THREE.Mesh(lineGeo, CITY_MATERIALS.parkingYellow);
  l2.position.set(1.4, 0.07, -0.6);
  station.add(l1, l2);

  // Modelo Kenney do Prédio da Delegacia
  const bldg = assets.stationBuilding.clone(true);
  bldg.scale.set(2.8, 2.8, 2.8);
  bldg.position.set(-2.2, 0.06, -2.2);
  station.add(bldg);

  return station;
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
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.multiplyScalar(0.75);
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
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.color.multiplyScalar(0.72);
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
