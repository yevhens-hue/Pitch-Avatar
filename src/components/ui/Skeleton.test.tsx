import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders text variant by default', () => {
    render(<Skeleton />);

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders specified number of lines', () => {
    render(<Skeleton lines={5} />);

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBe(5);
  });

  it('renders circle variant', () => {
    render(<Skeleton variant="circle" />);

    const skeleton = document.querySelector('[class*="skeleton"]');
    expect(skeleton).toHaveStyle({ borderRadius: '50%' });
  });

  it('renders rect variant', () => {
    render(<Skeleton variant="rect" width="200px" height="100px" />);

    const skeleton = document.querySelector('[class*="skeleton"]');
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('applies custom width', () => {
    render(<Skeleton width="150px" />);

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons[0]).toHaveStyle({ width: '150px' });
  });

  it('applies custom height', () => {
    render(<Skeleton height="30px" />);

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons[0]).toHaveStyle({ height: '30px' });
  });

  it('renders single line skeleton', () => {
    render(<Skeleton lines={1} />);

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBe(1);
  });
});