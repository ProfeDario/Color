import { useState } from 'react';
import { ColorFamilyCard } from './components/ColorFamilyCard';
import { NameFamilyModal } from './components/NameFamilyModal';
import { Toast } from './components/Toast';
import { generatePalette, exportFigmaVariables, isValidHex } from './utils/colors';
import { getColorNames, normalizeName } from './utils/naming';

const App = () => {
  const [format, setFormat] = useState('HEX');
  const [families, setFamilies] = useState([
    {
      id: 'main-1',
      baseColor: '#3b82f6',
      metadata: { name: 'Brand Primary' },
      isExpanded: true
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = () => {
    setToastMsg('No se pueden guardar dos colores con el mismo nombre porque se duplicará en Figma');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleNameSubmit = (name) => {
    const normalizedNew = normalizeName(name);
    const isDuplicate = families.some(f => normalizeName(f.metadata.name) === normalizedNew);
    
    if (isDuplicate) {
      triggerToast();
      return;
    }

    setIsModalOpen(false);
    const id = Date.now().toString();
    const newBase = '#10b981'; // default emerald
    
    setFamilies([...families, {
      id,
      baseColor: newBase,
      metadata: { name },
      isExpanded: true
    }]);
  };

  const updateFamily = (id, updates) => {
    let familyToUpdate = families.find(f => f.id === id);
    if (!familyToUpdate) return;
    
    let updatedMetadata = { ...familyToUpdate.metadata };
    
    if (updates.metadata) {
      updatedMetadata = { ...updatedMetadata, ...updates.metadata };
    }

    const newExportName = normalizeName(updatedMetadata.name);

    if (updates.metadata && updates.metadata.name !== undefined) {
      // Si el nombre queda completamente vacío al borrar, igual permitimos la edición en UI
      // pero si es duplicado de otro nombre existente (ej. ambos vacíos), bloqueamos si hay choque real
      const isDuplicate = families.some(f => {
        if (f.id === id) return false;
        return normalizeName(f.metadata.name) === newExportName;
      });

      if (isDuplicate && newExportName !== '') {
        triggerToast();
        return; 
      }
    }

    setFamilies(families.map(f => {
      if (f.id === id) {
        return { ...f, ...updates, metadata: updatedMetadata };
      }
      return f;
    }));
  };

  const removeFamily = (id) => {
    setFamilies(families.filter(f => f.id !== id));
  };

  const handleExport = (type) => {
    if (!families.length) return;
    let text = '';

    if (type === 'CSS') {
      text = families.map(f => {
        const prefix = normalizeName(f.metadata.name) || 'color';
        const roleStr = `/* ${f.metadata.name || 'Palette'} */`;
        const pStr = `:root {\n` + generatePalette(f.baseColor).map(p => `  --color-${prefix}-${p.tone}: ${p.hex};`).join('\n') + `\n}`;
        return roleStr + '\n' + pStr;
      }).join('\n\n');
    } else if (type === 'JSON') {
      const obj = {};
      families.forEach(f => {
        const role = normalizeName(f.metadata.name) || 'palette';
        const pObj = {};
        generatePalette(f.baseColor).forEach(p => pObj[p.tone] = p.hex);
        obj[role] = pObj;
      });
      text = JSON.stringify(obj, null, 2);
    } else if (type === 'Tailwind') {
      const colorsObj = {};
      families.forEach(f => {
        const role = normalizeName(f.metadata.name) || 'palette';
        const pObj = {};
        generatePalette(f.baseColor).forEach(p => pObj[p.tone] = `"${p.hex.toUpperCase()}"`);
        colorsObj[role] = pObj;
      });
      // Building tailwind string properly formatted
      const tailwindJSON = JSON.stringify(colorsObj, null, 2);
      // Remove quotes from keys for cleaner js output
      const cleanTailwind = tailwindJSON.replace(/"([^"]+)":/g, '$1:');
      text = `theme: {\n  extend: {\n    colors: \n${cleanTailwind}\n  }\n}`;
    } else if (type === 'Variables Figma') {
      text = exportFigmaVariables(families);
    }

    let ext = 'txt';
    let mime = 'text/plain';
    if (type === 'CSS') ext = 'css';
    if (type === 'JSON') { ext = 'json'; mime = 'application/json'; }
    if (type === 'Tailwind') ext = 'js';
    if (type === 'Variables Figma') { ext = 'tokens.json'; mime = 'application/json'; }

    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'Variables Figma' ? `figma-variables.tokens.json` : `palettes-${type.toLowerCase().replace(' ', '-')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Generador de Paletas de Colores
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Genera hermosas paletas cohesivas de interfaz a partir de un solo color base.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => setIsModalOpen(true)} style={{ ...btnStyle, backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>
          + Nueva familia de color
        </button>

        {families.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>FORMATO:</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer' }}
              >
                <option value="HEX">HEX</option>
                <option value="RGB">RGB</option>
                <option value="HSL">HSL</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>EXPORTAR TODO:</span>
              <button className="btn-export" onClick={() => handleExport('CSS')} style={btnStyle}>CSS</button>
              <button className="btn-export" onClick={() => handleExport('JSON')} style={btnStyle}>JSON</button>
              <button className="btn-export" onClick={() => handleExport('Tailwind')} style={btnStyle}>Tailwind</button>
              <button className="btn-export" onClick={() => handleExport('Variables Figma')} style={btnStyle}>Variables Figma</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {families.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            Aún no hay familias de color. ¡Haz click en "+ Nueva familia de color" para comenzar!
          </div>
        )}
        {families.map(family => (
          <ColorFamilyCard 
            key={family.id} 
            family={family} 
            updateFamily={updateFamily} 
            removeFamily={removeFamily}
            format={format} 
          />
        ))}
      </div>

      <NameFamilyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleNameSubmit} 
      />
      <Toast message={toastMsg} isVisible={!!toastMsg} />
    </main>
  );
};

const btnStyle = {
  padding: '0.35rem 0.75rem',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-main)',
  transition: 'all 0.2s ease',
};

export default App;
