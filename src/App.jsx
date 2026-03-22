import { useState } from 'react';
import { ColorFamilyCard } from './components/ColorFamilyCard';
import { generatePalette, exportFigmaVariables, isValidHex } from './utils/colors';
import { getColorNames } from './utils/naming';

const App = () => {
  const [format, setFormat] = useState('HEX');
  const [families, setFamilies] = useState([
    {
      id: 'main-1',
      baseColor: '#3b82f6',
      metadata: { descriptiveName: 'Dark Blue', primitiveName: 'blue', semanticRole: 'Primary' },
      isExpanded: true
    }
  ]);

  const addFamily = () => {
    const id = Date.now().toString();
    const newBase = '#10b981'; // default emerald
    const names = getColorNames(newBase);
    setFamilies([...families, {
      id,
      baseColor: newBase,
      metadata: { descriptiveName: names.descriptive, primitiveName: names.primitive, semanticRole: 'Success' },
      isExpanded: true
    }]);
  };

  const updateFamily = (id, updates) => {
    setFamilies(families.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...updates };
        if (updates.baseColor && updates.baseColor !== f.baseColor && isValidHex(updates.baseColor)) {
          const names = getColorNames(updates.baseColor);
          updated.metadata = { ...updated.metadata, descriptiveName: names.descriptive, primitiveName: names.primitive };
        }
        return updated;
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
        const prefix = f.metadata.primitiveName || 'color';
        const roleStr = `/* ${f.metadata.descriptiveName || 'Palette'} (${f.metadata.semanticRole}) */`;
        const pStr = `:root {\n` + generatePalette(f.baseColor).map(p => `  --color-${prefix}-${p.tone}: ${p.hex};`).join('\n') + `\n}`;
        return roleStr + '\n' + pStr;
      }).join('\n\n');
    } else if (type === 'JSON') {
      const obj = {};
      families.forEach(f => {
        const role = f.metadata.semanticRole !== 'Custom' ? f.metadata.semanticRole.toLowerCase() : f.metadata.primitiveName;
        const pObj = {};
        generatePalette(f.baseColor).forEach(p => pObj[p.tone] = p.hex);
        obj[role] = pObj;
      });
      text = JSON.stringify(obj, null, 2);
    } else if (type === 'Tailwind') {
      const colorsObj = {};
      families.forEach(f => {
        const role = f.metadata.semanticRole !== 'Custom' ? f.metadata.semanticRole.toLowerCase() : f.metadata.primitiveName;
        const pObj = {};
        generatePalette(f.baseColor).forEach(p => pObj[p.tone] = `"${p.hex.toUpperCase()}"`);
        colorsObj[role] = pObj;
      });
      // Building tailwind string properly formatted
      const tailwindJSON = JSON.stringify(colorsObj, null, 2);
      // Remove quotes from keys for cleaner js output
      const cleanTailwind = tailwindJSON.replace(/"([^"]+)":/g, '$1:');
      text = `theme: {\n  extend: {\n    colors: \n${cleanTailwind}\n  }\n}`;
    } else if (type === 'Figma Variables') {
      text = exportFigmaVariables(families);
    }

    let ext = 'txt';
    let mime = 'text/plain';
    if (type === 'CSS') ext = 'css';
    if (type === 'JSON') { ext = 'json'; mime = 'application/json'; }
    if (type === 'Tailwind') ext = 'js';
    if (type === 'Figma Variables') { ext = 'tokens.json'; mime = 'application/json'; }

    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'Figma Variables' ? `figma-variables.tokens.json` : `palettes-${type.toLowerCase().replace(' ', '-')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Color Palette Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Generate beautiful, cohesive UI color palettes from a single base color.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={addFamily} style={{ ...btnStyle, backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>
          + Add color family
        </button>

        {families.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>FORMAT:</label>
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
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>EXPORT ALL:</span>
              <button className="btn-export" onClick={() => handleExport('CSS')} style={btnStyle}>CSS</button>
              <button className="btn-export" onClick={() => handleExport('JSON')} style={btnStyle}>JSON</button>
              <button className="btn-export" onClick={() => handleExport('Tailwind')} style={btnStyle}>Tailwind</button>
              <button className="btn-export" onClick={() => handleExport('Figma Variables')} style={btnStyle}>Figma Variables</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {families.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            No color families yet. Click "Add color family" to start!
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
