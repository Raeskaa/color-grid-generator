import { useState, useCallback } from 'react';
import { GridState, GridCell } from '../types';

export const useGridHistory = (initialCells: GridCell[]) => {
  const [history, setHistory] = useState<GridState[]>([
    { cells: initialCells, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToHistory = useCallback((cells: GridCell[]) => {
    const newState: GridState = { cells, timestamp: Date.now() };
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const resetHistory = useCallback((cells: GridCell[]) => {
    const newState: GridState = { cells, timestamp: Date.now() };
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentCells = history[currentIndex]?.cells || initialCells;

  return {
    currentCells,
    canUndo,
    canRedo,
    addToHistory,
    resetHistory,
    undo,
    redo
  };
};