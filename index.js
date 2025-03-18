const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const fetch = require("node-fetch");
const { parseString } = require("xml2js");
const dotenv = require("dotenv").config();
const fs = require('fs');
const { send } = require("process");
// dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Debug: List all servers the bot is in
   client.guilds.cache.forEach(guild => {
        console.log(`Bot is in: ${guild.name} (ID: ${guild.id})`);
    });
});
// message moderation defined here ---------------------
let badwords = [];
try {
  badwords = fs.readFileSync('badwords.txt', 'utf-8')
    .split(/\r?\n/)
    .filter(word => word.trim().length > 0); // Remove empty lines
} catch (error) {
  console.error("Error reading the file:", error);
}

console.log(badwords);

client.on('messageCreate', async msg => {
  if(msg.author.bot) return;
  const comment = msg.content.toLowerCase(); // Normalize case sensitivity
  if(comment === "!!xkcd") sendRandomXKCD(msg);
  if(comment === "!!joke") fetchJoke(msg);
  const found = badwords.find(word=>comment.includes(word))
  if(found){
    msg.reply(`\`\`\`|"${found}"|\`\`\`\nWhoa there, sailor! Let's keep it classy—this isn't a pirate ship!`);
  }
});
// defining functions to be used in the slash commands
async function ImageCombiner1(msg, image1){
  
      // Ensure the avatar is PNG
      // const avatarUrl = msg.user.displayAvatarURL({ extension: "png", size: 256 });
      const avatarUrl = msg.author.displayAvatarURL({ extension: "png", size: 256 });


      try {
          // Create canvas
          const canvasSize = 125; // Keep canvas small to prevent Discord stretching
          const canvas = createCanvas(canvasSize, canvasSize);
          const ctx = canvas.getContext("2d");

          // Load trash bag image
          const trashBag = await loadImage(image1).catch(err => {
              console.error("❌ Error loading trash bag image:", err);
              return null;
          });

          if (!trashBag) {
              await msg.reply("Error loading the image.");
              return;
          }

          // Load avatar image
          const avatar = await loadImage(avatarUrl).catch(err => {
              console.error("❌ Error loading avatar:", err);
              return null;
          });

          if (!avatar) {
              await msg.reply("Error loading the user's avatar.");
              return;
          }

          // Draw the trash bag background
          ctx.drawImage(trashBag, 0, 0, canvasSize, canvasSize);

          // Resize and position avatar dynamically
          const avatarSize = 50; // Adjust size of the avatar relative to canvas
          const avatarX = (canvasSize - avatarSize) / 2; // Center horizontally
          const avatarY = canvasSize * 0.55; // Place in lower section of bag

          // Overlay the avatar onto the trash bag
          ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
          console.log("✅ Avatar placed on trash bag at", avatarX, avatarY);

          // Convert to buffer and send image
          const buffer = canvas.toBuffer("image/png");
          await msg.reply({ files: [{ attachment: buffer, name: "trashed.png" }] });

      } catch (error) {
          console.error("Error processing image:", error);
          await msg.reply("Error generating image.");
      }
}
async function ImageCombiner(interaction, image1){
  
      const user = interaction.options.getUser("user");
      if (!user) {
          await interaction.reply("You must mention a user!");
          return;
      }

      // Ensure the avatar is PNG
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 256 });

      try {
          // Create canvas
          const canvasSize = 125; // Keep canvas small to prevent Discord stretching
          const canvas = createCanvas(canvasSize, canvasSize);
          const ctx = canvas.getContext("2d");

          // Load trash bag image
          const trashBag = await loadImage(image1).catch(err => {
              console.error("❌ Error loading trash bag image:", err);
              return null;
          });

          if (!trashBag) {
              await interaction.reply("Error loading the trash bag image.");
              return;
          }

          // Load avatar image
          const avatar = await loadImage(avatarUrl).catch(err => {
              console.error("❌ Error loading avatar:", err);
              return null;
          });

          if (!avatar) {
              await interaction.reply("Error loading the user's avatar.");
              return;
          }

          // Draw the trash bag background
          ctx.drawImage(trashBag, 0, 0, canvasSize, canvasSize);

          // Resize and position avatar dynamically
          const avatarSize = 50; // Adjust size of the avatar relative to canvas
          const avatarX = (canvasSize - avatarSize) / 2; // Center horizontally
          const avatarY = canvasSize * 0.55; // Place in lower section of bag

          // Overlay the avatar onto the trash bag
          ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
          console.log("✅ Avatar placed on trash bag at", avatarX, avatarY);

          // Convert to buffer and send image
          const buffer = canvas.toBuffer("image/png");
          await interaction.reply({ files: [{ attachment: buffer, name: "trashed.png" }] });

      } catch (error) {
          console.error("Error processing image:", error);
          await interaction.reply("Error generating image.");
      }
}
async function sendRandomXKCD(interaction) {
    await interaction.deferReply(); // Defer reply to handle API fetch time

    try {
        // Fetch the latest XKCD comic to get the max comic number
        const latest = await fetch("https://xkcd.com/info.0.json").then(res => res.json());
        const maxComicNum = latest.num;

        // Select a random comic number
        const randomNum = Math.floor(Math.random() * maxComicNum) + 1;

        // Fetch the random XKCD comic
        const comic = await fetch(`https://xkcd.com/${randomNum}/info.0.json`).then(res => res.json());

        // Reply with the XKCD comic
        await interaction.editReply({
            content: `**${comic.title}**\n${comic.link}`,
            files: [comic.img]
        });

    } catch (error) {
        console.error("Error fetching XKCD:", error);
        await interaction.editReply("Couldn't fetch an XKCD comic. Try again!");
    }
}
async function sendRandomXKCD(message) {
    try {
        // Fetch the latest XKCD comic to get the max comic number
        const latest = await fetch("https://xkcd.com/info.0.json").then(res => res.json());
        const maxComicNum = latest.num;

        // Select a random comic number
        const randomNum = Math.floor(Math.random() * maxComicNum) + 1;

        // Fetch the random XKCD comic
        const comic = await fetch(`https://xkcd.com/${randomNum}/info.0.json`).then(res => res.json());

        // Reply with the XKCD comic
        await message.reply({
            content: `**${comic.title}**\n${comic.link}`,
            files: [comic.img]
        });

    } catch (error) {
        console.error("Error fetching XKCD:", error);
        await message.reply("Couldn't fetch an XKCD comic. Try again!");
    }
}
async function fetchJoke(message) {
    let thisjoke;
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any');
        const data = await response.json();

        if (data.type === 'single') {
            thisjoke = data.joke;
        } else {
            thisjoke = `${data.setup}\n\n||${data.delivery}||`; // Spoiler tag for punchline
        }
    } catch (error) {
        console.error('Error fetching joke:', error);
        thisjoke = 'Failed to fetch a joke. Try again later!';
    }
    await message.reply({
        content: `${thisjoke}`
    });
}
async function fetchJoke(interaction) {
    let thisjoke;
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any');
        const data = await response.json();

        if (data.type === 'single') {
            thisjoke = data.joke;
        } else {
            thisjoke = `${data.setup}\n\n||${data.delivery}||`; // Spoiler tag for punchline
        }
    } catch (error) {
        console.error('Error fetching joke:', error);
        thisjoke = 'Failed to fetch a joke. Try again later!';
    }
    interaction.reply(`${thisjoke}`);// this might not be done, Have to wait for slash command to be registered to test it out. until then use the built in command prefix !!
}
// Slash commands defined below ------------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "trash") {
    ImageCombiner(interaction, "trash.png");
  }
  else if(interaction.commandName==="xkcd"){
    sendRandomXKCD(interaction);
  }
});


client.login(process.env.DISCORD_TOKEN);
