import React, { useEffect, useState} from "react";
import Modal from "react-modal";
import "../../Styles/fotografias.css";

const Fotografias = () => {
    const [pastas, setPastas] = useState([]);
    const [pastaSelecionada, setPastaSelecionada] = useState(null);
    const [fotoSelecionada, setFotoSelecionada] = useState(null);
    const [fotoIndex, setFotoIndex] = useState(0);
    const [playingVideo, setPlayingVideo] = useState(null); // Novo estado para o vídeo que está sendo reproduzido

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${backendUrl}components/fotografias.php`, { method: "GET" });

            if (response.ok) {
                const data = await response.json();
                setPastas(data);
            } else {
                console.error("Erro: " + response.status);
            }
        };
        fetchData();
    }, [ backendUrl]);

    const handlePastaClick = (pasta) => {
        setPastaSelecionada(pasta);
    };

    const handleFotoClick = (index) => {
        setFotoIndex(index);
        setFotoSelecionada(pastaSelecionada.fotos[index]);
    };

    const closeModal = () => {
        setFotoSelecionada(null);
    };

    const nextFoto = () => {
        const newIndex = (fotoIndex + 1) % pastaSelecionada.fotos.length;
        setFotoIndex(newIndex);
        setFotoSelecionada(pastaSelecionada.fotos[newIndex]);
    };

    const prevFoto = () => {
        const newIndex = (fotoIndex - 1 + pastaSelecionada.fotos.length) % pastaSelecionada.fotos.length;
        setFotoIndex(newIndex);
        setFotoSelecionada(pastaSelecionada.fotos[newIndex]);
    };

    const handlePlay = (video) => { // Novo manipulador de evento para quando um vídeo começa a ser reproduzido
        if (playingVideo && playingVideo !== video) {
            playingVideo.pause();
        }
        setPlayingVideo(video);
    };

    return (
        <div>
            <div className='container'>
                <h2>Imagens e Vídeos da Comunidade Paroquial de São Nicolau</h2>
            </div>
            {pastaSelecionada === null ? (
                <div className='carousel-pasta'>
                    {pastas.map((pasta, index) => (
                        <div key={index} className='pasta' onClick={() => handlePastaClick(pasta)}>
                            <div className='pasta-text'>{pasta.nome}</div>
                            <div>{pasta.data_criacao.split(' ')[0]}</div> {/* Modifique esta linha */}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>{pastaSelecionada.nome}</h2>
                    <div className='carousel-fotos'>
                        {pastaSelecionada.fotos.map((foto, index) => (
                            <div key={index} className='item' onClick={() => handleFotoClick(index)}>
                                {foto.tipo === 'foto' ? (
                                    <img className='card-foto' src={foto.arquivo} alt={foto.nome} />
                                ) : (
                                    <video className='card-foto' controls onPlay={e => handlePlay(e.target)}>
                                        <source src={foto.arquivo} type="video/mp4" />
                                       
                                    </video>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setPastaSelecionada(null)}className="voltar-button">Voltar</button>
                </div>
            )}

            {fotoSelecionada && (
                <Modal isOpen={true} onRequestClose={closeModal} className="modal">
                    <button onClick={prevFoto} className="nav-button left">
                        <svg viewBox="0 0 24 24">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    {fotoSelecionada.tipo === 'foto' ? (
                        <img src={fotoSelecionada.arquivo} alt={fotoSelecionada.nome} className="modal-foto" />
                    ) : (
                        <video controls className="modal-foto" onPlay={e => handlePlay(e.target)}>
                            <source src={fotoSelecionada.arquivo} type="video/mp4" />
                            
                        </video>
                    )}
                    <button onClick={nextFoto} className="nav-button right">
                        <svg viewBox="0 0 24 24">
                            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                        </svg>
                    </button>
                    <button onClick={closeModal} className="close-button">Fechar</button>
                </Modal>
            )}
        </div>
    );
};

export default Fotografias;
