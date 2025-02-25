import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface TargetType {
  name: string;
  color: number;
  speed: number;
  health: number;
  points: number;
  size: number;
  behavior: 'stationary' | 'patrol' | 'chase' | 'teleport';
}

export function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [debug, setDebug] = useState(false);
  let lastFrameTime = performance.now();

  useEffect(() => {
    if (!mountRef.current) return;

    // Game state
    let bullets: THREE.Mesh[] = [];
    let targets: THREE.Mesh[] = [];
    let gameActive = true;
    
    // Movement state
    const keyState = {
      w: false,
      a: false,
      s: false,
      d: false,
    };
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Fog for depth perception
    scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    camera.position.y = 2;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Mouse look controls
    let mouseX = 0;
    let mouseY = 0;
    let isPointerLocked = false;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;
      
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      
      // Adjust rotation sensitivity
      const sensitivity = 0.002;
      
      // Update the camera direction using quaternions for smoother rotation
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      
      // Get current camera rotation
      euler.setFromQuaternion(camera.quaternion);
      
      // Apply mouse movement (with inverted Y for natural feel)
      euler.y -= movementX * sensitivity;
      euler.x -= movementY * sensitivity;
      
      // Clamp vertical rotation to prevent flipping
      euler.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, euler.x));
      
      // Apply the new rotation
      camera.quaternion.setFromEuler(euler);
    };

    // Pointer lock for better mouse controls
    const requestPointerLock = () => {
      mountRef.current?.requestPointerLock();
    };

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = document.pointerLockElement === mountRef.current;
    });

    window.addEventListener('mousemove', handleMouseMove);
    mountRef.current?.addEventListener('click', requestPointerLock);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,  // Forest green
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create a map with walls and structures
    const createMap = () => {
      // Create a map container to organize all map elements
      const mapContainer = new THREE.Group();
      scene.add(mapContainer);
      
      // Wall material
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.7,
        metalness: 0.1
      });
      
      // Brick material (using color instead of texture)
      const brickMaterial = new THREE.MeshStandardMaterial({
        color: 0x993333, // Brick red color
        roughness: 0.8,
        metalness: 0.1
      });
      
      // Create outer boundary walls
      const createWall = (x: number, z: number, width: number, height: number, depth: number, material: THREE.Material, rotation = 0) => {
        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(x, height/2, z);
        wall.rotation.y = rotation;
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        // Add collision data
        wall.userData.isWall = true;
        
        mapContainer.add(wall);
        return wall;
      };
      
      // Outer boundary walls
      const mapSize = 50;
      const wallHeight = 5;
      const wallThickness = 1;
      
      // North wall
      createWall(0, -mapSize, mapSize*2, wallHeight, wallThickness, wallMaterial);
      // South wall
      createWall(0, mapSize, mapSize*2, wallHeight, wallThickness, wallMaterial);
      // East wall
      createWall(mapSize, 0, wallThickness, wallHeight, mapSize*2, wallMaterial);
      // West wall
      createWall(-mapSize, 0, wallThickness, wallHeight, mapSize*2, wallMaterial);
      
      // Create buildings and structures
      
      // Central fortress
      const fortressSize = 10;
      // Fortress walls
      createWall(-fortressSize/2, -fortressSize/2, fortressSize, wallHeight, 1, brickMaterial, 0);
      createWall(-fortressSize/2, fortressSize/2, fortressSize, wallHeight, 1, brickMaterial, 0);
      createWall(-fortressSize/2, 0, 1, wallHeight, fortressSize, brickMaterial, 0);
      createWall(fortressSize/2, 0, 1, wallHeight, fortressSize+2, brickMaterial, 0);
      
      // Fortress towers
      const createTower = (x: number, z: number, height: number, radius: number) => {
        const towerGeometry = new THREE.CylinderGeometry(radius, radius*1.2, height, 8);
        const tower = new THREE.Mesh(towerGeometry, brickMaterial);
        tower.position.set(x, height/2, z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        tower.userData.isWall = true;
        mapContainer.add(tower);
        
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
      };
      
      // Create towers at the corners of the fortress
      createTower(-fortressSize/2, -fortressSize/2, wallHeight*1.5, 1.5);
      createTower(-fortressSize/2, fortressSize/2, wallHeight*1.5, 1.5);
      createTower(fortressSize/2, -fortressSize/2, wallHeight*1.5, 1.5);
      createTower(fortressSize/2, fortressSize/2, wallHeight*1.5, 1.5);
      
      // Create maze-like structures in different areas
      const createMazeSection = (startX: number, startZ: number, size: number, complexity: number) => {
        const wallPositions: {x: number, z: number, rotation: number}[] = [];
        
        // Generate random walls
        for (let i = 0; i < complexity; i++) {
          const x = startX + (Math.random() - 0.5) * size;
          const z = startZ + (Math.random() - 0.5) * size;
          const rotation = Math.floor(Math.random() * 2) * Math.PI / 2; // Either 0 or 90 degrees
          const length = 2 + Math.random() * 6;
          
          wallPositions.push({x, z, rotation});
          
          createWall(
            x, 
            z, 
            rotation === 0 ? length : wallThickness, 
            2 + Math.random() * 3, 
            rotation === 0 ? wallThickness : length, 
            Math.random() > 0.5 ? wallMaterial : brickMaterial,
            rotation
          );
        }
      };
      
      // Create several maze sections
      createMazeSection(-20, -20, 20, 15);
      createMazeSection(20, 20, 20, 15);
      createMazeSection(-20, 20, 20, 10);
      createMazeSection(20, -20, 20, 10);
      
      // Add some decorative elements
      
      // Trees
      const createTree = (x: number, z: number) => {
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
        mapContainer.add(treeGroup);
      };
      
      // Add trees around the map
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 15;
        createTree(
          Math.sin(angle) * distance,
          Math.cos(angle) * distance
        );
      }
      
      // Add some rocks
      const createRock = (x: number, z: number, scale: number) => {
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
        
        mapContainer.add(rock);
      };
      
      // Add rocks throughout the map
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40;
        createRock(
          Math.sin(angle) * distance,
          Math.cos(angle) * distance,
          0.5 + Math.random() * 1.5
        );
      }
      
      return mapContainer;
    };

    const map = createMap();

    // Define collision detection function
    const checkCollision = (position: THREE.Vector3): boolean => {
      // Check if the player is trying to move outside the map bounds
      const mapSize = 49; // Slightly less than the actual wall position
      if (
        position.x > mapSize || 
        position.x < -mapSize || 
        position.z > mapSize || 
        position.z < -mapSize
      ) {
        return true;
      }
      
      // Check collision with walls and other obstacles
      const playerRadius = 0.5;
      const colliders: THREE.Mesh[] = [];
      
      // Collect all objects with isWall flag
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.isWall) {
          colliders.push(object);
        }
      });
      
      // Create a sphere representing the player
      const playerSphere = new THREE.Sphere(position, playerRadius);
      
      // Check collision with each wall
      for (const collider of colliders) {
        // Get the bounding box of the wall
        const box = new THREE.Box3().setFromObject(collider);
        
        // Check if the player sphere intersects with the wall box
        if (box.intersectsSphere(playerSphere)) {
          return true;
        }
      }
      
      return false;
    };

    // Find a safe spawn position
    const findSafeSpawnPosition = (): THREE.Vector3 => {
      // Try several potential spawn points
      const potentialSpawns = [
        new THREE.Vector3(0, 2, 30),    // Default spawn
        new THREE.Vector3(20, 2, 30),   // Right side
        new THREE.Vector3(-20, 2, 30),  // Left side
        new THREE.Vector3(0, 2, -30),   // Back side
        new THREE.Vector3(30, 2, 0),    // Far right
        new THREE.Vector3(-30, 2, 0)    // Far left
      ];
      
      // Find the first position that doesn't collide with anything
      for (const position of potentialSpawns) {
        if (!checkCollision(position)) {
          console.log("Found safe spawn at", position);
          return position;
        }
      }
      
      // If all predefined positions fail, try random positions
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 20;
        const position = new THREE.Vector3(
          Math.sin(angle) * distance,
          2,
          Math.cos(angle) * distance
        );
        
        if (!checkCollision(position)) {
          console.log("Found random safe spawn at", position);
          return position;
        }
      }
      
      // If all else fails, use a high position to avoid being stuck
      console.log("Using fallback spawn position");
      return new THREE.Vector3(0, 10, 30);
    };

    // Set player position to a safe spawn point
    const safePosition = findSafeSpawnPosition();
    camera.position.copy(safePosition);

    // Create player weapon (gun)
    const gunGroup = new THREE.Group();
    camera.add(gunGroup);

    // Gun body
    const gunBodyGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.3);
    const gunBodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2 
    });
    const gunBody = new THREE.Mesh(gunBodyGeometry, gunBodyMaterial);
    gunBody.position.set(0.2, -0.2, -0.5);
    gunGroup.add(gunBody);

    // Gun barrel
    const gunBarrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    const gunBarrelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.1 
    });
    const gunBarrel = new THREE.Mesh(gunBarrelGeometry, gunBarrelMaterial);
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.set(0.2, -0.2, -0.7);
    gunGroup.add(gunBarrel);

    // Gun handle
    const gunHandleGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.08);
    const gunHandleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111,
      roughness: 0.8 
    });
    const gunHandle = new THREE.Mesh(gunHandleGeometry, gunHandleMaterial);
    gunHandle.position.set(0.2, -0.3, -0.45);
    gunGroup.add(gunHandle);

    scene.add(camera);

    // Define target types with personalities
    const targetTypes: TargetType[] = [
      {
        name: "Grunt",
        color: 0xff0000,
        speed: 0.02,
        health: 50,
        points: 50,
        size: 0.8,
        behavior: 'patrol'
      },
      {
        name: "Tank",
        color: 0x0000ff,
        speed: 0.01,
        health: 200,
        points: 150,
        size: 1.2,
        behavior: 'stationary'
      },
      {
        name: "Scout",
        color: 0x00ff00,
        speed: 0.05,
        health: 25,
        points: 75,
        size: 0.6,
        behavior: 'chase'
      },
      {
        name: "Ninja",
        color: 0x000000,
        speed: 0.03,
        health: 75,
        points: 100,
        size: 0.7,
        behavior: 'teleport'
      }
    ];

    // Function to create a bullet
    const createBullet = () => {
      const bulletGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const bulletMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
      });
      const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
      
      // Position bullet at the gun's position
      bullet.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );
      
      // Set direction based on camera's direction
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      bullet.userData = { 
        direction: direction,
        distance: 0,
        maxDistance: 100
      };
      
      scene.add(bullet);
      bullets.push(bullet);
      
      // Play sound effect
      // (In a real game, you'd add sound here)
    };

    // Function to create a target with personality
    const createTarget = () => {
      // Select a random target type
      const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      
      // Create different shapes based on target type
      let targetGeometry;
      
      switch(targetType.name) {
        case "Tank":
          targetGeometry = new THREE.BoxGeometry(
            targetType.size, 
            targetType.size, 
            targetType.size
          );
          break;
        case "Scout":
          targetGeometry = new THREE.SphereGeometry(targetType.size / 2, 16, 16);
          break;
        case "Ninja":
          targetGeometry = new THREE.TetrahedronGeometry(targetType.size / 2);
          break;
        default: // Grunt
          targetGeometry = new THREE.ConeGeometry(targetType.size / 2, targetType.size, 8);
      }
      
      const targetMaterial = new THREE.MeshStandardMaterial({ 
        color: targetType.color,
        metalness: 0.3,
        roughness: 0.4,
      });
      
      const target = new THREE.Mesh(targetGeometry, targetMaterial);
      
      // Random position within the map boundaries
      const mapSize = 45; // Slightly smaller than the actual map
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * mapSize;
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      
      // Make sure the target doesn't spawn inside a wall
      let validPosition = false;
      let attempts = 0;
      let finalX = x;
      let finalZ = z;
      
      while (!validPosition && attempts < 10) {
        const testPosition = new THREE.Vector3(finalX, 1, finalZ);
        if (!checkCollision(testPosition)) {
          validPosition = true;
        } else {
          // Try a slightly different position
          finalX = x + (Math.random() - 0.5) * 5;
          finalZ = z + (Math.random() - 0.5) * 5;
          attempts++;
        }
      }
      
      target.position.set(
        finalX,
        Math.random() * 3 + 0.5, // Height between 0.5 and 3.5
        finalZ
      );
      
      target.castShadow = true;
      
      // Store target properties in userData
      target.userData = { 
        health: targetType.health,
        type: targetType,
        initialPosition: target.position.clone(),
        movementAngle: Math.random() * Math.PI * 2,
        lastTeleport: 0,
        patrolRadius: 3 + Math.random() * 5
      };
      
      // Add a name label above the target
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.font = 'Bold 24px Arial';
        context.fillText(targetType.name, 10, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(labelMaterial);
        label.position.y = targetType.size + 0.5;
        label.scale.set(2, 0.5, 1);
        target.add(label);
      }
      
      scene.add(target);
      targets.push(target);
    };

    // Create initial targets
    for (let i = 0; i < 10; i++) {
      createTarget();
    }

    // Handle click to shoot
    const handleClick = () => {
      if (!gameActive) return;
      createBullet();
    };
    window.addEventListener("click", handleClick);

    // Game timer
    const gameTimer = setInterval(() => {
      if (!gameActive) return;
      
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          gameActive = false;
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn new targets periodically
    const targetSpawner = setInterval(() => {
      if (!gameActive || targets.length >= 20) return;
      createTarget();
    }, 2000);

    // Keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w': keyState.w = true; break;
        case 'a': keyState.a = true; break;
        case 's': keyState.s = true; break;
        case 'd': keyState.d = true; break;
        case 'f1': 
          // Toggle debug mode
          setDebug(prev => !prev);
          event.preventDefault();
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w': keyState.w = false; break;
        case 'a': keyState.a = false; break;
        case 's': keyState.s = false; break;
        case 'd': keyState.d = false; break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation loop
    const animate = () => {
      const now = performance.now();
      lastFrameTime = now;
      
      requestAnimationFrame(animate);
      
      if (gameActive) {
        // Movement vectors
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0; // Keep movement on the ground plane
        forward.normalize();
        
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0; // Keep movement on the ground plane
        right.normalize();
        
        const moveSpeed = 0.15;
        
        // Apply movement based on key states
        if (keyState.w) {
          const newPosition = camera.position.clone().addScaledVector(forward, moveSpeed);
          if (!checkCollision(newPosition)) {
            camera.position.copy(newPosition);
          }
        }
        if (keyState.s) {
          const newPosition = camera.position.clone().addScaledVector(forward, -moveSpeed);
          if (!checkCollision(newPosition)) {
            camera.position.copy(newPosition);
          }
        }
        if (keyState.a) {
          const newPosition = camera.position.clone().addScaledVector(right, -moveSpeed);
          if (!checkCollision(newPosition)) {
            camera.position.copy(newPosition);
          }
        }
        if (keyState.d) {
          const newPosition = camera.position.clone().addScaledVector(right, moveSpeed);
          if (!checkCollision(newPosition)) {
            camera.position.copy(newPosition);
          }
        }
        
        // Update targets based on their behavior
        const time = Date.now();
        
        for (const target of targets) {
          const targetData = target.userData;
          const targetType = targetData.type as TargetType;
          
          switch(targetType.behavior) {
            case 'patrol':
              // Move in a circular pattern
              targetData.movementAngle += 0.01;
              const patrolX = targetData.initialPosition.x + Math.cos(targetData.movementAngle) * targetData.patrolRadius;
              const patrolZ = targetData.initialPosition.z + Math.sin(targetData.movementAngle) * targetData.patrolRadius;
              target.position.x = patrolX;
              target.position.z = patrolZ;
              // Make it face the direction of movement
              target.lookAt(patrolX + Math.cos(targetData.movementAngle), target.position.y, patrolZ + Math.sin(targetData.movementAngle));
              break;
              
            case 'chase':
              // Move toward the player if within range
              const distanceToPlayer = target.position.distanceTo(camera.position);
              if (distanceToPlayer < 20) {
                const direction = new THREE.Vector3().subVectors(camera.position, target.position).normalize();
                direction.y = 0; // Keep on the ground
                target.position.addScaledVector(direction, targetType.speed);
                target.lookAt(camera.position);
              }
              break;
              
            case 'teleport':
              // Teleport to a new position every few seconds
              if (time - targetData.lastTeleport > 5000) { // Every 5 seconds
                const angle = Math.random() * Math.PI * 2;
                const distance = 10 + Math.random() * 10;
                target.position.set(
                  Math.sin(angle) * distance + camera.position.x,
                  Math.random() * 3 + 0.5,
                  Math.cos(angle) * distance + camera.position.z
                );
                targetData.lastTeleport = time;
                
                // Add teleport effect
                const teleportGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                const teleportMaterial = new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                  transparent: true,
                  opacity: 0.8
                });
                const teleportEffect = new THREE.Mesh(teleportGeometry, teleportMaterial);
                teleportEffect.position.copy(target.position);
                scene.add(teleportEffect);
                
                // Animate and remove the effect
                const startTime = time;
                const animateTeleport = () => {
                  const elapsed = Date.now() - startTime;
                  if (elapsed > 500) {
                    scene.remove(teleportEffect);
                    teleportGeometry.dispose();
                    teleportMaterial.dispose();
                    return;
                  }
                  
                  teleportEffect.scale.set(
                    1 + elapsed / 250,
                    1 + elapsed / 250,
                    1 + elapsed / 250
                  );
                  teleportMaterial.opacity = 0.8 - (elapsed / 500) * 0.8;
                  
                  requestAnimationFrame(animateTeleport);
                };
                animateTeleport();
              }
              break;
              
            case 'stationary':
            default:
              // Just rotate in place
              target.rotation.y += 0.01;
              break;
          }
        }
        
        // Update bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i];
          const bulletData = bullet.userData;
          
          // Move bullet forward
          bullet.position.add(
            bulletData.direction.clone().multiplyScalar(0.5)
          );
          
          bulletData.distance += 0.5;
          
          // Remove bullet if it's gone too far
          if (bulletData.distance > bulletData.maxDistance) {
            scene.remove(bullet);
            bullets.splice(i, 1);
            continue;
          }
          
          // Check for collisions with targets
          for (let j = targets.length - 1; j >= 0; j--) {
            const target = targets[j];
            const distance = bullet.position.distanceTo(target.position);
            
            if (distance < 0.75) { // Hit detection (approximate)
              // Reduce target health
              target.userData.health -= 25;
              
              // Remove bullet
              scene.remove(bullet);
              bullets.splice(i, 1);
              
              // If target is destroyed
              if (target.userData.health <= 0) {
                scene.remove(target);
                targets.splice(j, 1);
                setScore(prevScore => prevScore + target.userData.type.points);
              } else {
                // Visual feedback for hit
                if (target.material instanceof THREE.MeshStandardMaterial) {
                  target.material.emissive = new THREE.Color(0xff0000);
                  setTimeout(() => {
                    if (target.material instanceof THREE.MeshStandardMaterial) {
                      target.material.emissive = new THREE.Color(0x000000);
                    }
                  }, 200);
                }
              }
              
              break;
            }
          }
        }
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(gameTimer);
      clearInterval(targetSpawner);
      
      mountRef.current?.removeChild(renderer.domElement);
      
      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        }
      });
      
      renderer.dispose();
      
      // Remove mouse event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeEventListener('click', requestPointerLock);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Game UI */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
        Score: {score}
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
        Time: {timeLeft}s
      </div>
      
      {/* Debug overlay */}
      {debug && (
        <div className="absolute bottom-20 left-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs font-mono">
          <div>Position: X: {camera.position.x.toFixed(2)}, Y: {camera.position.y.toFixed(2)}, Z: {camera.position.z.toFixed(2)}</div>
          <div>Rotation: X: {(camera.rotation.x * 180 / Math.PI).toFixed(2)}°, Y: {(camera.rotation.y * 180 / Math.PI).toFixed(2)}°</div>
          <div>FPS: {Math.round(1000 / (performance.now() - lastFrameTime))}</div>
          <div>Targets: {targets.length}, Bullets: {bullets.length}</div>
          <div>Keys: {Object.entries(keyState).filter(([_, v]) => v).map(([k]) => k).join(', ')}</div>
        </div>
      )}
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.5" />
          <line x1="12" y1="4" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="20" />
          <line x1="4" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="20" y2="12" />
        </svg>
      </div>
      
      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 