# frontendsnretratos

## Integração com o Backend

### Desenvolvimento local

1. Certifique-se de que o backend está rodando localmente em `http://localhost:8000/` (document root `backend-sn/`).
2. Crie um arquivo `.env` no diretório `frontendsnretratos/` com:

```env
REACT_APP_BACKEND_URL=http://localhost:8000/
```

### Produção (PTisp)

1. Em produção, `REACT_APP_BACKEND_URL` é definida no secret `PTISP_BACKEND_URL` do GitHub Actions, e injetada no `npm run build` pelo workflow `.github/workflows/deploy.yml`:

```env
REACT_APP_BACKEND_URL=https://api-sn.paroquiasaonicolau.pt/
```

2. O build de produção injeta `REACT_APP_BACKEND_URL` no service worker.

### Observações importantes

- Não usar o campo `proxy` do `package.json` para apontar para o backend de produção.
- Se `REACT_APP_BACKEND_URL` não estiver definida durante o build, o service worker pode ficar com o placeholder `__API_HOSTNAME__`.
- Garanta que o backend (`backend-sn/connect/cors.php`) permite CORS para o domínio do frontend usado em produção.

### Comandos

- `npm install`
- `npm start`
- `npm run build`
