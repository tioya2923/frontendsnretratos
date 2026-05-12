import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { MdEdit, MdCheck, MdClose, MdLogout, MdWhatsapp, MdEmail } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../UserContext';
import AtividadesPage from './AtividadesPage';

const BACKEND = 'https://snref-backend-8d85ffa999cd.herokuapp.com';

// ─── Estilos do perfil ───────────────────────────────────────────────────────

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  font-family: sans-serif;
`;

const ProfileCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 24px 20px;
  margin-bottom: 28px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #4b0303;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 1px;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserStatus = styled.div`
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
  margin-top: 2px;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff0f0;
  color: #b91c1c;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  &:hover { background: #fee2e2; }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 16px 0;
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f9fafb;
  &:last-child { border-bottom: none; }
`;

const DataIcon = styled.div`
  color: #9ca3af;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const DataContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DataLabel = styled.div`
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DataValue = styled.div`
  font-size: 14px;
  color: #222;
  margin-top: 2px;
`;

const EditInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  border: 1.5px solid #4b0303;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  margin-top: 2px;
  box-sizing: border-box;
`;

const EditActions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const IconBtn = styled.button`
  background: ${({ $variant }) =>
    $variant === 'confirm' ? '#4b0303' :
    $variant === 'cancel'  ? '#f3f4f6' : 'transparent'};
  color: ${({ $variant }) =>
    $variant === 'confirm' ? '#fff' : '#555'};
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
  &:hover { opacity: 0.8; }
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: #4b0303;
  font-weight: 700;
  margin-bottom: 4px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4b030320;
`;

// ─── Componente ──────────────────────────────────────────────────────────────

function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function PerfilPage() {
  const { token, userName, logout } = useUser();
  const navigate = useNavigate();

  const [perfil, setPerfil]         = useState(null);
  const [editWhats, setEditWhats]   = useState(false);
  const [whatsVal, setWhatsVal]     = useState('');
  const [saving, setSaving]         = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchPerfil = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND}/components/perfil.php`, { headers });
      setPerfil(data);
      setWhatsVal(data.whatsapp || '');
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => { fetchPerfil(); }, [fetchPerfil]);

  const saveWhatsapp = async () => {
    setSaving(true);
    try {
      await axios.put(`${BACKEND}/components/perfil.php`, { whatsapp: whatsVal }, { headers });
      setPerfil(p => ({ ...p, whatsapp: whatsVal }));
      setEditWhats(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const name = perfil?.name || userName || '';

  return (
    <Page>
      {/* ── Cartão de perfil ── */}
      <ProfileCard>
        <CardTop>
          <Avatar>{initials(name)}</Avatar>
          <UserInfo>
            <UserName>{name}</UserName>
            <UserStatus>✓ Conta aprovada</UserStatus>
          </UserInfo>
          <LogoutBtn onClick={handleLogout}>
            <MdLogout size={16} /> Sair
          </LogoutBtn>
        </CardTop>

        <Divider />

        {/* Email */}
        <DataRow>
          <DataIcon><MdEmail size={18} /></DataIcon>
          <DataContent>
            <DataLabel>E-mail</DataLabel>
            <DataValue>{perfil?.email || '—'}</DataValue>
          </DataContent>
        </DataRow>

        {/* WhatsApp — editável */}
        <DataRow>
          <DataIcon><MdWhatsapp size={18} /></DataIcon>
          <DataContent>
            <DataLabel>WhatsApp</DataLabel>
            {editWhats ? (
              <EditInput
                type="tel"
                value={whatsVal}
                onChange={e => setWhatsVal(e.target.value)}
                placeholder="Ex: 244912345678"
                autoFocus
              />
            ) : (
              <DataValue>{perfil?.whatsapp || '—'}</DataValue>
            )}
          </DataContent>
          <EditActions>
            {editWhats ? (
              <>
                <IconBtn $variant="confirm" onClick={saveWhatsapp} disabled={saving}>
                  <MdCheck size={16} />
                </IconBtn>
                <IconBtn $variant="cancel" onClick={() => { setEditWhats(false); setWhatsVal(perfil?.whatsapp || ''); }}>
                  <MdClose size={16} />
                </IconBtn>
              </>
            ) : (
              <IconBtn onClick={() => setEditWhats(true)} title="Editar WhatsApp">
                <MdEdit size={16} />
              </IconBtn>
            )}
          </EditActions>
        </DataRow>

      </ProfileCard>

      {/* ── Atividades ── */}
      <SectionTitle>As Minhas Atividades</SectionTitle>
      <AtividadesPage />
    </Page>
  );
}
