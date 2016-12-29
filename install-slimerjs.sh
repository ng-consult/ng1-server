#!/bin/bash

echo "Installing SlimerJS - be patient"
bash -c '[ -d ./slimerjs ] && rm -Rf ./slimerjs'
bash -c '[ -d ./slimerjs_git ] && rm -Rf ./slimerjs_git'

git clone https://github.com/laurentj/slimerjs.git ./slimerjs_git
cd slimerjs_git
git checkout 0.10.2
./buildpackage.sh

mv _dist/slimerjs-0.10.2 ./../slimerjs

cd ..
rm -Rf slimerjs_git

echo "SlimerJS installed"