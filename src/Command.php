<?php
namespace Shed;

class Command
{
    const ENV_FILE = '.env';

    static private function getEnv()
    {
        return parse_ini_file(getcwd() . '/' . static::ENV_FILE);
    }

    static private function setEnv(array $config)
    {
        $config = array_replace(static::getEnv(), $config);
        $ini = '';

        foreach ($config as $attr => $val) {
            $ini .= "$attr=$val\n";
        }

        file_put_contents(getcwd() . '/' . static::ENV_FILE, $ini);
    }

    static private function populateSystemEnv()
    {
        putenv("USER_ID=" . getmyuid());
        putenv("GROUP_ID=" . getmygid());
    }

    static private function container($name)
    {
        if (!in_array($name, ['apache', 'mysql', 'postgres'])) {
            echo "You must specify either the apache, mysql, or postgres container.\n";
            exit(1);
        }

        static::populateSystemEnv();
        $container_id = trim(shell_exec("docker-compose ps -q $name"));

        if (!$container_id) {
            echo "Container $name could not be found. Is it running?\n";
            exit(1);
        }

        return $container_id;
    }

    static private function runInteractiveCommand($cmd, array $args = [])
    {
        static::populateSystemEnv();
        $cmd .= ' ' . implode(' ', array_map('escapeshellarg', $args));
        $process = proc_open($cmd, [STDIN, STDOUT, STDERR], $pipes);

        do {
            usleep(50000);
            $status = proc_get_status($process);
        } while($status['running']);
    }



    private $args = [];

    public function __construct($args, $pwd)
    {
        $this->args = $args;
        $this->pwd = rtrim($pwd, '/');
    }

    public function run()
    {
        if (count($this->args) == 0) {
            $this->help();
            exit(1);
        }

        switch ($this->args[0]) {
            case '-h':
            case '--help':
                $this->help();
                break;

            case 'config':
                $this->config();
                break;

            case 'fetch':
                $this->fetch();
                break;

            case 'mysql':
                $this->mysql();
                break;

            case 'psql':
                $this->psql();
                break;

            case 'npm':
            case 'php':
                $this->runInEquivalentPath($this->args[0]);
                break;

            case 'sh':
                $this->sh();
                break;

            default:
                static::populateSystemEnv();
                passthru(
                    'docker-compose ' . implode(' ',
                        array_map('escapeshellarg', $this->args)
                    ),
                    $exit
                );
                exit($exit);
        }
    }

    public function help()
    {
        echo implode("\n", [
            "Manage your shed containers.",
            "",
            "Usage:",
            "  shed [COMMAND] [ARGS...]",
            "  shed -h|--help",
            "",
            "Commands:",
            "  build    Build or rebuild services.",
            "  down     Stop shed containers.",
            "  fetch    Fetch a remote database.",
            "  mysql    Access MySQL.",
            "  psql     Access PostgreSQL.",
            "  npm      Run NPM within the apache container.",
            "  php      Run PHP within the apache container.",
            "  sh       Access a container.",
            "  start    Start shed services.",
            "  stop     Stop shed services.",
            "  ps       Show status of shed services.",
            "  up       Create and start shed containers.",
            ""
        ]);
    }

    public function config()
    {
        $env = static::getEnv();

        if (count($this->args) < 2) {
            foreach ($env as $attr => $val) {
                echo "$attr = $val\n";
            }
        } elseif (count($this->args) == 2) {
            if (isset($env[$this->args[1]])) {
                echo $this->args[1] . " = " . $env[$this->args[1]] . "\n";
            }
        } else {
            $env[$this->args[1]] = $this->args[2];
            static::setEnv($env);
        }
    }

    public function runInEquivalentPath($cmd)
    {
        $env = static::getEnv();
        if (strpos($this->pwd, $env['sites']) === 0) {
            $path = '/var/www/' . substr($this->pwd, strlen($env['sites']));
        } else {
            $path = '/var/www';
        }
        $id = static::container('apache');
        static::runInteractiveCommand(
            "docker exec -it $id bash -c \"cd $path; " . implode(' ', $this->args) . "\""
        );
    }

    public function mysql()
    {
        $id = static::container('mysql');
        static::runInteractiveCommand(
            "docker exec -it $id mysql",
            array_slice($this->args, 1)
        );
    }

    public function psql()
    {
        $id = static::container('postgres');
        static::runInteractiveCommand(
            "docker exec -it $id psql",
            array_slice($this->args, 1)
        );
    }

    public function fetch()
    {
        if (count($this->args) < 4) {
            echo "Usage: shed fetch postgres|mysql DBNAME SERVER\n";
            exit(1);
        }

        $id = static::container($this->args[1]);
        $db = $this->args[2];
        $host = $this->args[3];

        if ($this->args[1] == 'mysql') {
            static::runInteractiveCommand(
                "ssh $host mysqldump --databases --add-drop-database $db | docker exec -i $id mysql"
            );
        } elseif ($this->args[1] == 'postgres') {
            static::runInteractiveCommand(
                "ssh $host pg_dump -C -U postgres $db | docker exec -i $id psql -U postgres > /dev/null"
            );
        } else {
            echo "DB type must be mysql or postgres.\n";
            exit(1);
        }
    }

    public function sh()
    {
        if (count($this->args) > 1) {
            $name = $this->args[1];
        } else {
            $name = 'apache';
        }
        $id = static::container($name);
        static::runInteractiveCommand("docker exec -it $id bash -i");
    }
}
