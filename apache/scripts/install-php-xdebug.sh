#!/bin/bash
set -e

# download
cd /tmp
git clone https://github.com/xdebug/xdebug
cd /tmp/xdebug

# compile and install
phpize
./configure --enable-xdebug
make
cp modules/xdebug.so $(php-config --extension-dir)/

# cleanup
rm -rf /tmp/xdebug

echo 'zend_extension=xdebug.so' > /usr/local/etc/php/conf.d/xdebug.ini
