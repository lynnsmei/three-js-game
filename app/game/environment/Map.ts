import * as THREE from "three";

export function createMap(scene: THREE.Scene): THREE.Group {
  // Create a map container to organize all map elements
  const mapContainer = new THREE.Group();
  scene.add(mapContainer);
  
  // Wall material
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.7,
    metalness: 0.1
  });
  
  // Brick material
  const brickMaterial = new THREE.MeshStandardMaterial({
    color: 0x993333, // Brick red color
    roughness: 0.8,
    metalness: 0.1
  });
  
  // Create walls, buildings, trees, etc.
  createBoundaryWalls(mapContainer, wallMaterial);
  createFortress(mapContainer, brickMaterial);
  createMazeSections(mapContainer, wallMaterial, brickMaterial);
  createTrees(mapContainer);
  createRocks(mapContainer);
  
  return mapContainer;
}

// Helper functions
function createWall(
  container: THREE.Group, 
  x: number, 
  z: number, 
  width: number, 
  height: number, 
  depth: number, 
  material: THREE.Material, 
  rotation = 0
): THREE.Mesh {
  const wallGeometry = new THREE.BoxGeometry(width, height, depth);
  const wall = new THREE.Mesh(wallGeometry, material);
  wall.position.set(x, height/2, z);
  wall.rotation.y = rotation;
  wall.castShadow = true;
  wall.receiveShadow = true;
  
  // Add collision data
  wall.userData.isWall = true;
  
  container.add(wall);
  return wall;
}

function createBoundaryWalls(container: THREE.Group, material: THREE.Material): void {
  const mapSize = 50;
  const wallHeight = 5;
  const wallThickness = 1;
  
  // North wall
  createWall(container, 0, -mapSize, mapSize*2, wallHeight, wallThickness, material);
  // South wall
  createWall(container, 0, mapSize, mapSize*2, wallHeight, wallThickness, material);
  // East wall
  createWall(container, mapSize, 0, wallThickness, wallHeight, mapSize*2, material);
  // West wall
  createWall(container, -mapSize, 0, wallThickness, wallHeight, mapSize*2, material);
}

function createFortress(container: THREE.Group, material: THREE.Material): void {
  const fortressSize = 10;
  const wallHeight = 5;
  
  // Fortress walls
  createWall(container, -fortressSize/2, -fortressSize/2, fortressSize, wallHeight, 1, material, 0);
  createWall(container, -fortressSize/2, fortressSize/2, fortressSize, wallHeight, 1, material, 0);
  createWall(container, -fortressSize/2, 0, 1, wallHeight, fortressSize, material, 0);
  createWall(container, fortressSize/2, 0, 1, wallHeight, fortressSize+2, material, 0);
  
  // Create towers at the corners of the fortress
  createTower(container, -fortressSize/2, -fortressSize/2, wallHeight*1.5, 1.5, material);
  createTower(container, -fortressSize/2, fortressSize/2, wallHeight*1.5, 1.5, material);
  createTower(container, fortressSize/2, -fortressSize/2, wallHeight*1.5, 1.5, material);
  createTower(container, fortressSize/2, fortressSize/2, wallHeight*1.5, 1.5, material);
}

function createTower(
  container: THREE.Group, 
  x: number, 
  z: number, 
  height: number, 
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const towerGeometry = new THREE.CylinderGeometry(radius, radius*1.2, height, 8);
  const tower = new THREE.Mesh(towerGeometry, material);
  tower.position.set(x, height/2, z);
  tower.castShadow = true;
  tower.receiveShadow = true;
  tower.userData.isWall = true;
  container.add(tower);
  
  // Add a roof
  const roofGeometry = new THREE.ConeGeometry(radius*1.2, height/2, 8);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x882222,
    roughness: 0.6
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = height/2 + height/4;
  tower.add(roof);
  
  return tower;
}

function createMazeSections(
  container: THREE.Group, 
  wallMaterial: THREE.Material, 
  brickMaterial: THREE.Material
): void {
  createMazeSection(container, -20, -20, 20, 15, wallMaterial, brickMaterial);
  createMazeSection(container, 20, 20, 20, 15, wallMaterial, brickMaterial);
  createMazeSection(container, -20, 20, 20, 10, wallMaterial, brickMaterial);
  createMazeSection(container, 20, -20, 20, 10, wallMaterial, brickMaterial);
}

function createMazeSection(
  container: THREE.Group, 
  startX: number, 
  startZ: number, 
  size: number, 
  complexity: number,
  wallMaterial: THREE.Material,
  brickMaterial: THREE.Material
): void {
  const wallThickness = 1;
  
  // Generate random walls
  for (let i = 0; i < complexity; i++) {
    const x = startX + (Math.random() - 0.5) * size;
    const z = startZ + (Math.random() - 0.5) * size;
    const rotation = Math.floor(Math.random() * 2) * Math.PI / 2; // Either 0 or 90 degrees
    const length = 2 + Math.random() * 6;
    
    createWall(
      container,
      x, 
      z, 
      rotation === 0 ? length : wallThickness, 
      2 + Math.random() * 3, 
      rotation === 0 ? wallThickness : length, 
      Math.random() > 0.5 ? wallMaterial : brickMaterial,
      rotation
    );
  }
}

function createTrees(container: THREE.Group): void {
  // Add trees around the map
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 15;
    createTree(
      container,
      Math.sin(angle) * distance,
      Math.cos(angle) * distance
    );
  }
}

function createTree(container: THREE.Group, x: number, z: number): void {
  const treeGroup = new THREE.Group();
  
  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Brown
    roughness: 0.9
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  trunk.castShadow = true;
  treeGroup.add(trunk);
  
  // Tree foliage
  const foliageGeometry = new THREE.SphereGeometry(1, 8, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22, // Forest green
    roughness: 0.8
  });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = 2.5;
  foliage.scale.y = 1.5;
  foliage.castShadow = true;
  treeGroup.add(foliage);
  
  treeGroup.position.set(x, 0, z);
  container.add(treeGroup);
}

function createRocks(container: THREE.Group): void {
  // Add rocks throughout the map
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40;
    createRock(
      container,
      Math.sin(angle) * distance,
      Math.cos(angle) * distance,
      0.5 + Math.random() * 1.5
    );
  }
}

function createRock(container: THREE.Group, x: number, z: number, scale: number): void {
  const rockGeometry = new THREE.DodecahedronGeometry(scale, 0);
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0.1
  });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  
  // Randomize the rock shape a bit
  const vertices = rock.geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    vertices.setXYZ(
      i,
      vertices.getX(i) + (Math.random() - 0.5) * 0.2 * scale,
      vertices.getY(i) + (Math.random() - 0.5) * 0.2 * scale,
      vertices.getZ(i) + (Math.random() - 0.5) * 0.2 * scale
    );
  }
  rock.geometry.computeVertexNormals();
  
  rock.position.set(x, scale/2, z);
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  rock.castShadow = true;
  rock.receiveShadow = true;
  rock.userData.isWall = true;
  
  container.add(rock);
} 