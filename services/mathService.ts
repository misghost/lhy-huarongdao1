
import { BlockData, Grid } from '../types';
import { TOTAL_BLOCKS, GRID_SIZE } from '../constants';

/**
 * 随机生成一个结果等于 target 的三年级水平数学题
 */
export function generateMathProblem(target: number): string {
  const ops = ['+', '-', 'x', '÷'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  switch (op) {
    case '+': {
      const a = Math.floor(Math.random() * (target + 1));
      return `${a} + ${target - a}`;
    }
    case '-': {
      const b = Math.floor(Math.random() * 20) + 1; // 减数
      return `${target + b} - ${b}`;
    }
    case 'x': {
      // 寻找因数
      const factors: number[] = [];
      for (let i = 1; i <= target; i++) {
        if (target % i === 0) factors.push(i);
      }
      const a = factors[Math.floor(Math.random() * factors.length)];
      return `${a} × ${target / a}`;
    }
    case '÷': {
      const b = Math.floor(Math.random() * 5) + 1; // 除数不要太大
      return `${target * b} ÷ ${b}`;
    }
    default:
      return `${target}`;
  }
}

/**
 * 初始化有序网格
 */
export function createInitialGrid(): Grid {
  const grid: Grid = [];
  for (let i = 1; i < TOTAL_BLOCKS; i++) {
    grid.push({ id: i, problem: generateMathProblem(i) });
  }
  grid.push({ id: 0, problem: '' }); // 空格
  return grid;
}

/**
 * 获取某个索引的可移动邻居
 */
function getNeighbors(index: number): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  if (row > 0) neighbors.push(index - GRID_SIZE); // 上
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE); // 下
  if (col > 0) neighbors.push(index - 1); // 左
  if (col < GRID_SIZE - 1) neighbors.push(index + 1); // 右

  return neighbors;
}

/**
 * 通过模拟随机移动来打乱网格，确保100%有解
 */
export function shuffleGrid(initialGrid: Grid, moves: number = 100): Grid {
  const grid = [...initialGrid];
  let emptyIndex = grid.findIndex(b => b.id === 0);

  for (let i = 0; i < moves; i++) {
    const neighbors = getNeighbors(emptyIndex);
    const moveToIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    // 交换
    [grid[emptyIndex], grid[moveToIndex]] = [grid[moveToIndex], grid[emptyIndex]];
    emptyIndex = moveToIndex;
  }
  
  return grid;
}

/**
 * 检查是否胜利
 */
export function checkWin(grid: Grid): boolean {
  for (let i = 0; i < grid.length - 1; i++) {
    if (grid[i].id !== i + 1) return false;
  }
  return grid[grid.length - 1].id === 0;
}
