'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  FileText, 
  Award, 
  MessageSquare, 
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  if (!isOpen) return null;

  const features = [
    {
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      title: "Smartest Career Engines",
      desc: "Advanced AI models for resume tuning & job description alignment.",
      free: false,
      pro: true
    },
    {
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      title: "Unlimited Resume & CV Builds",
      desc: "Create and export unlimited tailored resumes for different target roles.",
      free: false,
      pro: true
    },
    {
      icon: <GithubIcon className="w-4 h-4 text-slate-800" />,
      title: "GitHub README & Portfolio Builder",
      desc: "Generate high-impact GitHub profiles, tech badges & streak cards.",
      free: false,
      pro: true
    },
    {
      icon: <LinkedinIcon className="w-4 h-4 text-blue-600" />,
      title: "LinkedIn Profile Optimizer",
      desc: "Craft recruiter-ready headlines, summaries & featured accomplishments.",
      free: false,
      pro: true
    },
    {
      icon: <Award className="w-4 h-4 text-emerald-600" />,
      title: "Live ATS Score & Keyword Audit",
      desc: "Deep diagnostic scanning against ATS parsers & keyword density check.",
      free: false,
      pro: true
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
      title: "1-on-1 AI Career Coaching & Review",
      desc: "Real-time AI feedback and professional asset refinement.",
      free: false,
      pro: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Features & Comparison Table */}
        <div className="w-full md:w-7/12 bg-slate-50/80 p-6 md:p-8 border-r border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 leading-snug">
                  Available inside Momentum
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Compare plans & features
                </p>
              </div>
            </div>

            {/* Table Headers */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200/80 px-1">
              <span>What's included in plan</span>
              <div className="flex items-center gap-8 pr-2">
                <span>Free</span>
                <span className="text-blue-600 font-bold">Pro</span>
              </div>
            </div>

            {/* Feature Rows */}
            <div className="space-y-4">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0 pr-4">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-semibold text-slate-800 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-9 shrink-0 pt-0.5">
                    {/* Free Status */}
                    <span className="text-red-400 font-bold text-xs w-4 text-center">✕</span>
                    {/* Pro Status */}
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: Pricing & Subscription Selection */}
        <div className="w-full md:w-5/12 p-6 md:p-8 bg-white flex flex-col justify-between space-y-6">
          
          <div className="space-y-5">
            {/* Right Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Upgrade your plan</span>
                <span className="text-lg">🚀</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Get full access to Momentum's AI career engines, unlimited ATS diagnostics, and expert reviews.
              </p>
            </div>

            {/* Pricing Options */}
            <div className="space-y-3 pt-1">
              
              {/* Option 1: Monthly */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === 'monthly'
                    ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'monthly' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'monthly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Pro Monthly</div>
                    <div className="text-[11px] text-slate-500 font-semibold">$14/month</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400">⚡ 3K</div>
                  <div className="text-[10px] text-slate-400 font-medium">$0.46/day</div>
                </div>
              </div>

              {/* Option 2: Quarterly (Popular) */}
              <div 
                onClick={() => setSelectedPlan('quarterly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === 'quarterly'
                    ? 'border-slate-900 bg-slate-50/80 ring-2 ring-slate-900 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'quarterly' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                  }`}>
                    {selectedPlan === 'quarterly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">Pro Quarterly</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-extrabold">Save 21%</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      <span className="line-through text-slate-400 mr-1">$14</span>
                      <span className="text-slate-900 font-bold">$11</span>
                      <span>/month</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-blue-600">⚡ 9K</div>
                  <div className="text-[10px] text-slate-600 font-bold">$0.36/day</div>
                </div>
              </div>

              {/* Option 3: Yearly (Best Value) */}
              <div className="space-y-1">
                <div 
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPlan === 'yearly'
                      ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'yearly' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                    }`}>
                      {selectedPlan === 'yearly' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">Pro Yearly</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-extrabold">Save 42%</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        <span className="line-through text-slate-400 mr-1">$14</span>
                        <span className="text-slate-900 font-bold">$8</span>
                        <span>/month</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-emerald-600">⚡ 36K</div>
                    <div className="text-[10px] text-slate-600 font-bold">$0.26/day</div>
                  </div>
                </div>

                {/* Popular Pill */}
                <div className="px-3 py-1 rounded-xl bg-lime-400/90 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 shadow-xs">
                  <span>✦ Most Popular · 1,850 professionals upgraded this week</span>
                </div>
              </div>

            </div>
          </div>

          {/* Action & Footer */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all text-center"
            >
              Continue
            </button>

            {/* Security Footer */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Pay safe & secure</span>
              </div>
              
              {/* Graphic Payment Badges */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                
                {/* PayPal Badge */}
                <div className="h-6 px-2 bg-white border border-slate-300 rounded flex items-center justify-center shadow-2xs">
                  <span className="font-extrabold italic text-[11px] tracking-tight text-[#003087]">
                    Pay<span className="text-[#0079C1]">Pal</span>
                  </span>
                </div>

                {/* VISA Badge */}
                <div className="h-6 px-2.5 bg-[#1A1F71] rounded flex items-center justify-center shadow-2xs">
                  <span className="font-black italic text-[11px] tracking-wider text-white">
                    <span className="text-[#F79E1B]">V</span>ISA
                  </span>
                </div>

                {/* Mastercard Badge */}
                <div className="h-6 px-2 bg-[#0A2540] rounded flex items-center justify-center gap-1 shadow-2xs">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EB001B]" />
                    <div className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-90" />
                  </div>
                  <span className="font-extrabold text-[9px] text-white tracking-tighter lowercase">
                    mastercard
                  </span>
                </div>

                {/* American Express Badge */}
                <div className="h-6 px-2 bg-[#006FCF] rounded flex items-center justify-center shadow-2xs">
                  <span className="font-black text-[8px] text-white tracking-tighter uppercase leading-tight text-center">
                    AMERICAN<br/>EXPRESS
                  </span>
                </div>

                {/* Discover Badge */}
                <div className="h-6 px-2 bg-[#383838] rounded flex items-center justify-center shadow-2xs">
                  <span className="font-extrabold text-[9px] text-white tracking-tighter uppercase flex items-center gap-0.5">
                    DISC<div className="w-2 h-2 rounded-full bg-[#F9A01B]" />VER
                  </span>
                </div>

                {/* JCB Badge */}
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
