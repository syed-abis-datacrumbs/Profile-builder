import React, { useState } from 'react';
import { 
  X, 
  Rocket, 
  Check, 
  UserCheck, 
  FileCheck2, 
  Compass, 
  MessageSquareText, 
  ShieldCheck, 
  Star,
  Sparkles
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';

interface AskExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskExpertModal: React.FC<AskExpertModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'quarterly' | 'executive'>('quarterly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: What's Included */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-slate-50/50 border-r border-slate-100 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            
            {/* Header Badge & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  Available inside Momentum Expert
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  1-on-1 Mentorship & Career Review
                </p>
              </div>
            </div>

            {/* Feature Comparison Table Header */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 pb-2">
              <span>WHAT&apos;S INCLUDED IN SESSION</span>
              <span className="text-blue-600 font-extrabold pr-1">EXPERT 1-ON-1</span>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              
              {/* Feature 1 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">1-on-1 Live Career Mentorship</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Direct session with senior tech leads, HR directors & industry mentors.
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 pr-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">In-Depth CV & Resume Expert Review</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Line-by-line feedback, bullet point rewriting & ATS formatting audit.
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 pr-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <Compass className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Personalized Career Roadmap & Strategy</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Tailored transition strategy, salary negotiation tips & target company list.
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 pr-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <GithubIcon className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">GitHub & Portfolio Code Review</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Repository structure evaluation, README feedback & project positioning.
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 pr-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <LinkedinIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">LinkedIn Profile Optimization Audit</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Recruiter search visibility review, headline crafting & personal branding.
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 pr-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <MessageSquareText className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">24/7 Priority Mentor Q&A Line</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Direct messaging line to expert advisors for fast career advice.
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 pr-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Social Proof / Guarantee */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
              <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center border border-white">
                JD
              </span>
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border border-white">
                AK
              </span>
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center border border-white">
                MR
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.9/5 Mentor Rating</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Over 2,400+ tech professionals hired at top companies.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Booking & Pricing Options */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-5">
            
            {/* Header */}
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Book 1-on-1 Mentorship</span>
                <span className="text-base">🎓</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Get direct access to expert career advisors, comprehensive CV review, and tailored guidance.
              </p>
            </div>

            {/* Mentorship Option 1: Single Session */}
            <div
              onClick={() => setSelectedPlan('single')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedPlan === 'single'
                  ? 'border-slate-900 bg-slate-50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedPlan === 'single' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                }`}>
                  {selectedPlan === 'single' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Single Review Session</div>
                  <div className="text-[11px] font-medium text-slate-500">$29 one-time session</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900">$29</span>
                <span className="text-[10px] text-slate-400 block font-medium">/session</span>
              </div>
            </div>

            {/* Mentorship Option 2: Quarterly Mentorship (Default Selected) */}
            <div
              onClick={() => setSelectedPlan('quarterly')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative flex items-center justify-between ${
                selectedPlan === 'quarterly'
                  ? 'border-slate-900 bg-slate-50 shadow-md ring-1 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedPlan === 'quarterly' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                }`}>
                  {selectedPlan === 'quarterly' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Quarterly Mentorship</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                      Save 35%
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    3 Live Sessions + Unlimited Priority Q&A
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900">$19</span>
                <span className="text-[10px] text-slate-400 block font-medium">/month</span>
              </div>
            </div>

            {/* Mentorship Option 3: Executive Accelerator */}
            <div
              onClick={() => setSelectedPlan('executive')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedPlan === 'executive'
                  ? 'border-slate-900 bg-slate-50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedPlan === 'executive' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                }`}>
                  {selectedPlan === 'executive' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Executive Accelerator</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      Save 50%
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    6 Months Unlimited Sessions & Job Guarantee
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-900">$39</span>
                <span className="text-[10px] text-slate-400 block font-medium">/month</span>
              </div>
            </div>

            {/* Active Mentors Notification Banner */}
            <div className="w-full py-2.5 px-3 rounded-xl bg-lime-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>42 senior mentors online</span>
            </div>

          </div>

          {/* Bottom Action & Payment Badges */}
          <div className="space-y-4 pt-2">
            
            <button
              onClick={() => {
                alert('Thank you! Redirecting to mentor booking calendar...');
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all text-center"
            >
              Book Expert Session
            </button>

            {/* Security Guarantee & Payment Graphic Badges */}
            <div className="space-y-2 text-center">
              
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Satisfaction Guarantee or Full Refund</span>
              </div>

              {/* Graphic Payment Badges */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                <div className="h-6 px-2 bg-white border border-slate-300 rounded flex items-center justify-center shadow-2xs">
                  <span className="font-extrabold italic text-[11px] tracking-tight text-[#003087]">
                    Pay<span className="text-[#0079C1]">Pal</span>
                  </span>
                </div>
                <div className="h-6 px-2.5 bg-[#1A1F71] rounded flex items-center justify-center shadow-2xs">
                  <span className="font-black italic text-[11px] tracking-wider text-white">
                    <span className="text-[#F79E1B]">V</span>ISA
                  </span>
                </div>
                <div className="h-6 px-2 bg-[#0A2540] rounded flex items-center justify-center gap-1 shadow-2xs">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EB001B]" />
                    <div className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-90" />
                  </div>
                  <span className="font-extrabold text-[9px] text-white tracking-tighter lowercase">
                    mastercard
                  </span>
                </div>
                <div className="h-6 px-2 bg-[#006FCF] rounded flex items-center justify-center shadow-2xs">
                  <span className="font-black text-[8px] text-white tracking-tighter uppercase leading-tight text-center">
                    AMERICAN<br/>EXPRESS
                  </span>
                </div>
                <div className="h-6 px-2 bg-[#383838] rounded flex items-center justify-center shadow-2xs">
                  <span className="font-extrabold text-[9px] text-white tracking-tighter uppercase flex items-center gap-0.5">
                    DISC<div className="w-2 h-2 rounded-full bg-[#F9A01B]" />VER
                  </span>
                </div>
                <div className="h-6 px-2 bg-[#0F4C81] rounded flex items-center justify-center gap-0.5 shadow-2xs">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1.5 h-1 bg-[#CC0000] rounded-2xs" />
                    <div className="w-1.5 h-1 bg-[#0000CC] rounded-2xs" />
                    <div className="w-1.5 h-1 bg-[#008000] rounded-2xs" />
                  </div>
                  <span className="font-black text-[9px] text-white tracking-tighter">
                    JCB
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
