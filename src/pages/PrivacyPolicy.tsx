import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-8 py-12 text-white">
          <Link to="/" className="inline-block mb-8">
            <div className="bg-white p-2 rounded-lg inline-block">
              <Logo />
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-blue-100 max-w-2xl text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="px-8 py-10 prose prose-blue max-w-none text-gray-600">
          <p className="text-lg leading-relaxed">
            At Codie Leads, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you register for an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, company name, and payment information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, maintain, and improve our services</li>
            <li>To process transactions and send related information</li>
            <li>To send administrative information, such as updates, security alerts, and support messages</li>
            <li>To respond to your comments, questions, and requests</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet can be guaranteed to be 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@codielead.com" className="text-blue-600 hover:text-blue-800">privacy@codielead.com</a>
          </p>
        </div>
        
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            &larr; Back to Home
          </Link>
          <span className="text-gray-400 text-sm">Codie Leads © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};
