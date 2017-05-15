"use strict";

const dotenv = require("dotenv");
const fs = require("fs");
const proc = require("child_process");

let ShedEnvironment = function() {};

ShedEnvironment = function(options, userCwd) {
    let cwd = __dirname;

    let idFor = function (name) {
        return proc.execSync(
            `docker-compose ps -q ${options.container}`,
            {cwd}
        ).toString().trim();
    };

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

    this.runInContainer = function (cmd, args) {
        let id = idFor(options.container);
        args = ["exec", "-it", id, "bash"].concat(args);
        proc.spawn("docker", args, {
            stdio: "inherit",
            cwd,
            env: Object.assign({}, process.env, this.opts)
        });
    };

    this.runOnHost = function(cmd, args) {
        console.log("proc.spawn", cmd, args, cwd);
        proc.spawn(cmd, args, {
            stdio: "inherit",
            cwd,
            env: Object.assign({}, process.env, this.opts)
        });
    };

    // init

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
