import React, { useState } from 'react';
import './App.css';
import AdvancedGalaxyScene from './components/AdvancedGalaxy';
import Galaxy from './components/Galaxy';

function App() {
  const [useAdvanced, setUseAdvanced] = useState(true);
  
  // Paramètres initiaux personnalisables
  const initialParams = {
    count: useAdvanced ? 50000 : 10000,
    size: useAdvanced ? 20 : 0.01,
    radius: 5,
    branches: 8, // Augmentation du nombre de branches par défaut
    spin: 1,
    randomness: useAdvanced ? 0.5 : 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    cameraDistance: 6,
    rotationSpeed: 0.5
  };
  
  return (
    <div className="App">
      {/* Rendu de la version avancée ou simple de la galaxie avec paramètres initiaux */}
      {useAdvanced ? 
        <AdvancedGalaxyScene initialParams={initialParams} /> : 
        <Galaxy initialParams={initialParams} />
      }
      
      {/* Bouton pour basculer entre les versions */}
      <div className="absolute bottom-4 right-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setUseAdvanced(!useAdvanced)}
        >
          {useAdvanced ? 'Utiliser la version simple' : 'Utiliser la version avancée'}
        </button>
      </div>
    </div>
  );
}

export default App;