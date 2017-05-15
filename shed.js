#!/usr/bin/env node
"use strict";

const shedEnv   = require("./shed-environment");
const commander = require("commander");

const composeCommands = ['start', 'stop', 'up', 'down', 'ps'];

/**
 * Help function that returns the equivalent for rawArgs except with the
 * command, subcommand, and any commander options stripped out.
 */
commander.rawCommandArgs = function(args) {
    let arg = null,
        argv = this.rawArgs.slice(3),
        len = argv.length;

    if (args === undefined) {
        args = [];
    } else if (typeof(args) == "string") {
        args = [args];
    }

    for (let i = 0; i < len; i++) {
        arg = argv[i];
        let option = this.optionFor(arg);
        if (option) {
            if (option.required) {
                i++;
            } else if (option.optional) {
                arg = argv[i+1];
                if (arg && (arg == "-" || "-" != arg[0])) {
                    i++;
                }
            }
            continue;
        } else {
            args.push(arg);
        }
    };

    return args;
};

commander
    .version("0.3.0")
    .option("--sites <folder>", "sites directory")
    .option("--docroot <folder>", "docroot default", "public")
    .option("--log-level [level]", "logging level", "INFO")
    .option("--container <container>", "container", "apache")
    .option("--config <file>", "confg file")
    .option("--port <port>", "port", 80);

commander
    .command("config")
    .description("config")
    .action((param, val) => {
        let env = new shedEnv(commander.opts(), process.cwd);

        if (typeof(val) == "string") {
            env.option(param, val);
        } else if (typeof(param) == "string") {
            env.option(param);
        } else {
            env.option();
        }
    });

commander
    .command("sh")
    .description("sh")
    .allowUnknownOption()
    .action(cmd => {
        let env = new shedEnv(commander.opts(), process.cwd);
        env.runInContainer("bash", commander.rawCommandArgs());
    });

for (let i = 0; i < composeCommands.length; i++) {
    let cmd = composeCommands[i];
    commander
        .command(`${cmd} [args...]`)
        .description(`This is just a wrapper for docker-compose ${cmd}.`)
        .allowUnknownOption()
        .action(() => {
            let env = new shedEnv(commander.opts(), process.cwd);
            env.runOnHost("docker-compose", commander.rawCommandArgs(cmd));
        });
}

commander
    .command("compose [args...]")
    .description("Run a docker-compose command.")
    .allowUnknownOption()
    .action(() => {
        let env = new shedEnv(commander.opts(), process.cwd);
        env.runOnHost("docker-compose", commander.rawCommandArgs());
    });

commander.parse(process.argv);
