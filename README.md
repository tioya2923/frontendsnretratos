# frontendsnretratos

## Integração com o Backend

1. Certifique-se de que o backend está rodando localmente (exemplo: http://localhost:8000/backend-sn/).
2. Configure a URL do backend no arquivo `.env` do frontend:

```
REACT_APP_BACKEND_URL=http://localhost:8000/backend-sn/
```

3. Para produção, altere a URL para o domínio correto do backend.

4. O frontend faz requisições usando a variável `REACT_APP_BACKEND_URL`.

5. Para rodar o frontend:
	- Instale as dependências: `npm install`
	- Inicie: `npm start`

6. Certifique-se de que o backend permite CORS para o domínio do frontend.
