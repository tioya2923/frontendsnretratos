import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import {
  MdSend, MdClose, MdAdd, MdDelete, MdGroup, MdPerson, MdPeople,
  MdMailOutline, MdMail, MdReply
} from 'react-icons/md';
import { useUser } from '../../../UserContext';

const BACKEND = 'https://snref-backend-8d85ffa999cd.herokuapp.com';
const POLL_INTERVAL_MS = 12000; // 12 segundos

// ─── Animações ───────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

// ─── Estilos ─────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 0 4px;
  font-family: sans-serif;
`;

const NewBanner = styled.div`
  background: #4b0303;
  color: #fff;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  animation: ${slideDown} 0.3s ease;
  gap: 12px;
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active }) => ($active ? '#4b0303' : '#888')};
  border-bottom: 3px solid ${({ $active }) => ($active ? '#4b0303' : 'transparent')};
  margin-bottom: -2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const Badge = styled.span`
  background: #4b0303;
  color: #fff;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  min-width: 18px;
  text-align: center;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #4b0303;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #6b0404; }
`;

const MsgCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  border-left: 4px solid ${({ $lida }) => ($lida ? '#ddd' : '#4b0303')};
  cursor: pointer;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.13); }
`;

const MsgHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const MsgFrom = styled.span`
  font-weight: ${({ $lida }) => ($lida ? 500 : 700)};
  font-size: 14px;
  color: #222;
  flex: 1;
  min-width: 0;
`;

const MsgTime = styled.span`
  font-size: 11px;
  color: #bbb;
  white-space: nowrap;
  flex-shrink: 0;
`;

const MsgBody = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${({ $lida }) => ($lida ? '#999' : '#444')};
  white-space: ${({ $expanded }) => ($expanded ? 'pre-wrap' : 'nowrap')};
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #888;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 2px 8px;
  margin-top: 4px;
`;

const MsgActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ $danger }) => ($danger ? '#e53e3e' : '#4b0303')};
  &:hover {
    background: ${({ $danger }) => ($danger ? '#fff0f0' : '#4b030312')};
  }
`;

// ── Resposta inline ──────────────────────────────────────────────────────────

const ReplyBox = styled.div`
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
`;

const ReplyLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #4b0303;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  border: 1.5px solid #ddd;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  font-family: sans-serif;
  line-height: 1.5;
  &:focus { border-color: #4b0303; }
`;

const ReplyActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
`;

const ReplyCancel = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  &:hover { background: #e5e7eb; }
`;

const ReplySend = styled.button`
  background: #4b0303;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { background: #6b0404; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Empty = styled.div`
  text-align: center;
  color: #aaa;
  padding: 48px 0;
  font-size: 14px;
`;

// ── Modal composição ─────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  @media (min-width: 600px) { align-items: center; }
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  @media (min-width: 600px) { border-radius: 20px; }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`margin: 0; font-size: 1.1rem; color: #222;`;

const CloseBtn = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
`;

const RecipRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const RecipBtn = styled.button`
  padding: 10px 6px;
  border: 2px solid ${({ $active }) => ($active ? '#4b0303' : '#eee')};
  background: ${({ $active }) => ($active ? '#4b030318' : '#fafafa')};
  border-radius: 10px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#4b0303' : '#888')};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
`;

const UserList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1.5px solid #ddd;
  border-radius: 10px;
  margin-bottom: 16px;
`;

const UserItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #f3f4f6;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafafa; }
  input { accent-color: #4b0303; width: 16px; height: 16px; flex-shrink: 0; }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1.5px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  font-family: sans-serif;
  line-height: 1.5;
  &:focus { border-color: #4b0303; }
`;

const SendBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #4b0303;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { background: #6b0404; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrBox = styled.div`
  color: #b91c1c;
  font-size: 13px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #fff0f0;
  border-radius: 8px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7)  return d.toLocaleDateString('pt-PT', { weekday: 'long' });
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function MensagensPage() {
  const { token, refreshUnreadMessages } = useUser();
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab]             = useState('recebidas');
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [newCount, setNewCount]   = useState(0);

  // IDs já vistos — para detetar mensagens novas no polling silencioso
  const seenIdsRef = useRef(new Set());

  // Resposta inline
  const [replyingTo, setReplyingTo]   = useState(null);
  const [replyCorpo, setReplyCorpo]   = useState('');
  const [replySending, setReplySending] = useState(false);

  // Modal composição
  const [showModal, setShowModal]         = useState(false);
  const [utilizadores, setUtilizadores]   = useState([]);
  const [loadingUsers, setLoadingUsers]   = useState(false);
  const [corpo, setCorpo]                 = useState('');
  const [tipoDestinatario, setTipo]       = useState('todos');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState('');

  // ── Fetch / Polling ─────────────────────────────────────────────────────────

  const fetchMensagens = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setNewCount(0); }
    try {
      const url = tab === 'enviadas'
        ? `${BACKEND}/components/mensagens.php?tipo=enviadas&_=${Date.now()}`
        : `${BACKEND}/components/mensagens.php?_=${Date.now()}`;
      const { data } = await axios.get(url, { headers });
      const msgs = Array.isArray(data) ? data : [];

      // Detetar mensagens novas (apenas em "Recebidas" e no polling silencioso)
      if (silent && tab === 'recebidas') {
        const novas = msgs.filter(m => !seenIdsRef.current.has(m.id) && !m.lida);
        if (novas.length > 0) setNewCount(prev => prev + novas.length);
      }

      // Registar todos os IDs vistos
      msgs.forEach(m => seenIdsRef.current.add(m.id));
      setMensagens(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, tab]);

  // Fetch inicial ao montar ou mudar de tab
  useEffect(() => {
    seenIdsRef.current = new Set();
    fetchMensagens(false);
  }, [fetchMensagens]);

  // Polling silencioso — pausa quando o separador está escondido
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) fetchMensagens(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMensagens]);

  // ── Utilizadores ────────────────────────────────────────────────────────────

  const fetchUtilizadores = async () => {
    if (utilizadores.length > 0) return;
    setLoadingUsers(true);
    try {
      const { data } = await axios.get(
        `${BACKEND}/components/mensagens.php?utilizadores=1&_=${Date.now()}`, { headers }
      );
      setUtilizadores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ── Ações ───────────────────────────────────────────────────────────────────

  const openModal = () => {
    setCorpo('');
    setTipo('todos');
    setSelectedUsers([]);
    setSubmitError('');
    setShowModal(true);
    fetchUtilizadores();
  };

  const toggleUser = (id) =>
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );

  const handleCardClick = async (msg) => {
    if (replyingTo === msg.id) return; // não fechar ao clicar na área de resposta
    setExpanded(prev => (prev === msg.id ? null : msg.id));
    setReplyingTo(null);
    setReplyCorpo('');
    if (tab === 'recebidas' && !msg.lida) {
      try {
        await axios.put(`${BACKEND}/components/mensagens.php`, { id: msg.id }, { headers });
        setMensagens(prev => prev.map(m => m.id === msg.id ? { ...m, lida: true } : m));
        refreshUnreadMessages();
      } catch (_) {}
    }
  };

  const eliminar = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Eliminar esta mensagem?')) return;
    try {
      await axios.delete(`${BACKEND}/components/mensagens.php`, { data: { id }, headers });
      setMensagens(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao eliminar');
    }
  };

  const abrirResposta = (e, msgId) => {
    e.stopPropagation();
    setReplyingTo(msgId);
    setReplyCorpo('');
  };

  const cancelarResposta = (e) => {
    e.stopPropagation();
    setReplyingTo(null);
    setReplyCorpo('');
  };

  const enviarResposta = async (e, msg) => {
    e.stopPropagation();
    if (!replyCorpo.trim()) return;
    setReplySending(true);
    try {
      await axios.post(
        `${BACKEND}/components/mensagens.php`,
        { corpo: replyCorpo, destinatarios: [msg.remetente_id] },
        { headers }
      );
      setReplyingTo(null);
      setReplyCorpo('');
      // Atualiza enviadas se o utilizador trocar de tab
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao enviar resposta');
    } finally {
      setReplySending(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!corpo.trim()) return;
    const destinatarios = tipoDestinatario === 'todos' ? 'todos' : selectedUsers;
    if (tipoDestinatario !== 'todos' && selectedUsers.length === 0) {
      setSubmitError('Seleciona pelo menos um utilizador.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await axios.post(
        `${BACKEND}/components/mensagens.php`,
        { corpo, destinatarios },
        { headers }
      );
      setShowModal(false);
      if (tab === 'enviadas') fetchMensagens(false);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Erro ao enviar mensagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = mensagens.filter(m => !m.lida).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Wrap>

      <TabBar>
        <Tab $active={tab === 'recebidas'} onClick={() => setTab('recebidas')}>
          <MdMail size={16} />
          Recebidas
          {tab === 'recebidas' && unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </Tab>
        <Tab $active={tab === 'enviadas'} onClick={() => setTab('enviadas')}>
          <MdMailOutline size={16} />
          Enviadas
        </Tab>
      </TabBar>

      {/* Banner de novas mensagens */}
      {newCount > 0 && tab === 'recebidas' && (
        <NewBanner onClick={() => { setNewCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span>
            {newCount} nova{newCount > 1 ? 's' : ''} mensagem{newCount > 1 ? 's' : ''} recebida{newCount > 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Tocar para ver ↑</span>
        </NewBanner>
      )}

      <TopBar>
        <AddBtn onClick={openModal}>
          <MdAdd size={18} /> Nova mensagem
        </AddBtn>
      </TopBar>

      {loading ? (
        <Empty>A carregar...</Empty>
      ) : mensagens.length === 0 ? (
        <Empty>
          {tab === 'recebidas'
            ? 'Não tens mensagens recebidas.'
            : 'Ainda não enviaste nenhuma mensagem.'}
        </Empty>
      ) : (
        mensagens.map(msg => {
          const isExpanded = expanded === msg.id;
          const lida = tab === 'enviadas' || msg.lida;

          const remetente = tab === 'recebidas'
            ? msg.remetente_nome
            : msg.para_todos
              ? 'Para todos os utilizadores'
              : (msg.destinatarios || []).join(', ') || '—';

          return (
            <MsgCard key={msg.id} $lida={lida} onClick={() => handleCardClick(msg)}>
              <MsgHeader>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MsgFrom $lida={lida}>{remetente}</MsgFrom>
                  {tab === 'recebidas' && msg.para_todos && (
                    <Tag><MdGroup size={11} /> Para todos</Tag>
                  )}
                </div>
                <MsgTime>{formatTime(msg.created_at)}</MsgTime>
              </MsgHeader>

              <MsgBody $lida={lida} $expanded={isExpanded}>
                {msg.corpo}
              </MsgBody>

              {isExpanded && (
                <>
                  <MsgActions>
                    {tab === 'recebidas' && (
                      <ActionBtn onClick={(e) => abrirResposta(e, msg.id)}>
                        <MdReply size={15} /> Responder
                      </ActionBtn>
                    )}
                    <ActionBtn $danger onClick={(e) => eliminar(e, msg.id)}>
                      <MdDelete size={15} /> Eliminar
                    </ActionBtn>
                  </MsgActions>

                  {/* Resposta inline */}
                  {replyingTo === msg.id && (
                    <ReplyBox onClick={e => e.stopPropagation()}>
                      <ReplyLabel>
                        <MdReply size={14} />
                        Responder a {msg.remetente_nome}
                      </ReplyLabel>
                      <ReplyTextarea
                        autoFocus
                        placeholder="Escreve a tua resposta..."
                        value={replyCorpo}
                        onChange={e => setReplyCorpo(e.target.value)}
                      />
                      <ReplyActions>
                        <ReplyCancel onClick={cancelarResposta}>Cancelar</ReplyCancel>
                        <ReplySend
                          onClick={(e) => enviarResposta(e, msg)}
                          disabled={replySending || !replyCorpo.trim()}
                        >
                          <MdSend size={14} />
                          {replySending ? 'A enviar...' : 'Enviar'}
                        </ReplySend>
                      </ReplyActions>
                    </ReplyBox>
                  )}
                </>
              )}
            </MsgCard>
          );
        })
      )}

      {/* ── Modal composição ──────────────────────────────────────────────── */}
      {showModal && (
        <Overlay onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <Modal>
            <ModalHeader>
              <ModalTitle>Nova mensagem</ModalTitle>
              <CloseBtn onClick={() => setShowModal(false)}><MdClose size={18} /></CloseBtn>
            </ModalHeader>

            <form onSubmit={enviar}>
              <FieldLabel>Para</FieldLabel>
              <RecipRow>
                <RecipBtn
                  type="button"
                  $active={tipoDestinatario === 'todos'}
                  onClick={() => { setTipo('todos'); setSelectedUsers([]); }}
                >
                  <MdGroup size={20} />
                  Todos
                </RecipBtn>
                <RecipBtn
                  type="button"
                  $active={tipoDestinatario === 'selecionar'}
                  onClick={() => setTipo('selecionar')}
                >
                  <MdPeople size={20} />
                  Selecionar
                </RecipBtn>
                <RecipBtn
                  type="button"
                  $active={tipoDestinatario === 'um'}
                  onClick={() => { setTipo('um'); setSelectedUsers([]); }}
                >
                  <MdPerson size={20} />
                  Um utilizador
                </RecipBtn>
              </RecipRow>

              {(tipoDestinatario === 'selecionar' || tipoDestinatario === 'um') && (
                loadingUsers
                  ? <Empty style={{ padding: '20px 0' }}>A carregar utilizadores...</Empty>
                  : (
                    <UserList>
                      {utilizadores.map(u => (
                        <UserItem key={u.id}>
                          <input
                            type={tipoDestinatario === 'um' ? 'radio' : 'checkbox'}
                            name="destinatario"
                            checked={selectedUsers.includes(u.id)}
                            onChange={() => {
                              if (tipoDestinatario === 'um') {
                                setSelectedUsers([u.id]);
                              } else {
                                toggleUser(u.id);
                              }
                            }}
                          />
                          {u.name}
                        </UserItem>
                      ))}
                    </UserList>
                  )
              )}

              <FieldLabel style={{ marginTop: 4 }}>Mensagem</FieldLabel>
              <Textarea
                placeholder="Escreve a tua mensagem..."
                value={corpo}
                onChange={e => setCorpo(e.target.value)}
                required
              />

              {submitError && <ErrBox>⚠ {submitError}</ErrBox>}

              <SendBtn type="submit" disabled={submitting || !corpo.trim()}>
                <MdSend size={18} />
                {submitting ? 'A enviar...' : 'Enviar mensagem'}
              </SendBtn>
            </form>
          </Modal>
        </Overlay>
      )}
    </Wrap>
  );
}
