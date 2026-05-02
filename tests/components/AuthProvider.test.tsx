import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthButton } from '../../components/features/AuthProvider';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { trackUserSignedIn, trackUserSignedOut } from '../../lib/analytics';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: class {},
  getAuth: jest.fn(),
}));

jest.mock('../../lib/firebase', () => ({
  auth: {},
}));

jest.mock('../../lib/analytics', () => ({
  trackUserSignedIn: jest.fn(),
  trackUserSignedOut: jest.fn(),
}));

describe('AuthProvider & AuthButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation(() => () => {});
    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );
    expect(screen.getByLabelText('Loading authentication status')).toBeInTheDocument();
  });

  it('renders sign in button when not authenticated', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    expect(screen.getByLabelText('Sign in with Google')).toBeInTheDocument();
  });

  it('renders user info when authenticated', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback({
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com',
      });
      return () => {};
    });

    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
  });

  it('calls signInWithPopup on sign in click', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    fireEvent.click(screen.getByLabelText('Sign in with Google'));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
      expect(trackUserSignedIn).toHaveBeenCalledWith('google');
    });
  });

  it('calls signOut on sign out click', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback({ uid: '123', displayName: 'Test User' });
      return () => {};
    });

    render(
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    );

    fireEvent.click(screen.getByLabelText('Sign out'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(trackUserSignedOut).toHaveBeenCalled();
    });
  });
});
