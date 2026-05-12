import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import {
  MdAdd, MdDelete, MdClose, MdChurch, MdSchool, MdDirectionsWalk,
  MdFlight, MdSportsSoccer, MdWeekend, MdPeople, MdCategory,
  MdAccessTime, MdSelfImprovement, MdCalendarToday
} from 'react-icons/md';
import { useUser } from '../../../UserContext';

const BACKEND = 'https://snref-backend-8d85ffa999cd.herokuapp.com';

const TIPOS = [
  { value: 'Missa',      label: 'Missa',       Icon: MdChurch,          color: '#92400e' },
  { value: 'Confissão',  label: 'Confissão',   Icon: MdSelfImprovement, color: '#6d28d9' },
  { value: 'Aula',       label: 'Aula',         Icon: MdSchool,          color: '#1d4ed8' },
  { value: 'Explicação', label: 'Explicação',   Icon: MdPeople,          color: '#0e7490' },
  { value: 'Desporto',   label: 'Desporto',     Icon: MdSportsSoccer,    color: '#15803d' },
  { value: 'Viagem',     label: 'Viagem',       Icon: MdFlight,          color: '#c2410c' },
  { value: 'Passeio',    label: 'Passeio',      Icon: MdDirectionsWalk,  color: '#4d7c0f' },
  { value: 'Lazer',      label: 'Lazer',        Icon: MdWeekend,         color: '#b45309' },
  { value: 'Outro',      label: 'Outro',        Icon: MdCategory,        color: '#4b5563' },
];

function getTipo(value) {
  return TIPOS.find(t => t.value === value) || TIPOS[TIPOS.length - 1];
}

function getLocalDateStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateHeader(dateStr, todayStr, tomorrowStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const weekday = d.toLocaleDateString('pt-PT', { weekday: 'long' });
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  if (dateStr === todayStr)    return `Hoje · ${cap(weekday)}`;
  if (dateStr === tomorrowStr) return `Amanhã · ${cap(weekday)}`;
  return cap(d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
}

// ─── Estilos ────────────────────────────────────────────────────────────────

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  font-family: sans-serif;
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

const EmptyState = styled.div`
  text-align: center;
  color: #aaa;
  padding: 40px 0;
  font-size: 14px;
`;

const DateGroup = styled.div`
  margin-bottom: 20px;
`;

const DateLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $past }) => $past ? '#aaa' : '#4b0303'};
  background: ${({ $today }) => $today ? '#4b030310' : 'transparent'};
  border-left: 3px solid ${({ $past }) => $past ? '#ddd' : '#4b0303'};
  padding: 4px 10px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActivityCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  border-left: 4px solid ${({ $color }) => $color};
  opacity: ${({ $ativo }) => ($ativo ? 1 : 0.45)};
  transition: opacity 0.2s;
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityName = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #222;
`;

const ActivitySub = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const ActivityActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const Toggle = styled.label`
  position: relative;
  width: 42px;
  height: 24px;
  cursor: pointer;
  input { opacity: 0; width: 0; height: 0; }
  span {
    position: absolute;
    inset: 0;
    background: ${({ $checked }) => ($checked ? '#4b0303' : '#ccc')};
    border-radius: 12px;
    transition: background 0.2s;
    &::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      top: 3px;
      left: ${({ $checked }) => ($checked ? '21px' : '3px')};
      transition: left 0.2s;
    }
  }
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  &:hover { color: #e53e3e; background: #fff0f0; }
`;

// ─── Modal ───────────────────────────────────────────────────────────────────

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
  max-width: 480px;
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

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #222;
`;

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

const Field = styled.div`
  margin-bottom: 16px;
  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #555;
    margin-bottom: 6px;
  }
  input, select {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #ddd;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    &:focus { border-color: #4b0303; }
  }
`;

const DateTimeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const TypeBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border: 2px solid ${({ $active, $color }) => ($active ? $color : '#eee')};
  background: ${({ $active, $color }) => ($active ? $color + '18' : '#fafafa')};
  border-radius: 10px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active, $color }) => ($active ? $color : '#888')};
  transition: all 0.15s;
`;

const SubmitBtn = styled.button`
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
  &:hover { background: #6b0404; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  color: #b91c1c;
  font-size: 13px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #fff0f0;
  border-radius: 8px;
`;

// ─── Componente ──────────────────────────────────────────────────────────────

export default function AtividadesPage() {
  const { token } = useUser();

  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    tipo: '',
    titulo: '',
    data_atividade: getLocalDateStr(),
    hora_inicio: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAtividades = useCallback(async () => {
    setFetchError('');
    try {
      const { data } = await axios.get(`${BACKEND}/components/atividades.php`, { headers });
      setAtividades(data);
    } catch (err) {
      console.error(err);
      setFetchError(err.response?.data?.error || err.message || 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAtividades(); }, [fetchAtividades]);

  const todayStr    = getLocalDateStr();
  const tomorrowStr = getTomorrowStr();

  // Agrupa por data
  const grouped = {};
  [...atividades]
    .sort((a, b) => `${a.data_atividade} ${a.hora_inicio}`.localeCompare(`${b.data_atividade} ${b.hora_inicio}`))
    .forEach(atv => {
      if (!grouped[atv.data_atividade]) grouped[atv.data_atividade] = [];
      grouped[atv.data_atividade].push(atv);
    });
  const dateKeys = Object.keys(grouped).sort();

  const toggleAtivo = async (atv) => {
    setAtividades(prev =>
      prev.map(a => a.id === atv.id ? { ...a, ativo: !a.ativo } : a)
    );
    await axios.put(`${BACKEND}/components/atividades.php`,
      { id: atv.id, ativo: !atv.ativo }, { headers });
  };

  const deletar = async (id) => {
    if (!window.confirm('Eliminar esta atividade?')) return;
    setAtividades(prev => prev.filter(a => a.id !== id));
    await axios.delete(`${BACKEND}/components/atividades.php`,
      { data: { id }, headers });
  };

  const openModal = () => {
    setForm({ tipo: '', titulo: '', data_atividade: getLocalDateStr(), hora_inicio: '' });
    setSubmitError('');
    setShowModal(true);
  };

  const submeter = async (e) => {
    e.preventDefault();
    if (!form.tipo || !form.data_atividade || !form.hora_inicio) return;

    const today = getLocalDateStr();
    if (form.data_atividade < today) {
      setSubmitError('Não é possível criar uma atividade numa data já passada.');
      return;
    }
    if (form.data_atividade === today) {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      if (form.hora_inicio <= currentTime) {
        setSubmitError('Não é possível criar uma atividade a uma hora já passada.');
        return;
      }
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await axios.post(`${BACKEND}/components/atividades.php`, form, { headers });
      setShowModal(false);
      fetchAtividades();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.error || err.message || 'Erro ao guardar atividade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page style={{ padding: 0 }}>

      <TopBar>
        <AddBtn onClick={openModal}>
          <MdAdd size={18} /> Adicionar
        </AddBtn>
      </TopBar>

      {fetchError && <EmptyState style={{ color: '#b91c1c' }}>⚠ {fetchError}</EmptyState>}

      {loading ? (
        <EmptyState>A carregar...</EmptyState>
      ) : !fetchError && dateKeys.length === 0 ? (
        <EmptyState>
          Nenhuma atividade registada.<br />
          Toca em "Adicionar" para criar uma.
        </EmptyState>
      ) : (
        dateKeys.map(dateStr => {
          const isPast  = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          return (
            <DateGroup key={dateStr}>
              <DateLabel $past={isPast} $today={isToday}>
                <MdCalendarToday size={13} />
                {formatDateHeader(dateStr, todayStr, tomorrowStr)}
              </DateLabel>

              {grouped[dateStr].map(atv => {
                const tipo = getTipo(atv.tipo);
                const { Icon } = tipo;
                const nome = atv.titulo || atv.tipo;
                return (
                  <ActivityCard key={atv.id} $color={tipo.color} $ativo={atv.ativo}>
                    <ActivityIcon $color={tipo.color}>
                      <Icon size={22} />
                    </ActivityIcon>
                    <ActivityInfo>
                      <ActivityName>{nome}</ActivityName>
                      <ActivitySub>
                        <MdAccessTime size={13} />
                        {atv.hora_inicio}
                        {!atv.ativo && ' · inativa'}
                      </ActivitySub>
                    </ActivityInfo>
                    <ActivityActions>
                      <Toggle $checked={atv.ativo} title={atv.ativo ? 'Desativar' : 'Ativar'}>
                        <input
                          type="checkbox"
                          checked={atv.ativo}
                          onChange={() => toggleAtivo(atv)}
                        />
                        <span />
                      </Toggle>
                      <DeleteBtn onClick={() => deletar(atv.id)} title="Eliminar">
                        <MdDelete size={18} />
                      </DeleteBtn>
                    </ActivityActions>
                  </ActivityCard>
                );
              })}
            </DateGroup>
          );
        })
      )}

      {/* Modal — adicionar atividade */}
      {showModal && (
        <Overlay onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <Modal>
            <ModalHeader>
              <ModalTitle>Nova Atividade</ModalTitle>
              <CloseBtn onClick={() => setShowModal(false)}><MdClose size={18} /></CloseBtn>
            </ModalHeader>

            <form onSubmit={submeter}>
              <Field>
                <label>Tipo de atividade</label>
                <TypeGrid>
                  {TIPOS.map(t => (
                    <TypeBtn
                      key={t.value}
                      type="button"
                      $active={form.tipo === t.value}
                      $color={t.color}
                      onClick={() => setForm(f => ({ ...f, tipo: t.value }))}
                    >
                      <t.Icon size={20} />
                      {t.label}
                    </TypeBtn>
                  ))}
                </TypeGrid>
              </Field>

              {form.tipo === 'Outro' && (
                <Field>
                  <label>Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Reunião, Médico..."
                    value={form.titulo}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  />
                </Field>
              )}

              <DateTimeRow>
                <Field>
                  <label>Data</label>
                  <input
                    type="date"
                    required
                    min={getLocalDateStr()}
                    value={form.data_atividade}
                    onChange={e => setForm(f => ({ ...f, data_atividade: e.target.value }))}
                  />
                </Field>
                <Field>
                  <label>Hora</label>
                  <input
                    type="time"
                    required
                    value={form.hora_inicio}
                    onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                  />
                </Field>
              </DateTimeRow>

              {submitError && <ErrorBox>⚠ {submitError}</ErrorBox>}

              <SubmitBtn
                type="submit"
                disabled={!form.tipo || !form.data_atividade || !form.hora_inicio || submitting}
              >
                {submitting ? 'A guardar...' : 'Guardar atividade'}
              </SubmitBtn>
            </form>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}
