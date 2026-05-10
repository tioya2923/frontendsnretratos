import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MdInstallMobile } from 'react-icons/md';

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  transition: background 0.2s;

  &:hover {
    background: #2d2d5e;
  }
`;

export default function InstallPwaButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt) return null;

  const handleInstall = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
  };

  return (
    <Button onClick={handleInstall} title="Instalar app no telemóvel">
      <MdInstallMobile size={18} />
      Instalar App
    </Button>
  );
}
