import localConfig from "./config"
import releaseConfig from "./config.release"
import developConfig from "./config.develop"

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

export default config;

