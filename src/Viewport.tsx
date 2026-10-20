import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEditorStore } from "./store";

export default function Viewport() {
  const host = useRef<HTMLDivElement>(null);
  const objects = useEditorStore(s => s.objects);
  const selectedId = useEditorStore(s => s.selectedId);
  const selectObject = useEditorStore(s => s.selectObject);
  const updateObject = useEditorStore(s => s.updateObject);

  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#171d27");
    const camera = new THREE.PerspectiveCamera(50, element.clientWidth / element.clientHeight, 0.1, 1000);
    camera.position.set(5, 4, 7);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(element.clientWidth, element.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x344050, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 8, 5);
    scene.add(key);
    const grid = new THREE.GridHelper(20, 20, 0x536174, 0x303a49);
    scene.add(grid);
    const axes = new THREE.AxesHelper(1.5);
    scene.add(axes);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    const transform = new TransformControls(camera, renderer.domElement);
    transform.addEventListener("dragging-changed", (event: any) => { orbit.enabled = !event.value; });
    scene.add(transform.getHelper());

    const meshes = new Map<string, THREE.Mesh>();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const syncMeshes = () => {
      const currentIds = new Set(objects.map(o => o.id));
      for (const [id, mesh] of meshes) {
        if (!currentIds.has(id)) { scene.remove(mesh); meshes.delete(id); }
      }
      objects.forEach(obj => {
        let mesh = meshes.get(obj.id);
        if (!mesh) {
          let geometry: THREE.BufferGeometry;
          if (obj.type === "sphere") geometry = new THREE.SphereGeometry(0.5, 32, 20);
          else if (obj.type === "cylinder") geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
          else geometry = new THREE.BoxGeometry(1, 1, 1);
          mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: obj.color, roughness: 0.55 }));
          mesh.userData.objectId = obj.id;
          scene.add(mesh);
          meshes.set(obj.id, mesh);
        }
        mesh.position.set(...obj.position);
        mesh.rotation.set(...obj.rotation);
        mesh.scale.set(...obj.scale);
        (mesh.material as THREE.MeshStandardMaterial).color.set(obj.color);
      });
      const selected = selectedId ? meshes.get(selectedId) : undefined;
      if (selected) transform.attach(selected); else transform.detach();
    };
    syncMeshes();

    const onPointerDown = (event: PointerEvent) => {
      if (transform.dragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...meshes.values()]);
      selectObject(hits[0]?.object.userData.objectId ?? null);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    const onChange = () => {
      const selected = selectedId ? meshes.get(selectedId) : undefined;
      if (!selected) return;
      updateObject(selectedId!, {
        position: [selected.position.x, selected.position.y, selected.position.z],
        rotation: [selected.rotation.x, selected.rotation.y, selected.rotation.z],
        scale: [selected.scale.x, selected.scale.y, selected.scale.z]
      });
    };
    transform.addEventListener("objectChange", onChange);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      orbit.update();
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const w = element.clientWidth, h = element.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      transform.removeEventListener("objectChange", onChange);
      transform.dispose();
      orbit.dispose();
      renderer.dispose();
      element.removeChild(renderer.domElement);
    };
  }, [objects, selectedId, selectObject, updateObject]);

  return <div className="viewport" ref={host} />;
}

export async function loadGltfFile(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const loader = new GLTFLoader();
    return await loader.loadAsync(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}