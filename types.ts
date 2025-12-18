
export interface BlockData {
  id: number; // 目标数字 (1-8), 0 代表空格
  problem: string; // 对应的数学算式
}

export type Grid = BlockData[];

export interface GameState {
  grid: Grid;
  steps: number;
  time: number;
  isWon: boolean;
  isStarted: boolean;
}
