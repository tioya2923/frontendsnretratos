import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global";
import { theme } from "./theme";
import Navbar from "./Components/Navigation/Navbar";
import Footer from "./Components/FooterPage/Footer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Components/Navigation/HomePages/home";
import Fotografias from "./Components/Navigation/HomePages/fotografias";
import Videos from "./Components/Navigation/HomePages/videos";
import InsertImages from "./Components/Store/insertImages";
import Login from "./Components/Pages/LoginSignup/login";
import Register from "./Components/Pages/LoginSignup/register";
import InsertVideos from "./Components/Store/insertVideos";
import AreaPessoal from "./Components/Navigation/HomePages/areaPessoal";
import FotografiaPage from "./Components/Navigation/HomePages/FotografiaPage";
import VideoPage from "./Components/Navigation/HomePages/VideoPage";
import DeletePhoto from "./Components/delete/DeletePhoto";
import DeleteVideo from "./Components/delete/DeleteVideo";
import Administracao from "./Components/Navigation/HomePages/Administracao";
import Privacidade from "./Components/Pages/LoginSignup/Privacidade";
import UpdateUsuarios from "./Components/Navigation/HomePages/updateUsuarios";
import AdPrivacidade from "./Components/Pages/LoginSignup/AdPrivacidade";
import UpdateAdministradores from "./Components/Navigation/HomePages/updateAdministradores";

function PrivateRoute({ children, isAuthenticated }) {
  if (isAuthenticated) {
    return children;
  }
  return <Navigate to="/login" />;
}
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};
function App() {
  const isAuthenticated = localStorage.getItem("token") || sessionStorage.getItem("token");
  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyles />
        <Router>
          <Routes>
            <Route path="/" element={<><Navbar /><PrivateRoute isAuthenticated={!!isAuthenticated}><Home /></PrivateRoute><Footer /></>} />
            <Route path="/home" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/fotografias" element={<><Navbar /><Fotografias /><Footer /></>} />
            <Route path="/videos" element={<><Navbar /><Videos /><Footer /></>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/InsertVideos" element={<><Navbar /><InsertVideos /><Footer /></>} />
            <Route path="/insertImages" element={<><Navbar /><InsertImages /><Footer /></>} />
            <Route path="/areaPessoal" element={<><Navbar /><AreaPessoal /><Footer /></>} />
            <Route path="/deletePhoto" element={<><Navbar /><DeletePhoto /><Footer /></>} />
            <Route path="/deleteVideo" element={<><Navbar /><DeleteVideo /><Footer /></>} />
            <Route path="/administracao" element={<><Navbar /><Administracao /><Footer /></>} />
            <Route path="/privacidade" element={<><Navbar /><Privacidade /><Footer /></>} />
            <Route path="/updateUsuarios" element={<><Navbar /><UpdateUsuarios /><Footer /></>} />
            <Route path="/adPrivacidade" element={<><Navbar /><AdPrivacidade /><Footer /></>} />
            <Route path="/updateAdministradores" element={<><Navbar /><UpdateAdministradores /><Footer /></>} />
            <Route path="/imagem/:id" element={<FotografiaPage />} />
            <Route path="/videopath/:id" element={<VideoPage />} />
          </Routes>
        </Router>
      </>
    </ThemeProvider>
  );
}
export default App;