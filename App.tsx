
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { createInitialGrid, shuffleGrid, checkWin, generateMathProblem } from './services/mathService';
import { Grid } from './types';
import { MORANDI_COLORS, TEXT_COLORS, GRID_SIZE } from './constants';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(createInitialGrid());
  const [steps, setSteps] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [tutorMessage, setTutorMessage] = useState<string>("欢迎来到智慧算术华容道！点击方块移动，或点击下方按钮开始。");
  const [isThinking, setIsThinking] = useState(false);

  const timerRef = useRef<number | null>(null);

  const initGame = useCallback(() => {
    const initial = createInitialGrid();
    const shuffled = shuffleGrid(initial, 120);
    setGrid(shuffled);
    setSteps(0);
    setTime(0);
    setIsWon(false);
    setIsStarted(true);
    setTutorMessage("挑战开始！算出算式结果，按 1-8 顺序排好方块。");
    
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    if (isStarted && checkWin(grid)) {
      setIsWon(true);
      setIsStarted(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
      getTutorFeedback();
    }
  }, [grid, isStarted]);

  async function getTutorFeedback() {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一名亲切的小学数学老师。一名三年级 student 刚刚完成了《智慧算术华容道》游戏。表现如下：步数 ${steps} 步，用时 ${time} 秒。请写一段简短的鼓励话语（50字以内）。`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setTutorMessage(response.text || "太棒了！你的逻辑和计算能力都很出色！");
    } catch (error) {
      setTutorMessage(`挑战成功！用时${time}秒，共计${steps}步。你是数学小天才！`);
    } finally {
      setIsThinking(false);
    }
  }

  const handleBlockClick = (index: number) => {
    if (!isStarted && !isWon) {
      initGame();
      return;
    }
    if (isWon) return;

    const emptyIndex = grid.findIndex(b => b.id === 0);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                       (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newGrid = [...grid];
      [newGrid[index], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[index]];
      setGrid(newGrid);
      setSteps(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-[#f8f9fa] select-none overflow-y-auto pb-12">
      <div className="w-full max-w-[500px] mb-6 text-center">
        <h1 className="text-3xl font-bold text-[#457b9d] mb-2">智慧算术华容道</h1>
        <div className="flex justify-between px-6 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-left"><span className="text-xs text-gray-400 block">步数</span><span className="text-xl font-bold text-[#E29578]">{steps}</span></div>
          <div className="text-right"><span className="text-xs text-gray-400 block">用时</span><span className="text-xl font-bold text-[#84A59D]">{time}s</span></div>
        </div>
      </div>

      <div className="relative p-2 bg-[#a8dadc] rounded-2xl shadow-xl w-full max-w-[450px] aspect-square flex flex-wrap">
        {grid.map((block, idx) => (
          <div key={idx} onClick={() => handleBlockClick(idx)} className="w-1/3 h-1/3 p-1">
            <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer block-shadow ${block.id === 0 ? 'opacity-0 pointer-events-none' : MORANDI_COLORS[block.id]} ${TEXT_COLORS[block.id]}`}>
              <span className="text-xl sm:text-2xl font-bold">{block.problem}</span>
            </div>
          </div>
        ))}
        {isWon && (
          <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in zoom-in">
            <h2 className="text-3xl font-bold text-[#457b9d] mb-2">🎉 挑战成功</h2>
            <p className="text-gray-600 mb-6">用了 {steps} 步和 {time} 秒</p>
            <button onClick={initGame} className="bg-[#457b9d] text-white px-8 py-2 rounded-full font-bold shadow-lg">再挑战一次</button>
          </div>
        )}
      </div>

      <button onClick={initGame} className="mt-6 bg-[#E29578] text-white px-10 py-3 rounded-full text-lg font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">
        {isStarted ? "重置关卡" : "开始挑战"}
      </button>

      <div className="w-full max-w-[500px] mt-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#84A59D] rounded-full flex items-center justify-center text-white text-xl">🎓</div>
        <div className="flex-1 text-sm text-[#1d3557]">
          {isThinking ? <span className="animate-pulse">老师正在思考中...</span> : tutorMessage}
        </div>
      </div>

      <footer className="mt-8 text-gray-400 text-xs text-center">
        <p>人工智能程序设计作品</p>
        <p className="mt-1 font-bold text-gray-600 text-sm">作者：刘桓语</p>
      </footer>
    </div>
  );
};

export default App;
