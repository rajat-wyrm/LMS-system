import React from 'react';
import { motion } from 'framer-motion';
import { MdEmail, MdPhone, MdPhotoCamera } from 'react-icons/md';
import FloatingInput from '../FloatingInput';

const ProfileSection = ({ profile, onUpdate }) => {
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onUpdate({ avatar: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b" style={{ borderColor: 'var(--admin-border-subtle)' }}>
        <div className="relative group">
          <div
            className="absolute -inset-1 rounded-full opacity-80 blur-sm"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #14B8A6)',
            }}
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[var(--admin-surface)]" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold admin-text-primary">{profile.name}</h2>
          <p className="text-sm admin-text-secondary mt-0.5">{profile.role}</p>
          <p className="text-xs admin-text-muted mt-2">Last updated · {profile.lastUpdated}</p>
          <label className="mt-4 inline-flex rounded-xl has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#FF6B35] has-[:focus-visible]:outline-offset-2">
            <motion.span
              whileHover={{ boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
            >
              <MdPhotoCamera size={18} />
              Change Photo
            </motion.span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleAvatar} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FloatingInput
          id="profile-name"
          label="Full Name"
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <FloatingInput
          id="profile-email"
          label="Email"
          type="email"
          icon={MdEmail}
          value={profile.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
        />
        <FloatingInput
          id="profile-phone"
          label="Phone"
          type="tel"
          icon={MdPhone}
          value={profile.phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
        />
        <FloatingInput
          id="profile-role"
          label="Role"
          value={profile.role}
          disabled
          onChange={() => {}}
        />
      </div>
    </div>
  );
};

export default ProfileSection;
