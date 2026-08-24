import React, { useEffect, useState, useCallback } from 'react';
import '../../Styles/AniversariosHoje.css';

const backendUrl = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

function AniversariosHoje() {
  const [natalicio, setNatalicio] = useState([]);
  const [sacerdotal, setSacerdotal] = useState([]);

  const fetchAniversarios = useCallback(() => {
    return fetch(`${backendUrl}/components/aniversarios_hoje.php`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setNatalicio(data.natalicio || []);
        setSacerdotal(data.sacerdotal || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAniversarios();

    // Baixa frequência de propósito: a lista só muda com a virada do dia,
    // mas mantém-se correta para quem deixa a aba aberta durante a noite.
    const interval = setInterval(() => {
      if (!document.hidden) fetchAniversarios();
    }, 300000);
    const onVisible = () => { if (!document.hidden) fetchAniversarios(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchAniversarios]);

  if (natalicio.length === 0 && sacerdotal.length === 0) return null;

  return (
    <div className="aniversarios-hoje">
      {natalicio.length > 0 && (
        <p className="aniversarios-hoje-linha">
          🎂 <strong>Aniversariante do Dia:</strong> {natalicio.map((u) => u.name).join(', ')}
        </p>
      )}
      {sacerdotal.length > 0 && (
        <p className="aniversarios-hoje-linha">
          ⛪ <strong>Aniversariante Sacerdotal do Dia:</strong> {sacerdotal.map((u) => u.name).join(', ')}
        </p>
      )}
    </div>
  );
}

export default AniversariosHoje;
