// Utility for formatting numbers with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Utility for getting color by phase
export const getPhaseColor = (phaseId: number): string => {
  const colors: Record<number, { background: string; accent: string }> = {
    1: { background: '#E8F5E9', accent: '#2E7D32' },
    2: { background: '#E3F2FD', accent: '#1565C0' },
    3: { background: '#FFF3E0', accent: '#E65100' },
    4: { background: '#F3E5F5', accent: '#7B1FA2' },
    5: { background: '#FFEBEE', accent: '#C62828' },
    6: { background: '#E0F2F1', accent: '#00695C' },
    7: { background: '#FFF9C4', accent: '#F57F17' },
    8: { background: '#ECEFF1', accent: '#37474F' },
    9: { background: '#E8EAF6', accent: '#283593' },
    10: { background: '#FCE4EC', accent: '#AD1457' },
  };

  return colors[phaseId]?.accent || '#1565C0';
};

// Utility for tracking analytics or logging
export const logPageView = (pageName: string): void => {
  // Can be connected to analytics service like Google Analytics
  console.log(`Page viewed: ${pageName}`);
};

// Utility for debouncing functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
