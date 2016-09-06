Shed
====

simple local PHP development

Quick Start
-----------

1. You need [Docker](https://www.docker.com/) and [Composer](https://getcomposer.org/) installed.
2. `composer global require shed`
3. `shed config APACHE_BASE_PATH $HOME/Sites`
3. `shed up -d`

Introduction
------------

Shed provides a platform for simple, local, PHP development, in the same kind of way MAMP, Laravel Valet, or Homestead does.

* Shed uses Docker, and runs on **every platform** Docker does.
* Shed treats **folders as sites**, so adding a site is just making a folder.
* Shed makes use of **wildcard DNS**, so **no configuration** is required to add sites to Shed.
* Shed runs real Linux, Apache, MySQL, PostgreSQL and PHP, so your local environment matches production.

It's designed to provide a set-it-and-forget-it platform for local, PHP development.


Setup
-----

To run Shed, you only need to be able to run [Docker](https://www.docker.com/).


### Default Enviroment

By default, Shed assumes the following setup:

* You have all your projects in one main folder: `Projects/` or `Sites/` perhaps.
* Shed itself is inside that folder.
* Shed should use the default HTTP port, port 80.
* Within each project folder, Shed looks for a `public/` subfolder and uses that as the document root.

If that's how you plan to use Shed, great. If not, you'll want to look in the
`docker-compose.yml` and make some adjustements.


Usage
-----

Start Shed by running `./shed up`. Once it's running, you can access your
projects based on their folder names. For example, To access
`Projects/example.com`, I would go to

* http://example.com.shed.host

That's it. If you don't want to use shed.host, you can use any of the following:

* imarc.io - owned by [Imarc](https://www.imarc.com)
* localtest.me - [readme.localtest.me](http://readme.localtest.me/)
* lvh.me - owned by [Levi Cook](https://gist.github.com/levicook/563675)
* 42foo.com - owned by [Jorge Bernal](https://jorgebernal.info/2009/07/17/42foo-virtual-hosts-web-development/)
* fuf.me - owned by [fidian](http://www.fidian.com/programming/public-dns-pointing-to-localhost)
* lacolhost.com - owned by [Reenhanced](http://blog.reenhanced.com/post/29566591244/developing-with-subdomains-just-got-a-lot-easier)
* vcap.me - part of [Cloud Foundry](https://github.com/cloudfoundry-attic/vcap)

**Shed assumes** that the document root for all your projects is
`<projectfolder>/public`. If you use `docroot/` instead, you can try creating a
symlink like this:

```
$ ln -s public docroot
```


### How this works

\*.shed.host is setup using wildcard DNS to point to `127.0.0.1` - one of the IPs designed to always point to your own local system (*localhost*.) This eliminates any need to etc your `/etc/hosts` file.

Within Shed's apache container, it uses `mod_vhost_alias` to map these subdomains back to separate virtualhosts. This means that there's no new apache configuration required.


Adminer
-------

[Adminer](https://www.adminer.org/) is a lightweight webapp for managing databases, including both MySQL and PostgreSQL. The latest release of Adminer is included in Shed.

You can login by going to http://my.shed.host/ and clicking the relevant link, or:

* **MySQL:** host is `mysql`, username is `root`, no password
* **PostgresSQL:** host is `postgres`, username is `postgres`, no password


XDebug and Webgrind
-------------------

XDebug and Webgrind are setup within Shed as well. You can trigger XDebug
profiling by adding `?XDEBUG_PROFILE=1` to the end of a URL.

You can view That profile with Webgrind by going to

* http://my.shed.host/webgrind/
