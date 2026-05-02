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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should show age validation error for underage users', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '16' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });

    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      expect(screen.getByText('Must be at least 18 to vote.')).toBeInTheDocument();
    });
  });

  it('should display journey results on successful submission', async () => {
    const mockJourney = {
      steps: [
        { order: 1, title: 'Register to Vote', description: 'Visit NVSP portal', deadline: '2 weeks before', documents: ['Aadhaar Card'], tips: ['Do it early'] }
      ],
      summary: 'Your voter journey is ready',
      urgentActions: ['Register immediately'],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJourney),
    });

    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'New Delhi' } });

    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      expect(screen.getByText('Your Strategy is Ready')).toBeInTheDocument();
    });

    expect(screen.getByText('Your voter journey is ready')).toBeInTheDocument();
    expect(screen.getByText('Register to Vote')).toBeInTheDocument();
    expect(screen.getByText('Register immediately')).toBeInTheDocument();
    expect(screen.getByText('Aadhaar Card')).toBeInTheDocument();
  });

  it('should show error alert on API failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Service error' }),
    });

    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });

    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      expect(screen.getByText('Service error')).toBeInTheDocument();
    });
  });

  it('should show generic error when API fails and json parse fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('Cannot parse JSON')),
    });

    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });

    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate journey')).toBeInTheDocument();
    });
  });

  it('should show error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });

    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show Start Over button after journey is generated', async () => {
    const mockJourney = {
      steps: [{ order: 1, title: 'Step 1', description: 'Desc', deadline: 'Soon', documents: [], tips: [] }],
      summary: 'Summary',
      urgentActions: [],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJourney),
    });

    render(<VoterJourney />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'Delhi' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });
    fireEvent.click(screen.getByText('Generate Roadmap'));

    await waitFor(() => {
      expect(screen.getByText('Start Over')).toBeInTheDocument();
    });

    // Click Start Over to go back to the form
    fireEvent.click(screen.getByText('Start Over'));
    expect(screen.getByText('Generate Roadmap')).toBeInTheDocument();
  });

  it('should have a first-time voter checkbox', () => {
    render(<VoterJourney />);
    expect(screen.getByLabelText('I am a first-time voter')).toBeInTheDocument();
  });
});
