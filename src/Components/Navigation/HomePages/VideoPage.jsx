import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../Styles/VideoPage.css";

const VideoPage = () => {
    const [video, setVideo] = useState(null);
    const { id } = useParams();

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchVideo = async () => {
            const response = await fetch(`${backendUrl}components/videoPage.php?id=${id}`, { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                setVideo(data);
            } else {
                console.error("Erro: " + response.status);
            }
        };
        fetchVideo();
    }, [id, backendUrl]);

    if (!video) {
        return <div>Carregando...</div>;
    }
    return (
        <div>
            <video className='card-video' controls style={{ width: '100%', height: 'auto' }}>
                <source src={video.video} type="video/mp4">
                </source>
            </video>

            <div className='descricao'>
                <p>{video.descricao}</p>

            </div>
            <div className='voltar'>
                <Link to="/videos" className='voltar-a-pagina'>voltar</Link>
            </div>

        </div>

    );
};

export default VideoPage;
