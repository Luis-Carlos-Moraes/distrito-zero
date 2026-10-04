import * as THREE from 'three';

// Paleta de materiais Low Poly estilizados
export const MATERIALS = {
  // Asfalto e vias
  asphalt: new THREE.MeshStandardMaterial({ color: 0x1e2530, roughness: 0.85, metalness: 0.1 }),
  roadLine: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  roadYellow: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, metalness: 0.05 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9, metalness: 0.0 }),
  soil: new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.95 }),

  // Delegacia
  stationMain: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6, metalness: 0.2 }),
  stationAccent: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.4 }),
  stationWhite: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.1, transmission: 0.6, thickness: 0.5 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 }),

  // Prédios urbanos e comércios
  brickCommercial: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 }),
  wallClean: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 }),
  wallDegraded: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 }),
  wallAbandoned: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 }),
  roofTerracotta: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }),
  roofBlue: new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.8 }),
  roofMetal: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.5 }),
  woodPlanks: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }),

  // Viatura Policial
  policeBodyWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 }),
  policeBodyBlack: new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.2 }),
  carGlass: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 }),
  carTire: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }),
  carRim: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 }),
  sirenRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  sirenBlue: new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
};

/**
 * Cria um quarteirão de rua modular com calçadas e postes
 */
export function createRoadTile(isIntersection: boolean = false): THREE.Group {
  const group = new THREE.Group();
  const tileSize = 4;

  // Asfalto base
  const roadGeo = new THREE.BoxGeometry(tileSize, 0.1, tileSize);
  const roadMesh = new THREE.Mesh(roadGeo, MATERIALS.asphalt);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  if (isIntersection) {
    // Cruzamento com faixa de pedestre nas 4 pontas
    const stripeGeo = new THREE.BoxGeometry(0.8, 0.11, 0.15);
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      const s1 = new THREE.Mesh(stripeGeo, MATERIALS.roadLine);
      s1.position.set(i, 0.01, 1.6);
      group.add(s1);

      const s2 = new THREE.Mesh(stripeGeo, MATERIALS.roadLine);
      s2.position.set(i, 0.01, -1.6);
      group.add(s2);
    }
  } else {
    // Faixa pontilhada central
    const lineGeo = new THREE.BoxGeometry(0.12, 0.11, 0.8);
    const line1 = new THREE.Mesh(lineGeo, MATERIALS.roadYellow);
    line1.position.set(0, 0.01, -1);
    const line2 = new THREE.Mesh(lineGeo, MATERIALS.roadYellow);
    line2.position.set(0, 0.01, 1);
    group.add(line1, line2);

    // Calçadas laterais
    const walkGeo = new THREE.BoxGeometry(0.6, 0.18, tileSize);
    const walkLeft = new THREE.Mesh(walkGeo, MATERIALS.sidewalk);
    walkLeft.position.set(-1.7, 0.04, 0);
    walkLeft.receiveShadow = true;
    walkLeft.castShadow = true;

    const walkRight = new THREE.Mesh(walkGeo, MATERIALS.sidewalk);
    walkRight.position.set(1.7, 0.04, 0);
    walkRight.receiveShadow = true;
    walkRight.castShadow = true;

    group.add(walkLeft, walkRight);

    // Poste de iluminação público
    const pole = createStreetLamp();
    pole.position.set(-1.6, 0.1, 1.2);
    group.add(pole);
  }

  return group;
}

/**
 * Cria poste de luz com luminária estilizada
 */
export function createStreetLamp(): THREE.Group {
  const pole = new THREE.Group();

  const postGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.8, 6);
  const postMesh = new THREE.Mesh(postGeo, MATERIALS.metal);
  postMesh.position.y = 0.9;
  postMesh.castShadow = true;
  pole.add(postMesh);

  const armGeo = new THREE.BoxGeometry(0.35, 0.04, 0.06);
  const arm = new THREE.Mesh(armGeo, MATERIALS.metal);
  arm.position.set(0.15, 1.8, 0);
  pole.add(arm);

  const bulbGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(0.3, 1.76, 0);
  pole.add(bulb);

  return pole;
}

/**
 * Cria a Delegacia de Polícia 3D Low Poly com pátio de viaturas e antena de rádio
 */
export function createPoliceStationMesh(): THREE.Group {
  const station = new THREE.Group();

  // Fundação / Pátio cercado
  const baseGeo = new THREE.BoxGeometry(3.6, 0.2, 3.6);
  const baseMesh = new THREE.Mesh(baseGeo, MATERIALS.sidewalk);
  baseMesh.receiveShadow = true;
  station.add(baseMesh);

  // Muros do pátio
  const wallGeo1 = new THREE.BoxGeometry(3.6, 0.6, 0.12);
  const backWall = new THREE.Mesh(wallGeo1, MATERIALS.stationWhite);
  backWall.position.set(0, 0.4, -1.74);
  backWall.castShadow = true;
  station.add(backWall);

  const sideWallGeo = new THREE.BoxGeometry(0.12, 0.6, 3.6);
  const leftWall = new THREE.Mesh(sideWallGeo, MATERIALS.stationWhite);
  leftWall.position.set(-1.74, 0.4, 0);
  leftWall.castShadow = true;
  station.add(leftWall);

  // Prédio Principal da Delegacia (2 andares)
  const bldgGeo = new THREE.BoxGeometry(2.4, 1.8, 1.8);
  const mainBldg = new THREE.Mesh(bldgGeo, MATERIALS.stationMain);
  mainBldg.position.set(-0.3, 1.0, -0.6);
  mainBldg.castShadow = true;
  mainBldg.receiveShadow = true;
  station.add(mainBldg);

  // Portaria / Recepção saliente
  const frontGeo = new THREE.BoxGeometry(1.4, 1.1, 0.8);
  const frontBldg = new THREE.Mesh(frontGeo, MATERIALS.stationWhite);
  frontBldg.position.set(-0.3, 0.65, 0.5);
  frontBldg.castShadow = true;
  station.add(frontBldg);

  // Placa "POLÍCIA"
  const signGeo = new THREE.BoxGeometry(1.2, 0.28, 0.08);
  const signMesh = new THREE.Mesh(signGeo, MATERIALS.stationAccent);
  signMesh.position.set(-0.3, 1.15, 0.92);
  station.add(signMesh);

  // Portas de vidro
  const doorGeo = new THREE.BoxGeometry(0.6, 0.7, 0.05);
  const door = new THREE.Mesh(doorGeo, MATERIALS.glass);
  door.position.set(-0.3, 0.45, 0.92);
  station.add(door);

  // Janelas do 2º andar
  const winGeo = new THREE.BoxGeometry(0.4, 0.4, 0.05);
  for (let x = -1.1; x <= 0.6; x += 0.6) {
    const win = new THREE.Mesh(winGeo, MATERIALS.glass);
    win.position.set(x, 1.4, 0.32);
    station.add(win);
  }

  // Antena de Comunicação Tática no telhado
  const towerGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.6, 6);
  const tower = new THREE.Mesh(towerGeo, MATERIALS.metal);
  tower.position.set(-1.0, 2.7, -1.0);
  tower.castShadow = true;
  station.add(tower);

  // Luz vermelha no topo da antena
  const beaconGeo = new THREE.SphereGeometry(0.07, 6, 6);
  const beacon = new THREE.Mesh(beaconGeo, MATERIALS.sirenRed);
  beacon.position.set(-1.0, 3.5, -1.0);
  station.add(beacon);

  // Vagas de viatura demarcadas no pátio com faixas amarelas
  const bayLineGeo = new THREE.BoxGeometry(0.06, 0.02, 1.4);
  const bay1 = new THREE.Mesh(bayLineGeo, MATERIALS.roadYellow);
  bay1.position.set(0.9, 0.11, 0.8);
  const bay2 = new THREE.Mesh(bayLineGeo, MATERIALS.roadYellow);
  bay2.position.set(1.6, 0.11, 0.8);
  station.add(bay1, bay2);

  return station;
}

/**
 * Cria Prédio Comercial ou Galpão Industrial
 */
export function createCommercialBuildingMesh(stage: string): THREE.Group {
  const bldg = new THREE.Group();

  const isAbandoned = stage === 'abandoned';
  const isRecovered = stage === 'recovered' || stage === 'expanded';

  // Bloco principal
  const bodyGeo = new THREE.BoxGeometry(2.2, 1.7, 2.0);
  const bodyMat = isAbandoned
    ? MATERIALS.wallAbandoned
    : isRecovered
    ? MATERIALS.brickCommercial
    : MATERIALS.wallDegraded;
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.95;
  body.castShadow = true;
  body.receiveShadow = true;
  bldg.add(body);

  // Fachada / Toldo comercial se reformado
  if (!isAbandoned) {
    const awningGeo = new THREE.BoxGeometry(1.8, 0.15, 0.5);
    const awningMat = new THREE.MeshStandardMaterial({ color: isRecovered ? 0x2563eb : 0x78350f, roughness: 0.6 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 0.8, 1.1);
    awning.castShadow = true;
    bldg.add(awning);

    // Vitrine de vidro
    const windowGeo = new THREE.BoxGeometry(1.6, 0.6, 0.05);
    const shopWindow = new THREE.Mesh(windowGeo, MATERIALS.glass);
    shopWindow.position.set(0, 0.4, 1.02);
    bldg.add(shopWindow);
  }

  // Unidade de ar-condicionado / exaustor no telhado
  const acGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
  const ac = new THREE.Mesh(acGeo, MATERIALS.metal);
  ac.position.set(0.6, 1.95, -0.4);
  ac.castShadow = true;
  bldg.add(ac);

  return bldg;
}

/**
 * Cria Residência / Casa Popular Low Poly
 */
export function createResidentialBuildingMesh(stage: string): THREE.Group {
  const house = new THREE.Group();

  const isAbandoned = stage === 'abandoned';

  // Paredes
  const wallGeo = new THREE.BoxGeometry(1.8, 1.2, 1.8);
  const wallMat = isAbandoned ? MATERIALS.wallAbandoned : MATERIALS.wallClean;
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 0.7;
  walls.castShadow = true;
  walls.receiveShadow = true;
  house.add(walls);

  // Telhado 2 águas triangular
  const roofGeo = new THREE.ConeGeometry(1.5, 0.8, 4);
  const roofMat = isAbandoned ? MATERIALS.roofMetal : MATERIALS.roofTerracotta;
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 1.7;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  house.add(roof);

  // Chaminé
  const chimGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
  const chim = new THREE.Mesh(chimGeo, MATERIALS.brickCommercial);
  chim.position.set(0.4, 1.8, 0.3);
  chim.castShadow = true;
  house.add(chim);

  return house;
}

/**
 * Cria a Viatura Policial 3D Low Poly com barra de giroflex e luzes reais
 */
export function createPoliceCruiserMesh(): {
  mesh: THREE.Group;
  sirenLightRed: THREE.PointLight;
  sirenLightBlue: THREE.PointLight;
} {
  const cruiser = new THREE.Group();

  // Chassi Inferior (Preto tático)
  const chassisGeo = new THREE.BoxGeometry(1.0, 0.32, 1.8);
  const chassis = new THREE.Mesh(chassisGeo, MATERIALS.policeBodyBlack);
  chassis.position.y = 0.28;
  chassis.castShadow = true;
  cruiser.add(chassis);

  // Cabine Superior (Branca)
  const cabinGeo = new THREE.BoxGeometry(0.85, 0.32, 0.95);
  const cabin = new THREE.Mesh(cabinGeo, MATERIALS.policeBodyWhite);
  cabin.position.set(0, 0.56, -0.1);
  cabin.castShadow = true;
  cruiser.add(cabin);

  // Parabrisa e Vidros
  const glassGeo = new THREE.BoxGeometry(0.86, 0.26, 0.92);
  const windshield = new THREE.Mesh(glassGeo, MATERIALS.carGlass);
  windshield.position.set(0, 0.56, -0.1);
  cruiser.add(windshield);

  // Rodas 3D
  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.16, 12);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.52, 0.18, 0.55],
    [0.52, 0.18, 0.55],
    [-0.52, 0.18, -0.55],
    [0.52, 0.18, -0.55]
  ];

  for (const pos of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, MATERIALS.carTire);
    wheel.position.set(pos[0], pos[1], pos[2]);
    wheel.castShadow = true;
    cruiser.add(wheel);
  }

  // Barra de Giroflex no teto
  const barGeo = new THREE.BoxGeometry(0.5, 0.08, 0.16);
  const bar = new THREE.Mesh(barGeo, MATERIALS.metal);
  bar.position.set(0, 0.74, -0.1);
  cruiser.add(bar);

  const sirenBlueMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.14), MATERIALS.sirenBlue);
  sirenBlueMesh.position.set(-0.14, 0.76, -0.1);
  const sirenRedMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.14), MATERIALS.sirenRed);
  sirenRedMesh.position.set(0.14, 0.76, -0.1);
  cruiser.add(sirenBlueMesh, sirenRedMesh);

  // Luzes reais pontuais do Giroflex (PointLights 3D)
  const sirenLightRed = new THREE.PointLight(0xef4444, 2.5, 6);
  sirenLightRed.position.set(0.25, 0.85, -0.1);
  cruiser.add(sirenLightRed);

  const sirenLightBlue = new THREE.PointLight(0x38bdf8, 2.5, 6);
  sirenLightBlue.position.set(-0.25, 0.85, -0.1);
  cruiser.add(sirenLightBlue);

  return { mesh: cruiser, sirenLightRed, sirenLightBlue };
}

/**
 * Cria o marcador de Ocorrência 3D (Holograma com Alerta Pulsante)
 */
export function createIncidentMarkerMesh(): THREE.Group {
  const marker = new THREE.Group();

  // Anel holográfico no chão
  const ringGeo = new THREE.RingGeometry(0.6, 0.85, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.08;
  marker.add(ring);

  // Cone de alerta flutuante invertido
  const coneGeo = new THREE.ConeGeometry(0.3, 0.6, 6);
  coneGeo.rotateX(Math.PI);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.y = 1.3;
  marker.add(cone);

  return marker;
}
