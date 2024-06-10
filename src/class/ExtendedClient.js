const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require("discord.js");
const { LavalinkManager } = require("lavalink-client");
const config = require("../config");
const webSocket = require("ws");
const commands = require("../handlers/commands");
const events = require("../handlers/events");
const deploy = require("../handlers/deploy");
const mongoose = require("../handlers/mongoose");
const components = require("../handlers/components");
const Functions = require("../handlers/Functions.js");
const { disableAllButtons } = require("../Functions/Utility.js");

module.exports = class extends Client {
    config = config.bot;
    // websocket = new webSocket('ws://128.254.225.82:2640'); //
    temdb = new Collection();
    buttonDisable = disableAllButtons;
    collection = {
        interactioncommands: new Collection(),
        prefixcommands: new Collection(),
        prefixCat: new Collection(),
        slashCat: new Collection(),
        aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection()
        }
    };
    applicationcommandsArray = [];

    constructor() {
        super({
            intents: Object.keys(GatewayIntentBits),
            partials: Object.keys(Partials),
            presence: {
                activities: [
                    {
                        name: "something goes here",
                        type: 4,
                        state: "Milanio v2"
                    }
                ]
            }
        });

        // Initialize Lavalink Manager
        this.lavalink = new LavalinkManager({
            nodes: [
                {
                    authorization: "catfein",
                    host: "lavalink4.alfari.id",
                    port: 443,
                    secure:true,
                    id: "main"
                }
            ],
            sendToShard: (guildId, payload) =>
                this.guilds.cache.get(guildId)?.shard?.send(payload),
            client: {
                id: process.env.CLIENT_ID || config.client.id,
                username: "YourBotUsername"
            },
            autoSkip: true,
            playerOptions: {
                clientBasedPositionUpdateInterval: 150,
                defaultSearchPlatform: "ytmsearch",
                volumeDecrementer: 0.75,
                onDisconnect: {
                    autoReconnect: true,
                    destroyPlayer: false
                },
                onEmptyQueue: {
                    destroyAfterMs: 30000
                }
            },
            queueOptions: {
                maxPreviousTracks: 25
            }
        });

        this.on("raw", d => this.lavalink.sendRawData(d));
        this.on("ready", async () => {
            
            await this.lavalink.init(this.user);
            console.log("Lavalink started")
        });
    }

    start = async () => {
        commands(this);
        events(this);
        components(this);
        Functions(this);

        if (config.handler.mongodb.enabled) mongoose();

        await this.login(process.env.CLIENT_TOKEN || config.client.token);

        if (config.handler.deploy) deploy(this, config);
    };
};
