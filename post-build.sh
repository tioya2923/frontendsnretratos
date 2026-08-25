#!/usr/bin/env bash

echo "Executando script pós-build..."

# Exemplo de comando, só corre se a pasta existir (evita erro em cada build)
if [ -d ./src/assets ]; then
  cp -R ./src/assets ./build/assets
  chmod -R 755 ./build/assets
fi

# Injetar o hostname do backend no service worker (ficheiros em public/ não
# passam pelo build do React, por isso não recebem process.env.* em tempo de build)
if [ -n "$REACT_APP_BACKEND_URL" ]; then
  API_HOSTNAME=$(echo "$REACT_APP_BACKEND_URL" | sed -E 's#^https?://##; s#/.*$##')
  sed -i "s#__API_HOSTNAME__#$API_HOSTNAME#g" ./build/service-worker.js
  echo "service-worker.js: API_HOSTNAME definido para $API_HOSTNAME"
else
  echo "ERRO: REACT_APP_BACKEND_URL não definido; o build não pode injetar o hostname no service worker" >&2
  exit 1
fi

# ID único por build, para o service-worker.js ficar sempre com bytes
# diferentes do deploy anterior — é o que faz o browser detetar a
# atualização e mostrar o aviso "Nova versão disponível!" a quem já tem a
# app aberta/instalada. Sem isto, o ficheiro só mudava quando alguém
# lembrasse de subir CACHE_VERSION à mão.
BUILD_ID=$(date -u +%Y%m%d%H%M%S)
sed -i "s#BUILD_ID_PLACEHOLDER#$BUILD_ID#g" ./build/service-worker.js
echo "service-worker.js: BUILD_ID definido para $BUILD_ID"

echo "Script pós-build concluído!"
