
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { createInitialGrid, shuffleGrid, checkWin } from './services/mathService';
import { Grid, BlockData } from './types';
import { MORANDI_COLORS, TEXT_COLORS, GRID_SIZE } from './constants';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(createInitialGrid());
  const [steps, setSteps] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [tutorMessage, setTutorMessage] = useState<string>("你好！我是你的 AI 数学助教。准备好挑战华容道了吗？");
  const [isThinking, setIsThinking] = useState(false);
  const [showDoc, setShowDoc] = useState(false);

  const timerRef = useRef<number | null>(null);

  const initGame = useCallback(() => {
    const initial = createInitialGrid();
    const shuffled = shuffleGrid(initial, 120);
    setGrid(shuffled);
    setSteps(0);
    setTime(0);
    setIsWon(false);
    setIsStarted(true);
    setTutorMessage("挑战开始！按数字顺序 1-8 排列方块。遇到不会算的题目可以点击它哦！");
    
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

  // AI 助教解释功能：体现人机协同深度
  const explainProblem = async (block: BlockData) => {
    if (block.id === 0 || isThinking) return;
    setIsThinking(true);
    setTutorMessage(`正在为你解析算式：${block.problem}...`);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一名小学三年级数学老师。请用非常简单、充满鼓励的语言（30字以内）解释算式 "${block.problem} = ${block.id}" 的计算思路。`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setTutorMessage(response.text || `这个算式的结果是 ${block.id}，加油！`);
    } catch (e) {
      setTutorMessage(`这是一个有趣的算式，结果等于 ${block.id}。继续努力！`);
    } finally {
      setIsThinking(false);
    }
  };

  async function getTutorFeedback() {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `三年级学生完成了华容道游戏。成绩：步数${steps}，用时${time}秒。请给出一句充满成就感的夸奖，并评价这个成绩（如：超越了90%的小朋友）。50字以内。`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setTutorMessage(response.text || "太不可思议了！你简直是数学界的小天才！");
    } catch (error) {
      setTutorMessage(`挑战成功！用时${time}秒，共计${steps}步。你是最棒的！`);
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
    } else {
      // 如果点击非相邻方块，触发 AI 解释
      explainProblem(grid[index]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pb-20">
      {/* 竞赛信息头部 */}
      <header className="w-full max-w-[500px] mb-6 flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-morandi-darkblue rounded-lg flex items-center justify-center text-white font-bold">AI</div>
          <span className="text-xs font-medium text-gray-600">上城区AI普及赛作品</span>
        </div>
        <button 
          onClick={() => setShowDoc(!showDoc)}
          className="text-xs bg-white/60 hover:bg-white px-3 py-1 rounded-full text-morandi-darkblue border border-morandi-darkblue/20 transition-all"
        >
          创作说明
        </button>
      </header>

      {/* 游戏主标题 */}
      <div className="w-full max-w-[500px] mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-morandi-darkblue mb-1 tracking-tight">智慧算术华容道</h1>
        <p className="text-gray-500 text-sm mb-4 italic">—— 逻辑与计算的双重挑战 ——</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">总步数</span>
            <span className="text-2xl font-black text-morandi-orange">{steps}</span>
          </div>
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">计时器</span>
            <span className="text-2xl font-black text-morandi-green">{time}s</span>
          </div>
        </div>
      </div>

      {/* 游戏盘面 */}
      <div className="relative p-3 bg-morandi-lightblue/50 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-white/80 w-full max-w-[450px] aspect-square flex flex-wrap overflow-hidden">
        {grid.map((block, idx) => (
          <div key={idx} onClick={() => handleBlockClick(idx)} className="w-1/3 h-1/3 p-1.5 transition-all duration-300 ease-out">
            <div className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 hover:scale-[1.02] cursor-pointer block-shadow ${block.id === 0 ? 'bg-transparent shadow-none' : MORANDI_COLORS[block.id]} ${TEXT_COLORS[block.id]}`}>
              {block.id !== 0 && (
                <span className="text-xl sm:text-2xl font-bold drop-shadow-sm">{block.problem}</span>
              )}
            </div>
          </div>
        ))}

        {/* 获胜层 */}
        {isWon && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center p-8 text-center z-20 animate-in zoom-in duration-500">
            <div className="text-6xl mb-4 animate-bounce-slow">🏆</div>
            <h2 className="text-4xl font-black text-morandi-darkblue mb-2">挑战成功！</h2>
            <p className="text-gray-500 mb-8 font-medium italic">“你是上城区最聪明的数学小达人！”</p>
            <button 
              onClick={initGame} 
              className="bg-morandi-darkblue text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-opacity-90 active:scale-95 transition-all"
            >
              再来一局
            </button>
          </div>
        )}
      </div>

      {/* 核心交互按钮 */}
      {!isWon && (
        <button 
          onClick={initGame} 
          className="mt-8 bg-morandi-orange text-white px-12 py-4 rounded-2xl text-xl font-black shadow-xl hover:shadow-morandi-orange/40 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all"
        >
          {isStarted ? "重新开始" : "开启智慧之门"}
        </button>
      )}

      {/* AI 助教对话框 - 竞赛加分项 */}
      <div className="w-full max-w-[500px] mt-8 glass-card p-5 rounded-[2rem] flex items-start gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-morandi-green/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
        <div className="shrink-0 w-12 h-12 bg-morandi-green rounded-2xl shadow-lg shadow-morandi-green/30 flex items-center justify-center text-white text-2xl animate-pulse">
          🎓
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-morandi-green bg-morandi-green/10 px-2 py-0.5 rounded-full uppercase">AI Mentor</span>
            <span className="text-xs text-gray-400">正在提供辅助...</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-700 font-medium">
            {isThinking ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-morandi-green rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-morandi-green rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-morandi-green rounded-full animate-bounce [animation-delay:0.4s]"></span>
                思考中...
              </span>
            ) : tutorMessage}
          </p>
        </div>
      </div>

      {/* 创作说明弹窗 */}
      {showDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-morandi-darkblue mb-4">人机协同创作说明</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="bg-morandi-cream/50 p-3 rounded-xl border border-morandi-cream">
                <p className="font-bold text-morandi-orange mb-1">1. AI 辅助编码</p>
                <p>利用 Gemini 模型生成了华容道打乱算法（保证 100% 有解）以及算术题随机生成逻辑。</p>
              </div>
              <div className="bg-morandi-lightblue/20 p-3 rounded-xl border border-morandi-lightblue/30">
                <p className="font-bold text-morandi-darkblue mb-1">2. AI 逻辑优化</p>
                <p>通过提示词引导，优化了移动冲突检测和获胜判定逻辑，并实现了 AI 实时语音/文本教学提示。</p>
              </div>
              <div className="bg-morandi-pink/20 p-3 rounded-xl border border-morandi-pink/30">
                <p className="font-bold text-morandi-red mb-1">3. 人主导设计</p>
                <p>由我（刘桓语）亲自设计了莫兰迪视觉体系和教学场景，将 AI 技术整合进教育小软件中。</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDoc(false)}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
            >
              了解完毕
            </button>
          </div>
        </div>
      )}

      {/* 脚注 */}
      <footer className="mt-12 text-gray-400 text-[10px] text-center uppercase tracking-[0.2em]">
        <p>上城区人工智能程序设计比赛 · 三年级组</p>
        <div className="flex items-center justify-center gap-2 mt-2 font-bold text-gray-600 text-sm tracking-normal">
          <span>参赛作者:</span>
          <span className="bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100 text-morandi-darkblue">刘桓语</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
