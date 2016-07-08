#!/bin/bash
set -e

# download
cd /tmp
git clone https://github.com/php-memcached-dev/php-memcached
cd /tmp/php-memcached
git checkout -b php7 origin/php7

# compile and install
phpize
./configure
make
make install

# cleanup
rm -rf /tmp/php-memcached

echo 'extension=memcached.so' > /usr/local/etc/php/conf.d/memcached.ini
