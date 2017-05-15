#!/usr/bin/env node
"use strict";

/**
 * This file defines the CLI command and maps its commands to ShedEnvironment
 * methods.
 */

const shedEnv   = require("./shed-environment");
const commander = require("commander");

/**
 * consants
 */
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


/**
 * shed config
 */
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


/**
 * shed sh
 */
commander
    .command("sh")
    .description("sh")
    .allowUnknownOption()
    .action(cmd => {
        let env = new shedEnv(commander.opts(), process.cwd);
        env.runInContainer("bash", commander.rawCommandArgs());
    });

/**
 * shed mysql
 */
commander
    .command("mysql")
    .description("mysql")
    .allowUnknownOption()
    .action(cmd => {
        let env = new shedEnv(commander.opts(), process.cwd);
        env.option("container", "mysql");
        env.runInContainer("mysql", commander.rawCommandArgs());
    });

/**
 * shed psql
 */
commander
    .command("psql")
    .description("psql")
    .allowUnknownOption()
    .action(cmd => {
        let env = new shedEnv(commander.opts(), process.cwd);
        env.option("container", "postgres");
        env.runInContainer(["psql", "-U", "postgres"], commander.rawCommandArgs());
    });

/**
 * shed compose
 */
commander
    .command("compose [args...]")
    .description("Run a docker-compose command.")
    .allowUnknownOption()
    .action(() => {
        let env = new shedEnv(commander.opts(), process.cwd);
        env.runOnHost("docker-compose", commander.rawCommandArgs());
    });


/**
 * This is sugar to allow some shed compose commands to be run without
 * including 'compose'.
 */
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
