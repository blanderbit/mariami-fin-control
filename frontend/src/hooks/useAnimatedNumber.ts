import { useState, useEffect, useRef } from 'react';

interface UseAnimatedNumberOptions {
  duration?: number;
  startValue?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'easeOutQuart';
  delay?: number;
}

const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
};

export const useAnimatedNumber = (
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) => {
  const {
    duration = 1000,
    startValue = 0,
    easing = 'easeOutQuart',
    delay = 0,
  } = options;

  const [currentValue, setCurrentValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(startValue);

  useEffect(() => {
    if (targetValue === startValueRef.current) {
      return;
    }

    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp + delay;
      }

      if (timestamp < startTimeRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);
      
      const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
      
      setCurrentValue(newValue);
      setIsAnimating(progress < 1);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        startValueRef.current = targetValue;
        startTimeRef.current = undefined;
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, easing, delay]);

  return { currentValue, isAnimating };
};

