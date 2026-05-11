import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MdInstallMobile } from 'react-icons/md';

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
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
      <MdInstallMobile size={16} />
      Instalar App
    </Button>
  );
}
