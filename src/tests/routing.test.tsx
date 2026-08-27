import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../components/Footer';

describe('Footer Navigation and Routing', () => {
  it('renders native anchor links for scrollable sections', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const featuresLink = screen.getByText('Why CodieLead');
    expect(featuresLink).toHaveAttribute('href', '#features');

    const pricingLink = screen.getByText('Pricing');
    expect(pricingLink).toHaveAttribute('href', '#pricing');
  });

  it('renders correct auth paths for workspace entry buttons', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const signInLink = screen.getByText('Sign in');
    expect(signInLink).toHaveAttribute('href', '/login');

    const startWorkspaceLink = screen.getByText('Start your free workspace');
    expect(startWorkspaceLink).toHaveAttribute('href', '/register');
  });
});
