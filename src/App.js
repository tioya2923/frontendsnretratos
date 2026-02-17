import React from "react";
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global";
import { theme } from "./theme";
import Navbar from "./Components/Navigation/Navbar";
import Footer from "./Components/FooterPage/Footer";
import ErrorBoundary from "./Components/ErrorBoundary";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Navigation/HomePages/home";
import InsertImages from "./Components/Store/insertImages";
import Login from "./Components/Pages/LoginSignup/login";
import Register from "./Components/Pages/LoginSignup/register";
import Unsubscribe from "./Components/Pages/LoginSignup/unsubscribe";
import AreaPessoal from "./Components/Navigation/HomePages/areaPessoal";
import DeletePhoto from "./Components/delete/DeletePhoto";
import Administracao from "./Components/Navigation/HomePages/Administracao";
import Privacidade from "./Components/Pages/LoginSignup/Privacidade";
import UpdateUsuarios from "./Components/Navigation/HomePages/updateUsuarios";
import AdPrivacidade from "./Components/Pages/LoginSignup/AdPrivacidade";
import UpdateAdministradores from "./Components/Navigation/HomePages/updateAdministradores";
import CalendarioRefeicoes from "./Components/Navigation/HomePages/refeicoes";
import InscritosRefeicoes from "./Components/Navigation/HomePages/InscritosRefeicoes";
import ConfissoesHorarios from "./Components/Navigation/HomePages/ConfissoesHoraios";
import InserirNome from "./Components/Navigation/HomePages/InserirNome";
import InserirNomeConf from "./Components/Navigation/HomePages/InserirNomeConf";
import GerenciamentoRefeicoes from "./Components/Navigation/HomePages/GerenciamentoRefeicoes";
import AdicionarNome from "./Components/Navigation/HomePages/AdicionarNome";
import MembrosGrupos from "./Components/Navigation/HomePages/gruposMembros";
import AddGroupsToMeal from "./Components/Navigation/HomePages/AddGroupsToMeal";
import RefeicoesGrupo from "./Components/Navigation/HomePages/RefeicoesGrupo";
import Notificacoes from "./Components/Navigation/HomePages/Notificacoes";
import ProtectedRoute from "./Components/Pages/LoginSignup/ProtectedRoute";
import { UserProvider, useUser } from './UserContext';
import InscreverVisita from "./Components/Navigation/HomePages/InscreverVisita";



// PrivateRoute não é necessário pois já existe o ProtectedRoute importado

function App() {
  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyles />
        <Router>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </Router>
      </>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useUser();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<><Navbar /><Home /><Footer /></>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />
      <Route path="/insertImages" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <><Navbar /><InsertImages /><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/areaPessoal" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <><Navbar /><AreaPessoal /><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/deletePhoto" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <><Navbar /><DeletePhoto /><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/administracao" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <><Navbar /><Administracao /><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/privacidade" element={<><Navbar /><Privacidade /><Footer /></>} />
      <Route path="/updateUsuarios" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <><Navbar /><UpdateUsuarios /><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/adPrivacidade" element={<><Navbar /><AdPrivacidade /><Footer /></>} />
      <Route path="/updateAdministradores" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <><Navbar /><UpdateAdministradores /><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/refeicoes" element={<><Navbar /><CalendarioRefeicoes /><Footer /></>} />
      <Route path="/InscritosRefeicoes" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
            <><Navbar /><ErrorBoundary><InscritosRefeicoes /></ErrorBoundary><Footer /></>
        </ProtectedRoute>
      } />
      <Route path="/ConfissoesHorarios" element={<><Navbar /><ConfissoesHorarios /><Footer /></>} />
      <Route path="/InserirNome" element={<><Navbar /><InserirNome /><Footer /></>} />
      <Route path="/InserirNomeConf" element={<><Navbar /><InserirNomeConf /><Footer /></>} />
      <Route path="/GerenciamentoRefeicoes" element={<><Navbar /><GerenciamentoRefeicoes /><Footer /></>} />
      <Route path="/AdicionarNome" element={<><Navbar /><AdicionarNome /><Footer /></>} />
      <Route path="/gruposMembros" element={<><Navbar /><MembrosGrupos /><Footer /></>} />
      <Route path="/AddGroupsToMeal" element={<><Navbar /><AddGroupsToMeal /><Footer /></>} />
      <Route path="/RefeicoesGrupo" element={<><Navbar /><RefeicoesGrupo /><Footer /></>} />
      <Route path="/Notificacoes" element={<><Navbar /><Notificacoes /><Footer /></>} />
      <Route path="/InscreverVisita" element={<><Navbar /><InscreverVisita /><Footer /></>} />
    </Routes>
  );
}

export default App;
