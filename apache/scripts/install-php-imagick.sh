#!/bin/bash
set -e

cd /tmp
wget https://pecl.php.net/get/imagick-3.4.0.tgz
tar xvzf imagick-3.4.0.tgz

cd /tmp/imagick-3.4.0
phpize
./configure
make install

rm -rf /tmp/imagick-3.4.0

echo 'extension=imagick.so' > /usr/local/etc/php/conf.d/imagick.ini
