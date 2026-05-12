import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import {
  MdAdd, MdDelete, MdClose, MdChurch, MdSchool, MdDirectionsWalk,
  MdFlight, MdSportsSoccer, MdWeekend, MdPeople, MdCategory,
  MdAccessTime, MdSelfImprovement
} from 'react-icons/md';
import { useUser } from '../../../UserContext';

const BACKEND = 'https://snref-backend-8d85ffa999cd.herokuapp.com';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

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

// ─── Estilos ────────────────────────────────────────────────────────────────

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  font-family: sans-serif;
`;

const PageTitle = styled.h1`
  font-size: 1.4rem;
  color: #4b0303;
  margin-bottom: 16px;
  text-align: center;
`;

const DayTabs = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 6px;
  padding-bottom: 4px;
  margin-bottom: 20px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const DayTab = styled.button`
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 20px;
  border: 2px solid ${({ $active }) => ($active ? '#4b0303' : '#ddd')};
  background: ${({ $active }) => ($active ? '#4b0303' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#555')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  ${({ $today }) => $today && `
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 5px;
      height: 5px;
      background: #4b0303;
      border-radius: 50%;
    }
  `}
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const DayTitle = styled.h2`
  font-size: 1.1rem;
  color: #333;
  margin: 0;
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

const ActivityCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  border-left: 4px solid ${({ $color }) => $color};
  opacity: ${({ $ativo }) => ($ativo ? 1 : 0.5)};
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

// ─── Modal ──────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 600px) {
    align-items: center;
  }
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 600px) {
    border-radius: 20px;
  }
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

const DayCheckboxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const DayChip = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1.5px solid ${({ $checked }) => ($checked ? '#4b0303' : '#ddd')};
  background: ${({ $checked }) => ($checked ? '#4b030315' : '#fafafa')};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $checked }) => ($checked ? '#4b0303' : '#888')};
  cursor: pointer;
  user-select: none;
  input { display: none; }
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

// ─── Componente principal ────────────────────────────────────────────────────

export default function AtividadesPage() {
  const { token } = useUser();
  const hoje = new Date().getDay(); // 0=Dom, 6=Sab

  const [diaAtivo, setDiaAtivo]     = useState(hoje);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);

  const [form, setForm] = useState({
    tipo: '',
    titulo: '',
    dias: [],
    hora_inicio: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAtividades = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND}/components/atividades.php`, { headers });
      setAtividades(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAtividades(); }, [fetchAtividades]);

  const atividadesDoDia = atividades
    .filter(a => a.dia_semana === diaAtivo)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

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
    setForm({ tipo: '', titulo: '', dias: [diaAtivo], hora_inicio: '' });
    setShowModal(true);
  };

  const toggleDia = (d) => {
    setForm(f => ({
      ...f,
      dias: f.dias.includes(d) ? f.dias.filter(x => x !== d) : [...f.dias, d]
    }));
  };

  const submeter = async (e) => {
    e.preventDefault();
    if (!form.tipo || !form.hora_inicio || form.dias.length === 0) return;
    try {
      await axios.post(`${BACKEND}/components/atividades.php`, form, { headers });
      setShowModal(false);
      fetchAtividades();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Page style={{ padding: 0 }}>

      {/* Tabs dos dias */}
      <DayTabs>
        {DIAS.map((d, i) => (
          <DayTab
            key={i}
            $active={diaAtivo === i}
            $today={hoje === i}
            onClick={() => setDiaAtivo(i)}
          >
            {d}
          </DayTab>
        ))}
      </DayTabs>

      {/* Cabeçalho do dia */}
      <DayHeader>
        <DayTitle>{DIAS_FULL[diaAtivo]}</DayTitle>
        <AddBtn onClick={openModal}>
          <MdAdd size={18} /> Adicionar
        </AddBtn>
      </DayHeader>

      {/* Lista de atividades */}
      {loading ? (
        <EmptyState>A carregar...</EmptyState>
      ) : atividadesDoDia.length === 0 ? (
        <EmptyState>
          Nenhuma atividade para {DIAS_FULL[diaAtivo].toLowerCase()}.<br />
          Toca em "Adicionar" para criar uma.
        </EmptyState>
      ) : (
        atividadesDoDia.map(atv => {
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

              <Field>
                <label>Hora</label>
                <input
                  type="time"
                  required
                  value={form.hora_inicio}
                  onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                />
              </Field>

              <Field>
                <label>Dias da semana</label>
                <DayCheckboxes>
                  {DIAS.map((d, i) => (
                    <DayChip key={i} $checked={form.dias.includes(i)}>
                      <input
                        type="checkbox"
                        checked={form.dias.includes(i)}
                        onChange={() => toggleDia(i)}
                      />
                      {d}
                    </DayChip>
                  ))}
                </DayCheckboxes>
              </Field>

              <SubmitBtn
                type="submit"
                disabled={!form.tipo || !form.hora_inicio || form.dias.length === 0}
              >
                Guardar atividade
              </SubmitBtn>
            </form>
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}
