import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { KeyState } from "../game/utils/types";
import { setupLighting, createGround } from "../game/environment/Lighting";
import { createMap } from "../game/environment/Map";
import { createPlayerWeapon, createBullet } from "../game/entities/Player";
import { createTarget, updateTargets, targetTypes } from "../game/entities/Target";
import { updateBullets } from "../game/entities/Bullet";
import { setupMouseControls, handleShoot } from "../game/controls/MouseControls";
import { setupKeyboardControls, handleMovement } from "../game/controls/KeyboardControls";
import { findSafeSpawnPosition } from "../game/utils/Collision";
import { Debug } from "./Debug";
import { GameUI } from "./GameUI";

export function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [debug, setDebug] = useState(false);
  const keyStateRef = useRef<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const [debugData, setDebugData] = useState({
    targets: [] as THREE.Mesh[],
    bullets: [] as THREE.Mesh[],
    lastFrameTime: performance.now(),
    camera: null as THREE.Camera | null,
  });
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Game state
    let bullets: THREE.Mesh[] = [];
    let targets: THREE.Mesh[] = [];
    let gameActive = true;
    let lastFrameTime = performance.now();
    
    // Movement state - use the ref
    const keyState = keyStateRef.current;
    
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
    
    // Store camera in debug data immediately
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
    
    // Create player weapon
    createPlayerWeapon(camera);
    
    // Setup controls
    const mouseControls = setupMouseControls(camera, mountRef);
    const keyboardControls = setupKeyboardControls(keyState, setDebug);
    
    // Click to shoot
    const handleClick = () => {
      if (!gameActive) return;
      handleShoot(camera, scene, bullets, createBullet);
    };
    window.addEventListener("click", handleClick);
    
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
      if (gameActive) {
        spawnTarget();
      }
    }, 2000);
    
    // Game timer
    const gameTimer = setInterval(() => {
      if (gameActive) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Game over
            gameActive = false;
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
      
      if (gameActive) {
        // Handle player movement
        handleMovement(camera, keyState, scene);
        
        // Update targets
        updateTargets(targets, camera, scene, now);
        
        // Update bullets
        updateBullets(bullets, targets, scene, setScore);
        
        // Update debug data if debug mode is on
        if (debug) {
          setDebugData({
            targets,
            bullets,
            lastFrameTime: now,
            camera: camera,
          });
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