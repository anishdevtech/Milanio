const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    AutocompleteInteraction
} = require("discord.js");
const { Manager } = require("lavalink-client"); // Ensure you import the Manager from lavalink-client
const ExtendedClient = require("../../../class/ExtendedClient");
const { getThumbnailUrl,getDominantColor } = require("../../../Functions/music.js");
module.exports = {
    structure: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play music of your choice")
        .addStringOption(option =>
            option
                .setName("query")
                .setDescription("The song name or URL")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName("platform")
                .setDescription("Select the music platform")
                .setRequired(false)
                .addChoices(
                    { name: "YouTube", value: "youtube" },
                    { name: "Spotify", value: "spotify" },
                    { name: "SoundCloud", value: "soundcloud" }
                )
        )
        .addBooleanOption(option =>
            option
                .setName("loop")
                .setDescription("Enable or disable looping")
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("shuffle")
                .setDescription("Shuffle the queue")
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName("volume")
                .setDescription("Set the volume level (0-100)")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("seek")
                .setDescription(
                    "Seek to a specific position in the track (mm:ss)"
                )
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName("skipto")
                .setDescription("Skip to a specific track in the queue")
                .setRequired(false)
        ),

    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction | AutocompleteInteraction} interaction
     */
    run: async (client, interaction) => {
        if (interaction instanceof AutocompleteInteraction) {
            const query = interaction.options.getFocused();
            console.log(query)
            if (!query) return;

            const results = await player.search(query, interaction.user);
            const tracks = results.tracks.slice(0, 10);

            const suggestions = tracks.map(track => ({
                name: track.info.title,
                value: track.info.uri
            }));

            return interaction.respond(suggestions);
        }

        try {
            const query = interaction.options.getString("query");
            const platform = interaction.options.getString("platform")||"youtube";
            const loop = interaction.options.getBoolean("loop")||false;
            const shuffle = interaction.options.getBoolean("shuffle");
            const volume = interaction.options.getInteger("volume");
            const seek = interaction.options.getString("seek");
            const skipto = interaction.options.getInteger("skipto");

            // Acknowledge the interaction immediately
            await interaction.deferReply();

            // Ensure the user is in a voice channel
            const memberVoiceChannel = interaction.member.voice.channel;
            if (!memberVoiceChannel) {
                return interaction.editReply({
                    content: "You need to be in a voice channel to play music!"
                });
            }

            // Check if the player already exists for the guild
            let player = client.lavalink.players.get(interaction.guild.id);
            if (!player) {
                player = await client.lavalink.createPlayer({
                    guildId: interaction.guild.id,
                    voiceChannelId: memberVoiceChannel.id,
                    textChannelId: interaction.channel.id,
                    selfDeaf: true
                });
                await player.connect();
            }

            // Search for the song on the specified platform
            const results = await player.search(
                query,
                interaction.user,
                platform
            );
            if (results.loadType === "NO_MATCHES") {
                return interaction.editReply({ content: "No results found." });
            }

            const track = results.tracks[0];
            player.queue.add(track);

            if (!player.playing && !player.paused) {
                await player.play();
            }

            // Set options if provided
            if (volume !== null) {
                player.setVolume(volume);
            }
            if (seek) {
                const [minutes, seconds] = seek.split(":").map(Number);
                const seekPosition = (minutes * 60 + seconds) * 1000;
                player.seek(seekPosition);
            }
            if (
                skipto !== null &&
                skipto > 0 &&
                skipto <= player.queue.length
            ) {
                player.queue.splice(0, skipto - 1);
                player.stop();
            }
            if (loop) {
                player.setRepeatMode("track");
            }
            if (shuffle) {
                player.queue.shuffle();
            }

            // Build the embed with track information

            let thumbnail = await getThumbnailUrl(track.info.uri);
            let color = await getDominantColor(thumbnail)||null;
            const embed = new EmbedBuilder()
                .setTitle("Now Playing")
                .setDescription(`[${track.info.title}](${track.info.uri})`)
                .setColor(color)
                .setThumbnail(thumbnail)
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in play command:", error);
            return interaction.editReply({
                content: "An error occurred while processing your request."
            });
        }
    }
};
