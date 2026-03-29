console.log("3D ENGINE LOADED - V4 (POLISHED)");

let scene3D, camera3D, renderer3D, gltfLoader3D;
let clock = new THREE.Clock();

// Track models globally to prevent ghosting
window.activeModels3D = { p1: null, p2: null };

// Global Environment Objects
let skyMesh, floorMesh;
let dojoEnvGroup = null;
let parkEnvGroup = null;
let ambientLight, sunLight, rimLight, fillLight;
let warehouseBgTex = null, warehouseFloorTex = null;
let currentStageIdx = -1;

function init3DLoader() {
  if (scene3D) return;
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  console.log("3D SYSTEM: Initializing Real-Time Arena...");

  scene3D = new THREE.Scene();
  scene3D.background = new THREE.Color(0x050505);
  
  camera3D = new THREE.PerspectiveCamera(50, 900/520, 0.1, 2000);
  camera3D.position.set(0, 15, 60);
  camera3D.lookAt(0, 10, 0);
  
  renderer3D = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer3D.setSize(900, 520);
  renderer3D.shadowMap.enabled = true;
  renderer3D.setPixelRatio(window.devicePixelRatio);
  
  // High Intensity Arcade Lighting: Warm Sunset
  ambientLight = new THREE.AmbientLight(0xffccaa, 0.6);
  scene3D.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xff9966, 2.5);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.camera.left = -100;
  sunLight.shadow.camera.right = 100;
  sunLight.shadow.camera.top = 100;
  sunLight.shadow.camera.bottom = -100;
  scene3D.add(sunLight);
  
  rimLight = new THREE.PointLight(0xffaa44, 5, 300);
  rimLight.position.set(0, 40, -60);
  scene3D.add(rimLight);

  fillLight = new THREE.PointLight(0x4488ff, 2, 200);
  fillLight.position.set(-50, 20, 50);
  scene3D.add(fillLight);
  
  const texLoader = new THREE.TextureLoader();
  
  // Base Skybox and Floor Meshes (For all stages)
  const skyGeo = new THREE.SphereGeometry(800, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false });
  skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.rotation.y = -Math.PI / 2;
  scene3D.add(skyMesh);
  
  const floorGeo = new THREE.PlaneGeometry(3000, 3000);
  const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.1 });
  floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene3D.add(floorMesh);

  // Build Dojo Background Environment
  buildDojoEnvironment();
  // Build Park Environment (Neon City slot)
  buildParkEnvironment();

  // Load Textures Asynchronously
  console.log("3D SYSTEM: Requesting Background Texture...");
  texLoader.load('./assets/bg_classic.png', (t) => {
    console.log("3D SYSTEM: Background Loaded Successfully.");
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.x = -1;
    warehouseBgTex = t;
    if (currentStageIdx === 2) skyMesh.material.map = warehouseBgTex;
    skyMesh.material.needsUpdate = true;
  }, undefined, (e) => console.error("3D SYSTEM: Background Load Error!", e));

  // Pro Retro Floor (Concrete)
  console.log("3D SYSTEM: Requesting Floor Texture...");
  texLoader.load('./assets/floor_classic.png', (t) => {
    console.log("3D SYSTEM: Floor Loaded Successfully.");
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(50, 50);
    warehouseFloorTex = t;
    if (currentStageIdx === 2) floorMesh.material.map = warehouseFloorTex;
    floorMesh.material.needsUpdate = true;
  }, undefined, (e) => {
    console.error("3D SYSTEM: Floor Load Error!", e);
  });

  scene3D.fog = new THREE.FogExp2(0x332222, 0.004);
  
  gltfLoader3D = new THREE.GLTFLoader();
}

// ========== MISHIMA DOJO: TEMPLE COURTYARD ==========
function buildDojoEnvironment() {
  dojoEnvGroup = new THREE.Group();

  // --- SHARED MATERIALS (realistic, muted palette) ---
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85, metalness: 0.02 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.9, metalness: 0.01 });
  const roofTileMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.55, metalness: 0.35 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6a, roughness: 0.95, metalness: 0.02 });
  const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9, metalness: 0.05 });
  const redLacquerMat = new THREE.MeshStandardMaterial({ color: 0x8B1A1A, roughness: 0.35, metalness: 0.15 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xC8A84E, metalness: 0.85, roughness: 0.15 });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x1a4a5a, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.6 });
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xc4a868, roughness: 0.95, metalness: 0.0 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.92, metalness: 0.0 });
  const blossomMat = new THREE.MeshStandardMaterial({ color: 0xd4506a, roughness: 0.65, metalness: 0.0 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.8, metalness: 0.0 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3a6a30, roughness: 0.9, metalness: 0.0 });
  const lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });

  // ====== 1. GROUND LAYERS (fighting courtyard → garden → distant terrain) ======
  
  // Inner stone courtyard (where fighters stand) — elevated slightly
  const courtyardGeo = new THREE.BoxGeometry(90, 1.5, 60);
  const courtyard = new THREE.Mesh(courtyardGeo, darkStoneMat);
  courtyard.position.set(0, -0.75, -10);
  courtyard.receiveShadow = true;
  dojoEnvGroup.add(courtyard);

  // Courtyard border trim (stone edging)
  for (let side of [-1, 1]) {
    const edgeGeo = new THREE.BoxGeometry(92, 2.5, 2);
    const edge = new THREE.Mesh(edgeGeo, stoneMat);
    edge.position.set(0, -0.25, -10 + side * 31);
    edge.receiveShadow = true;
    dojoEnvGroup.add(edge);
  }
  for (let side of [-1, 1]) {
    const edgeGeo = new THREE.BoxGeometry(2, 2.5, 64);
    const edge = new THREE.Mesh(edgeGeo, stoneMat);
    edge.position.set(side * 46, -0.25, -10);
    edge.receiveShadow = true;
    dojoEnvGroup.add(edge);
  }

  // Garden ground (surrounds the courtyard)
  const gardenGeo = new THREE.PlaneGeometry(400, 300);
  const garden = new THREE.Mesh(gardenGeo, grassMat);
  garden.rotation.x = -Math.PI / 2;
  garden.position.set(0, -1.5, -60);
  garden.receiveShadow = true;
  dojoEnvGroup.add(garden);

  // Sand path leading to temple (raked zen garden stripe)
  const pathGeo = new THREE.BoxGeometry(14, 0.2, 80);
  const path = new THREE.Mesh(pathGeo, sandMat);
  path.position.set(0, -1.3, -70);
  path.receiveShadow = true;
  dojoEnvGroup.add(path);

  // ====== 2. MAIN TEMPLE (centered behind the courtyard) ======
  
  // Raised stone foundation with steps
  const foundationGeo = new THREE.BoxGeometry(48, 5, 30);
  const foundation = new THREE.Mesh(foundationGeo, stoneMat);
  foundation.position.set(0, 1, -75);
  foundation.castShadow = true; foundation.receiveShadow = true;
  dojoEnvGroup.add(foundation);

  // Steps leading up to the temple (3 tiers)
  for (let i = 0; i < 4; i++) {
    const stepGeo = new THREE.BoxGeometry(18, 1.2, 2.5);
    const step = new THREE.Mesh(stepGeo, stoneMat);
    step.position.set(0, -1 + i * 1.2, -58 - i * 2);
    step.receiveShadow = true;
    dojoEnvGroup.add(step);
  }

  // Main hall (wooden body)
  const hallGeo = new THREE.BoxGeometry(42, 16, 24);
  const hall = new THREE.Mesh(hallGeo, woodMat);
  hall.position.set(0, 11.5, -75);
  hall.castShadow = true;
  dojoEnvGroup.add(hall);

  // Engawa (wooden veranda wrapping front)
  const verandaGeo = new THREE.BoxGeometry(46, 0.8, 4);
  const veranda = new THREE.Mesh(verandaGeo, darkWoodMat);
  veranda.position.set(0, 3.9, -62);
  veranda.receiveShadow = true;
  dojoEnvGroup.add(veranda);

  // Front pillars (wooden, not red — more grounded)
  for (let x = -18; x <= 18; x += 9) {
    const pillarGeo = new THREE.CylinderGeometry(0.8, 0.9, 15, 8);
    const pillar = new THREE.Mesh(pillarGeo, darkWoodMat);
    pillar.position.set(x, 11, -62);
    pillar.castShadow = true;
    dojoEnvGroup.add(pillar);
  }

  // Main roof (wide, heavy overhang — irimoya style)
  const mainRoofGeo = new THREE.BoxGeometry(54, 2.5, 32);
  const mainRoof = new THREE.Mesh(mainRoofGeo, roofTileMat);
  mainRoof.position.set(0, 20.5, -75);
  mainRoof.castShadow = true;
  dojoEnvGroup.add(mainRoof);

  // Upper roof (second tier, narrower)
  const upperRoofGeo = new THREE.BoxGeometry(38, 2, 22);
  const upperRoof = new THREE.Mesh(upperRoofGeo, roofTileMat);
  upperRoof.position.set(0, 26, -75);
  upperRoof.castShadow = true;
  dojoEnvGroup.add(upperRoof);

  // Roof ridge with decorative peak
  const ridgeGeo = new THREE.BoxGeometry(40, 1.5, 2);
  const ridge = new THREE.Mesh(ridgeGeo, roofTileMat);
  ridge.position.set(0, 27.5, -75);
  dojoEnvGroup.add(ridge);

  // Gold ornaments on roof peaks
  for (let x of [-18, 0, 18]) {
    const ornGeo = new THREE.ConeGeometry(1.2, 4, 6);
    const orn = new THREE.Mesh(ornGeo, goldMat);
    orn.position.set(x, 30, -75);
    dojoEnvGroup.add(orn);
  }

  // ====== 3. SIDE WINGS (connected to the main temple) ======
  
  // Left wing
  const wingGeo = new THREE.BoxGeometry(18, 12, 20);
  const leftWing = new THREE.Mesh(wingGeo, woodMat);
  leftWing.position.set(-35, 7.5, -72);
  leftWing.castShadow = true;
  dojoEnvGroup.add(leftWing);

  const lwRoofGeo = new THREE.BoxGeometry(24, 2, 26);
  const lwRoof = new THREE.Mesh(lwRoofGeo, roofTileMat);
  lwRoof.position.set(-35, 14.5, -72);
  lwRoof.castShadow = true;
  dojoEnvGroup.add(lwRoof);

  // Covered corridor connecting left wing to main hall
  const corridorGeo = new THREE.BoxGeometry(6, 8, 5);
  const leftCorridor = new THREE.Mesh(corridorGeo, darkWoodMat);
  leftCorridor.position.set(-24, 5.5, -72);
  dojoEnvGroup.add(leftCorridor);
  const lcRoof = new THREE.BoxGeometry(8, 1, 7);
  const lcRoofM = new THREE.Mesh(lcRoof, roofTileMat);
  lcRoofM.position.set(-24, 10, -72);
  dojoEnvGroup.add(lcRoofM);

  // Right wing
  const rightWing = new THREE.Mesh(wingGeo, woodMat);
  rightWing.position.set(35, 7.5, -72);
  rightWing.castShadow = true;
  dojoEnvGroup.add(rightWing);

  const rwRoofGeo = new THREE.BoxGeometry(24, 2, 26);
  const rwRoof = new THREE.Mesh(rwRoofGeo, roofTileMat);
  rwRoof.position.set(35, 14.5, -72);
  rwRoof.castShadow = true;
  dojoEnvGroup.add(rwRoof);

  // Right corridor
  const rightCorridor = new THREE.Mesh(corridorGeo, darkWoodMat);
  rightCorridor.position.set(24, 5.5, -72);
  dojoEnvGroup.add(rightCorridor);
  const rcRoof = new THREE.Mesh(lcRoof, roofTileMat);
  rcRoof.position.set(24, 10, -72);
  dojoEnvGroup.add(rcRoof);

  // ====== 4. TOWER / BELL TOWER (right side, taller) ======
  const towerGeo = new THREE.BoxGeometry(10, 28, 10);
  const tower = new THREE.Mesh(towerGeo, woodMat);
  tower.position.set(55, 14, -85);
  tower.castShadow = true;
  dojoEnvGroup.add(tower);

  for (let i = 0; i < 3; i++) {
    const tRoofGeo = new THREE.BoxGeometry(16 - i * 3, 1.5, 16 - i * 3);
    const tRoof = new THREE.Mesh(tRoofGeo, roofTileMat);
    tRoof.position.set(55, 29 + i * 5, -85);
    dojoEnvGroup.add(tRoof);
  }
  const bellSpire = new THREE.Mesh(new THREE.ConeGeometry(1, 5, 6), goldMat);
  bellSpire.position.set(55, 46, -85);
  dojoEnvGroup.add(bellSpire);

  // ====== 5. POND / LAKE (natural, organic — left of courtyard) ======
  // Pond with irregular shape (using ellipse)
  const pondGeo = new THREE.CircleGeometry(22, 32);
  const pond = new THREE.Mesh(pondGeo, waterMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(-55, -1.2, -50);
  dojoEnvGroup.add(pond);

  // Pond bank / rim (stone edging around the pond)
  const pondRimGeo = new THREE.TorusGeometry(22, 1.5, 4, 32);
  const pondRim = new THREE.Mesh(pondRimGeo, stoneMat);
  pondRim.rotation.x = -Math.PI / 2;
  pondRim.position.set(-55, -1, -50);
  dojoEnvGroup.add(pondRim);

  // Small stone bridge over the pond
  const bridgeGeo = new THREE.BoxGeometry(6, 1.2, 14);
  const bridge = new THREE.Mesh(bridgeGeo, stoneMat);
  bridge.position.set(-55, 0, -50);
  bridge.receiveShadow = true;
  dojoEnvGroup.add(bridge);

  // Bridge rails
  for (let side of [-1, 1]) {
    const railGeo = new THREE.BoxGeometry(0.6, 3, 14);
    const rail = new THREE.Mesh(railGeo, darkWoodMat);
    rail.position.set(-55 + side * 3, 2, -50);
    dojoEnvGroup.add(rail);
  }

  // ====== 6. CHERRY BLOSSOM TREES (naturally placed around compound) ======
  const treeData = [
    { x: -48, z: -42, s: 1.0 },   // Near courtyard left
    { x: 48, z: -48, s: 0.9 },    // Near courtyard right
    { x: -65, z: -70, s: 1.1 },   // Behind left wing
    { x: -40, z: -95, s: 0.85 },  // Far back left
    { x: 60, z: -100, s: 1.0 },   // Far back right
    { x: 0, z: -105, s: 1.2 },    // Center far back (largest)
    { x: -70, z: -35, s: 0.8 },   // Near pond
  ];
  
  treeData.forEach(({ x, z, s }) => {
    // Trunk (slightly curved with taper)
    const trunkGeo = new THREE.CylinderGeometry(0.8 * s, 1.4 * s, 14 * s, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 7 * s - 1.5, z);
    trunk.rotation.z = (Math.random() - 0.5) * 0.08; // Slight natural lean
    trunk.castShadow = true;
    dojoEnvGroup.add(trunk);

    // Canopy clusters (5-7 overlapping spheres for lush, natural look)
    const count = 5 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const r = (3 + Math.random() * 3) * s;
      const canopyGeo = new THREE.SphereGeometry(r, 8, 6);
      const canopy = new THREE.Mesh(canopyGeo, blossomMat);
      canopy.position.set(
        x + (Math.random() - 0.5) * 8 * s,
        (14 + Math.random() * 6) * s - 1.5,
        z + (Math.random() - 0.5) * 8 * s
      );
      canopy.castShadow = true;
      dojoEnvGroup.add(canopy);
    }
  });

  // ====== 7. EVERGREEN TREES (tall conifers for depth) ======
  const coniferPositions = [[-80, -60], [80, -65], [-90, -100], [90, -95], [-75, -120], [75, -110]];
  coniferPositions.forEach(([cx, cz]) => {
    const cTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1, 20, 5), trunkMat);
    cTrunk.position.set(cx, 8.5, cz);
    cTrunk.castShadow = true;
    dojoEnvGroup.add(cTrunk);

    for (let i = 0; i < 4; i++) {
      const coneR = 6 - i * 1.2;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(coneR, 8, 6), greenMat);
      cone.position.set(cx, 14 + i * 5, cz);
      cone.castShadow = true;
      dojoEnvGroup.add(cone);
    }
  });

  // ====== 8. STONE LANTERNS (along the sand path) ======
  const lanternSpots = [[-8, -50], [8, -50], [-8, -65], [8, -65]];
  lanternSpots.forEach(([lx, lz]) => {
    // Base
    const lBase = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), stoneMat);
    lBase.position.set(lx, -0.5, lz);
    dojoEnvGroup.add(lBase);
    // Post
    const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 4, 6), stoneMat);
    lPost.position.set(lx, 2, lz);
    dojoEnvGroup.add(lPost);
    // Cap (roof shape)
    const lCap = new THREE.Mesh(new THREE.ConeGeometry(2, 2, 4), stoneMat);
    lCap.rotation.y = Math.PI / 4;
    lCap.position.set(lx, 5, lz);
    dojoEnvGroup.add(lCap);
    // Glow
    const lGlow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 6), lanternGlowMat);
    lGlow.position.set(lx, 4, lz);
    dojoEnvGroup.add(lGlow);
    // Light
    const lLight = new THREE.PointLight(0xffaa44, 0.8, 20);
    lLight.position.set(lx, 5, lz);
    dojoEnvGroup.add(lLight);
  });

  // ====== 9. TORII GATE (entrance to the compound) ======
  const toriiPillarGeo = new THREE.CylinderGeometry(1, 1.1, 20, 8);
  const tp1 = new THREE.Mesh(toriiPillarGeo, redLacquerMat);
  tp1.position.set(-9, 10, -42);
  dojoEnvGroup.add(tp1);
  const tp2 = new THREE.Mesh(toriiPillarGeo, redLacquerMat);
  tp2.position.set(9, 10, -42);
  dojoEnvGroup.add(tp2);

  // Kasagi (top beam — slightly curved, wider than pillars)
  const kasagiGeo = new THREE.BoxGeometry(26, 2, 2.5);
  const kasagi = new THREE.Mesh(kasagiGeo, redLacquerMat);
  kasagi.position.set(0, 21, -42);
  dojoEnvGroup.add(kasagi);

  // Nuki (tie beam — thinner, between pillars)
  const nukiGeo = new THREE.BoxGeometry(22, 1.2, 1.2);
  const nuki = new THREE.Mesh(nukiGeo, redLacquerMat);
  nuki.position.set(0, 17, -42);
  dojoEnvGroup.add(nuki);

  // ====== 10. COMPOUND WALLS (low stone walls enclosing the grounds) ======
  // Back wall
  const bWall = new THREE.Mesh(new THREE.BoxGeometry(180, 6, 2), stoneMat);
  bWall.position.set(0, 1.5, -130);
  bWall.receiveShadow = true;
  dojoEnvGroup.add(bWall);
  // Left wall
  const lWall = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 100), stoneMat);
  lWall.position.set(-90, 1.5, -80);
  lWall.receiveShadow = true;
  dojoEnvGroup.add(lWall);
  // Right wall
  const rWall = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 100), stoneMat);
  rWall.position.set(90, 1.5, -80);
  rWall.receiveShadow = true;
  dojoEnvGroup.add(rWall);

  // ====== 11. DISTANT MOUNTAINS (far background silhouettes) ======
  const mtColors = [0x3a3a4a, 0x2a2a3a, 0x4a4a5a];
  const mtData = [
    { x: -120, z: -250, r: 80, h: 70 },
    { x: 0, z: -280, r: 100, h: 90 },
    { x: 130, z: -240, r: 75, h: 65 },
    { x: -60, z: -300, r: 90, h: 55 },
    { x: 80, z: -310, r: 85, h: 60 },
  ];
  mtData.forEach((md, i) => {
    const mtGeo = new THREE.ConeGeometry(md.r, md.h, 6);
    const mtMat = new THREE.MeshStandardMaterial({ color: mtColors[i % 3], roughness: 0.95, metalness: 0.0, fog: true });
    const mt = new THREE.Mesh(mtGeo, mtMat);
    mt.position.set(md.x, md.h / 2 - 10, md.z);
    dojoEnvGroup.add(mt);
  });

  // Finalize
  dojoEnvGroup.visible = false;
  scene3D.add(dojoEnvGroup);
  console.log("3D SYSTEM: Temple Compound Built.");
}

// ========== GREEN PARK ENVIRONMENT ==========
function buildParkEnvironment() {
  parkEnvGroup = new THREE.Group();

  // --- MATERIALS ---
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.92, metalness: 0.0 });
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xc4a87a, roughness: 0.85, metalness: 0.0 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, metalness: 0.05 });
  const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.85, metalness: 0.1 });
  const woodBenchMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85, metalness: 0.02 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.3, metalness: 0.8 });
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x3a8aaa, roughness: 0.05, metalness: 0.85, transparent: true, opacity: 0.65 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.92, metalness: 0.0 });
  const leafDarkMat = new THREE.MeshStandardMaterial({ color: 0x2a6a28, roughness: 0.75 });
  const leafLightMat = new THREE.MeshStandardMaterial({ color: 0x5aaa3a, roughness: 0.7 });
  const leafYellowMat = new THREE.MeshStandardMaterial({ color: 0x8aaa2a, roughness: 0.7 });
  const flowerRedMat = new THREE.MeshStandardMaterial({ color: 0xdd3344, roughness: 0.6 });
  const flowerYellowMat = new THREE.MeshStandardMaterial({ color: 0xffcc22, roughness: 0.6 });
  const flowerPurpleMat = new THREE.MeshStandardMaterial({ color: 0x8844cc, roughness: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.1 });
  const gazeboWoodMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.6, metalness: 0.0 });
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x3a7a30, roughness: 0.95 });
  const skyGrassMat = new THREE.MeshStandardMaterial({ color: 0x55aa44, roughness: 0.9 });

  // ====== 1. GROUND ======
  // Main park grass
  const grassGeo = new THREE.PlaneGeometry(500, 400);
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, -0.5, -80);
  grass.receiveShadow = true;
  parkEnvGroup.add(grass);

  // Fighting area (gravel/dirt patch)
  const arenaGeo = new THREE.BoxGeometry(80, 0.3, 50);
  const arena = new THREE.Mesh(arenaGeo, pathMat);
  arena.position.set(0, -0.3, -5);
  arena.receiveShadow = true;
  parkEnvGroup.add(arena);

  // ====== 2. WALKING PATHS ======
  // Main path (behind fighters towards fountain)
  const mainPathGeo = new THREE.BoxGeometry(10, 0.15, 120);
  const mainPath = new THREE.Mesh(mainPathGeo, pathMat);
  mainPath.position.set(0, -0.35, -70);
  mainPath.receiveShadow = true;
  parkEnvGroup.add(mainPath);

  // Cross path
  const crossPathGeo = new THREE.BoxGeometry(120, 0.15, 8);
  const crossPath = new THREE.Mesh(crossPathGeo, pathMat);
  crossPath.position.set(0, -0.35, -55);
  crossPath.receiveShadow = true;
  parkEnvGroup.add(crossPath);

  // ====== 3. FOUNTAIN PLAZA (center feature) ======
  // Circular stone base
  const fBaseLargeGeo = new THREE.CylinderGeometry(12, 13, 2, 24);
  const fBaseLarge = new THREE.Mesh(fBaseLargeGeo, stoneMat);
  fBaseLarge.position.set(0, 0.5, -70);
  fBaseLarge.receiveShadow = true;
  parkEnvGroup.add(fBaseLarge);

  // Water pool
  const poolGeo = new THREE.CylinderGeometry(10, 10, 1.5, 24);
  const pool = new THREE.Mesh(poolGeo, waterMat);
  pool.position.set(0, 1.5, -70);
  parkEnvGroup.add(pool);

  // Center pedestal
  const pedestalGeo = new THREE.CylinderGeometry(2, 2.5, 8, 8);
  const pedestal = new THREE.Mesh(pedestalGeo, whiteMat);
  pedestal.position.set(0, 5.5, -70);
  pedestal.castShadow = true;
  parkEnvGroup.add(pedestal);

  // Top bowl
  const bowlGeo = new THREE.CylinderGeometry(4, 2, 2, 12);
  const bowl = new THREE.Mesh(bowlGeo, whiteMat);
  bowl.position.set(0, 10.5, -70);
  parkEnvGroup.add(bowl);

  // Water spout (small sphere)
  const spoutGeo = new THREE.SphereGeometry(1.5, 8, 8);
  const spout = new THREE.Mesh(spoutGeo, waterMat);
  spout.position.set(0, 12.5, -70);
  parkEnvGroup.add(spout);

  // ====== 4. POND (to the right) ======
  const pondGeo = new THREE.CircleGeometry(25, 32);
  const pond = new THREE.Mesh(pondGeo, waterMat);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(55, -0.3, -85);
  parkEnvGroup.add(pond);

  // Pond rim
  const pondRimGeo = new THREE.TorusGeometry(25, 1.2, 4, 32);
  const pondRim = new THREE.Mesh(pondRimGeo, stoneMat);
  pondRim.rotation.x = -Math.PI / 2;
  pondRim.position.set(55, -0.1, -85);
  parkEnvGroup.add(pondRim);

  // Lily pads
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 8 + Math.random() * 12;
    const lilyGeo = new THREE.CircleGeometry(1.5 + Math.random(), 8);
    const lily = new THREE.Mesh(lilyGeo, leafDarkMat);
    lily.rotation.x = -Math.PI / 2;
    lily.position.set(55 + Math.cos(angle) * dist, 0, -85 + Math.sin(angle) * dist);
    parkEnvGroup.add(lily);
  }

  // ====== 5. GAZEBO (left side) ======
  // Floor
  const gazFloorGeo = new THREE.CylinderGeometry(8, 8, 0.5, 6);
  const gazFloor = new THREE.Mesh(gazFloorGeo, gazeboWoodMat);
  gazFloor.position.set(-55, 0.5, -65);
  gazFloor.receiveShadow = true;
  parkEnvGroup.add(gazFloor);

  // Pillars
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 6);
    const pillar = new THREE.Mesh(pillarGeo, gazeboWoodMat);
    pillar.position.set(-55 + Math.cos(angle) * 7, 5.5, -65 + Math.sin(angle) * 7);
    pillar.castShadow = true;
    parkEnvGroup.add(pillar);
  }

  // Roof
  const gazRoofGeo = new THREE.ConeGeometry(10, 5, 6);
  const gazRoof = new THREE.Mesh(gazRoofGeo, new THREE.MeshStandardMaterial({ color: 0x6a4a3a, roughness: 0.7 }));
  gazRoof.position.set(-55, 13, -65);
  gazRoof.castShadow = true;
  parkEnvGroup.add(gazRoof);

  // ====== 6. PARK BENCHES ======
  const benchSpots = [[-20, -40], [20, -40], [-30, -55], [30, -55], [-15, -85], [15, -85]];
  benchSpots.forEach(([bx, bz]) => {
    // Seat
    const seatGeo = new THREE.BoxGeometry(6, 0.4, 2);
    const seat = new THREE.Mesh(seatGeo, woodBenchMat);
    seat.position.set(bx, 1.8, bz);
    seat.receiveShadow = true;
    parkEnvGroup.add(seat);
    // Legs
    for (let lx of [-2.5, 2.5]) {
      const legGeo = new THREE.BoxGeometry(0.4, 1.8, 1.8);
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(bx + lx, 0.9, bz);
      parkEnvGroup.add(leg);
    }
    // Backrest
    const backGeo = new THREE.BoxGeometry(6, 2, 0.3);
    const back = new THREE.Mesh(backGeo, woodBenchMat);
    back.position.set(bx, 3, bz - 0.85);
    parkEnvGroup.add(back);
  });

  // ====== 7. TREES (varied species) ======
  // Full oak/maple trees
  const treeDefs = [
    { x: -35, z: -45, s: 1.0, mat: leafDarkMat },
    { x: 35, z: -42, s: 1.1, mat: leafLightMat },
    { x: -50, z: -90, s: 1.2, mat: leafDarkMat },
    { x: 50, z: -100, s: 0.9, mat: leafYellowMat },
    { x: -70, z: -50, s: 1.0, mat: leafLightMat },
    { x: 70, z: -55, s: 1.1, mat: leafDarkMat },
    { x: 0, z: -110, s: 1.3, mat: leafLightMat },
    { x: -80, z: -80, s: 0.85, mat: leafYellowMat },
    { x: 80, z: -75, s: 0.9, mat: leafDarkMat },
    { x: -25, z: -100, s: 1.0, mat: leafLightMat },
    { x: 25, z: -95, s: 1.1, mat: leafYellowMat },
  ];

  treeDefs.forEach(({ x, z, s, mat }) => {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7 * s, 1.2 * s, 12 * s, 6),
      trunkMat
    );
    trunk.position.set(x, 6 * s - 0.5, z);
    trunk.castShadow = true;
    parkEnvGroup.add(trunk);

    const count = 5 + Math.floor(Math.random() * 4);
    for (let j = 0; j < count; j++) {
      const r = (3.5 + Math.random() * 3) * s;
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
      canopy.position.set(
        x + (Math.random() - 0.5) * 8 * s,
        (12 + Math.random() * 6) * s - 0.5,
        z + (Math.random() - 0.5) * 8 * s
      );
      canopy.castShadow = true;
      parkEnvGroup.add(canopy);
    }
  });

  // ====== 8. FLOWER BEDS (along paths) ======
  const flowerBedSpots = [
    { x: -6, z: -45, w: 4, d: 12, mat: flowerRedMat },
    { x: 6, z: -45, w: 4, d: 12, mat: flowerYellowMat },
    { x: -6, z: -78, w: 4, d: 10, mat: flowerPurpleMat },
    { x: 6, z: -78, w: 4, d: 10, mat: flowerRedMat },
    { x: -35, z: -55, w: 8, d: 4, mat: flowerYellowMat },
    { x: 35, z: -55, w: 8, d: 4, mat: flowerPurpleMat },
  ];

  flowerBedSpots.forEach(({ x, z, w, d, mat }) => {
    // Soil bed
    const bedGeo = new THREE.BoxGeometry(w, 0.5, d);
    const bed = new THREE.Mesh(bedGeo, new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.95 }));
    bed.position.set(x, -0.1, z);
    parkEnvGroup.add(bed);

    // Flower clusters
    const count = Math.floor((w * d) / 3);
    for (let i = 0; i < count; i++) {
      const fGeo = new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 5, 4);
      const flower = new THREE.Mesh(fGeo, mat);
      flower.position.set(
        x + (Math.random() - 0.5) * (w - 1),
        0.5 + Math.random() * 0.5,
        z + (Math.random() - 0.5) * (d - 1)
      );
      parkEnvGroup.add(flower);
    }
  });

  // ====== 9. LAMP POSTS ======
  const lampSpots = [[-12, -45], [12, -45], [-12, -70], [12, -70], [-12, -90], [12, -90]];
  lampSpots.forEach(([lx, lz]) => {
    // Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 10, 6), metalMat);
    pole.position.set(lx, 5, lz);
    parkEnvGroup.add(pole);
    // Lamp head
    const lampHead = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffeedd }));
    lampHead.position.set(lx, 10.5, lz);
    parkEnvGroup.add(lampHead);
    // Light
    const lampLight = new THREE.PointLight(0xffeedd, 0.5, 25);
    lampLight.position.set(lx, 11, lz);
    parkEnvGroup.add(lampLight);
  });

  // ====== 10. ROLLING HILLS (background depth) ======
  const hillData = [
    { x: -100, z: -180, r: 60, h: 25 },
    { x: 0, z: -200, r: 80, h: 35 },
    { x: 110, z: -170, r: 55, h: 22 },
    { x: -60, z: -220, r: 70, h: 30 },
    { x: 70, z: -230, r: 65, h: 28 },
    { x: -130, z: -160, r: 50, h: 18 },
    { x: 140, z: -190, r: 55, h: 20 },
  ];

  hillData.forEach(hd => {
    const hillGeo = new THREE.SphereGeometry(hd.r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hill = new THREE.Mesh(hillGeo, hd.h > 25 ? hillMat : skyGrassMat);
    hill.position.set(hd.x, -0.5, hd.z);
    parkEnvGroup.add(hill);
  });

  // ====== 11. FENCE / LOW HEDGE BORDER ======
  // Hedge running along left
  const hedgeGeo = new THREE.BoxGeometry(2, 3, 120);
  const hedgeL = new THREE.Mesh(hedgeGeo, leafDarkMat);
  hedgeL.position.set(-85, 1, -70);
  parkEnvGroup.add(hedgeL);
  const hedgeR = new THREE.Mesh(hedgeGeo, leafDarkMat);
  hedgeR.position.set(85, 1, -70);
  parkEnvGroup.add(hedgeR);
  // Back hedge
  const hedgeBGeo = new THREE.BoxGeometry(172, 3, 2);
  const hedgeB = new THREE.Mesh(hedgeBGeo, leafDarkMat);
  hedgeB.position.set(0, 1, -130);
  parkEnvGroup.add(hedgeB);

  // Finalize
  parkEnvGroup.visible = false;
  scene3D.add(parkEnvGroup);
  console.log("3D SYSTEM: Green Park Built.");
}

function applyStageTheme(idx) {
  if (!skyMesh || !floorMesh) return;
  currentStageIdx = idx;

  // 0: Dojo, 1: Neon City, 2: Warehouse
  if (idx === 0) {
    skyMesh.visible = true;
    floorMesh.visible = true;
    if (dojoEnvGroup) dojoEnvGroup.visible = true;
    if (parkEnvGroup) parkEnvGroup.visible = false;
    scene3D.background = null;
    scene3D.fog.density = 0.003;

    skyMesh.material.map = null;
    skyMesh.material.color.setHex(0x5c3a21); // Brighter Dojo Wall
    floorMesh.material.map = null;
    floorMesh.material.color.setHex(0x4a2a18); // Darker Wood floor
    ambientLight.color.setHex(0xffccaa);
    ambientLight.intensity = 0.5;
    sunLight.color.setHex(0xffaa55);
    sunLight.intensity = 1.2;
    fillLight.color.setHex(0xaa6622);
    fillLight.intensity = 1.0;
    scene3D.fog.color.setHex(0x2a1a0f);
  } 
  else if (idx === 1) {
    skyMesh.visible = false;
    floorMesh.visible = false;
    if (dojoEnvGroup) dojoEnvGroup.visible = false;
    if (parkEnvGroup) parkEnvGroup.visible = true;
    scene3D.background = new THREE.Color(0x6ec6ff); // Bright blue sky
    scene3D.fog.density = 0.003;
    scene3D.fog.color.setHex(0x88ccee);

    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 0.7;
    sunLight.color.setHex(0xfff5e0); // Warm sunlight
    sunLight.intensity = 1.5;
    fillLight.color.setHex(0x88ccff);
    fillLight.intensity = 1.0;
  } 
  else if (idx === 2) {
    skyMesh.visible = true;
    floorMesh.visible = true;
    if (dojoEnvGroup) dojoEnvGroup.visible = false;
    if (parkEnvGroup) parkEnvGroup.visible = false;
    scene3D.background = null;
    scene3D.fog.density = 0.004;

    skyMesh.material.color.setHex(0xffffff);
    skyMesh.material.map = warehouseBgTex;
    floorMesh.material.color.setHex(0xffffff);
    floorMesh.material.map = warehouseFloorTex;
    ambientLight.color.setHex(0xffccaa);
    ambientLight.intensity = 0.6;
    sunLight.color.setHex(0xff9966);
    sunLight.intensity = 2.0;
    fillLight.color.setHex(0x4488ff);
    fillLight.intensity = 2;
    scene3D.fog.color.setHex(0x332222);
  }
  
  skyMesh.material.needsUpdate = true;
  floorMesh.material.needsUpdate = true;
}

const MODEL_MAP = {
  vegeta: './assets/vegeta.glb',
  sonic: './assets/sonic.glb',
  chuck: './assets/chuck.glb',
  jin: './assets/free_fire_demented_maniac_bundle.glb',
  nano: './assets/nano_persona_q.glb',
  // Fallbacks for backwards compatibility
  kazuya: './assets/vegeta.glb',
  goku: './assets/free_fire_demented_maniac_bundle.glb',
  nina: './assets/lynae_3d_model_from_aplaybox_site.glb',
  paul: './assets/chuck.glb'
};

function loadFighterModel(f, side) {
  const url = MODEL_MAP[f.charKey];
  if (!url) return;

  const playerKey = side === 1 ? 'p1' : 'p2';
  
  // DESTROY GHOSTS: Remove ANY previous model for this player slot
  if (window.activeModels3D[playerKey]) {
    scene3D.remove(window.activeModels3D[playerKey]);
    window.activeModels3D[playerKey] = null;
  }

  console.log(`Loading 3D Model for Player ${side}:`, f.charKey);
  
  gltfLoader3D.load(url, (gltf) => {
    const m = gltf.scene;
    
    // Auto-Scale to standard fighter height
    const box = new THREE.Box3().setFromObject(m);
    const sizeY = (box.max.y - box.min.y) || 1;
    const scale = 22 / sizeY; 
    
    const wrapper = new THREE.Group();
    wrapper.add(m);
    wrapper.scale.set(scale, scale, scale);
    
    // Recompute bounding box after scale to find the lowest vertex (feet)
    const scaledBox = new THREE.Box3().setFromObject(wrapper);
    wrapper.position.y -= scaledBox.min.y; // Pin exactly to the floor line
    
    wrapper.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    
    const pivot = new THREE.Group();
    pivot.add(wrapper);
    scene3D.add(pivot);
    
    // Store globally for management
    window.activeModels3D[playerKey] = pivot;
    f.model3D = pivot;

    // Animations
    if (gltf.animations.length > 0) {
      f.mixer = new THREE.AnimationMixer(m);
      f.actions = {};
      gltf.animations.forEach(clip => {
        const name = clip.name.toLowerCase();
        let key = name;
        if (name.includes('idle') || name.includes('stand')) key = 'idle';
        else if (name.includes('walk') || name.includes('run') || name.includes('dash') || name.includes('move')) key = 'walk';
        else if (name.includes('punch') || name.includes('attack') || name.includes('strike')) key = 'punch';
        else if (name.includes('kick') || name.includes('leg')) key = 'kick';
        else if (name.includes('hurt') || name.includes('damage') || name.includes('stun') || name.includes('hit')) key = 'hurt';
        else if (name.includes('dead') || name.includes('lose') || name.includes('fall')) key = 'dead';
        f.actions[key] = f.mixer.clipAction(clip);
      });
      
      const fallback = f.actions.idle || f.mixer.clipAction(gltf.animations[0]);
      ['idle', 'walk', 'punch', 'kick', 'hurt', 'dead'].forEach(k => { if (!f.actions[k]) f.actions[k] = fallback; });
      
      f.currentAction = f.actions.idle;
      if (f.currentAction) f.currentAction.reset().fadeIn(0.1).play();
    }
    
    f.isLoading3D = false;
  }, undefined, (err) => { 
    console.error("3D Load Failed:", err, "- Creating procedural fighter"); 
    f.isLoading3D = false; 
    f.loadFailed = true;
    
    // Build a procedural 3D humanoid so the fighter is ALWAYS visible
    createProceduralFighter(f, side, playerKey);
  });
}

function createProceduralFighter(f, side, playerKey) {
  // Get character color from the game's CHARS table
  const charColors = {
    vegeta: { body: 0x00d4ff, accent: 0x0066ff },
    sonic:  { body: 0x0066ff, accent: 0x0000aa },
    chuck:  { body: 0xffcc00, accent: 0xaa8800 },
    jin:    { body: 0xff4466, accent: 0xaa0033 },
    nano:   { body: 0x00ffcc, accent: 0x009966 },
    kazuya: { body: 0x8b0000, accent: 0x550000 },
    paul:   { body: 0xff6600, accent: 0xcc4400 },
    nina:   { body: 0xcc44ff, accent: 0x8800aa }
  };
  
  const colors = charColors[f.charKey] || { body: 0x888888, accent: 0x444444 };
  const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.4, metalness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.5, metalness: 0.2 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  const group = new THREE.Group();
  
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), skinMat);
  head.position.y = 18;
  head.castShadow = true;
  group.add(head);
  
  // Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), eyeMat);
  eyeL.position.set(-0.6, 18.3, 1.5);
  group.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), eyeMat);
  eyeR.position.set(0.6, 18.3, 1.5);
  group.add(eyeR);
  
  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.5, 7, 12), bodyMat);
  torso.position.y = 13;
  torso.castShadow = true;
  group.add(torso);
  
  // Belt
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.8, 12), accentMat);
  belt.position.y = 9.5;
  group.add(belt);
  
  // Left Arm
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5, 8), bodyMat);
  armL.position.set(-2.5, 13, 0);
  armL.rotation.z = 0.3;
  armL.castShadow = true;
  group.add(armL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), skinMat);
  handL.position.set(-3.8, 10.5, 0);
  group.add(handL);
  
  // Right Arm
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5, 8), bodyMat);
  armR.position.set(2.5, 13, 0);
  armR.rotation.z = -0.3;
  armR.castShadow = true;
  group.add(armR);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), skinMat);
  handR.position.set(3.8, 10.5, 0);
  group.add(handR);
  
  // Left Leg
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 6, 8), accentMat);
  legL.position.set(-0.8, 5.5, 0);
  legL.castShadow = true;
  group.add(legL);
  const footL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  footL.position.set(-0.8, 2.2, 0.3);
  group.add(footL);
  
  // Right Leg
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 6, 8), accentMat);
  legR.position.set(0.8, 5.5, 0);
  legR.castShadow = true;
  group.add(legR);
  const footR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  footR.position.set(0.8, 2.2, 0.3);
  group.add(footR);
  
  // Character name label (floating)
  // (skip text for now - name is already on HUD)
  
  // Position and pin to floor
  group.position.y = 0;
  
  const pivot = new THREE.Group();
  pivot.add(group);
  scene3D.add(pivot);
  
  window.activeModels3D[playerKey] = pivot;
  f.model3D = pivot;
  f.proceduralParts = { head, torso, armL, armR, legL, legR, handL, handR };
  
  console.log(`Procedural 3D fighter created for ${f.charKey} (Player ${side})`);
}

function updateFighter3D(f, side, dt) {
  if (!f.model3D && !f.isLoading3D && !f.loadFailed && MODEL_MAP[f.charKey]) {
    f.isLoading3D = true;
    loadFighterModel(f, side);
  }
  
  // If loadFailed and no model yet, create procedural
  if (!f.model3D && f.loadFailed) {
    const playerKey = side === 1 ? 'p1' : 'p2';
    createProceduralFighter(f, side, playerKey);
  }

  // Animation Update
  if (f.mixer) f.mixer.update(dt * 0.01667); 

  if (f.model3D) {
    // Map 2D to 3D position
    const targetX = (f.x - 450) / 10;
    const targetY = Math.max(0, (420 - f.y) / 10.0);
    
    f.model3D.position.x += (targetX - f.model3D.position.x) * 0.3;
    f.model3D.position.y += (targetY - f.model3D.position.y) * 0.3;
    
    // Face correct direction
    const targetRY = f.facing === 1 ? Math.PI/2 : -Math.PI/2;
    f.model3D.rotation.y += (targetRY - f.model3D.rotation.y) * 0.2;

    // State Matching
    let animKey = 'idle';
    if (f.hp <= 0) animKey = 'dead';
    else if (f.state === 'hurt') animKey = 'hurt';
    else if (f.state === 'walk') animKey = 'walk';
    else if (f.state === 'punch') animKey = 'punch';
    else if (f.state === 'kick') animKey = 'kick';

    if (f.actions && f.actions[animKey] && f.currentAction !== f.actions[animKey]) {
      const next = f.actions[animKey];
      if (f.currentAction) f.currentAction.fadeOut(0.2);
      next.reset().fadeIn(0.2).play();
      f.currentAction = next;
    }

    // Procedural Animation Fallback for Unrigged Models (T-Pose prevention)
    if (!f.mixer || Object.keys(f.actions || {}).length === 0) {
      const t = clock.getElapsedTime();
      let rZ = 0, offY = 0, offX = 0;
      
      if (animKey === 'idle') {
        rZ = Math.sin(t * 4 + side) * 0.04;
        offY = Math.abs(Math.sin(t * 4 + side)) * 0.2;
      } else if (animKey === 'walk') {
        rZ = Math.sin(t * 12 + side) * 0.15;
        offY = Math.abs(Math.sin(t * 12 + side)) * 0.6;
      } else if (animKey === 'punch' || animKey === 'kick') {
        rZ = f.facing * 0.4;
        offX = f.facing * 1.5;
      } else if (animKey === 'hurt') {
        rZ = -f.facing * 0.3;
        f.model3D.rotation.x = Math.sin(t * 40) * 0.2;
      } else if (animKey === 'dead') {
        rZ = -f.facing * (Math.PI / 2);
      }
      
      f.model3D.rotation.z = rZ;
      f.model3D.position.x += offX;
      f.model3D.position.y += offY;
    }
    
    // Procedural LIMB animation for generated humanoid fighters
    if (f.proceduralParts) {
      const t = clock.getElapsedTime();
      const pp = f.proceduralParts;
      
      // Reset all limbs
      pp.armL.rotation.z = 0.3;
      pp.armR.rotation.z = -0.3;
      pp.armL.rotation.x = 0;
      pp.armR.rotation.x = 0;
      pp.legL.rotation.x = 0;
      pp.legR.rotation.x = 0;
      pp.head.position.y = 18;
      
      if (animKey === 'idle') {
        // Gentle breathing bob  
        const bob = Math.sin(t * 3 + side) * 0.15;
        pp.torso.position.y = 13 + bob;
        pp.head.position.y = 18 + bob;
        pp.armL.rotation.z = 0.3 + Math.sin(t * 2) * 0.05;
        pp.armR.rotation.z = -0.3 - Math.sin(t * 2) * 0.05;
      } else if (animKey === 'walk') {
        // Arm and leg swing
        const swing = Math.sin(t * 10 + side) * 0.5;
        pp.legL.rotation.x = swing;
        pp.legR.rotation.x = -swing;
        pp.armL.rotation.x = -swing * 0.6;
        pp.armR.rotation.x = swing * 0.6;
      } else if (animKey === 'punch') {
        // Right arm extends forward
        pp.armR.rotation.z = -1.2;
        pp.armR.rotation.x = -0.8;
        pp.handR.position.set(2, 14, 4);
        pp.torso.rotation.y = 0.3;
      } else if (animKey === 'kick') {
        // Right leg extends forward
        pp.legR.rotation.x = -1.2;
        pp.armL.rotation.z = 0.8;
        pp.armR.rotation.z = -0.8;
        pp.torso.rotation.x = -0.15;
      } else if (animKey === 'hurt') {
        // Flinch backward
        pp.torso.rotation.x = 0.2;
        pp.head.position.y = 17.5;
        pp.armL.rotation.z = 0.6;
        pp.armR.rotation.z = -0.6;
        // Shake
        pp.head.position.x = Math.sin(t * 50) * 0.3;
      } else if (animKey === 'dead') {
        // Fall backward
        pp.torso.rotation.x = 0.8;
        pp.head.position.y = 16;
        pp.armL.rotation.z = 1.2;
        pp.armR.rotation.z = -1.2;
      }
    }
  }
}

let hitParticles3D = [];
let cameraShake3D = 0;
let koCameraActive = false;
let koCameraTargetX = 0;
let koCameraAngle = 0;

window.triggerKOCamera3D = function(winnerX2D) {
  koCameraActive = true;
  koCameraTargetX = winnerX2D !== null ? (winnerX2D - 450) / 10 : camera3D.position.x;
  koCameraAngle = 0;
};

window.resetCamera3D = function() {
  koCameraActive = false;
  cameraShake3D = 0;
};

window.spawnHitEffect3D = function(x, y, colorStr, isUltimate) {
  if (!scene3D) return;
  // Convert 2D coords to 3D world space loosely
  const targetX = (x - 450) / 10;
  const targetY = Math.max(0, (420 - y) / 10.0);
  
  const count = isUltimate ? 100 : 30;
  const color = new THREE.Color(colorStr);
  
  // A glowing orb material for particles
  const material = new THREE.MeshBasicMaterial({ 
    color: color, 
    transparent: true, 
    opacity: 1,
    blending: THREE.AdditiveBlending 
  });
  
  // Use a simple geometry for all particles (instancing technically better, but this is simple enough for < 200 particles)
  const geo = new THREE.SphereGeometry(isUltimate ? 0.8 : 0.4, 4, 4);

  // Spark ring effect
  for(let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, material.clone());
    mesh.position.set(targetX, targetY + 12 /* roughly chest height */, 0); // Z=0 is center combat plane
    
    // Explosive velocity
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = (isUltimate ? 2 + Math.random() * 3 : 1 + Math.random() * 1.5);
    
    scene3D.add(mesh);
    hitParticles3D.push({
      mesh: mesh,
      vx: Math.sin(phi) * Math.cos(theta) * speed,
      vy: Math.cos(phi) * speed,
      vz: Math.sin(phi) * Math.sin(theta) * speed,
      life: 1.0,
      decay: 0.03 + Math.random() * 0.03
    });
  }

  // Create an impact light directly
  const flashLight = new THREE.PointLight(color, isUltimate ? 5 : 2, 50);
  flashLight.position.set(targetX, targetY + 12, 10);
  scene3D.add(flashLight);
  hitParticles3D.push({ light: flashLight, life: 1.0, decay: 0.1 });
};

window.triggerCameraShake3D = function(intensity) {
  cameraShake3D = intensity; // 0 to 1 value typically
};

window.update3D = function(dt) {
  if (!scene3D) init3DLoader();
  
  // Dynamic Stage Swapping
  if (window.game && window.game.stageIdx !== currentStageIdx) {
    applyStageTheme(window.game.stageIdx);
  }

  if (window.p1) updateFighter3D(window.p1, 1, dt);
  if (window.p2) updateFighter3D(window.p2, 2, dt);
  
  // Update particles
  for (let i = hitParticles3D.length - 1; i >= 0; i--) {
    let p = hitParticles3D[i];
    p.life -= p.decay * (dt || 1);
    
    if (p.mesh) {
      p.mesh.position.x += p.vx * (dt || 1);
      p.mesh.position.y += p.vy * (dt || 1);
      p.mesh.position.z += p.vz * (dt || 1);
      
      // Gravity / Drag
      p.vy -= 0.1 * (dt || 1);
      p.mesh.material.opacity = p.life;
      p.mesh.scale.setScalar(p.life);
    }
    
    if (p.light) {
      p.light.intensity = p.life * (p.light.intensity > 3 ? 5 : 2);
    }

    // Remove dead particles
    if (p.life <= 0) {
      if (p.mesh) {
        scene3D.remove(p.mesh);
        p.mesh.material.dispose();
      }
      if (p.light) scene3D.remove(p.light);
      hitParticles3D.splice(i, 1);
    }
  }

  // Dynamic 3D Camera Focus
  if (window.p1 && window.p2 && camera3D) {
    if (koCameraActive) {
      // Cinematic Bullet-Time Orbit
      koCameraAngle += 0.015 * (dt || 1); // Orbit speed
      const radius = 40; // Epic orbit distance
      const orbitX = koCameraTargetX + Math.sin(koCameraAngle) * radius;
      const orbitZ = Math.cos(koCameraAngle) * radius;
      
      camera3D.position.x += (orbitX - camera3D.position.x) * 0.05;
      camera3D.position.y += (10 - camera3D.position.y) * 0.05; // Drop low for a heroic angle
      camera3D.position.z += (orbitZ - camera3D.position.z) * 0.05;
      
      camera3D.lookAt(koCameraTargetX, 12, 0);
    } else {
      const centerX = (window.p1.x + window.p2.x) / 2;
      const dist = Math.abs(window.p1.x - window.p2.x);
      const camX = (centerX - 450) / 10;
      const camZ = 70 + (dist / 12);
      
      camera3D.position.x += (camX - camera3D.position.x) * 0.1;
      camera3D.position.z += (camZ - camera3D.position.z) * 0.1;
      
      // Apply Shake
      if (cameraShake3D > 0) {
        const shakeAmt = cameraShake3D * 1.5;
        camera3D.position.x += (Math.random() - 0.5) * shakeAmt;
        camera3D.position.y += (Math.random() - 0.5) * shakeAmt;
        camera3D.position.z += (Math.random() - 0.5) * shakeAmt;
        
        // Decay shake
        cameraShake3D -= 0.1 * (dt || 1);
        if (cameraShake3D < 0) cameraShake3D = 0;
      } else {
        // Return to baseline Y lazily when not shaking
        camera3D.position.y += (15 - camera3D.position.y) * 0.1;
      }

      camera3D.lookAt(camera3D.position.x, 15, 0);
    }
  }
};

window.render3D = function() {
  if (renderer3D && scene3D && camera3D) renderer3D.render(scene3D, camera3D);
};

window.get3DScreenshot = function() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return null;
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; // Return base64 only
};

window.drawBackground = function() { if (!scene3D) init3DLoader(); };
window.drawFighter = function() {}; // Don't draw 2D fighter anymore
window.drawShadow = function() {};

setTimeout(init3DLoader, 500);
