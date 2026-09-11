'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { ImagineSidebar, MobileNavBar } from './ImagineSidebar';
import { AuthModal } from './AuthModal';
import { UpgradeModal } from './UpgradeModal';
import { PaymentModal } from './PaymentModal';
import BlockScreen from './BlockScreen';
import { useWorkspace } from '../context/WorkspaceContext';

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    activeTab,
    mobileHeaderRight,
    mainContentRef,
    isFullBleed,
    isAuthorized,
    unlocked,
    isAuthOpen,
    setIsAuthOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentModalReason,
    openPaymentModal,
    isUpgradeOpen,
    setIsUpgradeOpen,
    showBlockModal,
    setShowBlockModal,
    showProCelebrationModal,
    setShowProCelebrationModal,
  } = useWorkspace();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll listener on main container
  useEffect(() => {
    const container = mainContentRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [mainContentRef]);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] text-slate-900 font-sans">
      {/* ImagineArt Style Left Sidebar */}
      <ImagineSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          localStorage.setItem('profile_builder_active_tab', tab);
          if (tab === activeTab) {
            window.dispatchEvent(new CustomEvent('workspace_reset_landing'));
          } else {
            router.push(`/${tab}`);
          }
        }}
        onNewChat={() => {
          window.dispatchEvent(new CustomEvent('workspace_reset_landing'));
        }}
        unlocked={unlocked}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUpgrade={() => openPaymentModal()}
        onOpenAskExpert={() => {}}
        onOpenRemoveWatermark={() => openPaymentModal('Remove the watermark from your Resume, LinkedIn, and GitHub downloads')}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div
        ref={mainContentRef}
        className={`flex-1 flex flex-col min-w-0 h-screen ${
          isFullBleed ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {/* Mobile menu bar */}
        <MobileNavBar
          onOpenMenu={() => setIsMobileNavOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onGoHome={() => {
            window.dispatchEvent(new CustomEvent('workspace_reset_landing'));
            mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          rightContent={mobileHeaderRight}
        />

        {/* Studio Workspace View */}
        <div
          className={`relative flex-1 min-h-0 flex flex-col w-full mx-auto ${
            isFullBleed ? 'p-0 max-w-none' : 'p-4 sm:p-6 gap-4 max-w-7xl'
          }`}
        >
          {(showBlockModal || (!isAuthorized && activeTab === 'assistant')) && (
            <BlockScreen
              onOpenAuth={() => {
                setShowBlockModal(false);
                setIsAuthOpen(true);
              }}
              onClose={() => {
                setShowBlockModal(false);
                if (activeTab === 'assistant') router.push('/resume');
              }}
            />
          )}

          {/* Active Editor Component */}
          <div
            className="flex-1 min-h-0 flex flex-col"
            onClickCapture={(e) => {
              if (!isAuthorized && activeTab !== 'resume' && activeTab !== 'github') {
                e.preventDefault();
                e.stopPropagation();
                setShowBlockModal(true);
              }
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      {isPaymentModalOpen && (
        <PaymentModal
          reason={paymentModalReason}
          onApproved={() => {
            setIsPaymentModalOpen(false);
            window.location.reload();
          }}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {/* Pro Upgrade Celebration Modal */}
      <AnimatePresence>
        {showProCelebrationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/65">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20 border border-slate-700/50 p-2.5">
                <img src="/logo.png" alt="Momentum Logo" className="w-full h-full object-contain rounded-lg" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                You're Now Pro Active! 🎉
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Your payment screenshot has been verified by the team. All watermarks have been removed and full Pro access is active for your account.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-left space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>No Watermark on any downloaded resume</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Full access to AI Chat Studio & Resume Generator</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Unlimited ATS Optimization checks</span>
                </div>
              </div>

              <button
                onClick={() => setShowProCelebrationModal(false)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                Start Creating Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && !isFullBleed && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed bottom-6 right-6 p-3.5 rounded-full bg-[#2a2a2e] hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all z-40 focus:outline-none flex items-center justify-center cursor-pointer border border-slate-700/20"
            title="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
