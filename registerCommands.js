const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("trash")
    .setDescription("Put a user in the trash.")
    .addUserOption(option =>
      option.setName("user").setDescription("Select a user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("xkcd")
    .setDescription("Sends a random xkcd meme")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash command...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log("Slash command registered!");
  } catch (error) {
    console.error(error);
  }
})();
