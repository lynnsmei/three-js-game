import * as THREE from "three";

export function updateBullets(
  bullets: THREE.Mesh[],
  targets: THREE.Mesh[],
  scene: THREE.Scene,
  setScore: (value: number | ((prevState: number) => number)) => void
): void {
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