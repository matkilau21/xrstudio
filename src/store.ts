import { create } from "zustand";

export type SceneObject = {
  id: string;
  name: string;
  type: "box" | "sphere" | "cylinder";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
};

type EditorState = {
  objects: SceneObject[];
  selectedId: string | null;
  addObject: (type: SceneObject["type"]) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  loadObjects: (objects: SceneObject[]) => void;
  removeObject: (id: string) => void;
};

const starterObjects: SceneObject[] = [
  { id: crypto.randomUUID(), name: "Air Conditioning Unit", type: "box", position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [2.2, 0.8, 0.8], color: "#4f91c7" },
  { id: crypto.randomUUID(), name: "Compressor", type: "cylinder", position: [-1.5, 0.45, -1.2], rotation: [Math.PI / 2, 0, 0], scale: [0.55, 0.55, 0.55], color: "#d49b4c" },
  { id: crypto.randomUUID(), name: "Receiver Drier", type: "cylinder", position: [1.4, 0.55, -1.1], rotation: [0, 0, 0], scale: [0.35, 0.75, 0.35], color: "#7aa58a" }
];

export const useEditorStore = create<EditorState>((set) => ({
  objects: starterObjects,
  selectedId: starterObjects[0].id,
  addObject: (type) => set((state) => {
    const count = state.objects.filter(o => o.type === type).length + 1;
    const obj: SceneObject = {
      id: crypto.randomUUID(),
      name: `${type[0].toUpperCase()}${type.slice(1)} ${count}`,
      type, position: [0, 0.5, 0], rotation: [0, 0, 0],
      scale: [1, 1, 1], color: "#6d86a8"
    };
    return { objects: [...state.objects, obj], selectedId: obj.id };
  }),
  selectObject: (id) => set({ selectedId: id }),
  updateObject: (id, patch) => set((state) => ({
    objects: state.objects.map(o => o.id === id ? { ...o, ...patch } : o)
  })),
  loadObjects: (objects) => set({ objects, selectedId: objects[0]?.id ?? null }),
  removeObject: (id) => set((state) => {
    const next = state.objects.filter(o => o.id !== id);
    return { objects: next, selectedId: state.selectedId === id ? next[0]?.id ?? null : state.selectedId };
  })
}));