import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdNotifications, MdNotificationsOff, MdNotificationsNone } from 'react-icons/md';
import {
  isPushSupported,
  isEdgeBrowser,
  getSubscriptionStatus,
  subscribeToPush,
  unsubscribeFromPush
} from '../services/pushNotifications';
import { useUser } from '../UserContext';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Tooltip = styled.span`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #222;
  color: #fff;
  font-size: 11px;
  padding: 5px 9px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    right: 10px;
    border: 5px solid transparent;
    border-bottom-color: #222;
    border-top: none;
  }
`;

const TITLES = {
  subscribed:   'Notificações ativas — clica para desativar',
  unsubscribed: 'Ativar notificações push',
  denied:       'Notificações bloqueadas no browser'
};

export default function NotificationToggle() {
  const { token } = useUser();
  const [status, setStatus]   = useState('loading');
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState('');

  useEffect(() => {
    getSubscriptionStatus().then(setStatus);
  }, []);

  if (!isPushSupported() || status === 'loading' || status === 'unsupported') return null;

  const showTooltip = (msg, ms = 2500) => {
    setTooltip(msg);
    setTimeout(() => setTooltip(''), ms);
  };

  const handleClick = async () => {
    if (status === 'unsubscribed' && isEdgeBrowser()) {
      showTooltip('Notificações não funcionam no Edge. Usa o Chrome.', 5000);
      return;
    }
    setLoading(true);
    try {
      if (status === 'unsubscribed') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setStatus('denied');
          showTooltip('Permissão negada no browser');
          return;
        }
        await subscribeToPush(token);
        setStatus('subscribed');
        showTooltip('Notificações ativadas!');
      } else if (status === 'subscribed') {
        await unsubscribeFromPush(token);
        setStatus('unsubscribed');
        showTooltip('Notificações desativadas');
      }
    } catch (err) {
      console.error('Erro nas notificações:', err);
      showTooltip('Erro — tenta de novo');
    } finally {
      setLoading(false);
    }
  };

  const Icon = status === 'subscribed'
    ? MdNotifications
    : status === 'denied'
      ? MdNotificationsOff
      : MdNotificationsNone;

  return (
    <Wrapper>
      <Button
        onClick={handleClick}
        disabled={loading || status === 'denied'}
        title={TITLES[status]}
        aria-label="Gerir notificações"
      >
        <Icon size={22} />
      </Button>
      {tooltip && <Tooltip>{tooltip}</Tooltip>}
    </Wrapper>
  );
}
