import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const Banner = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: #1a1a2e;
  color: #fff;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  animation: ${slideUp} 0.3s ease;
  max-width: 90vw;
  font-family: sans-serif;
  font-size: 14px;
`;

const Button = styled.button`
  background: #fff;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;

  &:hover {
    background: #e8e8e8;
  }
`;

const Dismiss = styled.button`
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;

  &:hover {
    color: #fff;
  }
`;

export default function PwaUpdateBanner({ registration }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <Banner role="alert">
      <span>Nova versão disponível!</span>
      <Button onClick={handleUpdate}>Atualizar</Button>
      <Dismiss onClick={() => setVisible(false)} aria-label="Fechar">×</Dismiss>
    </Banner>
  );
}
