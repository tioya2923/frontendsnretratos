#!/usr/bin/env bash

echo "Executando script pós-build..."

# Exemplos de comandos
cp -R ./src/assets ./build/assets
chmod -R 755 ./build/assets

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

echo "Script pós-build concluído!"
