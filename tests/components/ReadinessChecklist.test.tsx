import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadinessChecklist } from '../../components/features/ReadinessChecklist';

jest.mock('../../lib/analytics', () => ({
  trackChecklistToggled: jest.fn(),
  trackChecklistCompleted: jest.fn(),
}));

jest.mock('canvas-confetti', () => jest.fn());

describe('ReadinessChecklist Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  it('should render all four checklist items', () => {
    render(<ReadinessChecklist />);
    expect(screen.getByText('Voter Registration Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Valid ID Card Ready')).toBeInTheDocument();
    expect(screen.getByText('Polling Booth Location Known')).toBeInTheDocument();
    expect(screen.getByText('Voting Date & Time Known')).toBeInTheDocument();
  });

  it('should have proper accessibility', () => {
    render(<ReadinessChecklist />);
    expect(screen.getByRole('region', { name: /Am I ready to vote/i })).toBeInTheDocument();
  });

  it('should start at 0% progress', () => {
    render(<ReadinessChecklist />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should update progress when checklist item is toggled', () => {
    render(<ReadinessChecklist />);
    
    const checkbox = screen.getByLabelText('Voter Registration Confirmed');
    fireEvent.click(checkbox);

    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should track analytics when item is toggled', async () => {
    const { trackChecklistToggled } = require('../../lib/analytics');
    render(<ReadinessChecklist />);
    
    const checkbox = screen.getByLabelText('Voter Registration Confirmed');
    fireEvent.click(checkbox);

    expect(trackChecklistToggled).toHaveBeenCalledWith('isRegistered', true);
  });

  it('should trigger confetti and analytics when all items checked', () => {
    const confetti = require('canvas-confetti');
    const { trackChecklistCompleted } = require('../../lib/analytics');
    
    render(<ReadinessChecklist />);

    const labels = ['Voter Registration Confirmed', 'Valid ID Card Ready', 'Polling Booth Location Known', 'Voting Date & Time Known'];
    labels.forEach(label => {
      fireEvent.click(screen.getByLabelText(label));
    });

    expect(confetti).toHaveBeenCalled();
    expect(trackChecklistCompleted).toHaveBeenCalled();
  });
});
