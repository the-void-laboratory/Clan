const fs = require('fs')

global.owner = "234" //owner number
global.footer = "☩ Void Equalizer ☩" //footer section
global.status = false //"self/public" section of the bot
global.prefa = ['','!','.',',','🐤','🗿']
global.owner = ['62']
global.xprefix = '.'
global.gambar = "https://voids-share.lovable.app/i/qy9if7ra"
global.OWNER_NAME = "Anas Pixelz"
global.DEVELOPER = ["2348145326915"] //
global.BOT_NAME = "☩ Void Equalizer ☩"
global.bankowner = "☩ Void Equalizer ☩"
global.creatorName = "Anas Pixelz"
global.ownernumber = '2348145326915'  //creator number
global.location = "Nigeria, Lagos-state, ilese"
global.prefa = ['','!','.','#','&']
//================DO NOT CHANGE OR YOU'LL GET AN ERROR=============\
global.footer = "☩ Void Equalizer ☩" //footer section
global.link = "https://whatsapp.com/channel/0029Vb7tekFBlHpXQGMz0L2q"
global.autobio = true//auto update bio
global.botName = "☩ Void Equalizer ☩"
global.version = "1.0.1"
global.botname = "☩ Void Equalizer ☩"
global.author = "Anas Pixelz"
global.themeemoji = ''
global.wagc = 'https://whatsapp.com/channel/0029Vb7tekFBlHpXQGMz0L2q'
global.thumbnail = 'https://voids-share.lovable.app/i/qy9if7ra'
global.richpp = ' '
global.packname = "Sticker By ☩ Void Equalizer ☩"
global.author = "\n\n\n\n\nCreate by Anas Pixelz"
global.creator = "1234567890@s.whatsapp.net"
global.ownername = 'Anas Pixelz' 
global.onlyowner = `Sorry only the owner can use this command.`
  // reply 
global.database = `To be in database contact Anas Pixelz`
  global.mess = {
wait: "Please wait...",
   success: "Success",
   on: "Bot is active", 
   prem: "For premium users only",
   off: "Bot is offline",
   query: {
       text: "Where's the text?",
       link: "Where's the link?",
   },
   error: {
       fitur: "Sorry, an error occurred. Please contact the bot owner.",
   },
   only: {
       group: "This feature can only be used in groups",
private: "This feature can only be used in private chats",
       owner: "This feature can only be used by the owner",
       admin: "This feature can only be used by bot admins",
       badmin: "The bot needs to be group admin to use this feature",
       premium: "This feature is for premium users only",
   }
}

global.hituet = 0
//false=disable and true=enable
global.autoviewstatus = false
global.autoread = false //auto read messages
global.autobio = true //auto update bio
global.anti92 = true //auto block +92 
global.autoswview = true //auto view status/story

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
