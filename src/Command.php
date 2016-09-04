<?php
namespace Shed;

class Command
{
    private $args = [];

    static private function container($name)
    {
        if (!in_array($name, ['apache', 'mysql', 'postgres'])) {
            echo "You must specify either the apache, mysql, or postgres container.\n";
            exit(1);
        }

        $container_id = trim(shell_exec("docker-compose ps -q $name"));

        if (!$container_id) {
            echo "Container $name could not be found. Is it running?\n";
            exit(1);
        }

        return $container_id;
    }

    static private function runInteractiveCommand($cmd, array $args = [])
    {
        $cmd .= ' ' . implode(' ', array_map('escapeshellarg', $args));
        $process = proc_open($cmd, [STDIN, STDOUT, STDERR], $pipes);

        do {
            usleep(50000);
            $status = proc_get_status($process);
        } while($status['running']);
    }

    public function __construct($args)
    {
        $this->args = $args;
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

            case 'mysql':
                $this->mysql();
                break;

            case 'psql':
                $this->psql();
                break;

            case 'sh':
                $this->sh();
                break;

            default:
                system(
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
            "  mysql    Access MySQL.",
            "  psql     Access PostgreSQL.",
            "  sh       Access a container.",
            "  start    Start shed services.",
            "  stop     Stop shed services.",
            "  up       Create and start shed containers.",
            ""
        ]);
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
