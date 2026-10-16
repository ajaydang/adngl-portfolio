'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, GitBranch, Link, Send } from 'lucide-react';
import { portfolioData } from '@/lib/portfolio-data';

interface ContactSectionProps {
  onBack: () => void;
}

function validate(data: { name: string; email: string; message: string }) {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email';
  if (!data.message.trim()) errors.message = 'Message is required';
  else if (data.message.length < 10) errors.message = 'Message is too short';
  return errors;
}

export function ContactSection({ onBack }: ContactSectionProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStatus('submitting');
    // In production: connect to a real endpoint (e.g. Resend, Formspree, or a serverless fn)
    // This shows a realistic integration point without a fake success
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('submitted');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full bg-[#790B20]/10 border border-[#790B20]/30 rounded px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#FF6900]/50 focus:bg-[#790B20]/15 transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm"
    >
      <div className="bg-[#0B0202]/85 backdrop-blur-xl border border-[#790B20]/30 rounded-xl p-6 md:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#FF6900]/60 hover:text-[#FF6900] text-xs tracking-widest uppercase mb-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2 rounded"
          aria-label="Back to home"
        >
          <ArrowLeft size={12} /> Back
        </button>

        <div className="mb-6">
          <p className="text-[#FF6900] text-xs tracking-[0.3em] uppercase mb-1">Contact</p>
          <h2 className="text-2xl font-semibold text-white">Let&apos;s Connect</h2>
          <p className="text-white/40 text-sm mt-1">Open to collaborations and interesting projects.</p>
        </div>

        {/* Direct links */}
        <div className="flex flex-col gap-3 mb-6">
          <a
            href={`mailto:${portfolioData.email}`}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-[#FF6900] transition-colors group"
          >
            <Mail size={14} className="text-[#C90008] group-hover:text-[#FF6900]" />
            {portfolioData.email}
          </a>
          <a
            href={portfolioData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-[#FF6900] transition-colors group"
          >
            <GitBranch size={14} className="text-[#C90008] group-hover:text-[#FF6900]" />
            GitHub
          </a>
          <a
            href={portfolioData.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-[#FF6900] transition-colors group"
          >
            <Link size={14} className="text-[#C90008] group-hover:text-[#FF6900]" />
            LinkedIn
          </a>
        </div>

        <div className="border-t border-[#790B20]/20 pt-5">
          <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-4">Send a Message</p>

          {status === 'submitted' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <p className="text-[#FF6900] text-sm font-medium mb-1">Message sent!</p>
              <p className="text-white/40 text-xs">I&apos;ll get back to you soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                  aria-label="Your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-[#C90008] text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                  aria-label="Your email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-[#C90008] text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                  aria-label="Your message"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-[#C90008] text-xs mt-1">{errors.message}</p>
                )}
              </div>

              {status === 'error' && (
                <p className="text-[#C90008] text-xs">
                  Something went wrong. Please email me directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C90008] hover:bg-[#FF6900] text-white text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2"
              >
                {status === 'submitting' ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={13} /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
