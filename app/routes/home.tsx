import type { Route } from "./+types/home";
import { ThreeScene } from "../components/ThreeScene";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Three.js Shooter Game" },
    { name: "description", content: "A simple 3D shooter game built with Three.js and React" },
  ];
}

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <ThreeScene />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-3 rounded text-center max-w-md">
        <p className="font-bold mb-1">Instructions:</p>
        <p className="text-sm">
          Click to shoot • Destroy as many targets as possible • WASD to move • Mouse to aim
        </p>
      </div>
    </div>
  );
}
