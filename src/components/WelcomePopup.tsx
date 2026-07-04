"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe, X, Code2 } from 'lucide-react';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('codie_leads_welcome_seen');
    if (!hasSeenPopup) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('codie_leads_welcome_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
            dir="rtl"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100 font-sans">
              {/* Header Gradient */}
              <div className="h-32 bg-gradient-to-br from-blue-600 via-yellow-500 to-orange-400 relative">
                <button 
                  onClick={handleClose}
                  className="absolute top-4 left-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute -bottom-8 right-8 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-3">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Content */}
              <div className="p-8 pt-12 text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  أهلاً بك يا صديقي 👋
                </h2>
                
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p className="flex items-start gap-3">
                    <span className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Code2 className="w-4 h-4" />
                    </span>
                    <span>
                      هذا التطبيق بيعتمد على قدرتك على فهم واستخدام <strong>Google AI Studio</strong>، وتقدر تطوره وتعدل عليه براحتك حسب رغبتك واحتياجاتك.
                    </span>
                  </p>
                  
                  <p className="flex items-start gap-3">
                    <span className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Globe className="w-4 h-4" />
                    </span>
                    <span>
                      ولو حبيت تشوف أدوات وخدمات ذكية تانية توفر عليك وقت ومجهود وتزود مبيعاتك وأرباحك، زور موقعنا في أي وقت!
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://codiemarket.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
                  >
                    <Globe className="w-5 h-5" />
                    زيارة موقع Codie Market 🌐
                  </a>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    يلا نبدأ الشغل 🚀
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
