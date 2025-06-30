import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePerformanceMonitor, useResourceCleanup } from '../PerformanceOptimizer';

// Mock component to test hooks
const TestComponent = ({ componentName }) => {
  const { renderCount } = usePerformanceMonitor(componentName);
  const { addTimeout } = useResourceCleanup();
  
  return (
    <div>
      <span data-testid="render-count">{renderCount}</span>
      <button 
        onClick={() => addTimeout(() => {}, 100)}
        data-testid="add-timeout"
      >
        Add Timeout
      </button>
    </div>
  );
};

describe('PerformanceOptimizer', () => {
  it('should render without crashing', () => {
    render(<TestComponent componentName="Test" />);
    expect(screen.getByTestId('render-count')).toBeInTheDocument();
  });

  it('should track render count', () => {
    const { rerender } = render(<TestComponent componentName="Test" />);
    expect(screen.getByTestId('render-count')).toHaveTextContent('1');
    
    rerender(<TestComponent componentName="Test" />);
    expect(screen.getByTestId('render-count')).toHaveTextContent('2');
  });
});
