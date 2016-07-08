Shed
====

Shed (Shared Hosting Environment on Docker) is a work in progress. It uses
Apache and vhost_alias to try to streamline local development by creating a
single set of containers that are shared instead of a separate set for each
project or site.


Usage
-----

First off, start docker by running `docker-compose up` or `docker-compose up -d`.

Once it's running, you can access your projects based on their folder name by
using a subdomain. Eventually we may setup an Imarc domain for this, but for
now, you can use localtest.me.

So, if you're trying to access the site in the folder "wordpress", you'd use

* http://wordpress.localtest.me/

**Shed assumes** that the document root for all your projects is
`<projectfolder>/public`. If you use `docroot/` instead, you can try creating a
symlink like this:

```
$ ln -s public docroot
```

That may be enough.

