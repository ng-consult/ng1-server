#!/bin/bash

echo 'Installing Slimer'
bash -c '[ -d ./slimerjs ] && rm -Rf ./slimerjs'
wget http://download.slimerjs.org/releases/0.10.1/slimerjs-0.10.1.zip
unzip slimerjs-0.10.1.zip
mv slimerjs-0.10.1 ./slimerjs
rm slimerjs-0.10.1.zip