import * as THREE from 'three';

// Materiais Low Poly elegantes e limpos
export const MATERIALS = {
  // Terreno e Urbanismo
  grass: new THREE.MeshStandardMaterial({ color: 0x3d733e, roughness: 0.9 }),
  groundBase: new THREE.MeshStandardMaterial({ color: 0x223824, roughness: 0.95 }),
  asphalt: new THREE.MeshStandardMaterial({ color: 0x2b333e, roughness: 0.8 }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  roadYellow: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 }),
  curb: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }),

  // Árvores e vegetação
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 }),
  treeLeaves: new THREE.MeshStandardMaterial({ color: 0x226b35, roughness: 0.8 }),
  treeLeavesAlt: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }),

  // Delegacia Central
  stationBody: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 }),
  stationWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }),
  stationAccent: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.2, metalness: 0.4 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 }),

  // Prédios da cidade
  brickCommercial: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 }),
  wallClean: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 }),
  wallDegraded: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 }),
  wallAbandoned: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 }),
  roofTerracotta: new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 }),
  roofBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 }),
  roofDark: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }),

  // Viatura Policial
  policeWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
  policeBlack: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }),
  sirenRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  sirenBlue: new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
};

/**
 * Cria uma árvore Low Poly estilizada
 */
export function createTree(scale: number = 1): THREE.Group {
  const tree = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 0.9 * scale, 5);
  const trunk = new THREE.Mesh(trunkGeo, MATERIALS.treeTrunk);
  trunk.position.y = (0.45 * scale);
  trunk.castShadow = true;
  tree.add(trunk);

  const foliageGeo1 = new THREE.ConeGeometry(0.9 * scale, 1.2 * scale, 6);
  const foliage1 = new THREE.Mesh(foliageGeo1, MATERIALS.treeLeaves);
  foliage1.position.y = (1.2 * scale);
  foliage1.castShadow = true;
  tree.add(foliage1);

  const foliageGeo2 = new THREE.ConeGeometry(0.65 * scale, 1.0 * scale, 6);
  const foliage2 = new THREE.Mesh(foliageGeo2, MATERIALS.treeLeavesAlt);
  foliage2.position.y = (1.7 * scale);
  foliage2.castShadow = true;
  tree.add(foliage2);

  return tree;
}

/**
 * Constrói a malha da cidade completa (Base Verde + Ruas Reais + Quarteirões)
 */
export function createCityGround(): THREE.Group {
  const city = new THREE.Group();

  // 1. Chão Verde da Cidade (Grama)
  const groundGeo = new THREE.BoxGeometry(60, 0.2, 60);
  const ground = new THREE.Mesh(groundGeo, MATERIALS.grass);
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  city.add(ground);

  // 2. Ruas Principais: Criar malha viária em formato de grade limpa
  // Avenida Horizontal (Z = 16)
  const aveHGeo = new THREE.BoxGeometry(50, 0.05, 5);
  const aveH = new THREE.Mesh(aveHGeo, MATERIALS.asphalt);
  aveH.position.set(20, 0.05, 16);
  aveH.receiveShadow = true;
  city.add(aveH);

  // Avenida Vertical (X = 16)
  const aveVGeo = new THREE.BoxGeometry(5, 0.05, 50);
  const aveV = new THREE.Mesh(aveVGeo, MATERIALS.asphalt);
  aveV.position.set(16, 0.05, 20);
  aveV.receiveShadow = true;
  city.add(aveV);

  // Rua Secundária Horizontal (Z = 32)
  const streetHGeo = new THREE.BoxGeometry(50, 0.05, 4);
  const streetH = new THREE.Mesh(streetHGeo, MATERIALS.asphalt);
  streetH.position.set(20, 0.05, 32);
  streetH.receiveShadow = true;
  city.add(streetH);

  // Rua Secundária Vertical (X = 32)
  const streetVGeo = new THREE.BoxGeometry(4, 0.05, 50);
  const streetV = new THREE.Mesh(streetVGeo, MATERIALS.asphalt);
  streetV.position.set(32, 0.05, 20);
  streetV.receiveShadow = true;
  city.add(streetV);

  // 3. Faixas e Pinturas nas Vias
  for (let x = -2; x <= 42; x += 3) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.15), MATERIALS.roadLine);
    dash.position.set(x, 0.09, 16);
    city.add(dash);
  }

  for (let z = -2; z <= 42; z += 3) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 1.6), MATERIALS.roadLine);
    dash.position.set(16, 0.09, z);
    city.add(dash);
  }

  // 4. Calçadas de Concreto para os Quarteirões
  const createBlockSidewalk = (cx: number, cz: number, w: number, d: number) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, 0.15, d), MATERIALS.sidewalk);
    block.position.set(cx, 0.1, cz);
    block.receiveShadow = true;
    city.add(block);
  };

  createBlockSidewalk(7.5, 7.5, 11, 11);
  createBlockSidewalk(24, 7.5, 10, 11);
  createBlockSidewalk(7.5, 24, 11, 11);
  createBlockSidewalk(24, 24, 11, 11);

  // 5. Adicionar Árvores Urbanas nas praças e calçadas
  const treeCoords = [
    [4, 4], [11, 4], [4, 11], [11, 11],
    [21, 5], [27, 5], [21, 11], [27, 11],
    [5, 21], [11, 21], [5, 27],
    [21, 21], [27, 21], [21, 27], [27, 27]
  ];

  for (const [tx, tz] of treeCoords) {
    const t = createTree(0.8 + Math.random() * 0.3);
    t.position.set(tx, 0.15, tz);
    city.add(t);
  }

  return city;
}

/**
 * Cria a Delegacia de Polícia 3D Central
 */
export function createPoliceStationMesh(): THREE.Group {
  const station = new THREE.Group();

  // Pátio cercado
  const yard = new THREE.Mesh(new THREE.BoxGeometry(9, 0.18, 9), MATERIALS.asphalt);
  yard.position.y = 0.1;
  yard.receiveShadow = true;
  station.add(yard);

  // Muros de Segurança
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(9, 0.9, 0.2), MATERIALS.stationWhite);
  backWall.position.set(0, 0.55, -4.4);
  backWall.castShadow = true;
  station.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 9), MATERIALS.stationWhite);
  leftWall.position.set(-4.4, 0.55, 0);
  leftWall.castShadow = true;
  station.add(leftWall);

  // Prédio Principal da Delegacia (Moderno e imponente)
  const bldg = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.8, 4.0), MATERIALS.stationBody);
  bldg.position.set(-1.2, 1.5, -1.8);
  bldg.castShadow = true;
  bldg.receiveShadow = true;
  station.add(bldg);

  // Portaria branca saliente
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 1.4), MATERIALS.stationWhite);
  lobby.position.set(-1.2, 0.9, 0.5);
  lobby.castShadow = true;
  station.add(lobby);

  // Placa "POLÍCIA"
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.1), MATERIALS.stationAccent);
  sign.position.set(-1.2, 1.6, 1.25);
  station.add(sign);

  // Portas de vidro
  const doors = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.08), MATERIALS.glass);
  doors.position.set(-1.2, 0.6, 1.25);
  station.add(doors);

  // Janelas do andar superior
  for (let wx = -2.8; wx <= 0.8; wx += 1.2) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.08), MATERIALS.glass);
    win.position.set(wx, 2.2, 0.25);
    station.add(win);
  }

  // Torre de Transmissão Tática
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 2.8, 6), MATERIALS.metal);
  tower.position.set(-3.2, 3.8, -3.2);
  tower.castShadow = true;
  station.add(tower);

  const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), MATERIALS.sirenRed);
  redBeacon.position.set(-3.2, 5.2, -3.2);
  station.add(redBeacon);

  // Vagas demarcadas para viaturas com faixas amarelas
  const bayGeo = new THREE.BoxGeometry(0.1, 0.02, 2.5);
  const b1 = new THREE.Mesh(bayGeo, MATERIALS.roadYellow);
  b1.position.set(2.0, 0.2, 1.5);
  const b2 = new THREE.Mesh(bayGeo, MATERIALS.roadYellow);
  b2.position.set(3.6, 0.2, 1.5);
  station.add(b1, b2);

  return station;
}

/**
 * Cria Comércios e Galpões
 */
export function createCommercialBuildingMesh(stage: string): THREE.Group {
  const group = new THREE.Group();
  const isAbandoned = stage === 'abandoned';
  const isRecovered = stage === 'recovered' || stage === 'expanded';

  // Base do Lote
  const lot = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.12, 5.5), MATERIALS.sidewalk);
  lot.position.y = 0.06;
  lot.receiveShadow = true;
  group.add(lot);

  // Bloco do Prédio
  const bldgGeo = new THREE.BoxGeometry(4.2, 2.6, 3.8);
  const bldgMat = isAbandoned
    ? MATERIALS.wallAbandoned
    : isRecovered
    ? MATERIALS.brickCommercial
    : MATERIALS.wallDegraded;
  const bldg = new THREE.Mesh(bldgGeo, bldgMat);
  bldg.position.set(0, 1.36, -0.4);
  bldg.castShadow = true;
  bldg.receiveShadow = true;
  group.add(bldg);

  // Toldo e Vitrine
  if (!isAbandoned) {
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 0.8), MATERIALS.stationAccent);
    awning.position.set(0, 1.4, 1.6);
    awning.castShadow = true;
    group.add(awning);

    const storefront = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.1), MATERIALS.glass);
    storefront.position.set(0, 0.7, 1.55);
    group.add(storefront);
  }

  // Equipamento de Ar no telhado
  const ac = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), MATERIALS.metal);
  ac.position.set(1.2, 2.9, -0.6);
  ac.castShadow = true;
  group.add(ac);

  return group;
}

/**
 * Cria Casas Residenciais
 */
export function createResidentialBuildingMesh(stage: string): THREE.Group {
  const house = new THREE.Group();
  const isAbandoned = stage === 'abandoned';

  // Quintal
  const yard = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.12, 5.5), MATERIALS.grass);
  yard.position.y = 0.06;
  yard.receiveShadow = true;
  house.add(yard);

  // Paredes
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.8, 3.2),
    isAbandoned ? MATERIALS.wallAbandoned : MATERIALS.wallClean
  );
  body.position.set(0, 1.0, -0.4);
  body.castShadow = true;
  body.receiveShadow = true;
  house.add(body);

  // Telhado Colonial 2 Águas
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.8, 1.4, 4),
    isAbandoned ? MATERIALS.roofDark : MATERIALS.roofTerracotta
  );
  roof.position.set(0, 2.6, -0.4);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  house.add(roof);

  // Pequena árvore no jardim da frente
  const tree = createTree(0.7);
  tree.position.set(1.8, 0.1, 1.6);
  house.add(tree);

  return house;
}

/**
 * Cria a Viatura Policial
 */
export function createPoliceCruiserMesh(): {
  mesh: THREE.Group;
  sirenLightRed: THREE.PointLight;
  sirenLightBlue: THREE.PointLight;
} {
  const cruiser = new THREE.Group();

  // Chassi
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 2.5), MATERIALS.policeBlack);
  chassis.position.y = 0.38;
  chassis.castShadow = true;
  cruiser.add(chassis);

  // Cabine
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.42, 1.3), MATERIALS.policeWhite);
  cabin.position.set(0, 0.78, -0.15);
  cabin.castShadow = true;
  cruiser.add(cabin);

  // Vidros
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.36, 1.25), MATERIALS.glass);
  glass.position.set(0, 0.78, -0.15);
  cruiser.add(glass);

  // 4 Rodas
  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.22, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.72, 0.24, 0.75],
    [0.72, 0.24, 0.75],
    [-0.72, 0.24, -0.75],
    [0.72, 0.24, -0.75]
  ];

  for (const pos of wheelPositions) {
    const w = new THREE.Mesh(wheelGeo, MATERIALS.tire);
    w.position.set(pos[0], pos[1], pos[2]);
    w.castShadow = true;
    cruiser.add(w);
  }

  // Barra Giroflex no Teto
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.22), MATERIALS.metal);
  bar.position.set(0, 1.05, -0.15);
  cruiser.add(bar);

  const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.18), MATERIALS.sirenBlue);
  blueLight.position.set(-0.2, 1.06, -0.15);
  const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.18), MATERIALS.sirenRed);
  redLight.position.set(0.2, 1.06, -0.15);
  cruiser.add(blueLight, redLight);

  // Luzes reais pontuais do Giroflex
  const sirenLightRed = new THREE.PointLight(0xef4444, 0, 8);
  sirenLightRed.position.set(0.4, 1.3, -0.15);
  cruiser.add(sirenLightRed);

  const sirenLightBlue = new THREE.PointLight(0x38bdf8, 0, 8);
  sirenLightBlue.position.set(-0.4, 1.3, -0.15);
  cruiser.add(sirenLightBlue);

  return { mesh: cruiser, sirenLightRed, sirenLightBlue };
}

/**
 * Marcador 3D sutil para Ocorrências (Sem banner gigante)
 */
export function createIncidentMarkerMesh(): THREE.Group {
  const marker = new THREE.Group();

  // Círculo pulsar no asfalto
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.2, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
  );
  ring.position.y = 0.15;
  marker.add(ring);

  // Pin de alerta flutuante
  const pin = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.9, 6).rotateX(Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  pin.position.y = 2.0;
  marker.add(pin);

  return marker;
}
