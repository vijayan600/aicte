import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, UserCheck, ArrowRight, Activity } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import type { Role } from '../../types';

const ROLES: Array<{
  id: Role;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  route: string;
  badge: string;
}> = [
  {
    id: 'institute',
    label: 'Institute User',
    description: 'Submit applications, upload documents, track status and compliance requirements',
    icon: Building2,
    color: '#1EA7FF',
    route: '/institute',
    badge: 'Institute Portal',
  },
  {
    id: 'admin',
    label: 'AICTE Administrator',
    description: 'Review all institutions, manage scrutiny, EVC, approvals and analytics',
    icon: Shield,
    color: '#22E55A',
    route: '/admin',
    badge: 'Admin Console',
  },
  {
    id: 'evc',
    label: 'EVC Member',
    description: 'Manage assigned inspection cases and submit evaluation reports',
    icon: UserCheck,
    color: '#FFB020',
    route: '/evc',
    badge: 'EVC Portal',
  },
];

export default function LoginPage() {
  const [selected, setSelected] = useState<Role | null>(null);
  const { setRole } = useUIStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!selected) return;
    const roleConfig = ROLES.find(r => r.id === selected);
    setRole(selected);
    navigate(roleConfig?.route || '/institute');
  };

  return (
    <div
      style={{ background: '#050B14', minHeight: '100vh' }}
      className="flex flex-col items-center justify-center p-8 relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 20%, rgba(30,167,255,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 80%, rgba(34,229,90,0.07) 0%, transparent 40%),
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
      }} />

      {/* Floating orbs */}
      <div className="absolute top-16 left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(30,167,255,0.08)' }} />
      <div className="absolute bottom-16 right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(34,229,90,0.07)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full relative z-10"
        style={{ maxWidth: 880 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
            className="inline-flex items-center gap-4 mb-6"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(30,167,255,0.15)',
                border: '2px solid rgba(30,167,255,0.45)',
                boxShadow: '0 0 40px rgba(30,167,255,0.35)',
              }}>
              <Activity size={32} color="#1EA7FF" />
            </div>
            <div className="text-left">
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#E8EDF5', lineHeight: 1.1 }}>
                AICTE IDP
              </h1>
              <p style={{ fontSize: 14, color: '#1EA7FF', fontWeight: 500, marginTop: 2 }}>
                Intelligent Document Processing System
              </p>
            </div>
          </motion.div>

          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#E8EDF5', lineHeight: 1.1, marginBottom: 12 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: 17, color: '#8B9CB8' }}>
            Select your role to access your personalized dashboard
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
          {ROLES.map((roleItem, i) => {
            const Icon = roleItem.icon;
            const isSelected = selected === roleItem.id;
            return (
              <motion.button
                key={roleItem.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(roleItem.id)}
                style={{
                  background: isSelected ? `${roleItem.color}14` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? roleItem.color : 'rgba(255,255,255,0.09)'}`,
                  boxShadow: isSelected ? `0 0 30px ${roleItem.color}30, 0 8px 32px rgba(0,0,0,0.4)` : '0 4px 16px rgba(0,0,0,0.2)',
                  borderRadius: 20,
                  padding: 28,
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                }}
                aria-pressed={isSelected}
              >
                {/* Badge */}
                <div style={{ marginBottom: 18 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '5px 12px',
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 600,
                    background: `${roleItem.color}1A`,
                    color: roleItem.color,
                    border: `1px solid ${roleItem.color}35`,
                    letterSpacing: '0.03em',
                  }}>
                    {roleItem.badge}
                  </span>
                </div>

                {/* Icon */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  background: `${roleItem.color}18`,
                  border: `1px solid ${roleItem.color}40`,
                  boxShadow: isSelected ? `0 0 20px ${roleItem.color}40` : 'none',
                }}>
                  <Icon size={26} color={roleItem.color} />
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#E8EDF5', marginBottom: 10, lineHeight: 1.2 }}>
                  {roleItem.label}
                </h3>
                <p style={{ fontSize: 14, color: '#8B9CB8', lineHeight: 1.6 }}>
                  {roleItem.description}
                </p>

                {/* Selected check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: roleItem.color,
                      boxShadow: `0 0 12px ${roleItem.color}60`,
                    }}
                  >
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M1.5 5L5 8.5L11.5 1.5" stroke="#050B14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <motion.button
            onClick={handleLogin}
            disabled={!selected}
            whileHover={selected ? { scale: 1.03, y: -1 } : {}}
            whileTap={selected ? { scale: 0.97 } : {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 48px',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              cursor: selected ? 'pointer' : 'not-allowed',
              opacity: selected ? 1 : 0.4,
              background: selected
                ? 'linear-gradient(135deg, #1EA7FF, #22E55A)'
                : 'rgba(255,255,255,0.08)',
              color: selected ? '#050B14' : '#6B7686',
              border: 'none',
              boxShadow: selected ? '0 8px 32px rgba(30,167,255,0.40)' : 'none',
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}
          >
            Enter Dashboard
            <ArrowRight size={20} />
          </motion.button>

          <p style={{ fontSize: 13, color: '#4A5568' }}>
            Demo mode — No authentication required. All data is simulated.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
