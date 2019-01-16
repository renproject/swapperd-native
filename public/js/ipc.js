// @ts-check

const menubar = require("menubar");

const {
    ipcMain,
} = require("electron");

const devMode = process.env.NODE_ENV == "development";

const log = devMode ? console.log : () => null;


const mb = menubar({
    tooltip: "Swapperd",
    preloadWindow: true,
    resizable: devMode,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + "/preload.js",
    },
});

/**
 * sendToRenderer is used to communicate to the Renderer
 * 
 * @param {string} path
 * @param {any} value
 * @param {Error} error
 */
const sendToRenderer = (path, value, error) => {
    log(`sendToRenderer ${path} ${JSON.stringify(value)} ${error}`);
    mb.window.webContents.send(path, value, error);
}

/**
 * In order to use this, two routes must be defined in main.js, `${route}` and
 * `${route}-response`.
 * 
 * @param {string} route
 * @param {number} seconds
 * @param {any} value
 */
const sendSyncWithTimeout = (route, seconds, value) => new Promise((resolve, reject) => {
    log(`sendSyncWithTimeout ${route}`)

    once(`${route}-response`,
        /**
         * @param {any} value
         * @param {Error} error
         */
        (value, error) => {
            log(`got back sendSyncWithTimeout ${route} returned ${value} ${error}`);

            if (error) {
                reject(error);
            }

            resolve(value);
        });

    sendToRenderer(route, value, null);

    // Reject after timeout
    if (seconds !== 0) {
        setTimeout(() => reject(new Error("timeout")), seconds * 1000);
    }
});

const on =
    /**
     * @param {string} route
     * @param {(value: any, error: Error) => any | Promise<any>} callback
     */
    (route, callback) => {

        ipcMain.on(route,
            /**
             * @param {any} _event
             * @param {[any, Error]} args
             */
            async (_event, ...args) => {
                log(`handling on ${route}`)
                try {
                    const [value, _error] = args;
                    let response;
                    try {
                        response = await callback(value, _error);

                    } catch (error) {
                        console.error(error);
                        sendToRenderer(`${route}-response`, response, error);
                        return;
                    }

                    sendToRenderer(`${route}-response`, response, null);
                } catch (error) {
                    console.error(error);
                }
            }
        );
    }

const once =
    /**
     * @param {string} route
     * @param {{ (value: any, error: Error): void | Promise<void>; }} callback
     */
    (route, callback) => {
        ipcMain.once(route,
            /**
             * @param {any} _event
             */
            async (_event, ...args) => {
                log(`handling once(${route}) with args: ${args}`);
                try {
                    const [params, error] = args;
                    callback(params, error);
                } catch (error) {
                    callback(null, error);
                }
            });
    }

module.exports = {
    on,
    mb,
    sendSyncWithTimeout,
    sendToRenderer,
}