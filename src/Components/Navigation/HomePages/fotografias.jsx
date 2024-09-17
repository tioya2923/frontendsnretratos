import React, { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import "../../Styles/fotografias.css";

// Defina o elemento principal da aplicação
Modal.setAppElement('#root');

const Fotografias = () => {
    const [pastas, setPastas] = useState([]);
    const [pastaSelecionada, setPastaSelecionada] = useState(null);
    const [fotoSelecionada, setFotoSelecionada] = useState(null);
    const [fotoIndex, setFotoIndex] = useState(0);
    const [playingVideo, setPlayingVideo] = useState(null);
    const videoRefs = useRef([]);

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
    }, [backendUrl]);

    const handlePastaClick = (pasta) => {
        setPastaSelecionada(pasta);
    };

    const handleFotoClick = (index) => {
        setFotoIndex(index);
        setFotoSelecionada(pastaSelecionada.fotos[index]);
    };

    const closeModal = () => {
        setFotoSelecionada(null);
        if (playingVideo) {
            playingVideo.pause();
            setPlayingVideo(null);
        }
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

    const handleSwipe = (direction) => {
        if (direction === 'left') {
            nextFoto();
        } else if (direction === 'right') {
            prevFoto();
        }
    };

    const handleVideoClick = (video) => {
        if (playingVideo && playingVideo !== video) {
            playingVideo.pause();
        }
        video.classList.add('video-fullscreen');
        setPlayingVideo(video);
    };

    const handlePlayPauseClick = (video) => {
        if (video.paused) {
            video.play();
            setPlayingVideo(video);
        } else {
            video.pause();
            setPlayingVideo(null);
        }
    };

    return (
        <div>           
            {pastaSelecionada === null ? (
                <div className='carousel-pasta'>
                    {pastas.map((pasta, index) => (
                        <div key={index} className='pasta' onClick={() => handlePastaClick(pasta)}>
                            <div className='pasta-text'>{pasta.nome}</div>
                            <div>{pasta.data_criacao.split(' ')[0]}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>{pastaSelecionada.nome}</h2>
                    <div className='carousel-fotos'>
                        {pastaSelecionada.fotos
                            .sort((a, b) => a.tipo === 'video' ? 1 : -1) // Ordena colocando vídeos no fim
                            .map((foto, index) => (
                                <div key={index} className='item' onClick={() => handleFotoClick(index)}>
                                    {foto.tipo === 'foto' ? (
                                        <img className='card-foto' src={foto.arquivo} alt={foto.nome} />
                                    ) : (
                                        <div className="video-container">
                                            <video 
                                                className='card-foto' 
                                                ref={el => videoRefs.current[index] = el}
                                                controls={false} // Desativa os controles no modo miniatura
                                                onClick={() => handleVideoClick(videoRefs.current[index])}
                                            >
                                                <source src={foto.arquivo} type="video/mp4" />
                                            </video>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                    <button onClick={() => setPastaSelecionada(null)} className="voltar-button">Voltar</button>
                </div>
            )}

            {fotoSelecionada && (
                <Modal 
                    isOpen={true} 
                    onRequestClose={closeModal} 
                    className="modal"
                >
                    <div
                        onTouchStart={(e) => {
                            const touchStartX = e.changedTouches[0].screenX;
                            e.target.ontouchend = (ev) => {
                                const touchEndX = ev.changedTouches[0].screenX;
                                if (touchStartX - touchEndX > 50) {
                                    handleSwipe('left');
                                } else if (touchEndX - touchStartX > 50) {
                                    handleSwipe('right');
                                }
                            };
                        }}
                    >
                        <button onClick={prevFoto} className="nav-button left">
                            <svg viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        {fotoSelecionada.tipo === 'foto' ? (
                            <img src={fotoSelecionada.arquivo} alt={fotoSelecionada.nome} className="modal-foto" />
                        ) : (
                            <div className="video-container">
                                <video 
                                    controls 
                                    className="modal-foto" 
                                    ref={el => videoRefs.current[fotoIndex] = el}
                                    onClick={() => handlePlayPauseClick(videoRefs.current[fotoIndex])}
                                >
                                    <source src={fotoSelecionada.arquivo} type="video/mp4" />
                                </video>
                                <div 
                                    className="play-pause-icon" 
                                    onClick={() => handlePlayPauseClick(videoRefs.current[fotoIndex])}
                                >
                                    ▶️
                                </div>
                            </div>
                        )}
                        <button onClick={nextFoto} className="nav-button right">
                            <svg viewBox="0 0 24 24">
                                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                            </svg>
                        </button>
                        <button onClick={closeModal} className="close-button">Fechar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Fotografias;
