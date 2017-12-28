class MessageHandler
{
    /*
    Initializes a new instance of the Message Handler
    */

    constructor(parent)
    {
        this.parent = parent
    }

    /*
    Checks a message
    */

    async checkNormal(message)
    {
        if (message.author.bot === true)
        {
            return;
        }

        var admin = message.member.hasPermission('ADMINISTRATOR');
        var manager = message.member.hasPermission('MANAGE_MESSAGES');
        var channel = message.channel.name;
    	var author = message.author.username;
        var uid = message.author.id;
    	var msg = message.content;
    	var date = message.createdAt;

        if (Config.Server.LogMessages === true)
        {
            //Logger.debug(`(${channel}) - ${uid} - ${author}: ${msg}`);
        }

        if ((msg === '.down') && (Config.Bot.Admins.includes(uid)))
        {
            message.reply('shutting down!').then(function() { process.exit() }).catch(function() { console.log('Error shutting down!') });
        }

        if (channel)
        {
            // Check that the user has data, if not then create the dummy data
            if(uid !== this.parent.bot.user.id)
            {
                try
                {
                    var user_data = Database.getData(`/${uid}/user_unbans[0]`);
                }
                catch(err)
                {
                    //Logger.error(err);
                    Database.push(`/${uid}/link_infractions[]`, {}, true);
                    Database.push(`/${uid}/profanity_warnings[]`, {}, true);
                    Database.push(`/${uid}/user_notes[]`, {}, true);
                    Database.push(`/${uid}/user_warnings[]`, {}, true);
                    Database.push(`/${uid}/user_kicks[]`, {}, true);
                    Database.push(`/${uid}/user_bans[]`, {}, true);
                    Database.push(`/${uid}/user_unbans[]`, {}, true);
                    Database.push(`/${uid}/suggestion_count[]`, {
                        "uv": 0,
                        "dv": 0
                    }, true);
                }
            }

            if (Config.Server.Admins.includes(uid))
            {
                var checkMsg = 0;
            }
            else
            {
                var checkMsg = this.checkProfanity(msg);
            }

            if (checkMsg[0] === 1)
            {
                Database.push(`/${uid}/profanity_warnings[]/`, {
                    content: msg,
                    detected_word: checkMsg[1]
                }, true);

                const embed = new Discord.RichEmbed()
                  .setDescription('Our bot has detected you swearing!\nPlease remember no NFSW language is allowed in the Corporate Clash discord.\n')
                  .setAuthor(author, this.getAvatar(message))

                  .setColor('#FF0000')
                  .setFooter("© Corporate Clash 2017-2018")

                  .setTimestamp()
                  .addField('**Message**', "```" + msg + "```", true)
                  .addField('**Detected Word**', "```" + checkMsg[1] + "```", true)
                  .addField('**Profanity Warnings**', "```" + this.parent.stats_hndler.getProfanityStats(uid) + "```", true);

                 message.author.send(
                     {
                         embed
                     }
                 );

                 if (Config.Server.LogMessages === true)
                 {

                     const embed = new Discord.RichEmbed()
                       .setDescription(`A message by ${author} has been deleted for profanity.`)
                       .setAuthor(author, this.getAvatar(message))

                       .setColor('#FF0000')
                       .setFooter("© Corporate Clash 2017-2018")

                       .setTimestamp()
                       .addField('**Original Message**', "```" + msg + "```", true)
                       .addField('**Detected Word**', "```" + checkMsg[1] + "```", true)
                       .addField('**Channel**', "```#" + channel + "```", true)
                       .addField('**User ID**', "```" + uid + "```", true)
                       .addField('**Profanity Warnings**', "```" + this.parent.stats_hndler.getProfanityStats(uid) + "```", true);

                     await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                 }

                await message.delete();
            }
            else
            {
                this.handleMessage(message);
            }
        }
    }

    /*
    Handles a deleted message
    */

    async handleDelete(message)
    {
        if (message.author.bot === true)
        {
            return;
        }

        var admin = message.member.hasPermission('ADMINISTRATOR');
        var manager = message.member.hasPermission('MANAGE_MESSAGES');
        var channel = message.channel.name;
    	var author = message.author.username;
        var uid = message.author.id;
    	var msg = message.content;
    	var date = message.createdAt;

        if (Config.Server.LogMessages === true)
        {
            //Logger.debug(`(${channel}) - ${uid} - ${author}: ${msg}`);

            const embed = new Discord.RichEmbed()
              .setDescription(`A message by ${author} has been deleted.`)
              .setAuthor(author, this.getAvatar(message))

              .setColor('#800080')
              .setFooter("© Corporate Clash 2017-2018")

              .setTimestamp()
              .addField('**Original Message**', "```" + msg + "```", true)
              .addField('**Channel**', "```#" + channel + "```", true)
              .addField('**User ID**', "```" + uid + "```", true);

            await this.sendChannelMessage(embed, Config.Server.Channels.Logging);
        }
    }

    /*
    Checks an edited message
    */

    async checkEdit(old_message, new_message)
    {
        if (new_message.author.bot === true)
        {
            return;
        }

        var admin = new_message.member.hasPermission('ADMINISTRATOR');
        var manager = new_message.member.hasPermission('MANAGE_MESSAGES');
        var channel = new_message.channel.name;
    	var author = new_message.author.username;
        var uid = new_message.author.id;
    	var msg = new_message.content;
        var omsg = old_message.content;
    	var date = new_message.createdAt;

        if (Config.Server.LogMessages === true)
        {
            //Logger.debug(`EDITED message: (${channel}) - ${uid} - ${author}: ${msg}`);

            const embed = new Discord.RichEmbed()
              .setDescription(`A message by ${author} has been edited.`)
              .setAuthor(author, this.getAvatar(new_message))

              .setColor('#800080')
              .setFooter("© Corporate Clash 2017-2018")

              .setTimestamp()
              .addField('**Original Message**', "```" + omsg + "```", true)
              .addField('**Edited Message**', "```" + msg + "```", true)
              .addField('**Channel**', "```#" + channel + "```", true)
              .addField('**User ID**', "```" + uid + "```", true);

            this.sendChannelMessage(embed, Config.Server.Channels.Logging);
        }

        if (channel)
        {

            if (Config.Server.Admins.includes(uid))
            {
                var checkMsg = 0;
            }
            else
            {
                var checkMsg = this.checkProfanity(msg);
            }

            if (checkMsg[0] === 1)
            {
                Database.push(`/${uid}/profanity_warnings[]/`, {
                    content: msg,
                    detected_word: checkMsg[1]
                }, true);

                const embed = new Discord.RichEmbed()
                  .setDescription('Our bot has detected you swearing!\nPlease remember no NFSW language is allowed in the Corporate Clash discord.\n')
                  .setAuthor(author, this.getAvatar(new_message))

                  .setColor('#FF0000')
                  .setFooter("© Corporate Clash 2017-2018")

                  .setTimestamp()
                  .addField('**Original Message**', "```" + omsg + "```", true)
                  .addField('**Edited Message**', "```" + msg + "```", true)
                  .addField('**Detected Word**', "```" + checkMsg[1] + "```", true)
                  .addField('**Profanity Warnings**', "```" + this.parent.stats_hndler.getProfanityStats(uid) + "```", true);

                 new_message.author.send(
                     {
                         embed
                     }
                 );

                 if (Config.Server.LogMessages === true)
                 {

                     const embed = new Discord.RichEmbed()
                       .setDescription(`A message by ${author} that had been edited, has been deleted for profanity.`)
                       .setAuthor(author, this.getAvatar(new_message))

                       .setColor('#FF0000')
                       .setFooter("© Corporate Clash 2017-2018")

                       .setTimestamp()
                       .addField('**Original Message**', "```" + omsg + "```", true)
                       .addField('**Edited Message**', "```" + msg + "```", true)
                       .addField('**Detected Word**', "```" + checkMsg[1] + "```", true)
                       .addField('**Channel**', "```#" + channel + "```", true)
                       .addField('**User ID**', "```" + uid + "```", true)
                       .addField('**Profanity Warnings**', "```" + this.parent.stats_hndler.getProfanityStats(uid) + "```", true);

                    await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                 }

                await new_message.delete();
            }
            else
            {
                await this.handleMessage(new_message);
            }
        }
    }

    /*
    Main message handler that processes messages after being checked
    */

    async handleMessage(message)
    {
        var admin = message.member.hasPermission('ADMINISTRATOR');
        var manager = message.member.hasPermission('MANAGE_MESSAGES');
        var channel = message.channel.name;
    	var author = message.author.username;
        var uid = message.author.id;
    	var msg = message.content;
    	var date = message.createdAt;
        var command_prefix = Config.Server.Prefix;

        if (channel === Config.Server.Channels.Suggestions)
        {
            await message.react("✅").then(
                () =>
                {
                    message.react("❌");
                }
            );
        }

        if (channel === Config.Server.Channels.ToonHQ)
        {
            if (msg == `${command_prefix}stats`)
            {
                var suggestion_count = this.parent.stats_hndler.getSuggestionStats(uid);
                var uv = parseInt(suggestion_count.uv);
                var dv = parseInt(suggestion_count.dv);

                const embed = new Discord.RichEmbed()
                  .setDescription('**User Stats**\n')
                  .setAuthor(author, this.getAvatar(message))

                  .setColor('#00ff00')
                  .setFooter("© Corporate Clash 2017-2018")

                  .setTimestamp()
                  .addField('**Upvotes**', `**${uv}**`, true)
                  .addField('**Downvotes**', `**${dv}**`, true)


                await this.sendChannelMessage(embed, Config.Server.Channels.ToonHQ);
            }
        }

        if (channel === Config.Server.Channels.Moderation)
        {
            if ((msg.startsWith(`${command_prefix}user`)) && (this.checkPerms(message, uid) === true))
            {
                var split_msg = msg.split(' ');
                var target_id = split_msg[1];
                var g_member = message.guild.members.get(target_id)
                var u_member = g_member.user;

                if (target_id === undefined)
                {
                    message.reply('please supply the target user\'s id!')
                }
                else if (g_member === undefined)
                {
                    message.reply('this user does not exist!')
                }
                else
                {
                    const embed = new Discord.RichEmbed()
                      .setDescription('**User Information**\n')
                      .setAuthor(message.author.username, this.getAvatar(message))

                      .setColor('#33CCCC')
                      .setFooter("© Corporate Clash 2017-2018")

                      .setTimestamp()
                      .setImage(u_member.avatarURL)
                      .addField('**ID**', g_member.id, true)
                      .addField('**Username**', u_member.username, true)
                      .addField('**Tag**', u_member.tag, true)
                      .addField('**Avatar URL**', u_member.avatarURL, true)
                      .addField('**Is bot?**', u_member.bot, true)
                      .addField('**Account Creation**', u_member.createdAt, true)
                      .addField('**Highest Role**', g_member.highestRole, true)
                      .addField('**Join Date**', g_member.joinedAt, true)
                      .addField('**Display Name**', g_member.displayName, true)
                      .addField('**Profanity Warnings**', this.parent.stats_hndler.getProfanityStats(target_id), true)
                      .addField('**Moderation Warnings**', this.parent.stats_hndler.getModPoints(target_id), true)
                      .addField('**Kick Points**', this.parent.stats_hndler.getKickPoints(target_id), true)
                      .addField('**Ban Points**', this.parent.stats_hndler.getBanPoints(target_id), true)


                    await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                }
            }
            else if ((msg.startsWith(`${command_prefix}user`)) && (this.checkPerms(message, uid) === false))
            {
                message.author.send('sorry but you don\'t have the proper permissions to execute this command!')
            }

            if ((msg.startsWith(`${command_prefix}log`)) && (this.checkPerms(message, uid) === true))
            {
                var split_msg = msg.split(' ');
                var target_id = split_msg[1];
                var g_member = message.guild.members.get(target_id)
                var log_type = this.removeFirstTwoParams(msg);
                var check_type = this.checkLogType(log_type);

                if (target_id === undefined)
                {
                    message.reply('please supply the target user\'s id!')
                }
                else if (g_member === undefined)
                {
                    message.reply('this user does not exist!')
                }
                else if (/^\s*$/.test(log_type) == true)
                {
                    message.reply('please supply a log type!')
                }
                else if (check_type[0] == false)
                {
                    message.reply('please supply a valid log type!')
                }
                else
                {
                    var db_type = check_type[1];
                    var arr = [];

                    if (log_type == 'pw')
                    {
                        var content = '';
                        var detected_words = '';
                        var p = Database.getData(`/${target_id}/${db_type}`);

                        for (var i = 1; i < p.length; i++)
                        {
                            var obj = p[i];
                            var inc = i - 1;
                            if (obj.content != undefined)
                            {
                                content += `(${inc}) ${obj.content}\n`
                                detected_words += `(${inc}) ${obj.detected_word}\n`
                            }
                        }

                        const embed = new Discord.RichEmbed()
                          .setDescription('**Profanity Warning Log**\n')
                          .setAuthor(message.author.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Content**', content, true)
                          .addField('**Detected Word**', detected_words, true)


                        await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                    }

                    if (log_type == 'b')
                    {
                        var reason = '';
                        var inv = '';
                        var inv_id = '';
                        var p = Database.getData(`/${target_id}/${db_type}`);

                        for (var i = 0; i < p.length; i++)
                        {
                            var obj = p[i];
                            var inc = i - 1;
                            if (obj.reason != undefined)
                            {
                                reason += `(${inc}) ${obj.reason}\n`
                                inv += `(${inc}) ${obj.invoker}\n`
                                inv_id += `(${inc}) ${obj.invoker_id}\n`
                            }
                        }

                        const embed = new Discord.RichEmbed()
                          .setDescription('**User Ban Log**\n')
                          .setAuthor(message.author.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Reason**', reason, true)
                          .addField('**Invoker**', inv, true)
                          .addField('**Invoker ID**', inv_id, true)


                        await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                    }

                    if (log_type == 'w')
                    {
                        var reason = '';
                        var inv = '';
                        var inv_id = '';
                        var p = Database.getData(`/${target_id}/${db_type}`);

                        for (var i = 0; i < p.length; i++)
                        {
                            var obj = p[i];
                            var inc = i - 1;
                            if (obj.reason != undefined)
                            {
                                reason += `(${inc}) ${obj.reason}\n`
                                inv += `(${inc}) ${obj.invoker}\n`
                                inv_id += `(${inc}) ${obj.invoker_id}\n`
                            }
                        }

                        const embed = new Discord.RichEmbed()
                          .setDescription('**Moderation Warning Log**\n')
                          .setAuthor(message.author.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Reason**', reason, true)
                          .addField('**Invoker**', inv, true)
                          .addField('**Invoker ID**', inv_id, true)


                        await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                    }

                    if (log_type == 'n')
                    {
                        var content = '';
                        var inv = '';
                        var inv_id = '';
                        var p = Database.getData(`/${target_id}/${db_type}`);

                        for (var i = 0; i < p.length; i++)
                        {
                            var obj = p[i];
                            var inc = i - 1;
                            if (obj.content != undefined)
                            {
                                content += `(${inc}) ${obj.content}\n`
                                inv += `(${inc}) ${obj.invoker}\n`
                                inv_id += `(${inc}) ${obj.invoker_id}\n`
                            }
                        }

                        const embed = new Discord.RichEmbed()
                          .setDescription('**User Notes**\n')
                          .setAuthor(message.author.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Content**', content, true)
                          .addField('**Invoker**', inv, true)
                          .addField('**Invoker ID**', inv_id, true)


                        await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                    }

                    if (log_type == 'k')
                    {
                        var reason = '';
                        var inv = '';
                        var inv_id = '';
                        var p = Database.getData(`/${target_id}/${db_type}`);

                        for (var i = 0; i < p.length; i++)
                        {
                            var obj = p[i];
                            var inc = i - 1;
                            if (obj.reason != undefined)
                            {
                                reason += `(${inc}) ${obj.reason}\n`
                                inv += `(${inc}) ${obj.invoker}\n`
                                inv_id += `(${inc}) ${obj.invoker_id}\n`
                            }
                        }

                        const embed = new Discord.RichEmbed()
                          .setDescription('**User Kick Log**\n')
                          .setAuthor(message.author.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Reason**', reason, true)
                          .addField('**Invoker**', inv, true)
                          .addField('**Invoker ID**', inv_id, true)


                        await this.sendChannelMessage(embed, Config.Server.Channels.Moderation);
                    }
                }
            }

            if ((msg.startsWith(`${command_prefix}mute`)) && (this.checkPerms(message, uid) === true))
            {
                if (message.mentions.users.first())
                {
                    var time = 0;
                    var self = this;
                    var user = message.mentions.users.first();
                    var guildUser = message.guild.members.get(user.id);
                    var role = guildUser.guild.roles.find(r => r.name == Config.Roles.Muted);
                    this.silence(guildUser, user, message, role);
                }
            }
            else if ((msg.startsWith(`${command_prefix}mute`)) && (this.checkPerms(message, uid) === false))
            {
                message.author.send('sorry but you don\'t have the proper permissions to execute this command!')
            }

            if ((msg.startsWith(`${command_prefix}unmute`)) && (this.checkPerms(message, uid) === true))
            {
                if (message.mentions.users.first())
                {
                    var user = message.mentions.users.first();
                    var guildUser = message.guild.members.get(user.id);
                    var role = guildUser.guild.roles.find(r => r.name == Config.Roles.Muted);
                    this.un_silence(guildUser, user, message, role);
                }
            }
            if ((msg.startsWith(`${command_prefix}unmute`)) && (this.checkPerms(message, uid) === false))
            {
                message.reply('sorry but you don\'t have the proper permissions to execute this command!')
            }

            if ((msg.startsWith(`${command_prefix}warn`)) && (this.checkPerms(message, uid) === true))
            {
                var split_msg = msg.split(' ');
                var target_id = split_msg[1];
                var g_member = message.guild.members.get(target_id)
                var type = this.checkType(split_msg[2]);
                var reason = this.removeFirstThreeParams(msg);

                if (target_id === undefined)
                {
                    message.reply('please supply the target user\'s id!')
                }
                else if (g_member === undefined)
                {
                    message.reply('this user does not exist!')
                }
                else if (type === undefined)
                {
                    message.reply('please supply a type warning!')
                }
                else if (type[0] === false)
                {
                    message.reply('please supply a valid type of warning!')
                }
                else if (/^\s*$/.test(reason) == true)
                {
                    message.reply('please supply a valid reason!')
                }
                else
                {
                    var user = g_member.user;

                    if (type[1] == 1)
                    {
                        var rule = parseInt(reason)
                        reason = Config.Server.Rules[rule - 1];

                        if (reason === undefined)
                        {
                            message.reply('please supply a valid reason!')
                            return;
                        }
                        else
                        {
                            Database.push(`/${target_id}/user_warnings[]/`, {
                                reason: `Rule ${rule}`,
                                invoker: `${message.author.username}`,
                                invoker_id: `${message.author.id}`
                            }, true);

                            const embed = new Discord.RichEmbed()
                              .setDescription('**You\'ve been warned in the Corporate Clash discord for violation of our terms.**\n')
                              .setAuthor(user.username, this.getAvatar(message))

                              .setColor('#FF0000')
                              .setFooter("© Corporate Clash 2017-2018")

                              .setTimestamp()
                              .addField('**Reason**', `Rule ${rule}`, true)
                              .addField('**Moderation Warnings**', this.parent.stats_hndler.getModPoints(target_id), true)
                              .addField('**Please Read**', '```' + reason + '```', true)

                          try
                          {
                              user.send(
                                  {
                                      embed
                                  }
                              )

                              message.reply(`I've warned ${user.username} for breaking rule ${rule}`)
                          }
                          catch(err)
                          {
                              message.reply(err);
                          }
                        }
                    }
                    else
                    {
                        Database.push(`/${target_id}/user_warnings[]/`, {
                            reason: `${reason}`,
                            invoker: `${message.author.username}`,
                            invoker_id: `${message.author.id}`
                        }, true);

                        const embed = new Discord.RichEmbed()
                          .setDescription('**You\'ve been warned in the Corporate Clash discord for violation of our terms.**\n')
                          .setAuthor(user.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Moderation Warnings**', this.parent.stats_hndler.getModPoints(target_id), true)
                          .addField('**Reason**', '```' + reason + '```', true)
                      try
                      {
                          user.send(
                              {
                                  embed
                              }
                          )

                          message.reply(`I've warned ${user.username} for: ${reason}`)
                      }
                      catch(err)
                      {
                          message.reply(err);
                      }
                    }
                }
            }
            if ((msg.startsWith(`${command_prefix}warn`)) && (this.checkPerms(message, uid) === false))
            {
                message.reply('sorry but you don\'t have the proper permissions to execute this command!')
            }

            if ((msg.startsWith(`${command_prefix}kick`)) && (this.checkPerms(message, uid) === true))
            {
                var split_msg = msg.split(' ');
                var target_id = split_msg[1];
                var g_member = message.guild.members.get(target_id)
                var type = this.checkType(split_msg[2]);
                var reason = this.removeFirstThreeParams(msg);

                if (target_id === undefined)
                {
                    message.reply('please supply the target user\'s id!')
                }
                else if (g_member === undefined)
                {
                    message.reply('this user does not exist!')
                }
                else if (type === undefined)
                {
                    message.reply('please supply a type kick!')
                }
                else if (type[0] === false)
                {
                    message.reply('please supply a valid type of kick!')
                }
                else if (/^\s*$/.test(reason) == true)
                {
                    message.reply('please supply a valid reason!')
                }
                else
                {
                    var user = g_member.user;

                    if (type[1] == 1)
                    {
                        var rule = parseInt(reason)
                        reason = Config.Server.Rules[rule - 1];

                        if (reason === undefined)
                        {
                            message.reply('please supply a valid reason!')
                            return;
                        }
                        else
                        {
                            Database.push(`/${target_id}/user_kicks[]/`, {
                                reason: `Rule ${rule}`,
                                invoker: `${message.author.username}`,
                                invoker_id: `${message.author.id}`
                            }, true);

                            const embed = new Discord.RichEmbed()
                              .setDescription('**You\'ve been kicked from the Corporate Clash discord for violation of our terms.**\n')
                              .setAuthor(user.username, this.getAvatar(message))

                              .setColor('#FF0000')
                              .setFooter("© Corporate Clash 2017-2018")

                              .setTimestamp()
                              .addField('**Reason**', `Rule ${rule}`, true)
                              .addField('**Kick Points**', this.parent.stats_hndler.getKickPoints(target_id), true)
                              .addField('**Please Read**', '```' + reason + '```', true)


                            try
                            {
                                user.send(
                                    {
                                        embed
                                    }
                                )

                                g_member.kick()
                            }
                            catch(err)
                            {
                                g_member.kick()
                            }

                            message.reply(`I've kicked ${user.username} for breaking rule ${rule}`)
                        }
                    }
                    else
                    {
                        Database.push(`/${target_id}/user_kicks[]/`, {
                            reason: `${reason}`,
                            invoker: `${message.author.username}`,
                            invoker_id: `${message.author.id}`
                        }, true);

                        const embed = new Discord.RichEmbed()
                          .setDescription('**You\'ve been kicked from the Corporate Clash discord for violation of our terms.**\n')
                          .setAuthor(user.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Kick Points**', this.parent.stats_hndler.getKickPoints(target_id), true)
                          .addField('**Reason**', '```' + reason + '```', true)

                      try
                      {
                          user.send(
                              {
                                  embed
                              }
                          )

                          g_member.kick()
                      }
                      catch(err)
                      {
                          g_member.kick()
                      }

                        message.reply(`I've kicked ${user.username} with the reason: ${reason}`)
                    }
                }
            }
            if ((msg.startsWith(`${command_prefix}kick`)) && (this.checkPerms(message, uid) === false))
            {
                message.reply('sorry but you don\'t have the proper permissions to execute this command!')
            }

            if ((msg.startsWith(`${command_prefix}ban`)) && (this.checkPerms(message, uid) === true))
            {
                var split_msg = msg.split(' ');
                var target_id = split_msg[1];
                var d_messages = parseInt(split_msg[2]);
                var g_member = message.guild.members.get(target_id)
                var type = this.checkType(split_msg[3]);
                var reason = this.removeFirstFourParams(msg);


                if (d_messages === undefined)
                {
                    message.reply('please supply the # of days of messages to be removed!')
                }
                else if (target_id === undefined)
                {
                    message.reply('please supply the target user\'s id!')
                }
                else if (g_member === undefined)
                {
                    message.reply('this user does not exist!')
                }
                else if (type === undefined)
                {
                    message.reply('please supply a type ban!')
                }
                else if (type[0] === false)
                {
                    message.reply('please supply a valid type of ban!')
                }
                else if (/^\s*$/.test(reason) == true)
                {
                    message.reply('please supply a valid reason!')
                }
                else
                {
                    var user = g_member.user;

                    if (type[1] == 1)
                    {
                        var rule = parseInt(reason)
                        reason = Config.Server.Rules[rule - 1];

                        if (reason === undefined)
                        {
                            message.reply('please supply a valid reason!')
                            return;
                        }
                        else
                        {
                            Database.push(`/${target_id}/user_bans[]/`, {
                                reason: `Rule ${rule}`,
                                invoker: `${message.author.username}`,
                                invoker_id: `${message.author.id}`
                            }, true);

                            const embed = new Discord.RichEmbed()
                              .setDescription('**You\'ve been kicked from the Corporate Clash discord for repeated violations of our terms.**\n')
                              .setAuthor(user.username, this.getAvatar(message))

                              .setColor('#FF0000')
                              .setFooter("© Corporate Clash 2017-2018")

                              .setTimestamp()
                              .addField('**Reason**', `Rule ${rule}`, true)
                              .addField('**Ban Points**', this.parent.stats_hndler.getBanPoints(target_id), true)
                              .addField('**Please Read**', '```' + reason + '```', true)


                            try
                            {
                                user.send(
                                    {
                                        embed
                                    }
                                )

                                g_member.ban({ 'days': d_messages, 'reason': `Rule ${rule}` })
                            }
                            catch(err)
                            {
                                g_member.ban({ 'days': d_messages, 'reason': `Rule ${rule}` })
                            }

                            message.reply(`I've banned ${user.username} for breaking rule ${rule} and ${d_messages} days of his messages have been removed.`)
                        }
                    }
                    else
                    {
                        Database.push(`/${target_id}/user_bans[]/`, {
                            reason: `${reason}`,
                            invoker: `${message.author.username}`,
                            invoker_id: `${message.author.id}`
                        }, true);

                        const embed = new Discord.RichEmbed()
                          .setDescription('**You\'ve been banned from the Corporate Clash discord for repeated violations of our terms.**\n')
                          .setAuthor(user.username, this.getAvatar(message))

                          .setColor('#FF0000')
                          .setFooter("© Corporate Clash 2017-2018")

                          .setTimestamp()
                          .addField('**Ban Points**', this.parent.stats_hndler.getBanPoints(target_id), true)
                          .addField('**Reason**', '```' + reason + '```', true)

                      try
                      {
                          user.send(
                              {
                                  embed
                              }
                          )

                          g_member.ban({ 'days': d_messages, 'reason': reason })
                      }
                      catch(err)
                      {
                          g_member.ban({ 'days': d_messages, 'reason': reason })
                      }

                        message.reply(`I've banned ${user.username} with the reason: ${reason} and ${d_messages} days of his messages have been removed.`)
                    }
                }
            }
            if ((msg.startsWith(`${command_prefix}ban`)) && (this.checkPerms(message, uid) === false))
            {
                message.reply('sorry but you don\'t have the proper permissions to execute this command!')
            }

            if ((msg.startsWith(`${command_prefix}note`)) && (this.checkPerms(message, uid) === true))
            {
                var split_msg = msg.split(' ');
                var target_id = split_msg[1];
                var g_member = message.guild.members.get(target_id)
                var reason = this.removeFirstTwoParams(msg);

                if (target_id === undefined)
                {
                    message.reply('please supply the target user\'s id!')
                }
                else if (g_member === undefined)
                {
                    message.reply('this user does not exist!')
                }
                else if (/^\s*$/.test(reason) == true)
                {
                    message.reply('please supply a valid note!')
                }
                else
                {
                    var user = g_member.user;

                    Database.push(`/${target_id}/user_notes[]/`, {
                        content: `${reason}`,
                        invoker: `${message.author.username}`,
                        invoker_id: `${message.author.id}`
                    }, true);

                    message.reply(`I've add that note to ${user.username}'s account.`)

                }
            }
            if ((msg.startsWith(`${command_prefix}note`)) && (this.checkPerms(message, uid) === false))
            {
                message.reply('sorry but you don\'t have the proper permissions to execute this command!')
            }
        }
    }

    handleReaction(reaction, user, type)
    {
        if (user.bot == true)
        {
            return;
        }

        var message = reaction.message;
        var emoji = reaction.emoji.name;
        var auth_id = message.author.id;
        var channel = message.channel.name;
        var suggestion_count = this.parent.stats_hndler.getSuggestionStats(auth_id);
        var uv = parseInt(suggestion_count.uv);
        var dv = parseInt(suggestion_count.dv);

        if (channel === Config.Server.Channels.Suggestions)
        {
            if (emoji == "✅")
            {
                if (type === 'add')
                {
                    Database.push(`/${auth_id}/suggestion_count[0]`, {
                        "uv": (uv + 1),
                        "dv": (dv)
                    }, true);
                }
                else if (type === 'remove')
                {
                    Database.push(`/${auth_id}/suggestion_count[0]`, {
                        "uv": (uv - 1),
                        "dv": (dv)
                    }, true);
                }
            }
            else if (emoji == "❌")
            {
                if (type === 'add')
                {
                    Database.push(`/${auth_id}/suggestion_count[0]`, {
                        "uv": (uv),
                        "dv": (dv + 1)
                    }, true);
                }
                else if (type === 'remove')
                {
                    Database.push(`/${auth_id}/suggestion_count[0]`, {
                        "uv": (uv),
                        "dv": (dv - 1)
                    }, true);
                }
            }
        }
    }

    checkPerms(message, uid)
    {
        if (message.guild.members.get(uid).roles.find(r => r.name === Config.Roles.Staff) !== null)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    silence(guildUser, user, message, role)
    {
        if (guildUser.roles.find(r => r.name === Config.Roles.Muted) == null)
        {
            guildUser.addRole(role);
            message.reply(`I've muted the user: ${user.username}`);

            const embed = new Discord.RichEmbed()
              .setDescription('**You\'ve been muted in the Corporate Clash discord for moderation purposes.**\n')
              .setAuthor(user.username, this.getAvatar(message))

              .setColor('#FF0000')
              .setFooter("© Corporate Clash 2017-2018")

              .setTimestamp();

             user.send(
                 {
                     embed
                 }
             );
        }
        else
        {
            message.reply(`${user.username} is already muted!`);
        }
    }

    un_silence(guildUser, user, message, role)
    {
        if (guildUser.roles.find(r => r.name === Config.Roles.Muted) !== null)
        {
            guildUser.removeRole(role);
            message.reply(`I unmuted the user: ${user.username}`);

            const embed = new Discord.RichEmbed()
              .setDescription('**Your mute has been lifted in the Corporate Clash discord.**\n')
              .setAuthor(user.username, this.getAvatar(message))

              .setColor('#FF0000')
              .setFooter("© Corporate Clash 2017-2018")

              .setTimestamp();

             user.send(
                 {
                     embed
                 }
             );
        }
        else
        {
            message.reply(`${user.username} is not muted!`);
        }
    }

    async sendChannelMessage(msg, channel)
    {
        var guildUser = this.parent.bot.guilds.first().me;
        var channel = guildUser.guild.channels.find('name', channel);
        channel.send(msg);
    }

    checkProfanity(msg)
    {
        var regex = new RegExp("(.)(?=\\1{1})", "g");
        var msg_1 = msg.replace(regex, "").split(' ').join('');
        msg_1 = msg_1.replace(/[^0-9a-z]/gi, '');

        this.check = 0;
        this.d_word = ""
        var arr = [];

        for (var i = 0; i < Config.Blacklist.length; i++)
        {
          var bWord = Config.Blacklist[i];
          var regex = new RegExp(bWord, 'gi');
          var check = msg_1.match(regex);
          if (check !== null)
          {
              this.d_word = bWord;
              this.check = 1;
          }
        }

        if (this.check > 0)
        {
            for (var i = 0; i < Config.Blacklist.length; i++)
            {
              var bWord = Config.Blacklist[i];
              var regex = new RegExp(bWord, 'gi');
              var check = msg.match(regex);
              if (check !== null)
              {
                  this.d_word = bWord;
                  this.check = 1;
              }
          }
        }

      return [this.check, this.d_word];
    }

    getAvatar(message)
    {
        return message.guild.members.get(message.author.id).user.avatarURL;
    }

    checkLogType(type)
    {
        switch(type)
        {
            case 'w':
                return [true, 'user_warnings'];
                break;
            case 'k':
                return [true, 'user_kicks'];
                break;
            case 'b':
                return [true, 'user_bans'];
                break;
            case 'pw':
                return [true, 'profanity_warnings'];
                break;
            case 'ub':
                return [true, 'user_unbans'];
                break;
            case 'n':
                return [true, 'user_notes'];
                break;
            default:
                return [false, ''];
                break;
        }
    }

    checkType(type)
    {
        type = parseInt(type)

        if (type == 1)
        {
            return [true, type];
        }
        else if (type == 2)
        {
            return [true, type];
        }
        else
        {
            return [false, type];
        }
    }

    removeFirstTwoParams(msg)
    {
        var split_msg = msg.split(' ');
        split_msg.shift()
        split_msg.shift()
        var join_msg = split_msg.join(' ')
        return join_msg;
    }

    removeFirstThreeParams(msg)
    {
        var split_msg = msg.split(' ');
        split_msg.shift()
        split_msg.shift()
        split_msg.shift()
        var join_msg = split_msg.join(' ')
        return join_msg;
    }

    removeFirstFourParams(msg)
    {
        var split_msg = msg.split(' ');
        split_msg.shift()
        split_msg.shift()
        split_msg.shift()
        split_msg.shift()
        var join_msg = split_msg.join(' ')
        return join_msg;
    }

}

module.exports = MessageHandler;
