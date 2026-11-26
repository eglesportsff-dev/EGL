import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function ReferEarn() {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState('');

  const referralCode = user?.uid || '';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (type === 'code') {
          setCopiedCode(true);
          setTimeout(() => setCopiedCode(false), 2000);
        } else {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        }
        setMessage(`${type === 'code' ? 'Referral code' : 'Referral link'} copied to clipboard!`);
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        setMessage('Failed to copy. Please select and copy manually.');
      });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="panel bg-gradient-to-br from-primary/20 via-card to-bg/85 border border-white/10 text-center py-8 px-4 rounded-[24px]">
        <p className="text-sm font-bold text-gold uppercase tracking-wider">Refer & Earn Program</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Invite Friends & Earn Cash</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          Share the excitement of Nexus eSports with your friends. Get rewarded when they sign up and start playing matches!
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-white">How it works</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/25 font-bold text-primary">1</span>
                <div>
                  <h3 className="font-bold text-slate-200">Share your Referral Code</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Send your code or registration link to your gaming friends, guilds, and social media channels.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/25 font-bold text-gold">2</span>
                <div>
                  <h3 className="font-bold text-slate-200">They get ₹5 instantly</h3>
                  <p className="text-xs text-slate-400 mt-0.5">When your friend signs up with your code and verifies their email, they instantly receive ₹5.00 in their wallet.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 font-bold text-emerald-400">3</span>
                <div>
                  <h3 className="font-bold text-slate-200">You earn ₹8</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Once your friend makes their first deposit (minimum ₹12) and plays their first match successfully, you get ₹8.00 credited to your wallet.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-ember/90 border-t border-white/5 pt-3">
            * Referrals are validated automatically. Multiple accounts on the same device or IP are not eligible.
          </div>
        </div>

        <div className="panel space-y-5">
          <h2 className="text-lg font-black text-white">Your Referral Details</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Referral Code</label>
            <div className="flex gap-2">
              <input
                className="input font-mono tracking-widest text-gold text-lg py-2.5 font-bold bg-bg/90"
                value={referralCode}
                readOnly
              />
              <button
                onClick={() => copyToClipboard(referralCode, 'code')}
                className={`btn shrink-0 w-24 ${copiedCode ? 'bg-emerald-600 text-white' : 'btn-ghost'}`}
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Invite Link</label>
            <div className="flex gap-2">
              <input
                className="input text-xs py-3 text-slate-300 bg-bg/90"
                value={referralLink}
                readOnly
              />
              <button
                onClick={() => copyToClipboard(referralLink, 'link')}
                className={`btn shrink-0 w-24 ${copiedLink ? 'bg-emerald-600 text-white' : 'btn-ghost'}`}
              >
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {message && <Alert>{message}</Alert>}

          <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-xs space-y-1 text-slate-400">
            <span className="font-bold text-slate-200 block mb-1">Affiliate Guidelines:</span>
            <p>• Share links on WhatsApp groups or Discord servers.</p>
            <p>• Post your referral code in YouTube comments under tournament streams.</p>
            <p>• Minimum withdrawal limit is ₹50.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
