const { readdirSync } = require("fs");
const path = require("path");
const ExtendedClient = require("../class/ExtendedClient");
const {log} = require("../functions.js")
/**
 *
 * @param {ExtendedClient} client
 */
module.exports = client => {
    const categories = readdirSync("./src/commands/");

    categories.forEach(category => {
        const commandDirs = readdirSync(`./src/commands/${category}`);
        commandDirs.forEach(dir => {
            const commandFiles = readdirSync(
                `./src/commands/${category}/${dir}`
            ).filter(file => file.endsWith(".js"));
            const subcommands = [];

            commandFiles.forEach(file => {
                const command = require(
                    path.join(
                        __dirname,
                        `../commands/${category}/${dir}/${file}`
                    )
                );
                if (!command.structure?.name || !command.run) {
                    console.log(
                        `Unable to load the command ${file} due to missing 'structure#name' or/and 'run' properties.`
                    );
                    return;
                }

            log(`Loading __${command.structure.name}__ from __${dir}__ category.`,"info")
                subcommands.push(command.structure);
             //   console.log(command)
                client.collection.interactioncommands.set(
                    command.structure.name,
                    command
                );
            });
const processDescription = ({ description }) => ({ description: description ? description.trim() === '' ? 'No description found' : description : 'No description found' });


            client.applicationcommandsArray.push({
                name: dir.toLowerCase(),
                description: `${dir} commands`,
                options: subcommands.map(sub => ({
                    type: 1, // 1 for subcommand
                    name: sub.name,
                    ...processDescription(sub), // Using object spread to merge the properties
                    options: sub.options || []
                }))
            });
            

          //  console.log(...client.applicationcommandsArray);
            client.collection.slashCat.set(dir, category);
        });
    });
};

