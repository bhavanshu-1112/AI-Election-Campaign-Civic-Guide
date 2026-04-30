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

  it('should navigate left with ArrowLeft key', () => {
    render(<InteractiveTimeline />);
    // First click second tab
    const secondTab = screen.getAllByRole('tab')[1];
    fireEvent.click(secondTab);
    expect(secondTab).toHaveAttribute('aria-selected', 'true');

    // Then press ArrowLeft
    secondTab.focus();
    fireEvent.keyDown(secondTab, { key: 'ArrowLeft' });

    const firstTab = screen.getAllByRole('tab')[0];
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should not go beyond last stage with ArrowRight', () => {
    render(<InteractiveTimeline />);
    const lastTab = screen.getAllByRole('tab')[4];
    fireEvent.click(lastTab);

    lastTab.focus();
    fireEvent.keyDown(lastTab, { key: 'ArrowRight' });

    // Should still be on the last tab
    expect(lastTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should not go before first stage with ArrowLeft', () => {
    render(<InteractiveTimeline />);
    const firstTab = screen.getAllByRole('tab')[0];
    
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });

    // Should still be on the first tab
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should select stage on Enter key', () => {
    render(<InteractiveTimeline />);
    const thirdTab = screen.getAllByRole('tab')[2];
    
    thirdTab.focus();
    fireEvent.keyDown(thirdTab, { key: 'Enter' });

    expect(thirdTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should select stage on Space key', () => {
    render(<InteractiveTimeline />);
    const thirdTab = screen.getAllByRole('tab')[2];
    
    thirdTab.focus();
    fireEvent.keyDown(thirdTab, { key: ' ' });

    expect(thirdTab).toHaveAttribute('aria-selected', 'true');
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

  it('should display deadline for selected stage', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByText(/Typically 2-3 weeks before election day/)).toBeInTheDocument();
  });

  it('should display description text', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByText('Understand every phase of the democratic process, from registration to results.')).toBeInTheDocument();
  });

  it('should switch to Voting Day stage and show its documents', () => {
    render(<InteractiveTimeline />);
    // Click on Voting Day (4th tab, index 3)
    const votingDayTab = screen.getAllByRole('tab')[3];
    fireEvent.click(votingDayTab);

    expect(screen.getByText(/Voter ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Go early to avoid lines/i)).toBeInTheDocument();
  });

  it('should handle stage with no required documents', () => {
    render(<InteractiveTimeline />);
    // Click on Campaigning (3rd tab, index 2) — has no required documents
    const campaigningTab = screen.getAllByRole('tab')[2];
    fireEvent.click(campaigningTab);

    // 'Campaigning' appears in both tab and detail panel
    const campaigningElements = screen.getAllByText('Campaigning');
    expect(campaigningElements.length).toBeGreaterThanOrEqual(2);
    // Should still render tips
    expect(screen.getByText(/Attend local debates/i)).toBeInTheDocument();
  });

  it('should handle clicking the scroll right button', () => {
    render(<InteractiveTimeline />);
    const rightButton = screen.getByLabelText('Scroll timeline right');
    // Should not throw on click
    fireEvent.click(rightButton);
    expect(rightButton).toBeInTheDocument();
  });

  it('should handle clicking the scroll left button', () => {
    render(<InteractiveTimeline />);
    const leftButton = screen.getByLabelText('Scroll timeline left');
    fireEvent.click(leftButton);
    expect(leftButton).toBeInTheDocument();
  });

  it('should display the panel with correct aria attributes', () => {
    render(<InteractiveTimeline />);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('tabIndex', '0');
    expect(panel).toHaveAttribute('aria-labelledby', 'timeline-tab-0');
  });

  it('should update panel aria-labelledby when stage changes', () => {
    render(<InteractiveTimeline />);
    const secondTab = screen.getAllByRole('tab')[1];
    fireEvent.click(secondTab);

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'timeline-tab-1');
  });

  it('should render region with Election Process Timeline label', () => {
    render(<InteractiveTimeline />);
    expect(screen.getByRole('region', { name: /Election Process Timeline/i })).toBeInTheDocument();
  });
});
