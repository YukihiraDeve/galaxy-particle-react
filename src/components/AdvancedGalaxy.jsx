import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stats, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import './GalaxyShaderMaterial'

const AdvancedGalaxyScene = ({ initialParams }) => {
  const defaultParams = {
    count: 50000,
    size: 20,
    radius: 5,
    branches: 6,
    spin: 1,
    randomness: 0.5,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    cameraDistance: 6,
    rotationSpeed: 0.5
  };
  
  const [params, setParams] = useState(initialParams || defaultParams);

  return (
    <div className="w-full h-screen">
      <Canvas dpr={[1, 2]}>
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 3, 15]} />
        <PerspectiveCamera makeDefault position={[params.cameraDistance, 4, 0]} fov={75} />
        <AdvancedGalaxyParticles 
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
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          rotateSpeed={0.5} 
          minDistance={3} 
          maxDistance={20} 
        />
        <Stats />
      </Canvas>
      <GalaxyControls params={params} setParams={setParams} />
    </div>
  )
}

const AdvancedGalaxyParticles = ({
  count,
  size,
  radius,
  branches,
  spin,
  randomness,
  randomnessPower,
  insideColor,
  outsideColor,
  rotationSpeed
}) => {
  const points = useRef();
  const shaderMaterial = useRef();
  
  
  const insideColorObj = useMemo(() => new THREE.Color(insideColor), [insideColor]);
  const outsideColorObj = useMemo(() => new THREE.Color(outsideColor), [outsideColor]);
  
  useEffect(() => {
    console.log("Valeurs des paramètres dans AdvancedGalaxyParticles:", { 
      count, size, radius, branches, spin, randomness, 
      randomnessPower, insideColor, outsideColor, rotationSpeed 
    });
  }, [count, size, radius, branches, spin, randomness, 
      randomnessPower, insideColor, outsideColor, rotationSpeed]);
  
  const [positions, scales, randoms] = useMemo(() => {
    console.log("Régénération de la galaxie avancée avec:", { count, radius, branches, spin, randomness, randomnessPower });

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randoms = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const r = Math.random() * radius;
      const branchAngle = (i % branches) / branches * Math.PI * 2;
      const spinAngle = r * spin;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r;


      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      randoms[i3] = randomX;
      randoms[i3 + 1] = randomY;
      randoms[i3 + 2] = randomZ;

      scales[i] = Math.random() * 2.5;
    }
    
    return [positions, scales, randoms];
  }, [count, radius, branches, spin, randomness, randomnessPower]);

  useFrame((state) => {
    if (shaderMaterial.current) {
      shaderMaterial.current.uTime = state.clock.elapsedTime;
      
      shaderMaterial.current.uInsideColor = insideColorObj.toArray();
      shaderMaterial.current.uOutsideColor = outsideColorObj.toArray();
      
      shaderMaterial.current.uRotationSpeed = rotationSpeed;
      

      if (state.clock.elapsedTime % 30 < 0.1) {
        console.log("Vitesse de rotation actuelle:", rotationSpeed);
      }
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
          attach="attributes-aScale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={randoms.length / 3}
          array={randoms}
          itemSize={3}
        />
      </bufferGeometry>
      <galaxyShaderMaterial 
        key={`${insideColor}-${outsideColor}-${size}-${rotationSpeed}`}
        ref={shaderMaterial}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uSize={size}
        uInsideColor={insideColorObj.toArray()}
        uOutsideColor={outsideColorObj.toArray()}
        uRotationSpeed={rotationSpeed}
      />
    </points>
  );
};

const GalaxyControls = ({ params, setParams }) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    console.log(`Paramètre modifié: ${name} => ${value}`);

    setParams({
      ...params,
      [name]: type === 'number' || name === 'count' || name.includes('size') || 
              name.includes('radius') || name.includes('distance') || 
              name.includes('spin') || name.includes('random') || 
              name.includes('rotation') ? parseFloat(value) : value
    });
  };

  return (
    <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white p-4 m-4 rounded-lg">
      <h2 className="text-xl mb-2">Paramètres de la Galaxie</h2>
      
      <div className="grid grid-cols-2 gap-2">
        <label>Particules:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="count"
            min="1000"
            max="200000"
            step="1000"
            value={params.count}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.count.toLocaleString()}</span>
        </div>
        
        <label>Taille:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="size"
            min="1"
            max="100"
            step="1"
            value={params.size}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.size}</span>
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
        
        <label>Distance caméra:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="cameraDistance"
            min="3"
            max="20"
            step="0.5"
            value={params.cameraDistance}
            onChange={handleChange}
            className="w-32 mr-2"
          />
          <span>{params.cameraDistance}</span>
        </div>
        
        <label>Vitesse de rotation:</label>
        <div className="flex items-center">
          <input
            type="range"
            name="rotationSpeed"
            min="0"
            max="2"
            step="0.01"
            value={params.rotationSpeed}
            onChange={handleChange}
            className="w-32 mr-2"
            style={{accentColor: '#ff6030'}}
          />
          <span className="min-w-12 text-right">{params.rotationSpeed.toFixed(2)}</span>
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

export default AdvancedGalaxyScene;