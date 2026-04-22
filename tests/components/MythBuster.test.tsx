import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MythBuster } from '../../components/features/MythBuster';

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) => <div ref={ref} {...props}>{children}</div>),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('../../lib/analytics', () => ({
  trackMythChecked: jest.fn(),
}));

describe('MythBuster Component', () => {
  it('should render the myth buster card', () => {
    render(<MythBuster />);
    expect(screen.getByText('Election Myth Buster')).toBeInTheDocument();
    expect(screen.getByLabelText('Claim input')).toBeInTheDocument();
  });

  it('should have proper accessibility', () => {
    render(<MythBuster />);
    expect(screen.getByRole('region', { name: /Election Myth Buster/i })).toBeInTheDocument();
  });

  it('should disable the verify button when claim is too short', () => {
    render(<MythBuster />);
    const button = screen.getByText('Check Fact');
    expect(button).toBeDisabled();
  });

  it('should enable the verify button when claim has enough characters', () => {
    render(<MythBuster />);
    const textarea = screen.getByLabelText('Claim input');
    fireEvent.change(textarea, { target: { value: 'You can vote online in India' } });
    
    const button = screen.getByText('Check Fact');
    expect(button).not.toBeDisabled();
  });

  it('should show character count', () => {
    render(<MythBuster />);
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('should update character count on input', () => {
    render(<MythBuster />);
    const textarea = screen.getByLabelText('Claim input');
    fireEvent.change(textarea, { target: { value: 'Test claim' } });
    expect(screen.getByText('10/500')).toBeInTheDocument();
  });

  it('should show AI disclaimer note', () => {
    render(<MythBuster />);
    expect(screen.getByText(/Always consult official sources/i)).toBeInTheDocument();
  });
});
