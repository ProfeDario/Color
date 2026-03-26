import { useState } from 'react';
import { ColorFamilyCard } from './components/ColorFamilyCard';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { Toast } from './components/Toast';
import { generatePalette, exportFigmaVariables, isValidHex } from './utils/colors';
import { getColorNames } from './utils/naming';
import { TypographyScreen } from './components/TypographyScreen';

const App = () => {
  const [activeTab, setActiveTab] = useState('colores');
  const [format, setFormat] = useState('HEX');
  const [families, setFamilies] = useState([
    {
      id: 'main-1',
      baseColor: '#3b82f6',
      metadata: { descriptiveName: 'Dark Blue', primitiveName: 'blue', semanticRole: 'Primary' },
      isExpanded: true
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const usedRoles = families.map(f => f.metadata.semanticRole).filter(r => r !== 'Custom');

  const triggerToast = () => {
    setToastMsg('No se pueden guardar dos colores con el mismo nombre porque se duplicará en Figma');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRoleSelect = (role) => {
    setIsModalOpen(false);
    const id = Date.now().toString();
    const newBase = '#10b981'; // default emerald
    const names = getColorNames(newBase);
    
    setFamilies([...families, {
      id,
      baseColor: newBase,
      metadata: { descriptiveName: names.descriptive, primitiveName: names.primitive, semanticRole: role },
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
    
    if (updates.baseColor && updates.baseColor !== familyToUpdate.baseColor && isValidHex(updates.baseColor)) {
      const names = getColorNames(updates.baseColor);
      updatedMetadata = { ...updatedMetadata, descriptiveName: names.descriptive, primitiveName: names.primitive };
    }

    const newExportName = updatedMetadata.semanticRole !== 'Custom' 
      ? updatedMetadata.semanticRole.toLowerCase() 
      : updatedMetadata.primitiveName;

    const isDuplicate = families.some(f => {
      if (f.id === id) return false;
      const siblingExportName = f.metadata.semanticRole !== 'Custom' 
        ? f.metadata.semanticRole.toLowerCase() 
        : f.metadata.primitiveName;
      return siblingExportName === newExportName;
    });

    if (isDuplicate) {
      triggerToast();
      return; 
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
          Generate beautiful, cohesive tokens for your UI.
        </p>

        {/* --- TABS --- */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('colores')}
            style={{ 
              background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', 
              fontWeight: activeTab === 'colores' ? '700' : '500', 
              color: activeTab === 'colores' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'colores' ? '2px solid var(--primary-color)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: '-0.5rem', transition: 'all 0.2s ease'
            }}
          >
            Colores
          </button>
          <button 
            onClick={() => setActiveTab('tipografia')}
            style={{ 
              background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', 
              fontWeight: activeTab === 'tipografia' ? '700' : '500', 
              color: activeTab === 'tipografia' ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'tipografia' ? '2px solid var(--primary-color)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: '-0.5rem', transition: 'all 0.2s ease'
            }}
          >
            Tipografía
          </button>
        </div>
      </header>

      {activeTab === 'colores' ? (
        <>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => setIsModalOpen(true)} style={{ ...btnStyle, backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>
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
      </>
      ) : (
        <TypographyScreen triggerToast={(msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); }} />
      )}

      <RoleSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleRoleSelect} 
        usedRoles={usedRoles} 
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
