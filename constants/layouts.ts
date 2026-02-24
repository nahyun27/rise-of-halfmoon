import { BoardLayout, BoardNode } from "../types/game";

// -------------- GENERATORS --------------

function createGridLayout(rows: number, cols: number, startX: number, startY: number, spacingX: number, spacingY: number): BoardNode[] {
  const nodes: BoardNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `grid_${r}_${c}`;
      const connectedTo: string[] = [];

      if (c > 0) connectedTo.push(`grid_${r}_${c - 1}`);
      if (c < cols - 1) connectedTo.push(`grid_${r}_${c + 1}`);
      if (r > 0) connectedTo.push(`grid_${r - 1}_${c}`);
      if (r < rows - 1) connectedTo.push(`grid_${r + 1}_${c}`);

      nodes.push({
        id,
        position: { x: startX + c * spacingX, y: startY + r * spacingY },
        card: null,
        connectedTo
      });
    }
  }
  return nodes;
}

function createCircularLayout(nodeCount: number, centerX: number, centerY: number, radiusX: number, radiusY: number): BoardNode[] {
  const nodes: BoardNode[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2; // start at top
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;

    const id = `circ_${i}`;
    const connectedTo = [
      `circ_${(i - 1 + nodeCount) % nodeCount}`, // prev
      `circ_${(i + 1) % nodeCount}` // next
    ];

    // Add cross connections for complexity (connect across the circle)
    if (nodeCount >= 6) {
      connectedTo.push(`circ_${(i + Math.floor(nodeCount / 2)) % nodeCount}`);
    }

    nodes.push({ id, position: { x, y }, card: null, connectedTo });
  }
  return nodes;
}

function createSpiralLayout(nodeCount: number, centerX: number, centerY: number): BoardNode[] {
  const nodes: BoardNode[] = [];
  for (let i = 0; i < nodeCount; i++) {
    // spiral out
    const angle = i * 0.8;
    const radiusX = 5 + i * 2.5;
    const radiusY = 5 + i * 2.5;

    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;

    const id = `spir_${i}`;
    const connectedTo: string[] = [];
    if (i > 0) connectedTo.push(`spir_${i - 1}`);
    if (i < nodeCount - 1) connectedTo.push(`spir_${i + 1}`);

    // Connect to inner rings
    if (i >= 5) {
      connectedTo.push(`spir_${i - 5}`);
    }

    nodes.push({ id, position: { x, y }, card: null, connectedTo });
  }
  return nodes;
}

// -------------- LEVEL DEFINITIONS --------------

export const LEVEL_1_MARCH: BoardLayout = {
  levelNumber: 1,
  name: "March",
  theme: "blue",
  nodes: createGridLayout(3, 3, 30, 20, 20, 30) // 3x3 grid centered
};

export const LEVEL_2_APRIL: BoardLayout = {
  levelNumber: 2,
  name: "April",
  theme: "green",
  nodes: [
    { id: 'n1', position: { x: 50, y: 10 }, card: null, connectedTo: ['n2', 'n3'] },

    { id: 'n2', position: { x: 35, y: 30 }, card: null, connectedTo: ['n1', 'n4', 'n5'] },
    { id: 'n3', position: { x: 65, y: 30 }, card: null, connectedTo: ['n1', 'n5', 'n6'] },

    { id: 'n4', position: { x: 20, y: 50 }, card: null, connectedTo: ['n2', 'n7'] },
    { id: 'n5', position: { x: 50, y: 50 }, card: null, connectedTo: ['n2', 'n3', 'n7', 'n8'] },
    { id: 'n6', position: { x: 80, y: 50 }, card: null, connectedTo: ['n3', 'n8'] },

    { id: 'n7', position: { x: 35, y: 70 }, card: null, connectedTo: ['n4', 'n5', 'n9'] },
    { id: 'n8', position: { x: 65, y: 70 }, card: null, connectedTo: ['n6', 'n5', 'n9'] },

    { id: 'n9', position: { x: 50, y: 90 }, card: null, connectedTo: ['n7', 'n8'] },
  ]
};

export const LEVEL_3_OCTOBER: BoardLayout = {
  levelNumber: 3,
  name: "October",
  theme: "purple",
  nodes: createCircularLayout(8, 50, 50, 35, 35)
};

export const LEVEL_4_NOVEMBER: BoardLayout = {
  levelNumber: 4,
  name: "November",
  theme: "indigo",
  nodes: [
    // Outer Pentagon
    { id: 'o1', position: { x: 50, y: 10 }, card: null, connectedTo: ['o2', 'o5', 'i1'] },
    { id: 'o2', position: { x: 90, y: 40 }, card: null, connectedTo: ['o1', 'o3', 'i2'] },
    { id: 'o3', position: { x: 75, y: 90 }, card: null, connectedTo: ['o2', 'o4', 'i3'] },
    { id: 'o4', position: { x: 25, y: 90 }, card: null, connectedTo: ['o3', 'o5', 'i4'] },
    { id: 'o5', position: { x: 10, y: 40 }, card: null, connectedTo: ['o4', 'o1', 'i5'] },

    // Inner Pentagon
    { id: 'i1', position: { x: 50, y: 30 }, card: null, connectedTo: ['o1', 'i2', 'i5', 'c'] },
    { id: 'i2', position: { x: 70, y: 45 }, card: null, connectedTo: ['o2', 'i1', 'i3', 'c'] },
    { id: 'i3', position: { x: 62, y: 70 }, card: null, connectedTo: ['o3', 'i2', 'i4', 'c'] },
    { id: 'i4', position: { x: 38, y: 70 }, card: null, connectedTo: ['o4', 'i3', 'i5', 'c'] },
    { id: 'i5', position: { x: 30, y: 45 }, card: null, connectedTo: ['o5', 'i4', 'i1', 'c'] },

    // Center Core
    { id: 'c', position: { x: 50, y: 52 }, card: null, connectedTo: ['i1', 'i2', 'i3', 'i4', 'i5'] },
  ]
};

export const LEVEL_5_DECEMBER: BoardLayout = {
  levelNumber: 5,
  name: "December",
  theme: "red",
  nodes: createSpiralLayout(15, 50, 50)
};

export const LEVEL_LAYOUTS = [
  LEVEL_1_MARCH,
  LEVEL_2_APRIL,
  LEVEL_3_OCTOBER,
  LEVEL_4_NOVEMBER,
  LEVEL_5_DECEMBER
];
