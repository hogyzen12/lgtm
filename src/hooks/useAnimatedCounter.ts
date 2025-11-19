import { useState, useEffect } from 'react';

export function useAnimatedCounter(target: number, _duration: number = 1500): number {
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    setCurrent(target);
  }, [target]);

  return current;
}