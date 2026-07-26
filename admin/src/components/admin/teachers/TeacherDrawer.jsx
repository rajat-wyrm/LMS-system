import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdPhotoCamera, MdCheckCircle, MdCancel } from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

function TeacherDrawer({ isOpen, onClose, title, teacher, onSave }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    enabled: true,
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const panelRef = useFocusTrap(isOpen, onClose);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setForm((currentForm) => ({ ...currentForm, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (teacher) {
      setForm({
        name: teacher.name,
        email: teacher.email,
        password: '',
        bio: teacher.bio,
        enabled: teacher.enabled,
        avatar: teacher.photo || null,
      });
      setAvatarPreview(teacher.photo || null);
      return;
    }

    setForm({
      name: '',
      email: '',
      password: '',
      bio: '',
      enabled: true,
      avatar: null,
    });
    setAvatarPreview(null);
  }, [teacher, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[110] shadow-[-20px_0_60px_rgba(0,0,0,0.35)] overflow-y-auto border-l"
            style={{
              background: 'var(--admin-surface)',
              borderColor: 'var(--admin-border)',
            }}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold admin-text-primary">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full admin-text-secondary hover:bg-[var(--admin-surface-hover)] transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center relative">
                  <label
                    htmlFor="teacher-photo-input"
                    className="relative w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all admin-text-secondary hover:border-[#8B5CF6] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#FF6B35] has-[:focus-visible]:outline-offset-2"
                    style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-raised)' }}
                  >
                    <MdPhotoCamera size={30} className="mb-1" />
                    <span className="text-xs">Upload Photo</span>
                    <input
                      id="teacher-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="absolute w-28 h-28 rounded-full object-cover pointer-events-none"
                    />
                  ) : null}
                </div>

                <Field label="Instructor Name" required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((currentForm) => ({ ...currentForm, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((currentForm) => ({ ...currentForm, email: e.target.value }))}
                    className={inputClass}
                  />
                </Field>

                <Field label={teacher ? 'New Password (optional)' : 'Password'} required={!teacher}>
                  <input
                    type="password"
                    required={!teacher}
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm((currentForm) => ({ ...currentForm, password: e.target.value }))}
                    placeholder={teacher ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                    className={inputClass}
                  />
                </Field>

                <Field label="Bio" required>
                  <textarea
                    rows={4}
                    required
                    value={form.bio}
                    onChange={(e) => setForm((currentForm) => ({ ...currentForm, bio: e.target.value }))}
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                <div className="space-y-3">
                  <label className="text-sm font-medium admin-text-secondary">Status</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setForm((currentForm) => ({ ...currentForm, enabled: true }))}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        form.enabled
                          ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400'
                          : 'border-[var(--admin-border)] admin-text-secondary'
                      }`}
                    >
                      <MdCheckCircle /> Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((currentForm) => ({ ...currentForm, enabled: false }))}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        !form.enabled
                          ? 'border-red-500/60 bg-red-500/20 text-red-400'
                          : 'border-[var(--admin-border)] admin-text-secondary'
                      }`}
                    >
                      <MdCancel /> Disabled
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-4 rounded-xl text-white font-bold text-base transition-all hover:-translate-y-1 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                  }}
                >
                  Save Instructor
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  'w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 admin-text-primary border bg-[var(--admin-surface-raised)] border-[var(--admin-border)] placeholder:text-[var(--admin-text-muted)]';

function Field({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium admin-text-secondary">
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
    </div>
  );
}

export default TeacherDrawer;
