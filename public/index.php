<?php
$sites = array_map(
    function($dir) {
        return preg_replace('(^/var/www/(.*)/public$)', '$1.shed.host', $dir);
    },
    glob('/var/www/*/public', GLOB_ONLYDIR)
);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>my.shed.host</title>
    <link rel="stylesheet" href="shed.css">
</head>
<body>
    <header class="primary">
        <h1>my.shed.host</h1>
    </header>
    <main>
        <section>
            <h2>Sites</h2>
            <ul>
                <?php
                foreach ($sites as $site) {
                    printf('<li><a href="//%s">%s</a></li>', $site, $site);
                }
                ?>
            </ul>
        </section>
        <section>
            <h2>Databases</h2>
            <ul>
                <li><a href="/adminer/adminer/?server=mysql&username=root">MySQL</a></li>
                <li><a href="/adminer/adminer/?pgsql=postgres&username=postgres">PostgreSQL</a></li>
            </ul>
        </section>

        <section>
            <h2>System</h2>
            <p>
                Shed is currently running on
                <?= $_SERVER['SERVER_SOFTWARE'] ?> and
                PHP <?= phpversion() ?>.
            </p>
            <ul>
                <li><a href="/phpinfo.php">PHP Info</a></li>
            </ul>
        </section>
    </main>
</body>
</html>
