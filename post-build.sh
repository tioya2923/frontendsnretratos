#!/usr/bin/env bash

echo "Executando script pós-build..."

# Exemplos de comandos
cp -R ./src/assets ./build/assets
chmod -R 755 ./build/assets

echo "Script pós-build concluído!"
