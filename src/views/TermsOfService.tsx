"use client";
import React from 'react';
import Link from 'next/link';
import { Logo } from '../components/Logo';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 px-8 py-12 text-white">
          <Link href="/" className="inline-block mb-8">
            <div className="bg-white p-2 rounded-lg inline-block">
              <Logo />
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-gray-400 max-w-2xl text-lg">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="px-8 py-10 prose prose-blue max-w-none text-gray-600">
          <p className="text-lg leading-relaxed">
            Please read these Terms of Service carefully before using the Codie Leads platform. By accessing or using our services, you agree to be bound by these terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Codie Leads, you agree to these terms and to our Privacy Policy. If you do not agree to all the terms and conditions, then you may not access the website or use any services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p>
            Codie Leads provides business intelligence tools, including map data extraction, lead enrichment, and campaign management. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Obligations</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate and complete registration information.</li>
            <li>You are responsible for maintaining the security of your account and password.</li>
            <li>You may not use the service for any illegal or unauthorized purpose.</li>
            <li>You must not violate any laws in your jurisdiction (including but not limited to copyright laws).</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Subscription and Billing</h2>
          <p>
            Certain features of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis depending on the type of subscription plan you select.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
          <p>
            For any questions regarding these terms, please contact us at: <a href="mailto:legal@codielead.com" className="text-blue-600 hover:text-blue-800">legal@codielead.com</a>
          </p>
        </div>
        
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            &larr; Back to Home
          </Link>
          <span className="text-gray-400 text-sm">Codie Leads © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};
