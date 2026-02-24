import { BoardLayout } from "../types/game";

export const LEVEL_1_MARCH: BoardLayout = {
  levelNumber: 1,
  name: "March",
  nodes: [
    { id: '1', position: { x: 20, y: 50 }, card: null, connectedTo: ['2'] },
    { id: '2', position: { x: 40, y: 50 }, card: null, connectedTo: ['1', '3', '4'] },
    { id: '3', position: { x: 40, y: 20 }, card: null, connectedTo: ['2'] },
    { id: '4', position: { x: 60, y: 50 }, card: null, connectedTo: ['2', '5', '6'] },
    { id: '5', position: { x: 60, y: 80 }, card: null, connectedTo: ['4'] },
    { id: '6', position: { x: 80, y: 50 }, card: null, connectedTo: ['4'] },
  ]
};

export const LEVEL_2_NOVEMBER: BoardLayout = {
  levelNumber: 2,
  name: "November",
  nodes: [
    { id: '1', position: { x: 10, y: 30 }, card: null, connectedTo: ['2', '4'] },
    { id: '2', position: { x: 25, y: 15 }, card: null, connectedTo: ['1', '3', '5'] },
    { id: '3', position: { x: 45, y: 10 }, card: null, connectedTo: ['2', '6'] },
    { id: '4', position: { x: 15, y: 55 }, card: null, connectedTo: ['1', '5', '9'] },
    { id: '5', position: { x: 30, y: 40 }, card: null, connectedTo: ['2', '4', '6', '10'] },
    { id: '6', position: { x: 50, y: 30 }, card: null, connectedTo: ['3', '5', '7', '11'] },
    { id: '7', position: { x: 70, y: 20 }, card: null, connectedTo: ['6', '8'] },
    { id: '8', position: { x: 90, y: 35 }, card: null, connectedTo: ['7', '12'] },
    { id: '9', position: { x: 20, y: 80 }, card: null, connectedTo: ['4', '10'] },
    { id: '10', position: { x: 40, y: 65 }, card: null, connectedTo: ['5', '9', '11', '13'] },
    { id: '11', position: { x: 60, y: 55 }, card: null, connectedTo: ['6', '10', '12', '14'] },
    { id: '12', position: { x: 80, y: 65 }, card: null, connectedTo: ['8', '11', '15'] },
    { id: '13', position: { x: 45, y: 90 }, card: null, connectedTo: ['10', '14'] },
    { id: '14', position: { x: 65, y: 85 }, card: null, connectedTo: ['11', '13', '15'] },
    { id: '15', position: { x: 85, y: 90 }, card: null, connectedTo: ['12', '14'] },
  ]
};

export const LEVEL_3_SOLSTICE: BoardLayout = {
  levelNumber: 3,
  name: "Solstice",
  nodes: [
    { id: 'c', position: { x: 50, y: 50 }, card: null, connectedTo: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] },
    { id: 'n', position: { x: 50, y: 15 }, card: null, connectedTo: ['c', 'nn'] },
    { id: 'nn', position: { x: 50, y: 0 }, card: null, connectedTo: ['n'] },
    { id: 's', position: { x: 50, y: 85 }, card: null, connectedTo: ['c', 'ss'] },
    { id: 'ss', position: { x: 50, y: 100 }, card: null, connectedTo: ['s'] },
    { id: 'e', position: { x: 85, y: 50 }, card: null, connectedTo: ['c', 'ee'] },
    { id: 'ee', position: { x: 100, y: 50 }, card: null, connectedTo: ['e'] },
    { id: 'w', position: { x: 15, y: 50 }, card: null, connectedTo: ['c', 'ww'] },
    { id: 'ww', position: { x: 0, y: 50 }, card: null, connectedTo: ['w'] },

    { id: 'ne', position: { x: 75, y: 25 }, card: null, connectedTo: ['c'] },
    { id: 'nw', position: { x: 25, y: 25 }, card: null, connectedTo: ['c'] },
    { id: 'se', position: { x: 75, y: 75 }, card: null, connectedTo: ['c'] },
    { id: 'sw', position: { x: 25, y: 75 }, card: null, connectedTo: ['c'] },
  ]
};

export const LEVEL_LAYOUTS = [LEVEL_1_MARCH, LEVEL_2_NOVEMBER, LEVEL_3_SOLSTICE];
