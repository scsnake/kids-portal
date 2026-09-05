import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, RotateCcw, Star, CheckCircle, ArrowRight, Sparkles,
  Trophy, Grid, SkipBack, SkipForward, X
} from 'lucide-react';

// --- Level Definitions (Now 24 Levels!) ---
const LEVELS = [
  {
    id: 1, name: "The Magic Triangle",
    nodes: [ { id: 0, x: 50, y: 20 }, { id: 1, x: 20, y: 80 }, { id: 2, x: 80, y: 80 } ],
    edges: [[0, 1], [1, 2], [2, 0]]
  },
  {
    id: 2, name: "The Bowtie",
    nodes: [
      { id: 0, x: 20, y: 20 }, { id: 1, x: 20, y: 80 }, { id: 2, x: 50, y: 50 },
      { id: 3, x: 80, y: 20 }, { id: 4, x: 80, y: 80 }
    ],
    edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]
  },
  {
    id: 3, name: "The Wizard's House",
    nodes: [
      { id: 0, x: 20, y: 45 }, { id: 1, x: 80, y: 45 }, { id: 2, x: 80, y: 90 },
      { id: 3, x: 20, y: 90 }, { id: 4, x: 50, y: 15 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [4, 0], [4, 1]]
  },
  {
    id: 4, name: "The Lucky Star",
    nodes: [
      { id: 0, x: 50, y: 10 }, { id: 1, x: 90, y: 40 }, { id: 2, x: 75, y: 90 },
      { id: 3, x: 25, y: 90 }, { id: 4, x: 10, y: 40 }
    ],
    edges: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]]
  },
  {
    id: 5, name: "The Fast Fish",
    nodes: [
      { id: 0, x: 25, y: 50 }, { id: 1, x: 50, y: 20 }, { id: 2, x: 50, y: 80 },
      { id: 3, x: 75, y: 50 }, { id: 4, x: 95, y: 20 }, { id: 5, x: 95, y: 80 }
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]]
  },
  {
    id: 6, name: "The Hourglass",
    nodes: [
      { id: 0, x: 20, y: 20 }, { id: 1, x: 80, y: 20 }, { id: 2, x: 50, y: 50 },
      { id: 3, x: 20, y: 80 }, { id: 4, x: 80, y: 80 }
    ],
    edges: [[0, 1], [0, 2], [1, 2], [3, 4], [3, 2], [4, 2]]
  },
  {
    id: 7, name: "The Rocket",
    nodes: [
      { id: 0, x: 50, y: 10 }, { id: 1, x: 30, y: 40 }, { id: 2, x: 70, y: 40 },
      { id: 3, x: 30, y: 80 }, { id: 4, x: 70, y: 80 }, { id: 5, x: 50, y: 95 }
    ],
    edges: [[0, 1], [0, 2], [1, 2], [1, 4], [2, 3], [1, 3], [2, 4], [3, 5], [4, 5]]
  },
  {
    id: 8, name: "The King's Crown",
    nodes: [
      { id: 0, x: 20, y: 30 }, { id: 1, x: 50, y: 50 }, { id: 2, x: 80, y: 30 },
      { id: 3, x: 20, y: 80 }, { id: 4, x: 80, y: 80 }, { id: 5, x: 50, y: 80 }
    ],
    edges: [[0, 3], [0, 1], [1, 2], [2, 4], [3, 5], [5, 4], [1, 5]]
  },
  {
    id: 9, name: "The Bridge",
    nodes: [
      { id: 0, x: 15, y: 70 }, { id: 1, x: 50, y: 70 }, { id: 2, x: 85, y: 70 },
      { id: 3, x: 32, y: 30 }, { id: 4, x: 68, y: 30 }
    ],
    edges: [[0, 1], [1, 2], [3, 4], [0, 3], [1, 3], [1, 4], [2, 4]]
  },
  {
    id: 10, name: "The Crystal",
    nodes: [
      { id: 0, x: 50, y: 10 }, { id: 1, x: 20, y: 35 }, { id: 2, x: 20, y: 65 },
      { id: 3, x: 50, y: 90 }, { id: 4, x: 80, y: 65 }, { id: 5, x: 80, y: 35 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [2, 5], [1, 5]]
  },
  {
    id: 11, name: "The Butterfly",
    nodes: [
      { id: 0, x: 50, y: 50 }, { id: 1, x: 20, y: 20 }, { id: 2, x: 10, y: 50 },
      { id: 3, x: 20, y: 80 }, { id: 4, x: 80, y: 20 }, { id: 5, x: 90, y: 50 }, { id: 6, x: 80, y: 80 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [0, 4], [4, 5], [5, 6], [6, 0], [0, 5]]
  },
  {
    id: 12, name: "The Grand Star",
    nodes: [
      { id: 0, x: 50, y: 5 }, { id: 1, x: 95, y: 38 }, { id: 2, x: 78, y: 90 },
      { id: 3, x: 22, y: 90 }, { id: 4, x: 5, y: 38 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [2, 4], [4, 1], [1, 3], [3, 0]]
  },
  {
    id: 13, name: "The Envelope",
    nodes: [
      { id: 0, x: 15, y: 80 }, { id: 1, x: 85, y: 80 }, { id: 2, x: 85, y: 40 },
      { id: 3, x: 15, y: 40 }, { id: 4, x: 50, y: 10 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [3, 4], [2, 4]]
  },
  {
    id: 14, name: "The Sailboat",
    nodes: [
      { id: 0, x: 30, y: 90 }, { id: 1, x: 70, y: 90 }, { id: 2, x: 10, y: 70 },
      { id: 3, x: 90, y: 70 }, { id: 4, x: 50, y: 20 }
    ],
    edges: [[0, 1], [1, 3], [3, 2], [2, 0], [2, 4], [3, 4], [2, 1]]
  },
  {
    id: 15, name: "The Double Tent",
    nodes: [
      { id: 0, x: 10, y: 90 }, { id: 1, x: 50, y: 90 }, { id: 2, x: 90, y: 90 },
      { id: 3, x: 30, y: 50 }, { id: 4, x: 70, y: 50 }, { id: 5, x: 50, y: 10 }
    ],
    edges: [[0, 1], [1, 2], [2, 4], [4, 3], [3, 0], [3, 1], [4, 1], [3, 5], [4, 5]]
  },
  {
    id: 16, name: "The Diamond",
    nodes: [
      { id: 0, x: 50, y: 10 }, { id: 1, x: 90, y: 50 }, { id: 2, x: 50, y: 90 },
      { id: 3, x: 10, y: 50 }, { id: 4, x: 50, y: 50 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [3, 4]]
  },
  {
    id: 17, name: "The Satellite",
    nodes: [
      { id: 0, x: 30, y: 30 }, { id: 1, x: 70, y: 30 }, { id: 2, x: 30, y: 70 },
      { id: 3, x: 70, y: 70 }, { id: 4, x: 10, y: 50 }, { id: 5, x: 90, y: 50 }
    ],
    edges: [[0, 1], [1, 3], [3, 2], [2, 0], [0, 4], [2, 4], [1, 5], [3, 5], [0, 3], [1, 2]]
  },
  {
    id: 18, name: "The Mansion",
    nodes: [
      { id: 0, x: 10, y: 90 }, { id: 1, x: 90, y: 90 }, { id: 2, x: 90, y: 50 },
      { id: 3, x: 10, y: 50 }, { id: 4, x: 30, y: 20 }, { id: 5, x: 70, y: 20 },
      { id: 6, x: 50, y: 40 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 2], [4, 6], [5, 6], [3, 6], [2, 6]]
  },
  {
    id: 19, name: "The Ninja Star",
    nodes: [
      { id: 0, x: 50, y: 10 }, { id: 1, x: 65, y: 35 }, { id: 2, x: 90, y: 50 },
      { id: 3, x: 65, y: 65 }, { id: 4, x: 50, y: 90 }, { id: 5, x: 35, y: 65 },
      { id: 6, x: 10, y: 50 }, { id: 7, x: 35, y: 35 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [1, 3], [3, 5], [5, 7], [7, 1]]
  },
  {
    id: 20, name: "The Shield",
    nodes: [
      { id: 0, x: 20, y: 20 }, { id: 1, x: 80, y: 20 }, { id: 2, x: 10, y: 50 },
      { id: 3, x: 90, y: 50 }, { id: 4, x: 50, y: 90 }
    ],
    edges: [[0, 1], [1, 3], [3, 4], [4, 2], [2, 0], [0, 4], [1, 4], [0, 3], [1, 2]]
  },
  {
    id: 21, name: "The Gem",
    nodes: [
      { id: 0, x: 30, y: 15 }, { id: 1, x: 70, y: 15 }, { id: 2, x: 90, y: 50 },
      { id: 3, x: 70, y: 85 }, { id: 4, x: 30, y: 85 }, { id: 5, x: 10, y: 50 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 2], [2, 4], [4, 0]]
  },
  {
    id: 22, name: "The Flower",
    nodes: [
      { id: 0, x: 50, y: 50 }, { id: 1, x: 50, y: 10 }, { id: 2, x: 90, y: 50 },
      { id: 3, x: 50, y: 90 }, { id: 4, x: 10, y: 50 }
    ],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 4], [4, 1], [1, 3], [2, 4]]
  },
  {
    id: 23, name: "The Pyramid",
    nodes: [
      { id: 0, x: 50, y: 15 }, { id: 1, x: 30, y: 50 }, { id: 2, x: 70, y: 50 },
      { id: 3, x: 10, y: 85 }, { id: 4, x: 50, y: 85 }, { id: 5, x: 90, y: 85 }
    ],
    edges: [[0, 1], [0, 2], [1, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 4], [4, 5], [0, 4]]
  },
  {
    id: 24, name: "The Infinite Knot",
    nodes: [
      { id: 0, x: 20, y: 20 }, { id: 1, x: 80, y: 20 }, { id: 2, x: 80, y: 80 },
      { id: 3, x: 20, y: 80 }, { id: 4, x: 40, y: 40 }, { id: 5, x: 60, y: 40 },
      { id: 6, x: 60, y: 60 }, { id: 7, x: 40, y: 60 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 5], [1, 6], [2, 7], [3, 4], [0, 4], [1, 5], [2, 6], [3, 7]
    ]
  }
];

// --- Helper Functions ---
const hasTraversedEdge = (path, a, b) => {
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true;
  }
  return false;
};

const isValidEdge = (edges, a, b) => {
  return edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
};

const calculateOddNodes = (level) => {
  const degrees = {};
  level.nodes.forEach(n => degrees[n.id] = 0);
  level.edges.forEach(e => {
    degrees[e[0]]++;
    degrees[e[1]]++;
  });
  return Object.keys(degrees).filter(id => degrees[id] % 2 !== 0).map(Number);
};

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [path, setPath] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState('menu'); // menu, playing, won, complete, map
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  const svgRef = useRef(null);
  const currentLevel = LEVELS[levelIndex];

  // Odd Nodes hint system
  const [oddNodes, setOddNodes] = useState([]);
  useEffect(() => {
    if (currentLevel) {
      const odds = calculateOddNodes(currentLevel);
      setOddNodes(odds.length === 2 ? odds : []);
    }
  }, [currentLevel]);

  // Coordinate math
  const getSVGCoordinates = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: cursorPt.x, y: cursorPt.y };
  }, []);

  const findNearestNode = useCallback((coords, threshold = 12) => {
    let nearest = null;
    let minDist = threshold;
    currentLevel.nodes.forEach(node => {
      const dist = Math.sqrt(Math.pow(node.x - coords.x, 2) + Math.pow(node.y - coords.y, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    });
    return nearest;
  }, [currentLevel]);

  // Pointer Events
  const handlePointerDown = (e) => {
    if (gameState !== 'playing') return;
    const coords = getSVGCoordinates(e.clientX, e.clientY);
    const node = findNearestNode(coords);

    if (node) {
      if (path.length === 0) {
        setPath([node.id]);
        setIsDragging(true);
        setPointerPos(coords);
      } else {
        const lastNodeId = path[path.length - 1];
        if (node.id === lastNodeId) {
          setIsDragging(true);
          setPointerPos(coords);
        } else if (isValidEdge(currentLevel.edges, lastNodeId, node.id) && !hasTraversedEdge(path, lastNodeId, node.id)) {
          const newPath = [...path, node.id];
          setPath(newPath);
          checkWin(newPath);
          setIsDragging(true);
          setPointerPos(coords);
        } else {
          setPath([node.id]);
          setIsDragging(true);
          setPointerPos(coords);
        }
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || gameState !== 'playing') return;
    if (e.cancelable) e.preventDefault();

    const coords = getSVGCoordinates(e.clientX, e.clientY);
    setPointerPos(coords);

    const node = findNearestNode(coords);
    if (node) {
      const lastNodeId = path[path.length - 1];
      if (node.id !== lastNodeId && isValidEdge(currentLevel.edges, lastNodeId, node.id)) {
        if (!hasTraversedEdge(path, lastNodeId, node.id)) {
          const newPath = [...path, node.id];
          setPath(newPath);
          checkWin(newPath);
        }
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const checkWin = (currentPath) => {
    if (currentPath.length - 1 === currentLevel.edges.length) {
      setIsDragging(false);
      setGameState('won');
    }
  };

  // Safe Navigation with Cooldown
  const navigateLevel = (newIndex) => {
    if (isOnCooldown) return;
    if (newIndex >= 0 && newIndex < LEVELS.length) {
      setIsOnCooldown(true);
      setLevelIndex(newIndex);
      setPath([]);
      setIsDragging(false);
      setGameState('playing');
      setTimeout(() => setIsOnCooldown(false), 500); // 500ms anti-spam
    } else if (newIndex >= LEVELS.length) {
      setGameState('complete');
    }
  };

  const restartLevel = () => {
    if (isOnCooldown) return;
    setIsOnCooldown(true);
    setPath([]);
    setIsDragging(false);
    setGameState('playing');
    setTimeout(() => setIsOnCooldown(false), 500);
  };

  // Renders
  const renderLines = () => {
    return currentLevel.edges.map((edge, index) => {
      const n1 = currentLevel.nodes.find(n => n.id === edge[0]);
      const n2 = currentLevel.nodes.find(n => n.id === edge[1]);
      const isTraversed = hasTraversedEdge(path, n1.id, n2.id);

      return (
        <line
          key={`edge-${index}`}
          x1={n1.x} y1={n1.y}
          x2={n2.x} y2={n2.y}
          className={`transition-all duration-300 ${
            isTraversed ? 'stroke-fuchsia-500' : 'stroke-slate-200 border-dashed stroke-dasharray-[4_4]'
          }`}
          strokeWidth={isTraversed ? "6" : "4"}
          strokeLinecap="round"
        />
      );
    });
  };

  const renderRubberBand = () => {
    if (!isDragging || path.length === 0) return null;
    const lastNode = currentLevel.nodes.find(n => n.id === path[path.length - 1]);
    return (
      <line
        x1={lastNode.x} y1={lastNode.y}
        x2={pointerPos.x} y2={pointerPos.y}
        className="stroke-fuchsia-300 pointer-events-none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="4 8"
      />
    );
  };

  const renderNodes = () => {
    return currentLevel.nodes.map((node) => {
      const isVisited = path.includes(node.id);
      const isCurrent = path[path.length - 1] === node.id;
      const isHint = path.length === 0 && oddNodes.includes(node.id);

      return (
        <g key={`node-${node.id}`} className="pointer-events-none">
          {(isCurrent || isHint) && (
            <circle
              cx={node.x} cy={node.y} r="8"
              className={`${isHint ? 'fill-amber-300 animate-ping opacity-50' : 'fill-fuchsia-200 animate-pulse'}`}
            />
          )}
          <circle
            cx={node.x} cy={node.y} r="5"
            className={`transition-all duration-200 ${
              isCurrent ? 'fill-fuchsia-600 stroke-white stroke-2' :
              isVisited ? 'fill-fuchsia-500' : 'fill-white stroke-slate-300 stroke-[2.5px]'
            }`}
          />
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 font-sans touch-none selection:bg-transparent relative">

      {/* Game Container */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-sky-200/50 overflow-hidden border-4 border-white relative z-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 pt-8 text-center text-white relative overflow-hidden">
          {/* Map Button */}
          {(gameState === 'playing' || gameState === 'won' || gameState === 'map') && (
            <button
              onClick={() => setGameState(gameState === 'map' ? 'playing' : 'map')}
              className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition z-20"
            >
              {gameState === 'map' ? <X size={20} /> : <Grid size={20} />}
            </button>
          )}

          <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
            <Sparkles size={64} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2 drop-shadow-md">
            Magic One-Stroke
          </h1>

          {(gameState === 'playing' || gameState === 'won' || gameState === 'map') ? (
            <div className="flex items-center justify-center space-x-2 bg-white/20 inline-flex px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
              <span className="font-bold text-sm">
                Level {levelIndex + 1} / {LEVELS.length}
              </span>
              <Star size={16} className="text-yellow-300 fill-yellow-300" />
            </div>
          ) : null}
        </div>

        {/* Content Area */}
        <div className="p-6 relative">

          {gameState === 'menu' && (
            <div className="text-center py-10">
              <div className="bg-fuchsia-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                <Play size={48} className="text-fuchsia-500 ml-2 z-10" />
                <div className="absolute inset-0 bg-fuchsia-200 rounded-full animate-ping opacity-30"></div>
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-4">Ready for a challenge?</h2>
              <p className="text-slate-500 mb-8 font-medium px-4">
                Connect all the dots without lifting your finger and never trace the same line twice!
              </p>
              <button
                onClick={() => navigateLevel(0)}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg shadow-fuchsia-300 transform transition active:scale-95 hover:-translate-y-1"
              >
                Let's Play!
              </button>
            </div>
          )}

          {gameState === 'map' && (
            <div className="py-2 animate-fade-in max-h-[400px] overflow-y-auto no-scrollbar">
              <h2 className="text-xl font-bold text-center text-slate-700 mb-6">Select a Level</h2>
              <div className="grid grid-cols-4 gap-3">
                {LEVELS.map((lvl, idx) => (
                  <button
                    key={lvl.id}
                    onClick={() => navigateLevel(idx)}
                    className={`aspect-square rounded-2xl flex items-center justify-center font-bold text-lg transition-transform active:scale-90 ${
                      levelIndex === idx
                        ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-200 ring-2 ring-offset-2 ring-fuchsia-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'complete' && (
            <div className="text-center py-8 animate-fade-in">
              <div className="bg-yellow-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                <Trophy size={64} className="text-yellow-500" />
                <Sparkles size={32} className="text-yellow-400 absolute top-0 right-0 animate-spin-slow" />
                <Sparkles size={24} className="text-orange-400 absolute bottom-2 left-0 animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                Grand Master!
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                You completed all {LEVELS.length} magic shapes! Your brain is super powerful!
              </p>
              <button
                onClick={() => navigateLevel(0)}
                className="bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-lg font-bold py-4 px-12 rounded-full shadow-lg transform transition active:scale-95 hover:-translate-y-1"
              >
                Play Again
              </button>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'won') && (
            <div className="flex flex-col items-center animate-fade-in">

              {/* Toolbar */}
              <div className="flex justify-between items-center w-full mb-4 px-2">
                <button
                  disabled={isOnCooldown || levelIndex === 0}
                  onClick={() => navigateLevel(levelIndex - 1)}
                  className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition active:scale-90 disabled:opacity-30"
                  aria-label="Previous Level"
                >
                  <SkipBack size={20} />
                </button>

                <h2 className="text-lg font-bold text-slate-700 text-center flex-1 mx-2 truncate">
                  {currentLevel.name}
                </h2>

                <div className="flex space-x-2">
                  <button
                    disabled={isOnCooldown}
                    onClick={restartLevel}
                    className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition active:scale-90 disabled:opacity-30"
                    aria-label="Restart Level"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button
                    disabled={isOnCooldown || levelIndex === LEVELS.length - 1}
                    onClick={() => navigateLevel(levelIndex + 1)}
                    className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition active:scale-90 disabled:opacity-30"
                    aria-label="Next Level"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
              </div>

              {/* The Drawing Board */}
              <div
                className="w-full aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner relative touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 100 100"
                  className="w-full h-full p-4 block touch-none"
                  style={{ touchAction: 'none' }}
                >
                  {renderLines()}
                  {renderRubberBand()}
                  {renderNodes()}
                </svg>

                {/* Win Overlay */}
                {gameState === 'won' && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-10">
                    <div className="bg-green-100 p-4 rounded-full mb-4 animate-bounce shadow-sm">
                      <CheckCircle size={56} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-6 drop-shadow-sm">
                      Awesome!
                    </h3>
                    <button
                      disabled={isOnCooldown}
                      onClick={() => navigateLevel(levelIndex + 1)}
                      className="flex items-center space-x-2 bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-green-200 transform transition active:scale-95 hover:-translate-y-1 disabled:opacity-50"
                    >
                      <span>{levelIndex === LEVELS.length - 1 ? "Finish!" : "Next Shape"}</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions / Hints */}
              <div className="mt-4 text-center h-12 flex items-center justify-center">
                {gameState === 'playing' && path.length === 0 ? (
                  <p className="text-slate-500 font-medium animate-pulse">
                    {oddNodes.length === 2
                      ? "Hint: Start on one of the glowing dots!"
                      : "Touch a dot to start tracing..."}
                  </p>
                ) : (gameState === 'playing' && path.length > 0) ? (
                  <p className="text-fuchsia-500 font-medium">
                    Keep going! Don't lift your finger!
                  </p>
                ) : null}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Hide scrollbar for map view but allow scrolling */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
