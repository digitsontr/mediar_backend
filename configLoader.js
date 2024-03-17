const localConfig = require("./config");
const releaseConfig = require("./config.release");
const developConfig = require("./config.develop");

let config;

switch (process.env.NODE_ENV) {
    case "local":
        config = localConfig;
        break;
    case "release":
        config = releaseConfig;
        break;
    case "develop":
        config = developConfig;
        break;
    default:
        config = localConfig;
}

module.exports = config;
