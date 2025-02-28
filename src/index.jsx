import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import GalaxyScene from './Galaxy'
import AdvancedGalaxyScene from './AdvancedGalaxy'
import './styles.css'

const App = () => {
  const [useAdvanced, setUseAdvanced] = useState(true)
  
  return (
    <>
      {useAdvanced ? <AdvancedGalaxyScene /> : <GalaxyScene />}
      <div className="absolute bottom-4 right-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setUseAdvanced(!useAdvanced)}
        >
          {useAdvanced ? 'Utiliser la version simple' : 'Utiliser la version avancée'}
        </button>
      </div>
    </>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)