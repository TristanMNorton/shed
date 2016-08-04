#!/bin/bash
set -e

# download
cd /tmp
git clone https://github.com/jokkedk/webgrind
mv /tmp/webgrind /var/shed/public/webgrind
