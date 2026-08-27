"use client";
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Lead } from '@/lib/schema';
import { Loader2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export function OutreachModal({ isOpen, onClose, lead }: OutreachModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null);
  const [tone, setTone] = useState<'professional' | 'casual' | 'urgent'>('professional');
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
        Write a cold outreach email to a business named "${lead.name}".
        
        Context about the lead:
        - Industry/Type: Based on name/website
        - Rating: ${lead.rating} stars
        - Location: ${lead.address}
        - Website: ${lead.website}
        
        My Goal: I am a GTM Engineer selling a "Digital Transformation Service" to help them get more customers.
        
        Tone: ${tone}
        
        Requirements:
        - Subject line: Catchy, under 50 chars.
        - Body: Short, personalized, mentioning their rating or location to prove I did research.
        - Call to Action: Ask for a 15-min call.
        
        Return JSON format: { "subject": "...", "body": "..." }
      `;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const text = data.text || "{}";
      setEmailContent(JSON.parse(text));
    } catch (error: any) {
      console.error("Failed to generate email", error);
      let errMsg = error?.message || "Failed to generate email. Please try again.";
      if (errMsg.includes("high demand") || errMsg.includes("503")) {
        errMsg = "AI Model is currently experiencing high demand. Please try again later.";
      } else if (errMsg.includes('api key') || errMsg.includes('API_KEY')) {
        errMsg = "API Key error. Please check your configuration.";
      }
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate on open if not generated
  React.useEffect(() => {
    if (isOpen && !emailContent) {
      generateEmail();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!emailContent) return;
    const fullText = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Outreach to ${lead.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">AI Personalization</h4>
              <p className="text-xs text-blue-700">Gemini analyzes the lead&apos;s data to write a custom hook.</p>
            </div>
          </div>
          <select 
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="text-sm border-blue-200 rounded-md bg-white text-blue-800 focus:ring-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="urgent">Direct/Urgent</option>
          </select>
        </div>

        {isGenerating ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
            <p>Drafting the perfect email...</p>
          </div>
        ) : emailContent ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-900">
                {emailContent.subject}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Body</label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[200px]">
                {emailContent.body}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button
                onClick={generateEmail}
                className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
