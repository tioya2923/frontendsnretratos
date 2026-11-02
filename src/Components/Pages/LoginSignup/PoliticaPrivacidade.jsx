import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

export default function PoliticaPrivacidade() {
    return (
        <div className="pagina" style={{ maxWidth: 760 }}>
            <h1 className="paginaTitulo"><FiShield style={{ verticalAlign: -3 }} /> Política de Privacidade</h1>
            <p className="paginaSubtitulo">Comunidade Paroquial de São Nicolau e Santa Maria Madalena — última atualização: novembro de 2026.</p>

            <div className="cartao cartao--destaque" style={{ lineHeight: 1.7 }}>
                <p>
                    Esta aplicação ("Comer" / "SN Refeições") é gerida pela Comunidade Paroquial de São Nicolau
                    e Santa Maria Madalena e serve para organizar as inscrições e a presença dos paroquianos
                    nas refeições da comunidade. Esta página explica que dados recolhemos, para que os usamos
                    e como pode exercer os seus direitos sobre eles.
                </p>

                <h2>Idade mínima</h2>
                <p>
                    A aplicação destina-se a pessoas com <strong>14 anos ou mais</strong>. Não recolhemos
                    conscientemente dados de menores de 14 anos; o registo recusa datas de nascimento que
                    indiquem uma idade inferior. Se tomar conhecimento de que uma criança com menos de 14 anos
                    se registou, contacte-nos para eliminarmos a conta.
                </p>

                <h2>Que dados recolhemos</h2>
                <ul>
                    <li><strong>Dados de registo:</strong> nome completo, email e palavra-passe (guardada sempre de forma encriptada, nunca em texto simples).</li>
                    <li><strong>Datas de aniversário:</strong> aniversário natalício e, opcionalmente, aniversário sacerdotal — usados para os avisos de aniversário dentro da comunidade.</li>
                    <li><strong>Inscrições e presenças:</strong> em que refeições se inscreveu, e a confirmação de presença em cada uma.</li>
                    <li><strong>Notificações push:</strong> se ativar as notificações, o seu dispositivo/browser gera um identificador técnico de subscrição (endpoint), usado só para lhe entregar essas notificações — não identifica a pessoa por si só.</li>
                    <li><strong>Mensagens internas:</strong> o conteúdo das mensagens que envia ou recebe através da funcionalidade de mensagens da app.</li>
                </ul>

                <h2>Para que usamos estes dados</h2>
                <ul>
                    <li>Organizar as refeições e saber, com antecedência, quantas pessoas contar em cada uma.</li>
                    <li>Enviar lembretes (push e/ou email) sobre refeições, atividades e inscrições.</li>
                    <li>Assinalar aniversários à comunidade.</li>
                    <li>Permitir aos administradores gerir a comunidade e produzir relatórios internos de gestão (ex.: quem confirmou presença numa quinzena).</li>
                </ul>

                <h2>Com quem partilhamos os dados</h2>
                <p>
                    Não vendemos nem partilhamos os seus dados com terceiros para fins de marketing. Usamos a{' '}
                    <strong>Brevo</strong> (brevo.com) apenas como serviço técnico de envio de emails (ex.: confirmação
                    de registo, recuperação de palavra-passe, lembretes) — a Brevo processa o email e o conteúdo
                    da mensagem só para essa entrega, nos termos da sua própria política de privacidade.
                </p>

                <h2>Onde ficam guardados</h2>
                <p>
                    Os dados ficam num servidor alojado em Portugal (PTisp). O acesso de administração é restrito
                    a quem tem uma conta de administrador validada pela comunidade.
                </p>

                <h2>Quanto tempo guardamos os dados</h2>
                <p>
                    Enquanto a sua conta estiver ativa. Pode pedir a eliminação da sua conta e dos dados associados
                    a qualquer momento — ver "Como exercer os seus direitos", abaixo.
                </p>

                <h2>Os seus direitos</h2>
                <p>Nos termos do RGPD, tem o direito a:</p>
                <ul>
                    <li>Aceder aos dados que temos sobre si;</li>
                    <li>Pedir a correção de dados incorretos ou desatualizados;</li>
                    <li>Pedir a eliminação da sua conta e dos dados associados;</li>
                    <li>Retirar o consentimento para receber notificações, a qualquer momento (desativando-as na app, ou através do link de anulação de subscrição nos emails);</li>
                    <li>Pedir uma cópia dos seus dados num formato estruturado.</li>
                </ul>

                <h2>Como exercer os seus direitos</h2>
                <p>
                    Contacte um administrador da comunidade, ou escreva para{' '}
                    <a href="mailto:retratospsn@gmail.com">retratospsn@gmail.com</a>. Se preferir deixar de
                    receber comunicações por email sem eliminar a conta, pode fazê-lo diretamente em{' '}
                    <Link to="/unsubscribe">esta página</Link>.
                </p>

                <h2>Armazenamento local no dispositivo</h2>
                <p>
                    A app guarda localmente no seu dispositivo (localStorage) a sessão iniciada, para não ter de
                    voltar a fazer login a cada vez que abre a app. Não usamos cookies de publicidade nem de
                    terceiros para seguimento (tracking).
                </p>

                <h2>Alterações a esta política</h2>
                <p>
                    Esta política pode ser atualizada sempre que a app ganhar novas funcionalidades que o
                    justifiquem. A data no topo desta página indica a última atualização.
                </p>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20 }}>
                <Link to="/login" className="linkVoltar">
                    <FiArrowLeft /> Voltar ao login
                </Link>
            </p>
        </div>
    );
}
