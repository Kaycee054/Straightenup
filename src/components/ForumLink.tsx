import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { AuthModal } from './AuthModal';

interface ForumLinkProps {
  className?: string;
  children: React.ReactNode;
}

export const ForumLink = ({ className, children }: ForumLinkProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleForumClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/forum');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <button onClick={handleForumClick} className={className}>
        {children}
      </button>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath="/forum"
      />
    </>
  );
};