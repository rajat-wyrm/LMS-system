import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdClose, MdEmail, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaCss3Alt, FaDocker, FaGitAlt, FaGithub, FaHtml5, FaJava, FaJs, FaNodeJs, FaPython, FaReact } from 'react-icons/fa';
import { SiCplusplus, SiTypescript } from 'react-icons/si';
import { apiRequest, storeAdminAuth } from '../../utils/api';

const techIcons = [
  { Icon: FaJava, className: 'top-[10%] left-[6%] text-orange-500/30', size: 48, delay: '0s', duration: '8s' },
  { Icon: FaReact, className: 'top-[25%] left-[18%] text-cyan-500/30', size: 36, delay: '1.5s', duration: '6.5s' },
  { Icon: SiTypescript, className: 'top-[35%] left-[26%] text-blue-500/30', size: 38, delay: '3s', duration: '8.5s' },
  { Icon: FaGitAlt, className: 'top-[48%] left-[8%] text-red-500/30', size: 40, delay: '2s', duration: '7s' },
  { Icon: FaGithub, className: 'top-[68%] left-[15%] text-slate-400/40', size: 52, delay: '4s', duration: '9s' },
  { Icon: FaNodeJs, className: 'top-[82%] left-[7%] text-green-500/30', size: 42, delay: '2.5s', duration: '9.5s' },
  { Icon: FaDocker, className: 'top-[8%] right-[8%] text-blue-500/30', size: 56, delay: '1s', duration: '10s' },
  { Icon: SiCplusplus, className: 'top-[24%] right-[22%] text-indigo-500/30', size: 44, delay: '3s', duration: '8s' },
  { Icon: FaCss3Alt, className: 'top-[40%] right-[10%] text-blue-400/30', size: 38, delay: '0.5s', duration: '7.5s' },
  { Icon: FaHtml5, className: 'top-[56%] right-[24%] text-orange-600/30', size: 34, delay: '2s', duration: '7s' },
  { Icon: FaJs, className: 'top-[72%] right-[8%] text-yellow-500/30', size: 38, delay: '3.5s', duration: '8.5s' },
  { Icon: FaPython, className: 'top-[86%] right-[18%] text-yellow-500/30', size: 48, delay: '5s', duration: '7.5s' },
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    navigate('/');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await apiRequest('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (result.user?.role !== 'admin') {
        setError('This account is not authorized for the admin dashboard.');
        return;
      }

      storeAdminAuth({ token: result.token, user: result.user });
      navigate('/dashboard/admin/users');
    } catch (requestError) {
      setError(requestError.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="no-theme min-h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] bg-accent-cyan rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-30%] right-[-30%] w-[60%] h-[60%] bg-accent-purple rounded-full blur-[120px] opacity-30" />

        {techIcons.map((item, index) => (
          <item.Icon
            key={index}
            size={item.size}
            className={`absolute animate-float transition-all duration-500 ${item.className}`}
            style={{
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          />
        ))}
      </div>

      <button
        onClick={handleClose}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm"
      >
        <MdArrowBack className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="max-w-md w-full mx-4 glass-card glass-card-hover p-8 rounded-2xl relative z-10">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          onClick={handleClose}
        >
          <MdClose size={20} />
        </button>

        <div className="text-center mb-6">
          <img src="/favicon.svg" alt="UptoSkills Logo" className="mx-auto h-12 mb-4" />
          <h2 className="text-3xl font-bold text-[#f8fafc] mb-2 tracking-tight">Admin Sign In</h2>
          <p className="text-[#cbd5e1] text-sm mb-4">Use the backend admin account to manage real database users.</p>
          <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-lg text-xs text-blue-200 flex flex-col gap-1 items-center justify-center">
            <span className="font-semibold text-blue-400 uppercase tracking-wider text-[10px]">Seeded Backend Admin</span>
            <span>Email: <strong>admin.amit@lms.com</strong></span>
            <span>Password: <strong>password123</strong></span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-sm text-red-200 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full bg-[#1a1f2e] border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1f2e] transition-colors"
              placeholder="Admin Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              className="w-full bg-[#1a1f2e] border border-white/20 rounded-md px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1f2e] transition-colors"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showPassword ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-bold py-3 rounded-md hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Protected by backend JWT authentication
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
