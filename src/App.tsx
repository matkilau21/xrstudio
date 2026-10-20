import { useMemo, useRef, useState } from "react";
import { Box, Circle, Cylinder, Download, FolderOpen, Globe2, Layers3, Plus, Save, Trash2, Upload, Languages, Move3D, Rotate3D, Scaling, Eye } from "lucide-react";
import Viewport from "./Viewport";
import { useEditorStore, type SceneObject } from "./store";

export default function App() {
  const objects = useEditorStore(s => s.objects);
  const selectedId = useEditorStore(s => s.selectedId);
  const addObject = useEditorStore(s => s.addObject);
  const selectObject = useEditorStore(s => s.selectObject);
  const updateObject = useEditorStore(s => s.updateObject);
  const removeObject = useEditorStore(s => s.removeObject);
  const loadObjects = useEditorStore(s => s.loadObjects);
  const selected = useMemo(() => objects.find(o => o.id === selectedId) ?? null, [objects, selectedId]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState("Move");
  const [language, setLanguage] = useState<"EN" | "BM">("BM");
  const [status, setStatus] = useState("Ready");

  const saveProject = () => {
    localStorage.setItem("xr-studio-project", JSON.stringify({ name: "Automotive Air Conditioning XR", objects }));
    setStatus("Project saved in this browser");
  };
  const openProject = () => {
    const raw = localStorage.getItem("xr-studio-project");
    if (!raw) { setStatus("No saved project found"); return; }
    try { const parsed = JSON.parse(raw); loadObjects(parsed.objects as SceneObject[]); setStatus("Project loaded"); }
    catch { setStatus("Unable to read saved project"); }
  };
  const exportProject = () => {
    const data = JSON.stringify({ name: "Automotive Air Conditioning XR", version: "1.0", objects }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "automotive-air-conditioning-xr.json"; a.click();
    URL.revokeObjectURL(url); setStatus("Project JSON exported");
  };
  const importProject = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const parsed = JSON.parse(String(reader.result)); if (!Array.isArray(parsed.objects)) throw new Error(); loadObjects(parsed.objects); setStatus("Project imported"); }
      catch { setStatus("Invalid XR Studio project JSON"); }
    };
    reader.readAsText(file);
  };

  const updateVector = (key: "position" | "rotation" | "scale", index: number, value: number) => {
    if (!selected) return;
    const next = [...selected[key]] as [number, number, number];
    next[index] = value;
    updateObject(selected.id, { [key]: next });
  };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Globe2 size={19}/></div><div><strong>XR STUDIO</strong><small>CREATOR 1.0 · WEBXR AUTHORING</small></div></div>
      <div className="project-name"><span className="live-dot"/> Automotive Air Conditioning XR <span className="muted">/ Scene 01</span></div>
      <div className="top-actions">
        <button className="ghost" onClick={() => setLanguage(language === "BM" ? "EN" : "BM")}><Languages size={15}/>{language}</button>
        <button className="ghost" onClick={openProject}><FolderOpen size={15}/>Open</button>
        <button className="ghost" onClick={saveProject}><Save size={15}/>Save</button>
        <button className="primary" onClick={exportProject}><Download size={15}/>Export</button>
      </div>
    </header>

    <main className="workspace">
      <aside className="left-panel">
        <div className="panel-heading"><Layers3 size={15}/> HIERARCHY <span className="count">{objects.length}</span></div>
        <div className="scene-root"><ChevronIcon/> Scene 01</div>
        <div className="object-list">
          {objects.map(obj => <button key={obj.id} className={`object-row ${selectedId === obj.id ? "selected" : ""}`} onClick={() => selectObject(obj.id)}>
            {obj.type === "sphere" ? <Circle size={14}/> : obj.type === "cylinder" ? <Cylinder size={14}/> : <Box size={14}/>}
            <span>{obj.name}</span>
          </button>)}
        </div>
        <div className="panel-heading asset-heading">CREATE OBJECT</div>
        <div className="create-grid">
          <button onClick={() => addObject("box")}><Box size={16}/>Box</button>
          <button onClick={() => addObject("sphere")}><Circle size={16}/>Sphere</button>
          <button onClick={() => addObject("cylinder")}><Cylinder size={16}/>Cylinder</button>
        </div>
        <div className="panel-bottom">
          <div className="panel-heading">ASSETS</div>
          <button className="asset-button" onClick={() => fileRef.current?.click()}><Upload size={15}/> Import 3D Model (.glb/.gltf)</button>
          <input ref={fileRef} type="file" accept=".json,.glb,.gltf" hidden onChange={e => importProject(e.target.files?.[0])}/>
          <p className="hint">Model import is planned for the next build milestone. JSON scene import is supported.</p>
        </div>
      </aside>

      <section className="center-panel">
        <div className="viewport-toolbar">
          <div className="tool-group">
            <button className={tool === "Move" ? "tool-active" : ""} onClick={() => setTool("Move")} title="Move"><Move3D size={16}/></button>
            <button className={tool === "Rotate" ? "tool-active" : ""} onClick={() => setTool("Rotate")} title="Rotate"><Rotate3D size={16}/></button>
            <button className={tool === "Scale" ? "tool-active" : ""} onClick={() => setTool("Scale")} title="Scale"><Scaling size={16}/></button>
          </div>
          <span className="viewport-label">3D VIEWPORT <span>·</span> PERSPECTIVE</span>
          <button className="ghost small" onClick={() => setStatus("Preview mode is planned for Phase 3")}><Eye size={15}/>Preview</button>
        </div>
        <Viewport />
        <div className="viewport-footer"><span>Orbit: drag · Zoom: scroll · Select: click object</span><span>WEBGL · THREE.JS</span></div>
      </section>

      <aside className="right-panel">
        <div className="panel-heading">INSPECTOR</div>
        {selected ? <>
          <div className="inspector-object"><div className="object-icon"><Box size={18}/></div><div><strong>{selected.name}</strong><small>{selected.type.toUpperCase()} OBJECT</small></div></div>
          <label className="field-label">OBJECT NAME</label>
          <input className="text-input" value={selected.name} onChange={e => updateObject(selected.id, { name: e.target.value })}/>
          <VectorEditor title="POSITION" values={selected.position} onChange={(i,v) => updateVector("position",i,v)}/>
          <VectorEditor title="ROTATION" values={selected.rotation} onChange={(i,v) => updateVector("rotation",i,v)} suffix="°" degrees/>
          <VectorEditor title="SCALE" values={selected.scale} onChange={(i,v) => updateVector("scale",i,v)}/>
          <label className="field-label">MATERIAL COLOR</label>
          <div className="color-row"><input type="color" value={selected.color} onChange={e => updateObject(selected.id, { color: e.target.value })}/><code>{selected.color.toUpperCase()}</code></div>
          <button className="danger-button" onClick={() => removeObject(selected.id)}><Trash2 size={14}/> Delete Object</button>
        </> : <div className="empty-inspector">Select an object in the hierarchy or viewport to edit its properties.</div>}
      </aside>
    </main>
    <footer className="statusbar"><span><span className="status-dot"/> {status}</span><span>XR STUDIO 1.0 · LOCAL WORKSPACE</span></footer>
  </div>;
}

function ChevronIcon() { return <span className="chevron">⌄</span>; }

function VectorEditor({ title, values, onChange, suffix = "", degrees = false }: {
  title: string; values: [number, number, number]; onChange: (index: number, value: number) => void; suffix?: string; degrees?: boolean;
}) {
  const display = (v: number) => degrees ? Number((v * 180 / Math.PI).toFixed(1)) : Number(v.toFixed(2));
  return <section className="vector-section">
    <div className="vector-title">{title}</div>
    <div className="vector-grid">{values.map((value, i) => <label key={i} className="axis-field"><span>{["X","Y","Z"][i]}</span><input type="number" step="0.1" value={display(value)} onChange={e => onChange(i, degrees ? Number(e.target.value) * Math.PI / 180 : Number(e.target.value))}/>{suffix}</label>)}</div>
  </section>;
}