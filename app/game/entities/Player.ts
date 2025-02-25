import * as THREE from "three";

export function createPlayerWeapon(camera: THREE.Camera): void {
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
}

export function createBullet(
  camera: THREE.Camera, 
  scene: THREE.Scene
): THREE.Mesh {
  const bulletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const bulletMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });
  
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  
  // Position the bullet at the camera position
  bullet.position.copy(camera.position);
  
  // Move it slightly forward
  const bulletDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  bullet.position.add(bulletDirection.multiplyScalar(1));
  
  // Store the bullet direction and other data
  bullet.userData = {
    direction: new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion),
    distance: 0,
    maxDistance: 100,
  };
  
  // Add a point light to the bullet for glow effect
  const bulletLight = new THREE.PointLight(0xff0000, 1, 2);
  bulletLight.position.set(0, 0, 0);
  bullet.add(bulletLight);
  
  scene.add(bullet);
  return bullet;
} 