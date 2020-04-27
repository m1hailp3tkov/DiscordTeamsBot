const Discord = require('discord.js');
const fs = require('fs');

const bot = new Discord.Client();
const config = JSON.parse(fs.readFileSync("config.json"));
const COMMAND_START = "!team";

bot.login(config.TOKEN);

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (msg) => {
    if (msg.author.id === bot.user.id) return;

    if (msg.content.split(' ')[0] === COMMAND_START) {
        await handleMsg(msg);
    }
});

const getIds = (str) => {
    const MENTION_REGEX = (/\s*<@!?(\d+)>\s*/g);
    return [...str.matchAll(MENTION_REGEX)].map(x => x[1]);
}

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

const generateTeams = (teamA, teamB, bench) => {
    teamA_distinct = [...new Set(teamA)];
    teamB_distinct = [...new Set(teamB)];
    bench_distinct = [...new Set(bench)];

    if (teamA_distinct.find(x => teamB_distinct.includes(x))) {
        throw new Error("One or more players is in both teams");
    }

    if ((teamA_distinct.length + teamB_distinct.length + bench_distinct.length) % 2 !== 0) {
        throw new Error("Cannot split players evenly.");
    }

    const filteredBench = bench_distinct
        .filter(p => !teamA_distinct.includes(p) && !teamB_distinct.includes(p));

    let remainingBench = [...filteredBench];

    while (remainingBench.length > 0) {
        let index = getRandomInt(remainingBench.length);

        if (teamA_distinct.length < teamB_distinct.length)
            teamA_distinct.push(remainingBench[index]);
        else
            teamB_distinct.push(remainingBench[index]);

        remainingBench = remainingBench
            .slice(0, index)
            .concat(remainingBench.slice(index + 1));
    }

    return { teamA: teamA_distinct, teamB: teamB_distinct };
}

const sendTeamsMessage = (teamA, teamB, channel) => {
    let str = `**TEAM A:**\r\n\t${teamA.map(x => `<@${x}>`).join(', ')}\r\n\**TEAM B**:\r\n\t${teamB.map(x => `<@${x}>`).join(', ')}`;
    channel.send(str);
}

const handleMsg = async (msg) => {
    const command = msg.content
        .toLowerCase()
        .substr(COMMAND_START.length)
        .trim();

    let playersToExclude = [];
    let playersToBench = [];

    if (command.includes('without')) {
        playersToExclude = getIds(command.split('without')[1]);

    } else if (command.includes('with')) {
        playersToBench = getIds(command.split('with')[1]);
    }


    let playersAvailable = [];
    const allPlayers =
        msg.member.voice.channel === null
            ?
            [...
                msg.channel.members
                    .filter(member => !member.user.bot)
                    .keys()
            ]
            :
            [...
                msg.member.voice.channel.members
                    .filter(member => !member.user.bot)
                    .keys()
            ];

    if (playersToBench.length > 0) {
        playersAvailable = playersToBench;
    }
    else if (playersToExclude.length > 0) {
        playersAvailable = allPlayers
            .filter(p => !playersToExclude.includes(p));
    }
    else {
        playersAvailable = allPlayers;
    }


    let teamA = [], teamB = [];

    const playersToTeamUp = command.split('with')[0].split('vs');
    teamA = getIds(command.split('with')[0].split('vs')[0]);

    if (playersToTeamUp[1]) {
        teamB = getIds(command.split('with')[0].split('vs')[1]);
    }


    try {
        const teams = generateTeams(teamA, teamB, playersAvailable);
        sendTeamsMessage(teams.teamA, teams.teamB, msg.channel);
    }
    catch (err) {
        await msg.channel.send(err.message);
    }
}