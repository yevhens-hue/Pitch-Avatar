"use client";

import Head from 'next/head';
import React, { useState } from 'react';
import Wizard from '../components/Wizard/Wizard';
import AuthModal from '../components/Auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div style={{minHeight: '100vh', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Head>
        <title>Pitch Avatar - AI Story Wizard</title>
        <meta name="description" content="Create interactive presentations with AI" />
      </Head>
      
      <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '1rem 0', gap: '1rem', alignItems: 'center'}}>
        <button onClick={() => window.location.href = '/analytics'} style={{padding: '0.5rem 1rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'}} className="animate-fade-in">
          Analytics
        </button>
        {user ? (
          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}} className="animate-fade-in">
            <div style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
              <UserIcon size={16} /> {user.email}
            </div>
            <button onClick={signOut} style={{padding: '0.5rem', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'}}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsAuthOpen(true)} style={{padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'}} className="animate-fade-in">
            Sign In / Sign Up
          </button>
        )}
      </div>

      <header style={{textAlign: 'center', marginBottom: '3rem'}} className="animate-fade-in">
        <h1 style={{fontSize: '3rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #a8edea, #fed6e3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          Pitch Avatar
        </h1>
        <p style={{fontSize: '1.2rem', opacity: 0.8, marginTop: '1rem'}}>
          Automate your sales with interactive AI-driven presentations
        </p>
      </header>

      <main style={{width: '100%'}} className="animate-fade-in">
        <Wizard />
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
