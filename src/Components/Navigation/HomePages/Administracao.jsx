import React from "react";
import { Link } from "react-router-dom";
import "../../Styles/Administracao.css";

const Administracao = () => {
    

    return (
        <div>
            <div className="admini">
                <div className="link-admini"><Link to="/insertImages" className='insert'>Inserir Fotografia</Link></div>
                <div className="link-admini"><Link to="/insertVideos" className='insert'>Inserir Vídeo</Link></div>
                <div className="link-admini"><Link to="/deletePhoto" className='insert'>Eliminar Fotografia</Link></div>
                <div className="link-admini"><Link to="/deleteVideo" className='insert'>Eliminar Vídeo</Link></div>
                <div className="link-admini"><Link to="/privacidade" className='insert'>Área Privida</Link></div>
            </div>
        </div>
    );
};

export default Administracao;
