import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveTimeline } from '../../components/features/InteractiveTimeline';

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) => <div ref={ref} {...props}>{children}</div>),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('InteractiveTimeline Component', () => {
  it('should render the timeline with all stages', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByText('The Election Journey')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('should have proper ARIA roles', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByRole('tablist', { name: /Election Stages/i })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should select first stage by default', () => {
    render(<InteractiveTimeline />);
    const firstTab = screen.getAllByRole('tab')[0];
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should display stage details in the panel', () => {
    render(<InteractiveTimeline />);
    // Stage name appears in both the tab and the detail panel heading
    const voterRegElements = screen.getAllByText('Voter Registration');
    expect(voterRegElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Ensure your name is on the electoral roll/i)).toBeInTheDocument();
  });

  it('should switch stages on tab click', () => {
    render(<InteractiveTimeline />);
    const secondTab = screen.getAllByRole('tab')[1];
    fireEvent.click(secondTab);

    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    // Stage name appears in both the tab and the detail panel heading
    const nominationElements = screen.getAllByText('Nomination Filing');
    expect(nominationElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should navigate with keyboard arrow keys', () => {
    render(<InteractiveTimeline />);
    const firstTab = screen.getAllByRole('tab')[0];
    
    // Focus first tab and press ArrowRight
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });

    const secondTab = screen.getAllByRole('tab')[1];
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should display required documents for stages that have them', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByText('Required Documents')).toBeInTheDocument();
    expect(screen.getByText('Proof of Age')).toBeInTheDocument();
  });

  it('should display pro tips', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByText('Pro Tips')).toBeInTheDocument();
    expect(screen.getByText(/Check status online at NVSP portal/i)).toBeInTheDocument();
  });

  it('should have scroll navigation buttons', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByLabelText('Scroll timeline left')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll timeline right')).toBeInTheDocument();
  });
});
