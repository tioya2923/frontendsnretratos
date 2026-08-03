# frontendsnretratos

## Integração com o Backend

### Desenvolvimento local

1. Certifique-se de que o backend está rodando localmente em `http://localhost:8000/`.
2. Crie um arquivo `.env` no diretório `frontendsnretratos/` com:

```env
REACT_APP_BACKEND_URL=http://localhost:8000/
```

3. O `npm start` usa `src/setupProxy.js` para encaminhar requisições para `/backend-sn` ao backend local.

### Produção

1. Em produção, defina `REACT_APP_BACKEND_URL` para a URL pública do backend, por exemplo:

```env
REACT_APP_BACKEND_URL=https://snretratos-backend.onrender.com/
```

2. No Render, essa variável pode ser definida em `render.yaml` ou nas variáveis de ambiente do serviço.
3. O build de produção injeta `REACT_APP_BACKEND_URL` no service worker.

### Observações importantes

- Não usar o campo `proxy` do `package.json` para apontar para o backend de produção.
- Se `REACT_APP_BACKEND_URL` não estiver definida durante o build, o service worker pode ficar com o placeholder `__API_HOSTNAME__`.
- Em desenvolvimento, apenas `/backend-sn` é proxy para `http://localhost:8000`; outras rotas são servidas pelo React dev server.
- Garanta que o backend permite CORS para o domínio do frontend usado em produção.

### Comandos

- `npm install`
- `npm start`
- `npm run build`
