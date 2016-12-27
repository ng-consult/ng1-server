#!/bin/bash
if [[ -s //etc/profile ]]; then
  source //etc/profile
fi

if [[ -s $HOME/.bash_profile ]] ; then
  source $HOME/.bash_profile
fi

ANSI_RED="\033[31;1m"
ANSI_GREEN="\033[32;1m"
ANSI_RESET="\033[0m"
ANSI_CLEAR="\033[0K"

if [ $TERM = dumb ]; then
  unset TERM
fi
: "${SHELL:=/bin/bash}"
: "${TERM:=xterm}"
: "${USER:=travis}"
export SHELL
export TERM
export USER

TRAVIS_TEST_RESULT=
TRAVIS_CMD=

travis_cmd() {
  local assert output display retry timing cmd result

  cmd=$1
  TRAVIS_CMD=$cmd
  shift

  while true; do
    case "$1" in
      --assert)  assert=true; shift ;;
      --echo)    output=true; shift ;;
      --display) display=$2;  shift 2;;
      --retry)   retry=true;  shift ;;
      --timing)  timing=true; shift ;;
      *) break ;;
    esac
  done

  if [[ -n "$timing" ]]; then
    travis_time_start
  fi

  if [[ -n "$output" ]]; then
    echo "\$ ${display:-$cmd}"
  fi

  if [[ -n "$retry" ]]; then
    travis_retry eval "$cmd"
  else
    eval "$cmd"
  fi
  result=$?

  if [[ -n "$timing" ]]; then
    travis_time_finish
  fi

  if [[ -n "$assert" ]]; then
    travis_assert $result
  fi

  return $result
}

travis_time_start() {
  travis_timer_id=$(printf %08x $(( RANDOM * RANDOM )))
  travis_start_time=$(travis_nanoseconds)
  echo -en "travis_time:start:$travis_timer_id\r${ANSI_CLEAR}"
}

travis_time_finish() {
  local result=$?
  travis_end_time=$(travis_nanoseconds)
  local duration=$(($travis_end_time-$travis_start_time))
  echo -en "\ntravis_time:end:$travis_timer_id:start=$travis_start_time,finish=$travis_end_time,duration=$duration\r${ANSI_CLEAR}"
  return $result
}

travis_nanoseconds() {
  local cmd="date"
  local format="+%s%N"
  local os=$(uname)

  if hash gdate > /dev/null 2>&1; then
    
    cmd="gdate"
  elif [[ "$os" = Darwin ]]; then
    
    format="+%s000000000"
  fi

  $cmd -u $format
}

travis_internal_ruby() {
  if ! type rvm &>/dev/null; then
    source $HOME/.rvm/scripts/rvm &>/dev/null
  fi
  local i selected_ruby rubies_array rubies_array_sorted rubies_array_len
  rubies_array=( $(
    rvm list strings \
      | while read -r v; do
          if [[ ! "${v}" =~ ^ruby-(2\.[0-2]\.[0-9]|1\.9\.3) ]]; then
            continue
          fi
          v="${v//ruby-/}"
          v="${v%%-*}"
          echo "$(vers2int "${v}")_${v}"
        done
  ) )
  bash_qsort_numeric "${rubies_array[@]}"
  rubies_array_sorted=( ${bash_qsort_numeric_ret[@]} )
  rubies_array_len="${#rubies_array_sorted[@]}"
  i=$(( rubies_array_len - 1 ))
  selected_ruby="${rubies_array_sorted[${i}]}"
  selected_ruby="${selected_ruby##*_}"
  echo "${selected_ruby:-default}"
}

travis_assert() {
  local result=${1:-$?}
  if [ $result -ne 0 ]; then
    echo -e "\n${ANSI_RED}The command \"$TRAVIS_CMD\" failed and exited with $result during $TRAVIS_STAGE.${ANSI_RESET}\n\nYour build has been stopped."
    travis_terminate 2
  fi
}

travis_result() {
  local result=$1
  export TRAVIS_TEST_RESULT=$(( ${TRAVIS_TEST_RESULT:-0} | $(($result != 0)) ))

  if [ $result -eq 0 ]; then
    echo -e "\n${ANSI_GREEN}The command \"$TRAVIS_CMD\" exited with $result.${ANSI_RESET}"
  else
    echo -e "\n${ANSI_RED}The command \"$TRAVIS_CMD\" exited with $result.${ANSI_RESET}"
  fi
}

travis_terminate() {
  pkill -9 -P $$ &> /dev/null || true
  exit $1
}

travis_wait() {
  local timeout=$1

  if [[ $timeout =~ ^[0-9]+$ ]]; then
    
    shift
  else
    
    timeout=20
  fi

  local cmd="$@"
  local log_file=travis_wait_$$.log

  $cmd &>$log_file &
  local cmd_pid=$!

  travis_jigger $! $timeout $cmd &
  local jigger_pid=$!
  local result

  {
    wait $cmd_pid 2>/dev/null
    result=$?
    ps -p$jigger_pid &>/dev/null && kill $jigger_pid
  }

  if [ $result -eq 0 ]; then
    echo -e "\n${ANSI_GREEN}The command $cmd exited with $result.${ANSI_RESET}"
  else
    echo -e "\n${ANSI_RED}The command $cmd exited with $result.${ANSI_RESET}"
  fi

  echo -e "\n${ANSI_GREEN}Log:${ANSI_RESET}\n"
  cat $log_file

  return $result
}

travis_jigger() {
  
  local cmd_pid=$1
  shift
  local timeout=$1 
  shift
  local count=0

  
  echo -e "\n"

  while [ $count -lt $timeout ]; do
    count=$(($count + 1))
    echo -ne "Still running ($count of $timeout): $@\r"
    sleep 60
  done

  echo -e "\n${ANSI_RED}Timeout (${timeout} minutes) reached. Terminating \"$@\"${ANSI_RESET}\n"
  kill -9 $cmd_pid
}

travis_retry() {
  local result=0
  local count=1
  while [ $count -le 3 ]; do
    [ $result -ne 0 ] && {
      echo -e "\n${ANSI_RED}The command \"$@\" failed. Retrying, $count of 3.${ANSI_RESET}\n" >&2
    }
    "$@"
    result=$?
    [ $result -eq 0 ] && break
    count=$(($count + 1))
    sleep 1
  done

  [ $count -gt 3 ] && {
    echo -e "\n${ANSI_RED}The command \"$@\" failed 3 times.${ANSI_RESET}\n" >&2
  }

  return $result
}

travis_fold() {
  local action=$1
  local name=$2
  echo -en "travis_fold:${action}:${name}\r${ANSI_CLEAR}"
}

decrypt() {
  echo $1 | base64 -d | openssl rsautl -decrypt -inkey $HOME/.ssh/id_rsa.repo
}

vers2int() {
  printf '1%03d%03d%03d%03d' $(echo "$1" | tr '.' ' ')
}

bash_qsort_numeric() {
   local pivot i smaller=() larger=()
   bash_qsort_numeric_ret=()
   (($#==0)) && return 0
   pivot=${1}
   shift
   for i; do
      if [[ ${i%%_*} -lt ${pivot%%_*} ]]; then
         smaller+=( "$i" )
      else
         larger+=( "$i" )
      fi
   done
   bash_qsort_numeric "${smaller[@]}"
   smaller=( "${bash_qsort_numeric_ret[@]}" )
   bash_qsort_numeric "${larger[@]}"
   larger=( "${bash_qsort_numeric_ret[@]}" )
   bash_qsort_numeric_ret=( "${smaller[@]}" "$pivot" "${larger[@]}" )
}


if [[ -f /etc/apt/sources.list.d/rabbitmq-source.list ]] ; then
  sudo rm -f /etc/apt/sources.list.d/rabbitmq-source.list
fi

mkdir -p $HOME/build
cd       $HOME/build


travis_fold start system_info
  echo -e "\033[33;1mBuild system information\033[0m"
  echo -e "Build language: node_js"
  echo -e "Build dist: trusty"
  echo -e "Build id: ''"
  echo -e "Job id: ''"
  if [[ -f /usr/share/travis/system_info ]]; then
    cat /usr/share/travis/system_info
  fi
travis_fold end system_info

echo
export PATH=$(echo $PATH | sed -e 's/::/:/g')
export PATH=$(echo -n $PATH | perl -e 'print join(":", grep { not $seen{$_}++ } split(/:/, scalar <>))')
echo "options rotate
options timeout:1

nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 208.67.222.222
nameserver 208.67.220.220
" | sudo tee /etc/resolv.conf &> /dev/null
sudo sed -e 's/^\(127\.0\.0\.1.*\)$/\1 '`hostname`'/' -i'.bak' /etc/hosts
sudo sed -e 's/^\([0-9a-f:]\+\) localhost/\1/' -i'.bak' /etc/hosts
test -f /etc/mavenrc && sudo sed -e 's/M2_HOME=\(.\+\)$/M2_HOME=${M2_HOME:-\1}/' -i'.bak' /etc/mavenrc
if [ $(command -v sw_vers) ]; then
  echo "Fix WWDRCA Certificate"
  sudo security delete-certificate -Z 0950B6CD3D2F37EA246A1AAA20DFAADBD6FE1F75 /Library/Keychains/System.keychain
  wget -q https://developer.apple.com/certificationauthority/AppleWWDRCA.cer
  sudo security add-certificates -k /Library/Keychains/System.keychain AppleWWDRCA.cer
fi

grep '^127\.0\.0\.1' /etc/hosts | sed -e 's/^127\.0\.0\.1 \(.*\)/\1/g' | sed -e 's/localhost \(.*\)/\1/g' | tr "\n" " " > /tmp/hosts_127_0_0_1
sed '/^127\.0\.0\.1/d' /etc/hosts > /tmp/hosts_sans_127_0_0_1
cat /tmp/hosts_sans_127_0_0_1 | sudo tee /etc/hosts > /dev/null
echo -n "127.0.0.1 localhost " | sudo tee -a /etc/hosts > /dev/null
cat /tmp/hosts_127_0_0_1 | sudo tee -a /etc/hosts > /dev/null
# apply :home_paths
for path_entry in $HOME/.local/bin $HOME/bin ; do
  if [[ ${PATH%%:*} != $path_entry ]] ; then
    export PATH="$path_entry:$PATH"
  fi
done

if [ ! $(uname|grep Darwin) ]; then echo update_initramfs=no | sudo tee -a /etc/initramfs-tools/update-initramfs.conf > /dev/null; fi

if [[ "$(sw_vers -productVersion 2>/dev/null | cut -d . -f 2)" -lt 12 ]]; then
  mkdir -p $HOME/.ssh
  chmod 0700 $HOME/.ssh
  touch $HOME/.ssh/config
  echo -e "Host *
    UseRoaming no
  " | cat - $HOME/.ssh/config > $HOME/.ssh/config.tmp && mv $HOME/.ssh/config.tmp $HOME/.ssh/config
fi

function travis_debug() {
echo -e "\033[31;1mThe debug environment is not available. Please contact support.\033[0m"
false
}

if [[ $(command -v sw_vers) ]]; then
  travis_cmd rvm\ use --echo
fi

if [[ -L /usr/lib/jvm/java-8-oracle-amd64 ]]; then
  echo -e "Removing symlink /usr/lib/jvm/java-8-oracle-amd64"
  travis_cmd sudo\ rm\ -f\ /usr/lib/jvm/java-8-oracle-amd64 --echo
  if [[ -f $HOME/.jdk_switcher_rc ]]; then
    echo -e "Reload jdk_switcher"
    travis_cmd source\ \$HOME/.jdk_switcher_rc --echo
  fi
  if [[ -f /opt/jdk_switcher/jdk_switcher.sh ]]; then
    echo -e "Reload jdk_switcher"
    travis_cmd source\ /opt/jdk_switcher/jdk_switcher.sh --echo
  fi
fi

export GIT_ASKPASS=echo

travis_fold start git.checkout
  if [[ ! -d ng-consult/angular.js-server/.git ]]; then
    travis_cmd git\ clone\ --depth\=50\ --branch\=\'\'\ git@github.com:ng-consult/angular.js-server.git\ ng-consult/angular.js-server --assert --echo --retry --timing
  else
    travis_cmd git\ -C\ ng-consult/angular.js-server\ fetch\ origin --assert --echo --retry --timing
    travis_cmd git\ -C\ ng-consult/angular.js-server\ reset\ --hard --assert --echo
  fi
  travis_cmd cd\ ng-consult/angular.js-server --echo
  travis_cmd git\ checkout\ -qf\  --assert --echo
travis_fold end git.checkout

if [[ -f .gitmodules ]]; then
  travis_fold start git.submodule
    echo Host\ github.com'
    '\	StrictHostKeyChecking\ no'
    ' >> ~/.ssh/config
    travis_cmd git\ submodule\ update\ --init\ --recursive --assert --echo --retry --timing
  travis_fold end git.submodule
fi

rm -f ~/.ssh/source_rsa

travis_fold start services
  travis_cmd sudo\ service\ redis-server\ start --echo --timing
  sleep 3
travis_fold end services

export PS4=+

travis_fold start install_firefox
  if [[ $(uname) = 'Linux' ]]; then
    travis_cmd export\ FIREFOX_SOURCE_URL\=\'https://download.mozilla.org/\?product\=firefox-49.0\&lang\=en-US\&os\=linux64\' --echo
  else
    travis_cmd export\ FIREFOX_SOURCE_URL\=\'https://download.mozilla.org/\?product\=firefox-49.0\&lang\=en-US\&os\=osx\' --echo
  fi
  echo -e "\033[33;1mInstalling Firefox 49.0\033[0m"
  mkdir -p $HOME/firefox-49.0
  chown -R travis $HOME/firefox-49.0
  travis_cmd pushd\ \$HOME/firefox-49.0\ \&\>\ /dev/null
  if [[ $(uname) = "Linux" ]]; then
    travis_cmd wget\ -O\ /tmp/firefox-49.0.tar.bz2\ \$FIREFOX_SOURCE_URL --echo --retry --timing
    tar xf /tmp/firefox-49.0.tar.bz2
    travis_cmd export\ PATH\=\$HOME/firefox-49.0/firefox:\$PATH --echo
  elif [[ $(uname) = "Darwin" ]]; then
    travis_cmd wget\ -O\ /tmp/firefox-49.0.tar.dmg\ \$FIREFOX_SOURCE_URL --echo --retry --timing
    hdiutil mount -readonly -mountpoint firefox /tmp/firefox-49.0.tar.dmg
    sudo rm -rf /Applications/Firefox.app
    sudo cp -a firefox/Firefox.app /Applications
    sudo ln -sf /Applications/Firefox.app/Contents/MacOS/firefox /usr/local/bin/firefox
    hdiutil unmount firefox && rm /tmp/firefox-49.0.tar.dmg
    travis_cmd export\ PATH\=/Applications/Firefox.app/Contents/MacOS:\$PATH --echo
  fi
  travis_cmd popd\ \&\>\ /dev/null
travis_fold end install_firefox

export TRAVIS=true
export CI=true
export CONTINUOUS_INTEGRATION=true
export HAS_JOSH_K_SEAL_OF_APPROVAL=true
export TRAVIS_EVENT_TYPE=''
export TRAVIS_PULL_REQUEST=false
export TRAVIS_SECURE_ENV_VARS=false
export TRAVIS_BUILD_ID=''
export TRAVIS_BUILD_NUMBER=''
export TRAVIS_BUILD_DIR=$HOME/build/ng-consult/angular.js-server
export TRAVIS_JOB_ID=''
export TRAVIS_JOB_NUMBER=''
export TRAVIS_BRANCH=''
export TRAVIS_COMMIT=''
export TRAVIS_COMMIT_RANGE=''
export TRAVIS_REPO_SLUG=ng-consult/angular.js-server
export TRAVIS_OS_NAME=''
export TRAVIS_LANGUAGE=node_js
export TRAVIS_TAG=''
export TRAVIS_SUDO=true
export TRAVIS_PULL_REQUEST_BRANCH=''
export TRAVIS_PULL_REQUEST_SHA=''
echo
echo -e "\033[33;1mSetting environment variables from .travis.yml\033[0m"
travis_cmd export\ CXX\=g\+\+-4.8 --echo
travis_cmd export\ SLIMERJSLAUNCHER\=\$\(which\ firefox\) --echo
travis_cmd export\ DISPLAY\=:99.0 --echo
travis_cmd export\ PATH\=\$TRAVIS_BUILD_DIR/slimerjs:\$PATH --echo
echo
export TRAVIS_NODE_VERSION=5.11

if [[ $(echo :$PATH: | grep -v :./node_modules/.bin:) ]]; then
  travis_cmd export\ PATH\=./node_modules/.bin:\$PATH --echo
fi

travis_cmd nvm\ install\ 5.11 --echo --timing

if [[ $? -ne 0 ]]; then
  echo -e "\033[31;1mFailed to install 5.11. Remote repository may not be reachable.\033[0m"
  echo -e "Using locally available version 5.11, if applicable."
  travis_cmd nvm\ use\ 5.11 --echo
  if [[ $? -ne 0 ]]; then
    echo -e "\033[31;1mUnable to use 5.11\033[0m"
    travis_cmd false --assert
  fi
fi

export TRAVIS_NODE_VERSION=5.11

if [[ $(command -v sw_vers) && -f $HOME/.npmrc ]]; then
  travis_cmd npm\ config\ delete\ prefix --assert --echo --timing
fi

travis_cmd npm\ config\ set\ spin\ false --assert
travis_cmd npm\ config\ set\ progress\ false --assert

travis_fold start cache.1
  echo -e "Setting up build cache"
  rvm use $(rvm current >&/dev/null) >&/dev/null
  travis_cmd export\ CASHER_DIR\=\$HOME/.casher --echo
  mkdir -p $CASHER_DIR/bin
  travis_cmd curl\ https://raw.githubusercontent.com/travis-ci/casher/production/bin/casher\ \ -L\ -o\ \$CASHER_DIR/bin/casher\ -s\ --fail --assert --echo --display Installing\ caching\ utilities --retry --timing
  [ $? -ne 0 ] && echo 'Failed to fetch casher from GitHub, disabling cache.' && echo > $CASHER_DIR/bin/casher
  if [[ -f $CASHER_DIR/bin/casher ]]; then
    chmod +x $CASHER_DIR/bin/casher
  fi
  if [[ $- = *e* ]]; then
    ERREXIT_SET=true
  fi
  set +e
  if [[ -f $CASHER_DIR/bin/casher ]]; then
    travis_cmd type\ rvm\ \&\>/dev/null\ \|\|\ source\ \~/.rvm/scripts/rvm --timing
    travis_cmd rvm\ \$\(travis_internal_ruby\)\ --fuzzy\ do\ \$CASHER_DIR/bin/casher\ fetch\ https://s3.amazonaws.com/cache_bucket/1234567890//cache-trusty-f3229c1e87844dd12bfcceadb2cd05cc2dfde87db8327fccb58b06138837fde6--node-5.11.tgz\\\?X-Amz-Algorithm\\\=AWS4-HMAC-SHA256\\\&X-Amz-Credential\\\=abcdef0123456789\\\%2F20161227\\\%2Fus-east-1\\\%2Fs3\\\%2Faws4_request\\\&X-Amz-Date\\\=20161227T052204Z\\\&X-Amz-Expires\\\=60\\\&X-Amz-Signature\\\=aa005848db0f7f5a8c3ee4e7edef7f91dcbcc4e9407c311594331616c19149f8\\\&X-Amz-SignedHeaders\\\=host\ https://s3.amazonaws.com/cache_bucket/1234567890//cache--node-5.11.tgz\\\?X-Amz-Algorithm\\\=AWS4-HMAC-SHA256\\\&X-Amz-Credential\\\=abcdef0123456789\\\%2F20161227\\\%2Fus-east-1\\\%2Fs3\\\%2Faws4_request\\\&X-Amz-Date\\\=20161227T052204Z\\\&X-Amz-Expires\\\=60\\\&X-Amz-Signature\\\=4ec5bf7f6d940cde8c79a275facc24c2d02e07dd5c0140fabb100d5d0926be79\\\&X-Amz-SignedHeaders\\\=host\ https://s3.amazonaws.com/cache_bucket/1234567890/cache-trusty-f3229c1e87844dd12bfcceadb2cd05cc2dfde87db8327fccb58b06138837fde6--node-5.11.tgz\\\?X-Amz-Algorithm\\\=AWS4-HMAC-SHA256\\\&X-Amz-Credential\\\=abcdef0123456789\\\%2F20161227\\\%2Fus-east-1\\\%2Fs3\\\%2Faws4_request\\\&X-Amz-Date\\\=20161227T052204Z\\\&X-Amz-Expires\\\=60\\\&X-Amz-Signature\\\=02bc4837199ea296257c392beae4735140d3f6c538b38f306be3a830cc10fc8e\\\&X-Amz-SignedHeaders\\\=host\ https://s3.amazonaws.com/cache_bucket/1234567890/cache--node-5.11.tgz\\\?X-Amz-Algorithm\\\=AWS4-HMAC-SHA256\\\&X-Amz-Credential\\\=abcdef0123456789\\\%2F20161227\\\%2Fus-east-1\\\%2Fs3\\\%2Faws4_request\\\&X-Amz-Date\\\=20161227T052204Z\\\&X-Amz-Expires\\\=60\\\&X-Amz-Signature\\\=1cfe3e095e51c595d3d1299ec89e109798c43ef7dae9e58ec2345730c087f441\\\&X-Amz-SignedHeaders\\\=host --timing
  fi
  if [[ -n $ERREXIT_SET ]]; then
    set -e
  fi
  if [[ $- = *e* ]]; then
    ERREXIT_SET=true
  fi
  set +e
  if [[ -f $CASHER_DIR/bin/casher ]]; then
    travis_cmd type\ rvm\ \&\>/dev/null\ \|\|\ source\ \~/.rvm/scripts/rvm --timing
    travis_cmd rvm\ \$\(travis_internal_ruby\)\ --fuzzy\ do\ \$CASHER_DIR/bin/casher\ add\ test-server/bower --timing
  fi
  if [[ -n $ERREXIT_SET ]]; then
    set -e
  fi
travis_fold end cache.1

travis_cmd node\ --version --echo
travis_cmd npm\ --version --echo
travis_cmd nvm\ --version --echo

travis_fold start before_install.1
  travis_cmd sudo\ apt-get\ install\ tidy\ libtidy-0.99-0\ build-essential\ git\ cmake\ xsltproc\ xvfb\ -y --assert --echo --timing
travis_fold end before_install.1

travis_fold start before_install.2
  travis_cmd sh\ -e\ /etc/init.d/xvfb\ start --assert --echo --timing
travis_fold end before_install.2

travis_fold start before_install.3
  travis_cmd npm\ install --assert --echo --timing
travis_fold end before_install.3

travis_fold start install.1
  travis_cmd npm\ run\ bower --assert --echo --timing
travis_fold end install.1

travis_fold start install.2
  travis_cmd npm\ run\ typings --assert --echo --timing
travis_fold end install.2

travis_fold start install.3
  travis_cmd npm\ run\ build --assert --echo --timing
travis_fold end install.3

travis_fold start install.4
  travis_cmd npm\ run\ getslimer --assert --echo --timing
travis_fold end install.4

if [[ -f package.json ]]; then
  travis_cmd npm\ test --echo --timing
else
  travis_cmd make\ test --echo --timing
fi

travis_result $?

travis_fold start cache.2
  echo -e "store build cache"
  if [[ $- = *e* ]]; then
    ERREXIT_SET=true
  fi
  set +e
  if [[ -n $ERREXIT_SET ]]; then
    set -e
  fi
  if [[ $- = *e* ]]; then
    ERREXIT_SET=true
  fi
  set +e
  if [[ -f $CASHER_DIR/bin/casher ]]; then
    travis_cmd type\ rvm\ \&\>/dev/null\ \|\|\ source\ \~/.rvm/scripts/rvm --timing
    travis_cmd rvm\ \$\(travis_internal_ruby\)\ --fuzzy\ do\ \$CASHER_DIR/bin/casher\ push\ https://s3.amazonaws.com/cache_bucket/1234567890//cache-trusty-f3229c1e87844dd12bfcceadb2cd05cc2dfde87db8327fccb58b06138837fde6--node-5.11.tgz\\\?X-Amz-Algorithm\\\=AWS4-HMAC-SHA256\\\&X-Amz-Credential\\\=abcdef0123456789\\\%2F20161227\\\%2Fus-east-1\\\%2Fs3\\\%2Faws4_request\\\&X-Amz-Date\\\=20161227T052204Z\\\&X-Amz-Expires\\\=60\\\&X-Amz-Signature\\\=0f157e995dcfe625be39fe94052eefc6266ce95cd04707cdf5d5882d524d6dae\\\&X-Amz-SignedHeaders\\\=host --timing
  fi
  if [[ -n $ERREXIT_SET ]]; then
    set -e
  fi
travis_fold end cache.2

if [[ $TRAVIS_TEST_RESULT = 0 ]]; then
  travis_fold start after_success
    travis_cmd npm\ run\ codecov --echo --timing
  travis_fold end after_success
fi

echo -e "\nDone. Your build exited with $TRAVIS_TEST_RESULT."

travis_terminate $TRAVIS_TEST_RESULT
