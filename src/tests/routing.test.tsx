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

    const featuresLink = screen.getByText('Features');
    expect(featuresLink).toHaveAttribute('href', '#features');

    const pricingLink = screen.getByText('Pricing');
    expect(pricingLink).toHaveAttribute('href', '#pricing');
  });

  it('renders correct auth paths for Get Started buttons', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const signInLink = screen.getByText('Sign In');
    expect(signInLink).toHaveAttribute('href', '/login');

    const startFreeTrialLink = screen.getByText('Start Free Trial');
    expect(startFreeTrialLink).toHaveAttribute('href', '/login');
  });
});
