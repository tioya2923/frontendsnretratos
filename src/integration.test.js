import axios from 'axios';

describe('Integração frontend-backend', () => {
  it('deve receber resposta do backend para upload de imagem', async () => {
    // Simula envio de dados mínimos para o endpoint do backend
    const backendUrl = process.env.REACT_APP_BACKEND_URL?.endsWith('/') ? process.env.REACT_APP_BACKEND_URL : process.env.REACT_APP_BACKEND_URL + '/';
    const formData = new FormData();
    formData.append('nome', 'teste');
    formData.append('pasta', 'testepasta');
    formData.append('nomeUsuario', 'usuarioteste');
    formData.append('dataCriacao', '2026-01-08');
    // Não envia arquivo real, apenas testa resposta do backend
    try {
      const response = await axios.post(`${backendUrl}components/insertFotografias.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(response.status).toBe(200);
      // Espera resposta em JSON
      expect(typeof response.data).toBe('object');
    } catch (error) {
      // O teste falha se o backend não responder corretamente
      throw new Error('Falha na comunicação frontend-backend: ' + (error.response?.data?.message || error.message));
    }
  });
});
