Shed
====

Introduction
------------

Shed (Shared Hosting Environment on Docker) is a simple set of docker
containers to make local development easier, in the same kind of way MAMP,
Laravel Valet, or Homestead does.

* Shed is runs on **every platform** docker does.
* Shed treats **folders as sites**, so adding a site is making a folder.
* Shed uses **wildcard DNS**, so **no configuration** needs to be done to add
  another site to Shed.
* Shed runs real Apache, MySQL, and PostgreSQL so your local enviroment matches
  production.

It's designed to provide a set-it-and-forget-it platform for local, web
development.


Setup
-----

To run Shed, you only need to be able to run [Docker](https://www.docker.com/).


### Default Enviroment

By default, Shed assumes the following setup:

* You have all your projects in one main folder: `Projects/` or `Sites/` perhaps.
* Shed is inside that folder.
* Shed should use the default HTTP port, port 80.
* Shed default to looking for a `public/` folder within each project to use as
  the document root.

If that's how you plan to use Shed, great. If not, you'll want to look in the
`docker-compose.yml` and make some adjustements.

Usage
-----

Start Shed by running `./shed up`. Once it's running, you can access your
projects based on their folder names. For example, To access
`Projects/example.com`, I would go to

* http://example.com.localtest.me

That's it. It you don't like using *.localtest.me, you can use any of the following:

* localtest.me - [readme.localtest.me](http://readme.localtest.me/)
* imarc.io - owned by [Imarc](https://www.imarc.com)
* 42foo.com - owned by [Jorge Bernal](https://jorgebernal.info/2009/07/17/42foo-virtual-hosts-web-development/)
* fuf.me - owned by [fidian](http://www.fidian.com/programming/public-dns-pointing-to-localhost)
* lacolhost.com - owned by [Reenhanced](http://blog.reenhanced.com/post/29566591244/developing-with-subdomains-just-got-a-lot-easier)
* lvh.me - owned by [Levi Cook](https://gist.github.com/levicook/563675)
* vcap.me - part of [Cloud Foundry](https://github.com/cloudfoundry-attic/vcap)

**Shed assumes** that the document root for all your projects is
`<projectfolder>/public`. If you use `docroot/` instead, you can try creating a
symlink like this:

```
$ ln -s public docroot
```

XDebug and Webgrind
-------------------

XDebug and Webgrind are setup within Shed as well. You can trigger XDebug
profiling by adding `?XDEBUG_PROFILE=1` to the end of a URL.

You can view That profile with Webgrind by going to

* http://shed.imarc.io/webgrind/
