import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should show loading state when verifying', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));
    
    render(<MythBuster />);
    const textarea = screen.getByLabelText('Claim input');
    fireEvent.change(textarea, { target: { value: 'You can vote online in India' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByText('Verifying Fact...')).toBeInTheDocument();
    });
  });

  it('should disable textarea during loading', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));
    
    render(<MythBuster />);
    const textarea = screen.getByLabelText('Claim input');
    fireEvent.change(textarea, { target: { value: 'You can vote online in India' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(textarea).toBeDisabled();
    });
  });

  it('should display verdict result on successful verification', async () => {
    const mockResult = {
      verdict: 'FALSE',
      explanation: 'Online voting is not available in India.',
      confidence: 95,
      referenceSource: 'ECI',
      disclaimer: 'AI analysis.',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    render(<MythBuster />);
    const textarea = screen.getByLabelText('Claim input');
    fireEvent.change(textarea, { target: { value: 'You can vote online in India' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByText('False / Misleading')).toBeInTheDocument();
    });

    expect(screen.getByText('Online voting is not available in India.')).toBeInTheDocument();
    expect(screen.getByText('ECI')).toBeInTheDocument();
    expect(screen.getByLabelText('Confidence level: 95 percent')).toBeInTheDocument();
  });

  it('should display TRUE verdict correctly', async () => {
    const mockResult = {
      verdict: 'TRUE',
      explanation: 'This is verified true.',
      confidence: 88,
      referenceSource: 'ECI',
      disclaimer: 'AI analysis.',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'Verified true claim here' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByText('Verified True')).toBeInTheDocument();
    });
  });

  it('should display PARTIALLY_TRUE verdict correctly', async () => {
    const mockResult = {
      verdict: 'PARTIALLY_TRUE',
      explanation: 'Partially correct.',
      confidence: 65,
      referenceSource: 'None',
      disclaimer: 'AI analysis.',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'Partially true claim here' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByText('Partially True / Missing Context')).toBeInTheDocument();
    });
  });

  it('should display UNVERIFIED verdict correctly', async () => {
    const mockResult = {
      verdict: 'UNVERIFIED',
      explanation: 'Cannot verify.',
      confidence: 30,
      referenceSource: 'None',
      disclaimer: 'AI analysis.',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'Some unverifiable claim' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
  });

  it('should show error message on failed API call', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Service unavailable' }),
    });

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'A claim to check' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
    });
  });

  it('should show generic error when API fails and json parse fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('Cannot parse JSON')),
    });

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'A claim to check' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to verify claim');
    });
  });

  it('should show generic error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'A claim to check' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  it('should not hide reference source when it is "none"', async () => {
    const mockResult = {
      verdict: 'FALSE',
      explanation: 'Incorrect.',
      confidence: 90,
      referenceSource: 'none',
      disclaimer: 'AI analysis.',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    render(<MythBuster />);
    fireEvent.change(screen.getByLabelText('Claim input'), { target: { value: 'Check this claim now' } });
    fireEvent.click(screen.getByText('Check Fact'));

    await waitFor(() => {
      expect(screen.getByText('False / Misleading')).toBeInTheDocument();
    });
    // "none" reference source should not be displayed
    expect(screen.queryByText('none')).not.toBeInTheDocument();
  });
});
