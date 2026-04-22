import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoterJourney } from '../../components/features/VoterJourney';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) => <div ref={ref} {...props}>{children}</div>),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('../../lib/analytics', () => ({
  trackJourneyGenerated: jest.fn(),
}));

describe('VoterJourney Component', () => {
  it('should render the form with all fields', () => {
    render(<VoterJourney />);
    
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByText('Generate Roadmap')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<VoterJourney />);
    
    const region = screen.getByRole('region', { name: /Personalized Voter Journey Builder/i });
    expect(region).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: /Generate Roadmap/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', async () => {
    render(<VoterJourney />);
    
    const submitButton = screen.getByText('Generate Roadmap');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('should disable submit button while loading', async () => {
    // Mock fetch to simulate loading
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));
    
    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });

    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /Generating Strategy/i });
      expect(button).toBeDisabled();
    });
  });
});
