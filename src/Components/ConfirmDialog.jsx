import React, { createContext, useCallback, useContext, useState } from 'react';
import './Styles/ConfirmDialog.css';

// Substituto de window.confirm() — mesma ideia (bloqueia até o utilizador
// escolher), mas com o visual da app em vez do popup feio do browser.
// Uso: const confirmar = useConfirm(); const ok = await confirmar('Eliminar isto?');
const ConfirmContext = createContext(() => Promise.resolve(false));

export const ConfirmProvider = ({ children }) => {
    const [pedido, setPedido] = useState(null); // { mensagem, resolve }

    const confirmar = useCallback((mensagem) => {
        return new Promise((resolve) => {
            setPedido({ mensagem, resolve });
        });
    }, []);

    const responder = (resultado) => {
        pedido?.resolve(resultado);
        setPedido(null);
    };

    return (
        <ConfirmContext.Provider value={confirmar}>
            {children}
            {pedido && (
                <div className="confirmOverlay" role="presentation" onClick={() => responder(false)}>
                    <div
                        className="confirmBox"
                        role="alertdialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="confirmMensagem">{pedido.mensagem}</p>
                        <div className="confirmAcoes">
                            <button className="confirmBotaoCancelar" onClick={() => responder(false)}>
                                Cancelar
                            </button>
                            <button className="confirmBotaoConfirmar" onClick={() => responder(true)} autoFocus>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => useContext(ConfirmContext);
