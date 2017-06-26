"use strict";

const dotenv = require("dotenv");
const fs = require("fs");
const proc = require("child_process");

let ShedEnvironment = function() {};


/**
 * This represents an instance of shed for the sake of running commands and such. Most of Shed's logic should be in here.
 */
ShedEnvironment = function(options, userCwd) {
    let cwd = __dirname;

    let USER_ID = proc.execSync("id -u").toString().trim();
    let GROUP_ID = proc.execSync("id -g").toString().trim();

    /**
     * Helper function that fetches the Docker ID for a container by name.
     *
     * @param name  string  Name of the container to get the ID for.
     */
    let idFor = function (name) {
        return proc.execSync(
            `docker-compose ps -q ${name}`,
            {cwd, env: {USER_ID, GROUP_ID}}
        ).toString().trim();
    };

    /*
     * Displays or sets a configuration option. If no arguments are given at
     * all, it displays all configuration option values.
     *
     * @param param  string  Parameter to display or set.
     * @param val    string  If provided, sets the parameter to this value.
     */
    this.option = function(param, val) {
        if (val) {
            options[param] = val;
        } else if (param) {
            console.log(`${param}: ${options[param]}`);
        } else {
            for (param in options) {
                console.log(`${param}: ${options[param]}`);
            }
        }
    };

    /*
     * Runs a command within the container using docker exec. Both cmd or args
     * can be arrays or a single string.
     *
     * @param cmd   mixed  a single argument (as a string) or an array of
     *                     arguments.
     * @param args  mixed  a single argument (as a string) or an array of
     *                     arguments.
     */
    this.runInContainer = function (cmd, args) {
        let id = idFor(options.container);

        if (process.stdin.isTTY) {
            args = ["exec", "-it", id].concat(cmd, args);
        } else {
            args = ["exec", "-i", id].concat(cmd, args);
        }

        proc.spawn("docker", args, {
            stdio: "inherit",
            cwd,
            env: Object.assign({USER_ID, GROUP_ID}, process.env, this.opts)
        });
    };

    /**
     * Runs a command on the host (where shed is installed.) cmd must be a
     * string (a single executable.)
     *
     * @param cmd   string  an executable.
     * @param args  array   an array of arguments.
     */
    this.runOnHost = function(cmd, args) {
        proc.spawn(cmd, args, {
            stdio: "inherit",
            cwd,
            env: Object.assign({USER_ID, GROUP_ID}, process.env, this.opts)
        });
    };


    /**
     * Fetches a remote database and loads it into the respective container.
     * This depends on the host's SSH configuration.
     *
     * @param type      string  Should be 'mysql' or 'postgres'.
     * @param database  string  Name of the remote database to fetch.
     * @param server    string  Name of the remote server to connect to.
     */
    this.fetchDatabase = function(type, database, server) {
        console.log('fetchDatabase', type, database, server);
        if (type == "mysql") {
            let id = idFor("mysql");
            let dbDump = proc.execSync(`ssh ${server} mysqldump --databases --add-drop-database ${database}`);
            proc.execSync(`docker exec -i ${id} mysql`, {
                input: dbDump
            });

        } else if (type == "postgres" || type == "psql") {
            let id = idFor("postgres");
            let dbDump = proc.execSync(`ssh ${server} pg_dump -C -U postgres ${database}`);
            proc.execSync(`docker exec -i ${id} psql -U postgres > /dev/null`, {
                input: dbDump
            });
        }
    };


    /**
     * initization code.
     */

    // remove undefined options
    Object.keys(options)
        .forEach(key => options[key] === undefined && delete options[key]);

    // combine with .env options
    if (fs.existsSync( cwd + "/.env")) {
        let envOptions = dotenv.parse(fs.readFileSync(cwd + "/.env"));
        options = Object.assign(
            {},
            envOptions,
            options
        );
    }
};

module.exports = ShedEnvironment;
