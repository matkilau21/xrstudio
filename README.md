# XR Studio 1.0 — Starter MVP

Browser-based 3D/WebXR authoring editor starter built with React, TypeScript, Vite, Three.js and Zustand.

## Current features
- Dark professional editor layout
- Three.js 3D viewport with grid, axes, lighting and orbit camera
- Create Box, Sphere and Cylinder primitives
- Select objects from hierarchy or viewport
- Inspector for name, position, rotation, scale and material color
- Save project to browser localStorage
- Open saved project and export/import project JSON
- Netlify configuration included

## Not implemented yet
This is an initial MVP foundation, not a complete production editor.
- GLB/GLTF import into the live scene
- Functional Move/Rotate/Scale toolbar mode switching
- Undo/redo history
- IndexedDB asset library
- WebXR headset session and runtime
- Learning content / hotspot / quiz builder
- Cloud accounts, database and subscription billing

## Run in VS Code
Install Node.js LTS, then open this folder in VS Code and run:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually http://localhost:5173.

## Production build
```bash
npm run build
npm run preview
```

## Deploy to Netlify
1. Push this folder to a GitHub repository.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Select the GitHub repository.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy.

The included `netlify.toml` already defines the build command, publish directory and SPA fallback.

## Notes
- Project saving currently uses browser localStorage on the current device/browser.
- WebXR requires a compatible browser/device and a secure context (HTTPS or localhost).
- Netlify hosts the web application; cloud project storage and user accounts require a backend service.
