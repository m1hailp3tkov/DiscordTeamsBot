# DiscordTeamsBot

A Discord Bot for when you just cannot decide how to team up with your friends

### Usage
If the user calling the bot is in a voice channel, the members from it will be used to create a team.
If the user is not currently in a voice channel, the bot will pick from all members unless specified using ``with``.

``!team @member1 @member2 [vs] @member3 [with/without] @other @member @names``

```!team``` only will team up all players

``!team @1 @2 `` will *ALWAYS* put @1 and @2 in the same team 

``!team @1 vs @2`` will *ALWAYS* put @1 and @2 against eachother

``!team @1 vs @2 with @3 @4`` will only use the mentioned members for teams

``!team @1 vs @2 without @3 @4`` will pick from **ALL** members except @3 and @4

Don't forget to put your own login token in a **config.json** file.
