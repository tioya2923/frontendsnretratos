import React, { useRef, useState } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import '../Styles/InsertVideos.css'

function InsertVideos() {
    const fileInput = useRef(null);
    const [result, setResult] = useState("");
    const [videoURL, setVideoURL] = useState("");
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nome", e.target.nome.value);
        formData.append("video", fileInput.current.files[0]);
        formData.append("descricao", e.target.descricao.value);

        axios.post(`${backendUrl}components/insertVideos.php`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity

        })
            .then((response) => {
                setResult(response.data);
                e.target.nome.value = "";
                e.target.descricao.value = "";
                fileInput.current.value = null;
                setVideoURL("");
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (window.FileReader) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setVideoURL(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            console.error("O navegador não suporta FileReader.");
        }
    };

    return (
        <div className="VideoForm">
            <h1>Selecione o vídeo</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" id="video" name="video" accept="video/*" ref={fileInput} onChange={handleFileChange} />
                <br />
                <input type="text" id="nome" name="nome" placeholder="Nome do vídeo" />
                <br />
                <textarea id="descricao" name="descricao" placeholder="Texto para descrever o vídeo"></textarea>
                <br />
                <button type="submit">Enviar</button>
            </form>
            <h3>{result}</h3>
            {videoURL && (
                <div className="VideoPlayer">
                    <ReactPlayer url={videoURL} controls={true} />
                </div>
            )}
        </div>
    );
}

export default InsertVideos;
