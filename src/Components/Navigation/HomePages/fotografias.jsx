import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../Styles/fotografias.css";

const Fotografias = () => {
    const carousel = useRef(null);
    const [images, setImages] = useState([]);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;



    useEffect(() => {
        const fetchData = async () => {

            const response = await fetch(`${backendUrl}components/fotografias.php`, { method: "GET" });

            if (response.ok) {
                const data = await response.json();
                setImages(data);
            } else {
                console.error("Erro: " + response.status);
            }
        };
        fetchData();
    }, []);

    return (
        <div className='container'>
            <h1>FOTOGRAFIAS</h1>
            <div className='carousel-foto' ref={carousel}>
                {images.map((image, index) => (
                    <div key={index} className='item'>
                        <img className='card-foto'
                            src={image.foto} alt={image.nome} /> {/* Use diretamente a URL da imagem */}
                        <div className='info'>
                            <span className='name'>{image.nome}</span>
                            <Link to={`/imagem/${image.id}`}>Saber mais</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Fotografias;
