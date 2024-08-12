import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../../Styles/FotografiaPage.css";

const FotografiaPage = () => {
    const [image, setImage] = useState(null);
    const { id } = useParams();


    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchImage = async () => {
            const response = await fetch(`${backendUrl}components/fotografiaPage.php?id=${id}`, { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                setImage(data);
            } else {
                console.error("Erro: " + response.status);
            }
        };
        fetchImage();
    }, [id, backendUrl ]);

    if (!image) {
        return <div>Carregando...</div>;
    }
    return (
        <div>
            <img className='card-foto' style={{ width: '100%', height: 'auto' }} src={image.foto} alt={image.nome} />
            <div className='descricao'>
                <p>{image.descricao}</p>
            </div>
            <div className='voltar'>
                <Link to="/fotografias" className='voltar-a-pagina'>voltar</Link>
            </div>
        </div>


    );
};

export default FotografiaPage;
