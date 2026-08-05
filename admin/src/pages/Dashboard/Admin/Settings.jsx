import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SettingsHero from '../../../components/admin/settings/SettingsHero';
import SettingsKpiRow from '../../../components/admin/settings/SettingsKpiRow';
import SettingsNav from '../../../components/admin/settings/SettingsNav';
import SettingsContentPanel from '../../../components/admin/settings/SettingsContentPanel';
import SettingsToast from '../../../components/admin/settings/SettingsToast';
import ProfileSection from '../../../components/admin/settings/sections/ProfileSection';
import QuickPreferences from '../../../components/admin/settings/sections/QuickPreferences';
import SecuritySection from '../../../components/admin/settings/sections/SecuritySection';
import NotificationsSection from '../../../components/admin/settings/sections/NotificationsSection';
import AppearanceSection from '../../../components/admin/settings/sections/AppearanceSection';
import PlatformSection from '../../../components/admin/settings/sections/PlatformSection';
import BillingSection from '../../../components/admin/settings/sections/BillingSection';
import {
  computeNotificationStatus,
  computeProfileCompletion,
  computeSecurityScore,
} from '../../../components/admin/settings/constants';
import { useSettingsState } from '../../../components/admin/settings/useSettingsState';
import { TABS } from '../../../components/admin/settings/constants';

const VALID_TABS = new Set(TABS.map((t) => t.id));

const Settings = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() =>
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : 'profile'
  );
  const [toast, setToast] = useState({ show: false, message: '' });
  const securityRef = useRef(null);

  const {
    settings,
    accent,
    dirty,
    updateProfile,
    updateQuickPrefs,
    updateNotifPrefs,
    updatePlatform,
    updateBilling,
    updateSecurity,
    updateAppearancePrefs,
    setAccent,
    saveAll,
    exportSettings,
    resetDirty,
  } = useSettingsState();

  const { profile, quickPrefs, notifPrefs, platform, billing, security, appearancePrefs } =
    settings;

  const profileCompletion = computeProfileCompletion(profile);
  const securityScore = computeSecurityScore(security);
  const notifStatus = computeNotificationStatus(notifPrefs);

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  const handleSave = useCallback(() => {
    saveAll();
    showToast('Settings saved successfully!');
  }, [saveAll, showToast]);

  const handleSecurityCenter = useCallback(() => {
    setActiveTab('security');
    requestAnimationFrame(() => {
      securityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const renderSection = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileSection profile={profile} onUpdate={updateProfile} />
            <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--admin-border-subtle)' }}>
              <QuickPreferences
                quickPrefs={quickPrefs}
                accent={accent}
                onQuickPrefsChange={updateQuickPrefs}
                onAccentChange={setAccent}
              />
            </div>
          </>
        );
      case 'security':
        return (
          <SecuritySection
            security={security}
            onUpdate={updateSecurity}
            sectionRef={securityRef}
          />
        );
      case 'notifications':
        return (
          <NotificationsSection
            notifPrefs={notifPrefs}
            onToggle={updateNotifPrefs}
            accent={accent}
          />
        );
      case 'appearance':
        return (
          <AppearanceSection
            accent={accent}
            accentId={quickPrefs.accentId}
            onAccentChange={setAccent}
            compact={appearancePrefs.compact}
            animations={appearancePrefs.animations}
            onCompactChange={(v) => updateAppearancePrefs({ compact: v })}
            onAnimationsChange={(v) => updateAppearancePrefs({ animations: v })}
          />
        );
      case 'platform':
        return <PlatformSection platform={platform} onUpdate={updatePlatform} accent={accent} />;
      case 'billing':
        return <BillingSection billing={billing} onUpdate={updateBilling} accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <SettingsHero
        onSave={handleSave}
        onSecurityCenter={handleSecurityCenter}
        onExport={exportSettings}
      />

      <SettingsKpiRow
        profileCompletion={profileCompletion}
        securityScore={securityScore}
        activeSessions={2}
        notificationLabel={notifStatus.label}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,30%)_minmax(0,70%)] gap-6 items-start">
        <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
        <SettingsContentPanel activeTab={activeTab}>{renderSection()}</SettingsContentPanel>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[190] flex items-center gap-4 px-6 py-3 rounded-2xl shadow-2xl border"
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <span className="text-xs admin-text-muted font-medium">Unsaved changes</span>
            <button
              type="button"
              onClick={resetDirty}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold admin-text-muted hover:admin-text-primary border transition-all"
              style={{ borderColor: 'var(--admin-border)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
            >
              Save Changes
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsToast
        show={toast.show}
        message={toast.message}
        onHide={() => setToast((t) => ({ ...t, show: false }))}
      />
    </div>
  );
};

export default Settings;
