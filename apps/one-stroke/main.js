import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, RotateCcw, Star, CheckCircle, ArrowRight, Sparkles,
  Trophy, Grid, SkipBack, SkipForward, X, Undo2, Home
} from 'lucide-react';
import { LEVELS } from './levels.js';
import { canStep, extendPath, hasMoves, nodeAt } from './trace.js';

// --- Helper Functions ---
const hasTraversedEdge = (path, a, b) => {
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true;
  }
  return false;
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

// --- Progress: solved levels and where the child left off, kept on this device ---
const PROGRESS_KEY = 'oneStroke:progress:v1';

const loadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    const ids = new Set(LEVELS.map(l => l.id));
    const solved = new Set((Array.isArray(saved.solved) ? saved.solved : []).filter(id => ids.has(id)));
    const current = Number.isInteger(saved.current) && saved.current >= 0 && saved.current < LEVELS.length ? saved.current : 0;
    return { solved, current };
  } catch {
    return { solved: new Set(), current: 0 };
  }
};

const saveProgress = (solved, current) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ solved: [...solved], current }));
  } catch {
    // Private mode or blocked storage: the game still works, it just won't remember.
  }
};

export default function App() {
  const [initialProgress] = useState(loadProgress);
  const [levelIndex, setLevelIndex] = useState(initialProgress.current);
  const [solved, setSolved] = useState(initialProgress.solved);
  const [path, setPathState] = useState([]);
  const [isDragging, setIsDraggingState] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState('menu'); // menu, playing, won, complete, map
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [nudge, setNudge] = useState({ id: null, n: 0 }); // which dot to wiggle; n replays it

  const svgRef = useRef(null);
  const currentLevel = LEVELS[levelIndex];

  useEffect(() => { saveProgress(solved, levelIndex); }, [solved, levelIndex]);

  // Pointer events can arrive faster than React re-renders, so the handlers read the stroke
  // from refs (always current) rather than from state captured at the last render.
  const pathRef = useRef([]);
  const draggingRef = useRef(false);
  const lastPointRef = useRef(null); // board coords of the last pointer sample processed
  const pointerIdRef = useRef(null); // the one finger drawing; others are ignored
  const setPath = (next) => {
    pathRef.current = next;
    setPathState(next);
  };
  const setIsDragging = (value) => {
    draggingRef.current = value;
    if (!value) pointerIdRef.current = null;
    setIsDraggingState(value);
  };

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

  // Pointer Events
  const handlePointerDown = (e) => {
    if (gameState !== 'playing' || draggingRef.current) return;
    const coords = getSVGCoordinates(e.clientX, e.clientY);
    const node = nodeAt(currentLevel, coords);
    if (!node) return;

    const current = pathRef.current;
    const last = current[current.length - 1];
    if (current.length <= 1 && node.id !== last) {
      // Nothing drawn yet: tapping another dot just picks a different start.
      setPath([node.id]);
    } else if (node.id !== last) {
      if (!canStep(currentLevel, current, node.id)) {
        // This used to wipe the whole drawing. Now it only shows where the line ends.
        setNudge(prev => ({ id: last, n: prev.n + 1 }));
        return;
      }
      const newPath = [...current, node.id];
      setPath(newPath);
      if (checkWin(newPath)) return;
    }
    // Keep receiving this finger's moves even if it slides off the board mid-stroke.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointerIdRef.current = e.pointerId;
    lastPointRef.current = coords;
    setIsDragging(true);
    setPointerPos(coords);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current || gameState !== 'playing') return;
    if (e.cancelable) e.preventDefault();

    // Browsers batch fast movement into one event; the coalesced samples trace the real path.
    const samples = e.nativeEvent.getCoalescedEvents?.() ?? [];
    let current = pathRef.current;
    let coords = lastPointRef.current;
    for (const sample of samples.length ? samples : [e.nativeEvent]) {
      const next = getSVGCoordinates(sample.clientX, sample.clientY);
      current = extendPath(currentLevel, current, coords, next);
      coords = next;
    }
    lastPointRef.current = coords;
    setPointerPos(coords);
    if (current !== pathRef.current) {
      setPath(current);
      checkWin(current);
    }
  };

  const handlePointerUp = (e) => {
    if (e.pointerId !== pointerIdRef.current) return;
    setIsDragging(false);
  };

  const checkWin = (currentPath) => {
    if (currentPath.length - 1 !== currentLevel.edges.length) return false;
    setIsDragging(false);
    setGameState('won');
    setSolved(prev => (prev.has(currentLevel.id) ? prev : new Set(prev).add(currentLevel.id)));
    return true;
  };

  // Take back the last line (or the starting dot).
  const undo = () => {
    if (gameState !== 'playing') return;
    setIsDragging(false);
    const current = pathRef.current;
    setPath(current.length > 1 ? current.slice(0, -1) : []);
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

  const levelDone = path.length - 1 === currentLevel.edges.length;
  // Closing the map must not turn a finished board back into "keep going".
  const toggleMap = () => setGameState(gameState === 'map' ? (levelDone ? 'won' : 'playing') : 'map');
  const isStuck = gameState === 'playing' && path.length > 0 && !levelDone && !hasMoves(currentLevel, path);
  const inGame = gameState === 'playing' || gameState === 'won' || gameState === 'map';
  const allSolved = solved.size === LEVELS.length;
  const firstUnsolved = LEVELS.findIndex(l => !solved.has(l.id));

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
          className={`transition-all duration-300 ${isTraversed ? 'stroke-fuchsia-500' : 'stroke-slate-400'}`}
          strokeWidth={isTraversed ? "6" : "3.5"}
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
      const nudged = isCurrent && nudge.id === node.id;
      const wiggle = isCurrent && isStuck ? 'animate-stuck' : nudged ? 'animate-nudge' : '';

      return (
        // Re-keying the nudged dot replays its wiggle on every stray tap.
        <g key={`node-${node.id}-${nudged ? nudge.n : 0}`} className={`pointer-events-none ${wiggle}`}>
          {(isCurrent || isHint) && (
            <circle
              cx={node.x} cy={node.y} r="8"
              className={`${isHint ? 'fill-amber-300 animate-ping opacity-50' : isStuck ? 'fill-amber-200' : 'fill-fuchsia-200 animate-pulse'}`}
              // Scale around the dot itself; SVG's default origin is the board's corner, which
              // sent the "glowing dot" hint sliding off its dot.
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          )}
          <circle
            cx={node.x} cy={node.y} r="5"
            className={`transition-all duration-200 ${
              isCurrent ? 'fill-fuchsia-600 stroke-white stroke-2' :
              isVisited ? 'fill-fuchsia-500' : 'fill-white stroke-slate-400 stroke-[2.5px]'
            }`}
          />
        </g>
      );
    });
  };

  const hintText = path.length === 0
    ? (oddNodes.length === 2 ? "Hint: Start on one of the glowing dots!" : "Touch any dot to start tracing!")
    : isDragging ? "Keep going!" : "Touch the pink dot to keep going";

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 font-sans select-none selection:bg-transparent relative">

      {/* Game Container */}
      <div className={`w-full ${inGame ? 'max-w-3xl' : 'max-w-md'} bg-white rounded-[2rem] shadow-2xl shadow-sky-200/50 overflow-hidden border-4 border-white relative z-10`}>

        {/* Header: slim while playing so the board gets the room */}
        {inGame ? (
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-white flex items-center gap-3">
            <button
              onClick={toggleMap}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition flex-shrink-0"
              aria-label={gameState === 'map' ? 'Close level map' : 'Level map'}
            >
              {gameState === 'map' ? <X size={22} /> : <Grid size={22} />}
            </button>
            <h1 className="text-lg font-extrabold tracking-tight flex-1 truncate">Magic One-Stroke</h1>
            <div className="flex items-center gap-1.5 bg-violet-900/30 px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap">
              <Star size={16} className={solved.has(currentLevel.id) ? 'text-yellow-300 fill-yellow-300' : 'text-white/60'} />
              Level {levelIndex + 1} / {LEVELS.length}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 pt-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
              <Sparkles size={64} />
            </div>
            <a
              href="https://kids.scsnake.xyz/"
              className="absolute top-4 left-4 z-10 p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition"
              aria-label="Back to Kids Portal"
              title="Kids Portal"
            >
              <Home size={22} />
            </a>
            <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-md">
              Magic One-Stroke
            </h1>
          </div>
        )}

        {/* Content Area */}
        <div className={`${inGame ? 'p-4' : 'p-6'} relative`}>

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
                onClick={() => navigateLevel(levelIndex)}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg shadow-fuchsia-300 transform transition active:scale-95 hover:-translate-y-1"
              >
                {solved.size > 0 ? `Play Level ${levelIndex + 1}` : "Let's Play!"}
              </button>
              {solved.size > 0 && (
                <p className="mt-5 flex items-center justify-center gap-1.5 text-slate-600 font-bold">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  {solved.size} / {LEVELS.length} shapes solved
                </p>
              )}
            </div>
          )}

          {gameState === 'map' && (
            <div className="py-2 animate-fade-in max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5 px-1">
                <h2 className="text-xl font-bold text-slate-700">Select a Level</h2>
                <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  {solved.size} / {LEVELS.length}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {LEVELS.map((lvl, idx) => {
                  const done = solved.has(lvl.id);
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => navigateLevel(idx)}
                      aria-label={`Level ${idx + 1}${done ? ', solved' : ''}`}
                      className={`relative aspect-square rounded-2xl flex items-center justify-center font-bold text-lg transition-transform active:scale-90 ${
                        levelIndex === idx
                          ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200 ring-2 ring-offset-2 ring-fuchsia-600'
                          : done
                            ? 'bg-amber-50 text-slate-700 border-2 border-amber-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                      {done && (
                        <Star size={14} className="absolute top-1 right-1 text-yellow-400 fill-yellow-400" />
                      )}
                    </button>
                  );
                })}
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
              {allSolved ? (
                <>
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
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-extrabold text-slate-700 mb-4">Great job!</h2>
                  <p className="text-slate-500 mb-8 font-medium">
                    You've solved {solved.size} of {LEVELS.length} shapes. Some are still waiting for you!
                  </p>
                  <button
                    onClick={() => navigateLevel(firstUnsolved)}
                    className="bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg transform transition active:scale-95 hover:-translate-y-1"
                  >
                    Next unsolved shape
                  </button>
                </>
              )}
            </div>
          )}

          {(gameState === 'playing' || gameState === 'won') && (
            <div className="flex flex-col items-center animate-fade-in">

              {/* Toolbar */}
              <div className="flex justify-between items-center w-full mb-3 px-1">
                <button
                  disabled={isOnCooldown || levelIndex === 0}
                  onClick={() => navigateLevel(levelIndex - 1)}
                  className="p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition active:scale-90 disabled:opacity-30"
                  aria-label="Previous Level"
                >
                  <SkipBack size={22} />
                </button>

                <h2 className="text-lg font-bold text-slate-700 text-center flex-1 mx-2 truncate">
                  {currentLevel.name}
                </h2>

                <div className="flex space-x-3">
                  <button
                    disabled={isOnCooldown}
                    onClick={restartLevel}
                    className="p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition active:scale-90 disabled:opacity-30"
                    aria-label="Restart Level"
                  >
                    <RotateCcw size={22} />
                  </button>
                  <button
                    disabled={isOnCooldown || levelIndex === LEVELS.length - 1}
                    onClick={() => navigateLevel(levelIndex + 1)}
                    className="p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition active:scale-90 disabled:opacity-30"
                    aria-label="Next Level"
                  >
                    <SkipForward size={22} />
                  </button>
                </div>
              </div>

              {/* The Drawing Board: as big as the screen allows */}
              <div
                className="board-size aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner relative touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 100 100"
                  className="w-full h-full p-4 block touch-none"
                  style={{ touchAction: 'none', overflow: 'visible' }}
                >
                  {renderLines()}
                  {renderRubberBand()}
                  {renderNodes()}
                </svg>

                {/* Win Overlay */}
                {gameState === 'won' && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center animate-fade-in z-10">
                    <div className="bg-green-100 p-4 rounded-full mb-4 animate-bounce shadow-sm">
                      <CheckCircle size={56} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-6 drop-shadow-sm">
                      Awesome!
                    </h3>
                    <button
                      disabled={isOnCooldown}
                      onClick={() => navigateLevel(levelIndex + 1)}
                      className="flex items-center space-x-2 bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-green-200 transform transition active:scale-95 hover:-translate-y-1 disabled:opacity-50"
                    >
                      <span>{levelIndex === LEVELS.length - 1 ? "Finish!" : "Next Shape"}</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Hints, Undo, and the "stuck" help: under the board, where thumbs are */}
              <div className="mt-3 w-full min-h-[60px] flex flex-wrap items-center justify-center gap-3 text-center">
                {gameState !== 'playing' ? null : isStuck ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2">
                    <span className="font-bold text-amber-800">Stuck! No lines left from the pink dot.</span>
                    <button
                      onClick={undo}
                      className="flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-900 font-bold px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition"
                    >
                      <Undo2 size={20} /> Undo
                    </button>
                    <button
                      onClick={restartLevel}
                      className="flex items-center gap-2 bg-amber-500 text-white font-bold px-5 py-2.5 rounded-full shadow-sm active:scale-95 transition"
                    >
                      <RotateCcw size={20} /> Start over
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`font-semibold ${path.length === 0 ? 'text-slate-600' : 'text-fuchsia-700'}`}>
                      {hintText}
                    </p>
                    {path.length > 0 && (
                      <button
                        onClick={undo}
                        className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-full shadow-sm hover:bg-slate-50 active:scale-95 transition"
                      >
                        <Undo2 size={20} /> Undo
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {gameState === 'menu' && (
        <p className="mt-5 text-sm text-slate-500 relative z-10">
          Made by{' '}
          <a href="mailto:scsnake@gmail.com" className="font-medium text-slate-600 underline underline-offset-2 decoration-slate-300 hover:text-fuchsia-600">
            scsnake@gmail.com
          </a>
        </p>
      )}

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
        /* Board: fill the card, but leave room for the header, toolbar and Undo row. */
        .board-size { width: min(100%, max(260px, calc(100vh - 290px))); }
        @supports (height: 100dvh) {
          .board-size { width: min(100%, max(260px, calc(100dvh - 290px))); }
        }
        /* Wiggle of the dot where the line ends (px are board units inside the SVG). */
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-1.5px); }
          40% { transform: translateX(1.5px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        @keyframes wiggle-pause {
          0%, 30%, 100% { transform: translateX(0); }
          6% { transform: translateX(-1.5px); }
          12% { transform: translateX(1.5px); }
          18% { transform: translateX(-1px); }
          24% { transform: translateX(1px); }
        }
        .animate-nudge { animation: wiggle 0.5s ease-in-out; }
        .animate-stuck { animation: wiggle-pause 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-nudge, .animate-stuck { animation: none; }
        }
      `}</style>
    </div>
  );
}
