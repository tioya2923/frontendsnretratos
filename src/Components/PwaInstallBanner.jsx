import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MdInstallMobile, MdIosShare, MdClose } from 'react-icons/md';

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const Banner = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  background: #1a1a2e;
  color: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  animation: ${slideUp} 0.3s ease;
  max-width: 92vw;
  font-family: sans-serif;
  font-size: 13.5px;
  line-height: 1.4;
`;

const Icon = styled.div`
  flex-shrink: 0;
  display: flex;
  color: #ffd700;
`;

const Texto = styled.span`
  flex: 1;
`;

const Botao = styled.button`
  flex-shrink: 0;
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

const Fechar = styled.button`
  flex-shrink: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: none;
  cursor: pointer;
  display: flex;
  padding: 2px;

  &:hover {
    color: #fff;
  }
`;

// Deteta a plataforma para saber que tipo de aviso mostrar — não há uma
// única API que funcione em todos os browsers: o Chrome/Edge (desktop e
// Android) tem um evento (beforeinstallprompt) que instala com um clique;
// o Safari (iPhone, iPad e Mac) nunca dispara esse evento — só dá para
// mostrar instruções de como adicionar manualmente.
function detetarPlataforma() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
  const isMac = /Macintosh/.test(ua) && navigator.maxTouchPoints <= 1; // exclui iPad em modo desktop
  return { isIOS, isSafariDesktop: isSafari && isMac && !isIOS };
}

function jaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true; // iOS antigo
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [modo, setModo] = useState(null); // 'instalar' | 'ios' | 'safari-mac' | null
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    if (jaInstalada()) return;

    const { isIOS, isSafariDesktop } = detetarPlataforma();

    const handler = e => {
      e.preventDefault();
      setPrompt(e);
      setModo('instalar');
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Safari (iOS e Mac) nunca dispara beforeinstallprompt — mostra as
    // instruções manuais de imediato, sem esperar por nenhum evento.
    if (isIOS) setModo(prev => prev || 'ios');
    else if (isSafariDesktop) setModo(prev => prev || 'safari-mac');

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (fechado || !modo) return null;

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setModo(null);
  };

  const conteudo = {
    instalar: {
      icone: <MdInstallMobile size={22} />,
      texto: 'Instale a app para um acesso mais rápido, com notificações e sem barra do browser.',
      acao: <Botao onClick={handleInstall}>Instalar</Botao>,
    },
    ios: {
      icone: <MdIosShare size={20} />,
      texto: 'Para instalar: toque em Partilhar e depois em "Adicionar ao Ecrã Principal".',
      acao: null,
    },
    'safari-mac': {
      icone: <MdIosShare size={20} />,
      texto: 'Para instalar: no menu Ficheiro do Safari, escolha "Adicionar ao Dock".',
      acao: null,
    },
  }[modo];

  return (
    <Banner role="alert">
      <Icon>{conteudo.icone}</Icon>
      <Texto>{conteudo.texto}</Texto>
      {conteudo.acao}
      <Fechar onClick={() => setFechado(true)} aria-label="Fechar">
        <MdClose size={18} />
      </Fechar>
    </Banner>
  );
}
