import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global";
import { theme } from "./theme";
import Navbar from "./Components/Navigation/Navbar";
import PwaUpdateBanner from "./Components/PwaUpdateBanner";
import Footer from "./Components/FooterPage/Footer";
import ErrorBoundary from "./Components/ErrorBoundary";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Components/Navigation/HomePages/home";
import Login from "./Components/Pages/LoginSignup/login";
import Register from "./Components/Pages/LoginSignup/register";
import Unsubscribe from "./Components/Pages/LoginSignup/unsubscribe";
import AreaPessoal from "./Components/Navigation/HomePages/areaPessoal";
import Administracao from "./Components/Navigation/HomePages/Administracao";
import Privacidade from "./Components/Pages/LoginSignup/Privacidade";
import UpdateUsuarios from "./Components/Navigation/HomePages/updateUsuarios";
import AdPrivacidade from "./Components/Pages/LoginSignup/AdPrivacidade";
import UpdateAdministradores from "./Components/Navigation/HomePages/updateAdministradores";
import CalendarioRefeicoes from "./Components/Navigation/HomePages/refeicoes";
import InscritosRefeicoes from "./Components/Navigation/HomePages/InscritosRefeicoes";
import MembrosGrupos from "./Components/Navigation/HomePages/gruposMembros";
import AddGroupsToMeal from "./Components/Navigation/HomePages/AddGroupsToMeal";
import RefeicoesGrupo from "./Components/Navigation/HomePages/RefeicoesGrupo";
import Notificacoes from "./Components/Navigation/HomePages/Notificacoes";
import ProtectedRoute from "./Components/Pages/LoginSignup/ProtectedRoute";
import { UserProvider, useUser } from './UserContext';
import { ConfirmProvider } from './Components/ConfirmDialog';
import InscreverVisita from "./Components/Navigation/HomePages/InscreverVisita";
import AtividadesPage from "./Components/Navigation/HomePages/AtividadesPage";
import PerfilPage from "./Components/Navigation/HomePages/PerfilPage";
import MensagensPage from "./Components/Navigation/HomePages/MensagensPage";



// PrivateRoute não é necessário pois já existe o ProtectedRoute importado

function App() {
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    const handler = event => setSwRegistration(event.detail);
    window.addEventListener('pwa-update', handler);
    return () => window.removeEventListener('pwa-update', handler);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyles />
        {/* Container único de notificações — substitui o alert() nativo em
            toda a app. Cada página só precisa de chamar toast.success()/
            toast.error(), sem montar o seu próprio <ToastContainer />. */}
        <ToastContainer position="top-center" autoClose={4000} />
        {swRegistration && <PwaUpdateBanner registration={swRegistration} />}
        <ConfirmProvider>
          <Router>
            <UserProvider>
              <AppRoutes />
            </UserProvider>
          </Router>
        </ConfirmProvider>
      </>
    </ThemeProvider>
  );
}

function AuthRoute({ children }) {
  const { isAuthenticated } = useUser();
  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      {children}
    </ProtectedRoute>
  );
}

// Páginas de gestão (administradores, utilizadores, grupos) — o backend
// já exige a sessão de admin em qualquer dos casos; isto só evita que um
// utilizador normal veja a página a tentar carregar e falhar, mandando-o
// antes para o login de administrador (não o de utilizador normal).
function AdminRoute({ children }) {
  const isAdminAuthenticated = !!localStorage.getItem('adminToken');
  if (!isAdminAuthenticated) {
    return <Navigate to="/privacidade" />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="/privacidade" element={<><Navbar /><Privacidade /><Footer /></>} />
      <Route path="/adPrivacidade" element={<><Navbar /><AdPrivacidade /><Footer /></>} />

      {/* Rotas protegidas — requerem login */}
      <Route path="/home" element={<AuthRoute><><Navbar /><Home /><Footer /></></AuthRoute>} />
      <Route path="/areaPessoal" element={<AuthRoute><><Navbar /><AreaPessoal /><Footer /></></AuthRoute>} />
      <Route path="/administracao" element={<AuthRoute><><Navbar /><Administracao /><Footer /></></AuthRoute>} />
      <Route path="/updateUsuarios" element={<AdminRoute><><Navbar /><UpdateUsuarios /><Footer /></></AdminRoute>} />
      <Route path="/updateAdministradores" element={<AdminRoute><><Navbar /><UpdateAdministradores /><Footer /></></AdminRoute>} />
      <Route path="/refeicoes" element={<AuthRoute><><Navbar /><CalendarioRefeicoes /><Footer /></></AuthRoute>} />
      <Route path="/InscritosRefeicoes" element={<AuthRoute><><Navbar /><ErrorBoundary><InscritosRefeicoes /></ErrorBoundary><Footer /></></AuthRoute>} />
      <Route path="/gruposMembros" element={<AdminRoute><><Navbar /><MembrosGrupos /><Footer /></></AdminRoute>} />
      <Route path="/AddGroupsToMeal" element={<AdminRoute><><Navbar /><AddGroupsToMeal /><Footer /></></AdminRoute>} />
      {/* O nome do componente é GruposList — a rota usa o mesmo nome para
          bater certo com o link em updateUsuarios.jsx ("Refeições em
          Grupos") e com o URL que os utilizadores já possam ter guardado. */}
      <Route path="/GruposList" element={<AuthRoute><><Navbar /><RefeicoesGrupo /><Footer /></></AuthRoute>} />
      <Route path="/Notificacoes" element={<AuthRoute><><Navbar /><Notificacoes /><Footer /></></AuthRoute>} />
      <Route path="/InscreverVisita" element={<AuthRoute><><Navbar /><InscreverVisita /><Footer /></></AuthRoute>} />
      <Route path="/atividades" element={<AuthRoute><><Navbar /><AtividadesPage /><Footer /></></AuthRoute>} />
      <Route path="/perfil" element={<AuthRoute><><Navbar /><PerfilPage /><Footer /></></AuthRoute>} />
      <Route path="/mensagens" element={<AuthRoute><><Navbar /><MensagensPage /><Footer /></></AuthRoute>} />
    </Routes>
  );
}

export default App;
