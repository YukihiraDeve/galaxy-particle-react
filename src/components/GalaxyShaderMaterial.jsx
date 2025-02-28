import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

// Vertex Shader
const vertexShader = `
uniform float uTime;
uniform float uSize;
uniform vec3 uInsideColor;
uniform vec3 uOutsideColor;
uniform float uRotationSpeed;

attribute vec3 aRandomness;
attribute float aScale;

varying vec3 vColor;

void main() {
  // Position de base (non transformée)
  vec3 basePosition = position;
  
  // Rotation personnalisée avec vitesse configurable
  // Notez qu'on utilise explicitement uRotationSpeed ici
  float angle = uTime * uRotationSpeed;
  
  // Matrice de rotation autour de l'axe Y
  mat3 rotationMatrix = mat3(
    cos(angle), 0.0, sin(angle),
    0.0, 1.0, 0.0,
    -sin(angle), 0.0, cos(angle)
  );
  
  // Application de la rotation à la position
  vec3 rotatedPosition = rotationMatrix * basePosition;
  
  // Création de la position du modèle
  vec4 modelPosition = modelMatrix * vec4(rotatedPosition, 1.0);
  
  // Ajout de la randomness
  modelPosition.xyz += aRandomness;
  
  // Positions dans l'espace de la caméra et projection
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
  
  // Taille des points avec atténuation
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / - viewPosition.z);
  
  // Couleur - calcul basé sur la distance au centre (rayon)
  float distanceToCenter = length(basePosition.xz);
  float maxRadius = 5.0; // Même valeur que le rayon par défaut
  float colorMix = min(distanceToCenter / maxRadius, 1.0);
  
  // Mélange des couleurs intérieure et extérieure
  vColor = mix(uInsideColor, uOutsideColor, colorMix);
}
`

// Fragment Shader
const fragmentShader = `
varying vec3 vColor;

void main() {
  // Disc pattern
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 10.0);
  
  // Final color
  vec3 color = mix(vec3(0.0), vColor, strength);
  gl_FragColor = vec4(color, strength);
}
`

// Créer le shader material avec plus de paramètres de contrôle
const GalaxyShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 30.0,
    uInsideColor: new THREE.Color('#ff6030').toArray(),
    uOutsideColor: new THREE.Color('#1b3984').toArray(),
    uRotationSpeed: 0.5 // Vitesse de rotation par défaut
  },
  vertexShader,
  fragmentShader
)

// Extension pour React Three Fiber
extend({ GalaxyShaderMaterial })

export default GalaxyShaderMaterial