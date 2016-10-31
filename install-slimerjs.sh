#!/bin/bash

echo "Installing SlimerJS - be patient"
bash -c '[ -d ./slimerjs ] && rm -Rf ./slimerjs'
bash -c '[ -d ./slimerjs_git ] && rm -Rf ./slimerjs_git'

git clone https://github.com/laurentj/slimerjs.git ./slimerjs_git
cd slimerjs_git
git checkout 0.10.1
./buildpackage.sh

mv _dist/slimerjs-0.10.1 ./../slimerjs

cd ..
rm -Rf slimerjs_git

echo "SlimerJS installed"

#wget http://download.slimerjs.org/releases/0.10.1/slimerjs-0.10.1.zip
#unzip slimerjs-0.10.1.zip
#mv slimerjs-0.10.1 ./slimerjs
#rm slimerjs-0.10.1.zip