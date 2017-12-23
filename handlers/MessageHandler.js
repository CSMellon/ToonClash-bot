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
    Handles a message
    */

    handle(message)
    {
        var admin = message.member.hasPermission('ADMINISTRATOR');
        var manager = message.member.hasPermission('MANAGE_MESSAGES');
        var channel = message.channel.name;
    	var author = message.author.username;
        var uid = message.author.id;
    	var msg = message.content;
    	var date = message.createdAt;

        if (Config.Server.LogMessages === true)
        {
            Logger.debug(`(${channel}) - ${uid} - ${author}: ${msg}`);
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
                    Logger.error(err);
                    Database.push(`/${uid}/link_infractions[]`, {}, true);
                    Database.push(`/${uid}/suggestion_count[]`, {}, true);
                    Database.push(`/${uid}/profanity_warnings[]`, {}, true);
                    Database.push(`/${uid}/user_notes[]`, {}, true);
                    Database.push(`/${uid}/user_warnings[]`, {}, true);
                    Database.push(`/${uid}/user_kicks[]`, {}, true);
                    Database.push(`/${uid}/user_bans[]`, {}, true);
                    Database.push(`/${uid}/user_unbans[]`, {}, true);
                }
            }

            if (Config.Server.Admins.includes(uid))
            {
                var checkMsg = 0;
            }
            else
            {
                var checkMsg = this.checkMessage(msg);
            }

            if (checkMsg === 1)
            {
                Database.push(`/${uid}/profanity_warnings[]/content`, msg, true);

                const embed = new Discord.RichEmbed()
                  .setDescription('Our bot has detected you swearing!\nPlease remember no NFSW language is allowed in the Corporate Clash discord.\n')
                  .setAuthor(author, this.getAvatar(message))

                  .setColor('#FF0000')
                  .setFooter("© Corporate Clash 2017-2018")

                  .setTimestamp()
                  .addField('**Message**', "```" + msg + "```")
                  .addField('**Detected Word**', "```" + 'placeholder' + "```");

                 message.author.send(
                     {
                         embed
                     }
                 );

                message.delete();
            }
            else
            {

            }
        }
    }

    checkProfanity(msg)
    {
        this.bad_word = false;
        var d_word = "";
        var s_word = msg.split(' ');

        for (var i = 0; i < s_word.length; i++)
        {
            // TODO
        }
    }

    checkMessage(msg)
    {
      this.check = 0;
      var arr = [];

      for (var i = 0; i < Config.Blacklist.length; i++)
      {
        var bWord = Config.Blacklist[i];
        var regex = new RegExp(bWord, 'gi');
        var check = msg.match(regex);
        if (check !== null)
        {
            this.check = 1;
        }
      }

      //arr.push(this.check);

      return this.check;
    }

    getAvatar(message)
    {
        return message.guild.members.get(message.author.id).user.avatarURL;
    }

}

module.exports = MessageHandler;
