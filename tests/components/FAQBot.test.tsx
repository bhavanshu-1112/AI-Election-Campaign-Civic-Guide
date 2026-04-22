import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FAQBot } from '../../components/features/FAQBot';

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<HTMLDivElement>) => <div ref={ref} {...props}>{children}</div>),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('../../lib/analytics', () => ({
  trackFAQAsked: jest.fn(),
}));

describe('FAQBot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial greeting message', () => {
    render(<FAQBot />);
    expect(screen.getByText(/neutral election guide/i)).toBeInTheDocument();
  });

  it('should render chat input and send button', () => {
    render(<FAQBot />);
    expect(screen.getByLabelText('Chat input')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  it('should have proper accessibility roles', () => {
    render(<FAQBot />);
    expect(screen.getByRole('region', { name: /Election FAQ Chatbot/i })).toBeInTheDocument();
    expect(screen.getByRole('log', { name: /Chat messages/i })).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    render(<FAQBot />);
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has text', () => {
    render(<FAQBot />);
    const input = screen.getByLabelText('Chat input');
    fireEvent.change(input, { target: { value: 'What documents do I need?' } });
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).not.toBeDisabled();
  });

  it('should add user message to chat on submit', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        answer: 'You need a voter ID.',
        confidence: 90,
        sources: [],
        disclaimer: '',
        isElectionRelated: true,
        sessionId: 'test-session',
      }),
    });

    render(<FAQBot />);

    const input = screen.getByLabelText('Chat input');
    fireEvent.change(input, { target: { value: 'What ID do I need?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('What ID do I need?')).toBeInTheDocument();
    });
  });

  it('should display AI disclaimer text', () => {
    render(<FAQBot />);
    expect(screen.getByText(/AI can make mistakes/i)).toBeInTheDocument();
  });
});
