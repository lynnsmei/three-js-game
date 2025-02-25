import * as THREE from "three";

export enum WeaponType {
  PISTOL = "pistol",
  SHOTGUN = "shotgun",
  RIFLE = "rifle",
  ROCKET_LAUNCHER = "rocket_launcher"
}

export interface Weapon {
  type: WeaponType;
  name: string;
  model: THREE.Object3D | null;
  fireRate: number; // milliseconds between shots
  damage: number;
  bulletSpeed: number;
  bulletSize: number;
  bulletColor: number;
  bulletCount: number; // for shotgun
  spread: number; // for shotgun
  lastFired: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number; // milliseconds
  isReloading: boolean;
  reloadStart: number;
  sound: string;
}

// Weapon definitions
export const WEAPONS: Record<WeaponType, Omit<Weapon, "model" | "lastFired" | "isReloading" | "reloadStart">> = {
  [WeaponType.PISTOL]: {
    type: WeaponType.PISTOL,
    name: "Pistol",
    fireRate: 350,
    damage: 10,
    bulletSpeed: 70,
    bulletSize: 0.1,
    bulletColor: 0xffff00,
    bulletCount: 1,
    spread: 0,
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1000,
    sound: "pistol.mp3"
  },
  [WeaponType.SHOTGUN]: {
    type: WeaponType.SHOTGUN,
    name: "Shotgun",
    fireRate: 800,
    damage: 8,
    bulletSpeed: 60,
    bulletSize: 0.08,
    bulletColor: 0xff0000,
    bulletCount: 8,
    spread: 0.2,
    ammo: 6,
    maxAmmo: 6,
    reloadTime: 2000,
    sound: "shotgun.mp3"
  },
  [WeaponType.RIFLE]: {
    type: WeaponType.RIFLE,
    name: "Rifle",
    fireRate: 100,
    damage: 5,
    bulletSpeed: 100,
    bulletSize: 0.05,
    bulletColor: 0x00ffff,
    bulletCount: 1,
    spread: 0.05,
    ammo: 30,
    maxAmmo: 30,
    reloadTime: 1500,
    sound: "rifle.mp3"
  },
  [WeaponType.ROCKET_LAUNCHER]: {
    type: WeaponType.ROCKET_LAUNCHER,
    name: "Rocket Launcher",
    fireRate: 1500,
    damage: 50,
    bulletSpeed: 40,
    bulletSize: 0.3,
    bulletColor: 0xff5500,
    bulletCount: 1,
    spread: 0,
    ammo: 4,
    maxAmmo: 4,
    reloadTime: 3000,
    sound: "rocket.mp3"
  }
};

// Create weapon models
export function createWeaponModel(type: WeaponType): THREE.Object3D {
  let model = new THREE.Object3D();
  
  switch (type) {
    case WeaponType.PISTOL:
      // Simple pistol model
      const pistolBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.15, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      const pistolBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      pistolBarrel.rotation.x = Math.PI / 2;
      pistolBarrel.position.z = 0.4;
      pistolBarrel.position.y = 0.05;
      
      model.add(pistolBody);
      model.add(pistolBarrel);
      break;
      
    case WeaponType.SHOTGUN:
      // Shotgun model
      const shotgunBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      );
      const shotgunBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      shotgunBarrel.rotation.x = Math.PI / 2;
      shotgunBarrel.position.z = 0.6;
      shotgunBarrel.position.y = 0.05;
      
      model.add(shotgunBody);
      model.add(shotgunBarrel);
      break;
      
    case WeaponType.RIFLE:
      // Rifle model
      const rifleBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      const rifleBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      rifleBarrel.rotation.x = Math.PI / 2;
      rifleBarrel.position.z = 0.7;
      rifleBarrel.position.y = 0.05;
      
      const rifleMagazine = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.3, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      rifleMagazine.position.y = -0.2;
      rifleMagazine.position.z = 0.2;
      
      model.add(rifleBody);
      model.add(rifleBarrel);
      model.add(rifleMagazine);
      break;
      
    case WeaponType.ROCKET_LAUNCHER:
      // Rocket launcher model
      const launcherBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: 0x006600 })
      );
      launcherBody.rotation.z = Math.PI / 2;
      
      const launcherSight = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      launcherSight.position.y = 0.2;
      
      model.add(launcherBody);
      model.add(launcherSight);
      break;
  }
  
  // Position the weapon for first-person view
  model.position.set(0.3, -0.3, -0.5);
  
  return model;
}

// Initialize a weapon with its model
export function initializeWeapon(type: WeaponType): Weapon {
  const weaponDef = WEAPONS[type];
  const weapon: Weapon = {
    ...weaponDef,
    model: null,
    lastFired: 0,
    isReloading: false,
    reloadStart: 0
  };
  
  // Create weapon model
  const gunGroup = new THREE.Group();
  
  // Different models based on weapon type
  switch (type) {
    case WeaponType.PISTOL:
      createPistolModel(gunGroup);
      break;
    case WeaponType.SHOTGUN:
      createShotgunModel(gunGroup);
      break;
    case WeaponType.RIFLE:
      createRifleModel(gunGroup);
      break;
    case WeaponType.ROCKET_LAUNCHER:
      createRocketLauncherModel(gunGroup);
      break;
  }
  
  // Position the weapon in view
  gunGroup.position.set(0.2, -0.2, -0.5);
  weapon.model = gunGroup;
  
  return weapon;
}

// Create pistol model
function createPistolModel(group: THREE.Group): void {
  // Gun body
  const gunBodyGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.3);
  const gunBodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2 
  });
  const gunBody = new THREE.Mesh(gunBodyGeometry, gunBodyMaterial);
  gunBody.position.set(0, 0, 0);
  group.add(gunBody);

  // Gun barrel
  const gunBarrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
  const gunBarrelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.1 
  });
  const gunBarrel = new THREE.Mesh(gunBarrelGeometry, gunBarrelMaterial);
  gunBarrel.rotation.x = Math.PI / 2;
  gunBarrel.position.set(0, 0, -0.2);
  group.add(gunBarrel);

  // Gun handle
  const gunHandleGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.08);
  const gunHandleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    roughness: 0.8 
  });
  const gunHandle = new THREE.Mesh(gunHandleGeometry, gunHandleMaterial);
  gunHandle.position.set(0, -0.1, 0.05);
  group.add(gunHandle);
}

// Create shotgun model
function createShotgunModel(group: THREE.Group): void {
  // Shotgun body
  const bodyGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, // Brown wood color
    roughness: 0.8 
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0, 0);
  group.add(body);

  // Shotgun barrel
  const barrelGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
  const barrelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444444,
    metalness: 0.7,
    roughness: 0.3 
  });
  const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0, -0.3);
  group.add(barrel);

  // Shotgun pump
  const pumpGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.15);
  const pumpMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    metalness: 0.5,
    roughness: 0.5 
  });
  const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
  pump.position.set(0, -0.05, -0.2);
  group.add(pump);
}

// Create rifle model
function createRifleModel(group: THREE.Group): void {
  // Rifle body
  const bodyGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    metalness: 0.6,
    roughness: 0.4 
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0, 0);
  group.add(body);

  // Rifle barrel
  const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
  const barrelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.2 
  });
  const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0, -0.35);
  group.add(barrel);

  // Rifle stock
  const stockGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.2);
  const stockMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513,
    roughness: 0.7 
  });
  const stock = new THREE.Mesh(stockGeometry, stockMaterial);
  stock.position.set(0, 0, 0.3);
  group.add(stock);

  // Rifle scope
  const scopeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
  const scopeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000,
    metalness: 0.9,
    roughness: 0.1 
  });
  const scope = new THREE.Mesh(scopeGeometry, scopeMaterial);
  scope.position.set(0, 0.06, -0.1);
  group.add(scope);
}

// Create rocket launcher model
function createRocketLauncherModel(group: THREE.Group): void {
  // Launcher tube
  const tubeGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
  const tubeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x556B2F, // Dark olive green
    roughness: 0.6 
  });
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  tube.rotation.x = Math.PI / 2;
  tube.position.set(0, 0, -0.2);
  group.add(tube);

  // Launcher end
  const endGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.1, 16);
  const endMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.3 
  });
  const end = new THREE.Mesh(endGeometry, endMaterial);
  end.rotation.x = Math.PI / 2;
  end.position.set(0, 0, -0.6);
  group.add(end);

  // Launcher handle
  const handleGeometry = new THREE.BoxGeometry(0.06, 0.15, 0.1);
  const handleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    roughness: 0.8 
  });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.set(0, -0.15, 0.1);
  group.add(handle);

  // Launcher sight
  const sightGeometry = new THREE.BoxGeometry(0.02, 0.05, 0.02);
  const sightMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFF0000,
    emissive: 0xFF0000,
    emissiveIntensity: 0.5
  });
  const sight = new THREE.Mesh(sightGeometry, sightMaterial);
  sight.position.set(0, 0.1, 0);
  group.add(sight);
}

// Create different types of bullets
export function createBullet(
  scene: THREE.Scene, 
  camera: THREE.Camera, 
  weapon: Weapon
): THREE.Mesh[] {
  const bullets: THREE.Mesh[] = [];
  const bulletGeometry = new THREE.SphereGeometry(weapon.bulletSize, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: weapon.bulletColor });
  
  // For shotgun or spread weapons, create multiple bullets
  for (let i = 0; i < weapon.bulletCount; i++) {
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    // Position at camera
    bullet.position.copy(camera.position);
    
    // Get direction with spread if needed
    const direction = new THREE.Vector3(0, 0, -1);
    if (weapon.spread > 0) {
      direction.x += (Math.random() - 0.5) * weapon.spread;
      direction.y += (Math.random() - 0.5) * weapon.spread;
      direction.z += (Math.random() - 0.5) * weapon.spread * 0.5;
    }
    direction.normalize();
    
    // Transform direction to camera's local space
    direction.applyQuaternion(camera.quaternion);
    
    // Store direction and other properties in userData
    bullet.userData = {
      direction,
      speed: weapon.bulletSpeed,
      damage: weapon.damage,
      type: weapon.type,
      createdAt: performance.now()
    };
    
    scene.add(bullet);
    bullets.push(bullet);
  }
  
  return bullets;
}

// Handle weapon firing
export function handleWeaponFire(
  camera: THREE.Camera,
  scene: THREE.Scene,
  weapon: Weapon,
  bullets: THREE.Mesh[]
): boolean {
  const now = performance.now();
  
  // Check if weapon can fire
  if (
    weapon.isReloading || 
    now - weapon.lastFired < weapon.fireRate || 
    weapon.ammo <= 0
  ) {
    return false;
  }
  
  // Create bullets and add them to the scene
  const newBullets = createBullet(scene, camera, weapon);
  bullets.push(...newBullets);
  
  // Update weapon state
  weapon.lastFired = now;
  weapon.ammo--;
  
  // Auto-reload if empty
  if (weapon.ammo === 0) {
    startReload(weapon);
  }
  
  return true;
}

// Start weapon reload
export function startReload(weapon: Weapon): void {
  if (weapon.isReloading || weapon.ammo === weapon.maxAmmo) return;
  
  weapon.isReloading = true;
  weapon.reloadStart = performance.now();
}

// Update weapon reload status
export function updateWeapon(weapon: Weapon): void {
  if (weapon.isReloading) {
    const now = performance.now();
    if (now - weapon.reloadStart >= weapon.reloadTime) {
      // Reload complete
      weapon.isReloading = false;
      weapon.ammo = weapon.maxAmmo;
    }
  }
}

// Update bullets based on their type
export function updateBullets(
  bullets: THREE.Mesh[], 
  targets: THREE.Mesh[], 
  scene: THREE.Scene,
  camera: THREE.Camera,
  setScore: (cb: (prev: number) => number) => void
): void {
  const now = performance.now();
  const bulletsToRemove: THREE.Mesh[] = [];
  
  // Collect all wall objects for collision detection
  const walls: THREE.Object3D[] = [];
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.userData.isWall) {
      walls.push(object);
    }
  });
  
  bullets.forEach(bullet => {
    const { direction, speed, damage, type, createdAt } = bullet.userData;
    
    // Store previous position for collision detection
    const previousPosition = bullet.position.clone();
    
    // Move bullet
    bullet.position.add(direction.clone().multiplyScalar(speed * 0.01));
    
    // Check for collisions with walls
    const bulletRay = new THREE.Raycaster(
      previousPosition,
      direction.clone().normalize(),
      0,
      previousPosition.distanceTo(bullet.position)
    );
    
    const wallIntersections = bulletRay.intersectObjects(walls);
    if (wallIntersections.length > 0) {
      // Bullet hit a wall
      
      // Create impact effect on wall
      const impact = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 8),
        new THREE.MeshBasicMaterial({ 
          color: 0x333333, 
          side: THREE.DoubleSide 
        })
      );
      
      impact.position.copy(wallIntersections[0].point);
      impact.lookAt(previousPosition);
      scene.add(impact);
      
      // Remove impact after some time
      setTimeout(() => {
        scene.remove(impact);
        impact.geometry.dispose();
        (impact.material as THREE.Material).dispose();
      }, 5000);
      
      // Add the bullet to removal list
      bulletsToRemove.push(bullet);
      return;
    }
    
    // Special effects for rocket launcher
    if (type === WeaponType.ROCKET_LAUNCHER) {
      // Add trail effect
      const trail = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ 
          color: 0xff8800, 
          transparent: true, 
          opacity: 0.7 
        })
      );
      trail.position.copy(bullet.position);
      scene.add(trail);
      
      // Fade out and remove trail
      setTimeout(() => {
        scene.remove(trail);
        trail.geometry.dispose();
        (trail.material as THREE.Material).dispose();
      }, 200);
    }
    
    // Check for collisions with targets
    let hitTarget = false;
    targets.forEach(target => {
      if (bullet.position.distanceTo(target.position) < 1) {
        // Handle hit based on weapon type
        if (type === WeaponType.ROCKET_LAUNCHER) {
          // Explosion effect for rocket launcher
          createExplosion(scene, bullet.position);
          
          // Damage all targets within explosion radius
          targets.forEach(nearbyTarget => {
            if (bullet.position.distanceTo(nearbyTarget.position) < 5) {
              // Calculate damage based on distance
              const distance = bullet.position.distanceTo(nearbyTarget.position);
              const explosionDamage = Math.max(1, damage * (1 - distance / 5));
              
              if (handleTargetHit(nearbyTarget, explosionDamage, scene, setScore)) {
                // Target was destroyed
              }
            }
          });
        } else {
          // Regular hit for other weapons
          if (handleTargetHit(target, damage, scene, setScore)) {
            // Target was destroyed
          }
        }
        
        hitTarget = true;
      }
    });
    
    // Remove bullet if it hit something or traveled too far
    if (hitTarget || 
        bullet.position.distanceTo(camera.position) > 100 || 
        now - createdAt > 5000) {
      bulletsToRemove.push(bullet);
    }
  });
  
  // Remove bullets that hit or went too far
  bulletsToRemove.forEach(bullet => {
    scene.remove(bullet);
    bullet.geometry.dispose();
    (bullet.material as THREE.Material).dispose();
    bullets.splice(bullets.indexOf(bullet), 1);
  });
}

// Handle target hit
function handleTargetHit(
  target: THREE.Mesh, 
  damage: number, 
  scene: THREE.Scene, 
  setScore: (cb: (prev: number) => number) => void
): boolean {
  // Decrease target health
  target.userData.health -= damage;
  
  // Create hit effect
  const hitEffect = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.8 
    })
  );
  hitEffect.position.copy(target.position);
  scene.add(hitEffect);
  
  // Remove hit effect after a short time
  setTimeout(() => {
    scene.remove(hitEffect);
    hitEffect.geometry.dispose();
    (hitEffect.material as THREE.Material).dispose();
  }, 100);
  
  // Check if target is destroyed
  if (target.userData.health <= 0) {
    // Update score - make sure points exist in userData
    const points = target.userData.points || target.userData.type?.points || 10;
    setScore(prev => prev + points);
    
    // Remove target
    scene.remove(target);
    return true;
  }
  
  return false;
}

// Create explosion effect
function createExplosion(scene: THREE.Scene, position: THREE.Vector3): void {
  const explosion = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ 
      color: 0xff5500, 
      transparent: true, 
      opacity: 0.8 
    })
  );
  explosion.position.copy(position);
  scene.add(explosion);
  
  // Animate explosion
  let size = 0.5;
  const expandInterval = setInterval(() => {
    size += 0.5;
    explosion.scale.set(size, size, size);
    (explosion.material as THREE.MeshBasicMaterial).opacity -= 0.05;
    
    if (size >= 5) {
      clearInterval(expandInterval);
      scene.remove(explosion);
      explosion.geometry.dispose();
      (explosion.material as THREE.Material).dispose();
    }
  }, 50);
} 