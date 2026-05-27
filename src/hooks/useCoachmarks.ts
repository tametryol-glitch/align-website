'use client';

import { useState, useEffect, useCallback } from 'react';
import { FIRST_VISIT_TOUR, type CoachmarkStep } from '@/data/coachmarkTours';

const STORAGE_KEY = 'align_coachmarks_seen_v1';

export function useCoachmarks() {
  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Delay slightly to let the page render first
      const timer = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: CoachmarkStep[] = FIRST_VISIT_TOUR;
  const currentStep = active ? steps[currentStepIndex] ?? null : null;

  const next = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      // Tour complete
      setActive(false);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [currentStepIndex, steps.length]);

  const skip = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const done = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  return {
    active,
    steps,
    currentStep,
    currentStepIndex,
    next,
    skip,
    done,
  };
}
