import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from 'react-toastify';
import "./DeletePhoto.css";

const DeletePhoto = () => {
    const [pastas, setPastas] = useState([]);
    const [pastaSelecionada, setPastaSelecionada] = useState(null);
    const [fotoSelecionada, setFotoSelecionada] = useState(null);
    const [fotoIndex, setFotoIndex] = useState(0);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [file, setFile] = useState(null);
    const [fotosSelecionadas, setFotosSelecionadas] = useState([]);

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

    const handlePlay = (video) => {
        if (playingVideo && playingVideo !== video) {
            playingVideo.pause();
        }
        setPlayingVideo(video);
    };

    const handleDeletePasta = async (pastaId) => {
        const response = await fetch(`${backendUrl}components/deletePasta.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `pasta_id=${pastaId}`,
        });

        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
        } else {
            toast.success(data.message || 'Ação feita com sucesso');
            setPastas(pastas.filter(pasta => pasta.id !== pastaId));
        }
    };

    const handleDeleteFotos = async () => {
        for (const fotoId of fotosSelecionadas) {
            const foto = pastaSelecionada.fotos.find(foto => foto.id === fotoId);
            const response = await fetch(`${backendUrl}components/deleteFoto.php`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `foto_id=${fotoId}&foto_key=${foto.arquivo}`,
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.error || 'Ocorreu um erro');
                return;
            }
        }

        setPastaSelecionada({
            ...pastaSelecionada,
            fotos: pastaSelecionada.fotos.filter(foto => !fotosSelecionadas.includes(foto.id))
        });

        setFotosSelecionadas([]);
        toast.success('Arquivos apagados com sucesso');
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm'];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file['type'];
            if (!validImageTypes.includes(fileType)) {
                toast.error("Formato de arquivo inválido. Por favor, selecione uma imagem ou vídeo.");
                return;
            }
        }
        setFile(files);
    };

    const handleUpload = () => {
        if (!file) {
            toast.error("Por favor, selecione um arquivo para carregar.");
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < file.length; i++) {
            formData.append('file[]', file[i]);
        }
        formData.append('pasta_id', pastaSelecionada.id);

        fetch(`${backendUrl}components/upload.php`, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw response;
                }
            })
            .then(data => {
                toast.success(data.message);
                setPastaSelecionada({
                    ...pastaSelecionada,
                    fotos: [...pastaSelecionada.fotos, { arquivo: URL.createObjectURL(new Blob([file[0]])), nome: file[0].name }]
                });
                setFile(null); // Limpa o estado do arquivo após o upload bem-sucedido
            })
            .catch(async errorResponse => {
                let error;
                if (errorResponse instanceof Response) {
                    error = await errorResponse.json();
                } else {
                    error = { error: errorResponse.message };
                }
                toast.error(error.error);
            });

    };

    return (
        <div>
            <div className='container'>
                <h2>Editar ficheiros</h2>
            </div>
            {pastaSelecionada === null ? (
                <div className='carousel-pasta'>
                    {pastas.map((pasta, index) => (
                        <div key={index} className='pasta' onClick={() => handlePastaClick(pasta)}>
                            <div className='pasta-text'>{pasta.nome}</div>
                            <div>{pasta.data_criacao.split(' ')[0]}</div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePasta(pasta.id); }} className="buttonsPasta">Apagar</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>{pastaSelecionada.nome}</h2>
                    <div className='carousel-fotos'>
                        {pastaSelecionada.fotos.map((foto, index) => (
                            <div key={index} className='item'>
                                <input
                                    type="checkbox"
                                    checked={fotosSelecionadas.includes(foto.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFotosSelecionadas([...fotosSelecionadas, foto.id]);
                                        } else {
                                            setFotosSelecionadas(fotosSelecionadas.filter(id => id !== foto.id));
                                        }
                                    }}
                                />
                                {foto.tipo === 'foto' ? (
                                    <img className='card-foto' src={foto.arquivo} alt={foto.nome} />
                                ) : (
                                    <video className='card-foto' controls onPlay={e => handlePlay(e.target)}>
                                        <source src={foto.arquivo} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="buttons">
                        <input type="file" id="file" name="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
                        <button onClick={handleUpload}>Adicionar Ficheiros</button>
                        <button onClick={handleDeleteFotos}>Apagar Ficheiros Selecionados</button>
                        <button onClick={() => setPastaSelecionada(null)}>Voltar</button>
                    </div>
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
                            Your browser does not support the video tag.
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

export default DeletePhoto;
