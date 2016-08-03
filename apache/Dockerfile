FROM php:7.0-apache
RUN a2enmod rewrite vhost_alias
RUN apt-get update
RUN apt-get install -y \
    build-essential \
    pkg-config \
    git-core \
    autoconf \
    libjpeg62-turbo-dev \
    libmcrypt-dev \
    libpng12-dev \
    libcurl4-openssl-dev \
    libpq-dev \
    libmemcached-dev \
    libmemcached11 \
    libsqlite3-dev \
    libmagickwand-dev \
    imagemagick \
    subversion \
    python \
    g++ \
    curl \
    vim \
    wget \
    netcat \
    chrpath
RUN docker-php-ext-install \
    iconv \
    mcrypt \
    opcache \
    curl \
    gd \
    mysqli \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    pdo_sqlite \
    pgsql \
    zip

COPY scripts/ /

# install memcached
RUN bash /install-php-memcached.sh && rm /install-php-memcached.sh

# install imagick
RUN bash /install-php-imagick.sh && rm /install-php-imagick.sh

# install xdebug
RUN bash /install-php-xdebug.sh && rm /install-php-xdebug.sh

# install composer
WORKDIR /tmp
RUN wget https://getcomposer.org/composer.phar
RUN mv composer.phar /bin/composer
RUN chmod 700 /bin/composer

# cleanup
RUN apt-get clean
RUN apt-get autoremove -y
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/src/*

# create base document root
RUN mkdir -p /var/shed/public
COPY /public/ /var/shed/public/

# install webgrind
RUN bash /install-webgrind.sh && rm /install-webgrind.sh

# copy in configuration files
COPY /000-default.conf /etc/apache2/sites-enabled/000-default.conf

# copy in PHP config
COPY /php.ini /usr/local/etc/php/php.ini
