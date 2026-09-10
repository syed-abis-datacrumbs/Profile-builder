'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import confetti from 'canvas-confetti';
import { ActiveTab, ResumeData, GithubProfileData, LinkedinProfileData } from '../types';
import { defaultResumeData, defaultGithubData, defaultLinkedinData } from '../lib/defaultData';
import { BUILDER_ACCESS_EMAILS } from '../lib/accessConfig';

export interface InitialUser {
  id: string;
  firstName: string;
  fullName: string;
  email?: string;
}

export interface WorkspaceContextType {
  activeTab: ActiveTab;
  mobileHeaderRight: React.ReactNode;
  setMobileHeaderRight: (node: React.ReactNode) => void;
  mainContentRef: React.RefObject<HTMLDivElement | null>;
  isFullBleed: boolean;
  setIsFullBleed: (val: boolean) => void;

  // User identity
  isLoggedIn: boolean;
  isAuthorized: boolean;
  firstName: string;
  displayFullName: string;
  clerkFullName: string;
  userEmail?: string;
  userId?: string;

  // Pro status
  unlocked: boolean | null;
  checkUnlockStatus: () => void;
  lockedResumeName: string;

  // Modals
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  paymentModalReason: string;
  openPaymentModal: (reason?: string) => void;
  isUpgradeOpen: boolean;
  setIsUpgradeOpen: (open: boolean) => void;
  showBlockModal: boolean;
  setShowBlockModal: (open: boolean) => void;

  // Shared profile data
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  githubData: GithubProfileData;
  setGithubData: React.Dispatch<React.SetStateAction<GithubProfileData>>;
  linkedinData: LinkedinProfileData;
  setLinkedinData: React.Dispatch<React.SetStateAction<LinkedinProfileData>>;

  // Navigation helpers
  assistantPrompt: string;
  setAssistantPrompt: (prompt: string) => void;
  navigateToAssistant: (promptText: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialUser: InitialUser | null;
}

export function WorkspaceProvider({ children, initialUser }: WorkspaceProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Derive activeTab from pathname
  const activeTab: ActiveTab = (() => {
    if (pathname.includes('/github')) return 'github';
    if (pathname.includes('/linkedin')) return 'linkedin';
    if (pathname.includes('/jobhunting')) return 'jobhunting';
    if (pathname.includes('/freelancing')) return 'freelancing';
    if (pathname.includes('/interview')) return 'interview';
    if (pathname.includes('/assistant')) return 'assistant';
    return 'resume';
  })();

  const [mobileHeaderRight, setMobileHeaderRight] = useState<React.ReactNode>(null);
  const [isFullBleed, setIsFullBleed] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalReason, setPaymentModalReason] = useState('Remove the watermark from your Resume, LinkedIn, and GitHub downloads');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showProCelebrationModal, setShowProCelebrationModal] = useState(false);

  // Shared profile data state
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [githubData, setGithubData] = useState<GithubProfileData>(defaultGithubData);
  const [linkedinData, setLinkedinData] = useState<LinkedinProfileData>(defaultLinkedinData);

  // User identity: server initialUser until Clerk is loaded client-side
  const { user: clientUser, isLoaded } = useUser();
  const user = isLoaded
    ? clientUser
    : initialUser
    ? {
        id: initialUser.id,
        firstName: initialUser.firstName,
        fullName: initialUser.fullName,
        primaryEmailAddress: initialUser.email ? { emailAddress: initialUser.email } : undefined,
      }
    : null;

  const userEmail = user?.primaryEmailAddress?.emailAddress || undefined;
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || userEmail?.split('@')[0] || '';
  const clerkFullName = (
    user?.fullName ||
    [user?.firstName, (user as any)?.lastName].filter(Boolean).join(' ') ||
    ''
  ).trim();

  const isLoggedIn = isLoaded ? !!clientUser : !!initialUser;
  const isAuthorized = isLoggedIn && BUILDER_ACCESS_EMAILS.has(userEmail || '');

  // Pro & name state
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [lockedResumeName, setLockedResumeName] = useState('');

  // Hydrate profile data & pro state safely on client mount
  useEffect(() => {
    try {
      const savedGithub = localStorage.getItem('profile_builder_github_data');
      if (savedGithub) setGithubData(JSON.parse(savedGithub));

      const cachedPro = localStorage.getItem('cached_pro_user');
      if (cachedPro === 'true') setUnlocked(true);
      else if (cachedPro === 'false') setUnlocked(false);
    } catch (e) {
      console.error('[Workspace hydration error]:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('profile_builder_github_data', JSON.stringify(githubData));
    } catch {}
  }, [githubData]);

  // Pro status & locked resume name fetching in background
  useEffect(() => {
    if (!isLoaded) return;
    if (isLoggedIn && user?.id) {
      const userCached = localStorage.getItem(`cached_pro_${user.id}`);
      if (userCached === 'true') setUnlocked(true);
      else if (userCached === 'false' && unlocked === null) setUnlocked(false);

      fetch('/api/resumes/name')
        .then((r) => r.json())
        .then((data) => {
          if (data.fullName) setLockedResumeName(data.fullName);
        })
        .catch(() => {});
    }
  }, [isLoggedIn, isLoaded, user?.id]);

  const displayFullName = clerkFullName || lockedResumeName || '';

  const checkUnlockStatus = () => {
    fetch('/api/payment/status')
      .then((r) => r.json())
      .then((d: { unlocked: boolean; lastApprovedAt?: string; shouldCelebrate?: boolean }) => {
        setUnlocked(d.unlocked);
        if (d.unlocked && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profile_builder_unlocked'));
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_pro_user', d.unlocked ? 'true' : 'false');
          if (user?.id) {
            localStorage.setItem(`cached_pro_${user.id}`, d.unlocked ? 'true' : 'false');
          }
        }

        if (d.unlocked && d.shouldCelebrate) {
          setShowProCelebrationModal(true);
          fetch('/api/payment/celebrate', { method: 'POST' }).catch(() => {});
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
            });
          } catch (e) {
            console.error('[Confetti error]:', e);
          }
        }
      })
      .catch(() => setUnlocked(false));
  };

  useEffect(() => {
    checkUnlockStatus();
    window.addEventListener('focus', checkUnlockStatus);
    return () => window.removeEventListener('focus', checkUnlockStatus);
  }, [user?.id]);

  useEffect(() => {
    if (!isPaymentModalOpen) {
      checkUnlockStatus();
    }
  }, [isPaymentModalOpen, user?.id]);

  const openPaymentModal = (reason?: string) => {
    if (reason) setPaymentModalReason(reason);
    setIsPaymentModalOpen(true);
  };

  const navigateToAssistant = (promptText: string) => {
    setAssistantPrompt(promptText);
    router.push(`/assistant?prompt=${encodeURIComponent(promptText)}`);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeTab,
        mobileHeaderRight,
        setMobileHeaderRight,
        mainContentRef,
        isFullBleed,
        setIsFullBleed,
        isLoggedIn,
        isAuthorized,
        firstName,
        displayFullName,
        clerkFullName,
        userEmail,
        userId: user?.id,
        unlocked,
        checkUnlockStatus,
        lockedResumeName,
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
        resumeData,
        setResumeData,
        githubData,
        setGithubData,
        linkedinData,
        setLinkedinData,
        assistantPrompt,
        setAssistantPrompt,
        navigateToAssistant,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
