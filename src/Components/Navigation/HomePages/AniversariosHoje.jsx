import React, { useEffect, useState } from 'react';
import '../../Styles/AniversariosHoje.css';

const backendUrl = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

function AniversariosHoje() {
  const [natalicio, setNatalicio] = useState([]);
  const [sacerdotal, setSacerdotal] = useState([]);

  useEffect(() => {
    let cancelado = false;

    fetch(`${backendUrl}/components/aniversarios_hoje.php`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelado) return;
        setNatalicio(data.natalicio || []);
        setSacerdotal(data.sacerdotal || []);
      })
      .catch(() => {});

    return () => { cancelado = true; };
  }, []);

  if (natalicio.length === 0 && sacerdotal.length === 0) return null;

  return (
    <div className="aniversarios-hoje">
      {natalicio.length > 0 && (
        <p className="aniversarios-hoje-linha">
          🎂 <strong>Aniversário hoje:</strong> {natalicio.map((u) => u.name).join(', ')} — vamos parabenizá-lo!
        </p>
      )}
      {sacerdotal.length > 0 && (
        <p className="aniversarios-hoje-linha">
          ⛪ <strong>Aniversário Sacerdotal hoje:</strong> {sacerdotal.map((u) => u.name).join(', ')} — vamos parabenizá-lo!
        </p>
      )}
    </div>
  );
}

export default AniversariosHoje;
