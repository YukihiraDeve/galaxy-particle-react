import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import * as THREE from 'three'

// Composant principal qui sera exporté
const Galaxy = ({ initialParams }) => {
  // Paramètres par défaut
  const defaultParams = {
    count: 10000,
    size: 0.01,
    radius: 5,
    branches: 8,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    rotationSpeed: 0.5
  };
  
  const [params, setParams] = useState(initialParams || defaultParams);

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [3, 3, 3], fov: 75 }}>
        <color attach="background" args={['#000']} />
        <GalaxyParticles 
          count={params.count}
          size={params.size}
          radius={params.radius}
          branches={params.branches}
          spin={params.spin}
          randomness={params.randomness}
          randomnessPower={params.randomnessPower}
          insideColor={params.insideColor}
          outsideColor={params.outsideColor}
          rotationSpeed={params.rotationSpeed}
        />
        <OrbitControls enableDamping />
        <Stats />
      </Canvas>
      <GalaxyControls params={params} setParams={setParams} />
    </div>
  )
}

// Composant pour les particules de la galaxie
const GalaxyParticles = ({
  count,
  size,
  radius,
  branches,
  spin,
  randomness,
  randomnessPower,
  insideColor,
  outsideColor,
  rotationSpeed = 0.5 // Valeur par défaut
}) => {
  const points = useRef();
  
  // Générer les positions des particules et les couleurs
  const [positions, colors] = useMemo(() => {
    console.log("Régénération de la galaxie simple avec:", { count, radius, branches, spin, randomness, randomnessPower });
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorInside = new THREE.Color(insideColor);
    const colorOutside = new THREE.Color(outsideColor);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Position
      const r = Math.random() * radius;
      const branchAngle = (i % branches) / branches * Math.PI * 2;
      const spinAngle = r * spin;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r;
      positions[i3 + 1] = Math.random() * 0.1 - 0.05; // Légère hauteur pour plus de volume
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r;

      // Ajouter de l'aléatoire
      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3]     += randomX;
      positions[i3 + 1] += randomY;
      positions[i3 + 2] += randomZ;

      // Couleur
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, r / radius);
      
      colors[i3]     = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    return [positions, colors];
  }, [count, radius, branches, spin, randomness, randomnessPower, insideColor, outsideColor]);

  // Animation de rotation avec vitesse contrôlable
  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Composant pour les contrôles utilisateur
const GalaxyControls = ({ params, setParams }) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Debug pour suivre les changements
    console.log(`Paramètre modifié: ${name} => ${value}`);
    
    // Mise à jour du state avec la nouvelle valeur
    setParams({
      ...params,
      [name]: type === 'number' || name === 'count' || name.includes('size') || 
              name.includes('radius') || name.includes('spin') || 
              name.includes('random') || name.includes('rotation') ? 
              parseFloat(value) : value
    });
  };

  return (
    <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white p-4 m-4 rounded-lg">
      <h2 className="text-xl mb-2">Paramètres de la Galaxie</h2>
      
      <div className="grid grid-cols-2 gap-2">
        <label>Nombre de particules:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="count"
            min="100"
            max="50000"
            step="100"
            value={params.count}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.count.toLocaleString()}</span>
        </div>
        
        <label>Taille des particules:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="size"
            min="0.001"
            max="0.1"
            step="0.001"
            value={params.size}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.size.toFixed(3)}</span>
        </div>
        
        <label>Rayon:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="radius"
            min="0.1"
            max="20"
            step="0.1"
            value={params.radius}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.radius.toFixed(1)}</span>
        </div>
        
        <label>Branches:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="branches"
            min="2"
            max="20"
            step="1"
            value={params.branches}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.branches}</span>
        </div>
        
        <label>Rotation:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="spin"
            min="-5"
            max="5"
            step="0.1"
            value={params.spin}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.spin.toFixed(1)}</span>
        </div>
        
        <label>Aléatoire:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="randomness"
            min="0"
            max="2"
            step="0.01"
            value={params.randomness}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.randomness.toFixed(2)}</span>
        </div>
        
        <label>Puissance aléatoire:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="randomnessPower"
            min="1"
            max="10"
            step="0.1"
            value={params.randomnessPower}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.randomnessPower.toFixed(1)}</span>
        </div>
        
        <label>Vitesse de rotation:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="rotationSpeed"
            min="0"
            max="2"
            step="0.05"
            value={params.rotationSpeed}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.rotationSpeed.toFixed(2)}</span>
        </div>
        
        <label>Couleur intérieure:</label>
        <div className="flex items-center">
          <input
            type="color"
            name="insideColor"
            value={params.insideColor}
            onChange={handleChange}
            className="w-12 h-8 mr-2"
          />
          <span>{params.insideColor}</span>
        </div>
        
        <label>Couleur extérieure:</label>
        <div className="flex items-center">
          <input
            type="color"
            name="outsideColor"
            value={params.outsideColor}
            onChange={handleChange}
            className="w-12 h-8 mr-2"
          />
          <span>{params.outsideColor}</span>
        </div>
      </div>
    </div>
  );
};

export default Galaxy