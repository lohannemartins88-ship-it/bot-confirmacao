require('dotenv').config();

const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const app = express();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ===== CONFIGURAÇÕES =====
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("❌ A variável DISCORD_TOKEN não foi encontrada!");
    process.exit(1);
}

const CLIENTE_ROLE_ID = '1483220204514185366';
const GUILD_ID = '1317689887729651722';
const OWNER_ID = '1287595944380076124';

// ===== SERVIDOR HTTP PARA RENDER =====
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot da Loja de Robux Online!');
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP iniciado na porta ${PORT}`);
});

// ===== BOT =====
client.once('ready', async () => {
    console.log(`✅ Bot da Loja de Robux Ativado: ${client.user.tag}`);

    const guild = client.guilds.cache.get(GUILD_ID);

    if (guild) {
        await guild.commands.create(
            new SlashCommandBuilder()
                .setName('compra_finalizada')
                .setDescription('Finaliza a venda e entrega o cargo de cliente')
                .addUserOption(option =>
                    option
                        .setName('comprador')
                        .setDescription('O usuário que comprou os Robux')
                        .setRequired(true)
                )
        );

        console.log('✅ Comando /compra_finalizada registrado!');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'compra_finalizada') {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: '❌ Apenas o dono da loja pode usar este comando!',
                ephemeral: true
            });
        }

        const member = interaction.options.getMember('comprador');
        const role = interaction.guild.roles.cache.get(CLIENTE_ROLE_ID);

        if (!role) {
            return interaction.reply({
                content: '❌ Não encontrei o cargo de cliente.',
                ephemeral: true
            });
        }

        try {
            await member.roles.add(role);

            await interaction.reply({
                content: `⤷ Agora ${member} é um cliente! >⩊<`
            });

        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: '❌ Erro ao dar o cargo! Verifique se o cargo do BOT está acima do cargo Cliente.',
                ephemeral: true
            });
        }
    }
});

client.login(TOKEN);