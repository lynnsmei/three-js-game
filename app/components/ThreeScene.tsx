import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { KeyState } from "../game/utils/types";
import { setupLighting, createGround } from "../game/environment/Lighting";
import { createMap } from "../game/environment/Map";
import { createTarget, updateTargets } from "../game/entities/Target";
import { setupMouseControls } from "../game/controls/MouseControls";
import { setupKeyboardControls, handleMovement } from "../game/controls/KeyboardControls";
import { findSafeSpawnPosition } from "../game/utils/Collision";
import { Debug } from "./Debug";
import { GameUI } from "./GameUI";
import { 
  WeaponType, 
  type Weapon, 
  initializeWeapon, 
  handleWeaponFire, 
  updateWeapon, 
  startReload,
  updateBullets
} from "../game/entities/Weapons";

export function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [debug, setDebug] = useState(false);
  const [currentWeaponType, setCurrentWeaponType] = useState<WeaponType>(WeaponType.PISTOL);
  
  // Refs for game state that needs to be accessed in event handlers
  const keyStateRef = useRef<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const weaponRef = useRef<Weapon | null>(null);
  const bulletsRef = useRef<THREE.Mesh[]>([]);
  const gameActiveRef = useRef(true);
  
  // State for UI
  const [ammo, setAmmo] = useState(0);
  const [maxAmmo, setMaxAmmo] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  
  // Debug data
  const [debugData, setDebugData] = useState({
    targets: [] as THREE.Mesh[],
    bullets: [] as THREE.Mesh[],
    lastFrameTime: performance.now(),
    camera: null as THREE.Camera | null,
  });
  
  // Handle weapon switching
  const handleWeaponSelect = (weaponType: WeaponType) => {
    if (!gameActiveRef.current || weaponType === currentWeaponType) return;
    setCurrentWeaponType(weaponType);
  };
  
  // Handle manual reload
  const handleReload = () => {
    if (!gameActiveRef.current || !weaponRef.current || weaponRef.current.isReloading) return;
    startReload(weaponRef.current);
  };
  
  // Effect for weapon switching
  useEffect(() => {
    if (!debugData.camera || !gameActiveRef.current) return;
    
    // Remove old weapon model from camera
    if (weaponRef.current?.model) {
      debugData.camera.remove(weaponRef.current.model);
    }
    
    // Create new weapon
    const newWeapon = initializeWeapon(currentWeaponType);
    weaponRef.current = newWeapon;
    
    // Add new weapon model to camera
    debugData.camera.add(newWeapon.model!);
    
    // Update UI
    setAmmo(newWeapon.ammo);
    setMaxAmmo(newWeapon.maxAmmo);
    setIsReloading(newWeapon.isReloading);
    
  }, [currentWeaponType, debugData.camera]);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Game state
    let targets: THREE.Mesh[] = [];
    gameActiveRef.current = true;
    let lastFrameTime = performance.now();
    bulletsRef.current = [];
    
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
    
    // Store camera in debug data
    setDebugData(prev => ({
      ...prev,
      camera: camera
    }));
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Setup environment
    setupLighting(scene);
    createGround(scene);
    const map = createMap(scene);
    
    // Set player position to a safe spawn point
    const safePosition = findSafeSpawnPosition(scene);
    camera.position.copy(safePosition);
    
    // Initialize weapon system
    const initialWeapon = initializeWeapon(currentWeaponType);
    weaponRef.current = initialWeapon;
    
    // Add weapon model to camera
    camera.add(initialWeapon.model!);
    
    // Update UI with initial weapon stats
    setAmmo(initialWeapon.ammo);
    setMaxAmmo(initialWeapon.maxAmmo);
    setIsReloading(initialWeapon.isReloading);
    
    // Setup controls
    const mouseControls = setupMouseControls(camera, mountRef);
    const keyboardControls = setupKeyboardControls(keyStateRef.current, setDebug);
    
    // Click to shoot
    const handleClick = () => {
      if (!gameActiveRef.current || !weaponRef.current) return;
      
      if (handleWeaponFire(camera, scene, weaponRef.current, bulletsRef.current)) {
        // Update UI after firing
        setAmmo(weaponRef.current.ammo);
        setIsReloading(weaponRef.current.isReloading);
      }
    };
    window.addEventListener("click", handleClick);
    
    // Keyboard handler for weapon switching and reload
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-4 for weapon selection
      if (e.key >= '1' && e.key <= '4') {
        const weaponIndex = parseInt(e.key) - 1;
        const weaponTypes = Object.values(WeaponType);
        if (weaponIndex < weaponTypes.length) {
          handleWeaponSelect(weaponTypes[weaponIndex]);
        }
      }
      
      // R key for reload
      if (e.key === 'r') {
        handleReload();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Spawn targets periodically
    const spawnTarget = () => {
      if (targets.length < 10) {
        const target = createTarget(scene);
        targets.push(target);
      }
    };
    
    // Initial targets
    for (let i = 0; i < 5; i++) {
      spawnTarget();
    }
    
    // Target spawner
    const targetSpawner = setInterval(() => {
      if (gameActiveRef.current) {
        spawnTarget();
      }
    }, 2000);
    
    // Game timer
    const gameTimer = setInterval(() => {
      if (gameActiveRef.current) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Game over
            gameActiveRef.current = false;
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    
    // Animation loop
    const animate = () => {
      const now = performance.now();
      lastFrameTime = now;
      
      requestAnimationFrame(animate);
      
      if (gameActiveRef.current) {
        // Handle player movement
        handleMovement(camera, keyStateRef.current, scene);
        
        // Update targets
        updateTargets(targets, camera, scene, now);
        
        // Update weapon state
        if (weaponRef.current) {
          updateWeapon(weaponRef.current);
          
          // Update UI if weapon state changed
          if (weaponRef.current.ammo !== ammo) {
            setAmmo(weaponRef.current.ammo);
          }
          if (weaponRef.current.isReloading !== isReloading) {
            setIsReloading(weaponRef.current.isReloading);
          }
        }
        
        // Update bullets and check for collisions
        updateBullets(bulletsRef.current, targets, scene, camera, setScore);
        
        // Update debug data
        setDebugData({
          targets,
          bullets: bulletsRef.current,
          lastFrameTime: now,
          camera
        });
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
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(gameTimer);
      clearInterval(targetSpawner);
      
      mouseControls.cleanup();
      keyboardControls.cleanup();
      
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
    };
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      <GameUI 
        score={score}
        timeLeft={timeLeft}
        gameOver={gameOver}
        onRestart={handleRestart}
        currentWeapon={currentWeaponType}
        ammo={ammo}
        maxAmmo={maxAmmo}
        isReloading={isReloading}
        onWeaponSelect={handleWeaponSelect}
        onReload={handleReload}
      />
      
      {debug && debugData.camera && (
        <Debug 
          camera={debugData.camera}
          targets={debugData.targets}
          bullets={debugData.bullets}
          keyState={keyStateRef.current}
          lastFrameTime={debugData.lastFrameTime}
        />
      )}
    </div>
  );
} 