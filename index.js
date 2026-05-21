require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

// ================= FANCY FONT STYLES =================
const fancy = {
  title: (t) => t.split('').map(c => '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅'.split('')['ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c)] || c).join(''),
  bold: (t) => `*${t}*`,
  glitch: (t) => `̸${t}̸`,
  hacker: (t) => `[ ${t} ]`,
  arrow: (t) => `➡️ ${t}`,
  skull: (t) => `💀 ${t} 💀`,
  fire: (t) => `🔥 ${t} 🔥`,
  box: (t) => `┌─────────────┐\n│ ${t} │\n└─────────────┘`
};

// ================= CONFIG FROM .env =================
const TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = parseInt(process.env.OWNER_ID);
const SECOND_ADMIN_ID = parseInt(process.env.SECOND_ADMIN_ID);
const LOG_GROUP_ID = process.env.LOG_GROUP_ID;
const CHANNEL_LINK = process.env.CHANNEL_LINK;
const OWNER_USERNAME = process.env.OWNER_USERNAME;
const START_IMAGE = process.env.START_IMAGE;
const BOT_NAME = process.env.BOT_NAME;
const PREMIUM_BOT = process.env.PREMIUM_BOT;

// ================= ALL COMMUNITY BUTTONS =================
const COMMUNITY_BUTTONS = [
  { name: "👥 MAIN GROUP", url: "https://t.me/lordsatanusmaingc" },
  { name: "📢 MAIN CHANNEL", url: "https://t.me/lordsatanusmainchannel" },
  { name: "🔥 RYOMEN TECH", url: "https://t.me/RyomenTechtheuprising" },
  { name: "💀 FYT_13", url: "https://t.me/FYT_13" },
  { name: "💰 EARNING BIT SATAN", url: "https://t.me/earningbitsatan664" },
  { name: "⚡ HELL GUARD", url: "https://t.me/hellgaurd666" }
];

// ================= STORAGE =================
let premiumUsers = new Set();
let pendingRequests = new Map();
let allUsers = new Set();
let adminIds = new Set();

function loadPremiumUsers() {
  try {
    if (fs.existsSync('premium_users.json')) {
      const data = JSON.parse(fs.readFileSync('premium_users.json', 'utf8'));
      premiumUsers = new Set(data.premium_users || []);
    }
  } catch (error) {}
}
function savePremiumUsers() {
  fs.writeFileSync('premium_users.json', JSON.stringify({ premium_users: [...premiumUsers] }, null, 2));
}
function loadAllUsers() {
  try {
    if (fs.existsSync('all_users.json')) {
      const data = JSON.parse(fs.readFileSync('all_users.json', 'utf8'));
      allUsers = new Set(data.all_users || []);
    }
  } catch (error) {}
}
function saveAllUsers() {
  fs.writeFileSync('all_users.json', JSON.stringify({ all_users: [...allUsers] }, null, 2));
}
function loadAdmins() {
  try {
    if (fs.existsSync('admins.json')) {
      const data = JSON.parse(fs.readFileSync('admins.json', 'utf8'));
      adminIds = new Set(data.admins || []);
    }
  } catch (error) {}
  adminIds.add(OWNER_ID);
  adminIds.add(SECOND_ADMIN_ID);
  saveAdmins();
}
function saveAdmins() {
  fs.writeFileSync('admins.json', JSON.stringify({ admins: [...adminIds] }, null, 2));
}
function isPremium(userId) { return premiumUsers.has(userId); }
function isAdmin(userId) { return adminIds.has(userId) || userId === OWNER_ID; }

loadPremiumUsers();
loadAllUsers();
loadAdmins();

// ================= BOT INIT =================
const bot = new Telegraf(TOKEN);

async function logToGroup(message) {
  try { await bot.telegram.sendMessage(LOG_GROUP_ID, message); } catch(e) { console.log('Log error:', e.message); }
}

// ================= PROGRESS FUNCTION =================
async function hackerProgress(ctx, messageId, toolName, target) {
  const steps = ['◐ 0% 🤖', '◓ 15% 🔍', '◑ 30% ⚡', '◒ 45% 💀', '◐ 60% 🎯', '◓ 75% 🔓', '◑ 90% ✅', '✅ 100% ☠️'];
  for (const step of steps) {
    await new Promise(r => setTimeout(r, 400));
    try {
      await bot.telegram.editMessageText(ctx.chat.id, messageId, null,
        `╔═══════════════════════════╗\n║ 🔥 ${toolName}\n║ 🎯 ${target}\n║ ⚡ ${step}\n╚═══════════════════════════╝`);
    } catch(e) {}
  }
}

// ================= HACKER REPLIES =================
function getHackerReply(command, target) {
  const time = new Date().toLocaleString();
  const randomPass = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for(let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  };

  const replies = {
    '/droid_virus': `╔══════════════════════════════════╗\n║ 🤖 ANDROID VIRUS DEPLOYED 🤖 ║\n╠══════════════════════════════════╣\n║ 🎯 TARGET: ${target}\n║ 🔥 STATUS: SYSTEM INFECTED\n║ 💀 EFFECT: REMOTE ACCESS GRANTED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/ios_virus': `╔══════════════════════════════════╗\n║ 📱 iOS VIRUS DEPLOYED 📱 ║\n╠══════════════════════════════════╣\n║ 🎯 TARGET: ${target}\n║ 🔥 STATUS: KERNEL EXPLOITED\n║ 💀 EFFECT: FULL CONTROL\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/linux_virus': `╔══════════════════════════════════╗\n║ 🐧 LINUX VIRUS DEPLOYED 🐧 ║\n╠══════════════════════════════════╣\n║ 🎯 TARGET: ${target}\n║ 🔥 STATUS: ROOTKIT INSTALLED\n║ 💀 EFFECT: PERSISTENT BACKDOOR\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/pc_kill': `╔══════════════════════════════════╗\n║ 💀 PC KILLER ACTIVATED 💀 ║\n╠══════════════════════════════════╣\n║ 🎯 TARGET: ${target}\n║ 🔥 STATUS: SYSTEM BRICKED\n║ 💀 EFFECT: PERMANENT DAMAGE\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/destroy': `╔══════════════════════════════════╗\n║ 💀💀💀 SYSTEM DESTROYER 💀💀💀 ║\n╠══════════════════════════════════╣\n║ 🎯 TARGET: ${target}\n║ 🔥 STATUS: COMPLETE ANNIHILATION\n║ 💀 EFFECT: DATA WIPED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/infect_ill': `╔══════════════════════════════════╗\n║ 🦠 INFECT ILL DEPLOYED 🦠 ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: SPREADING MALWARE\n║ 💀 EFFECT: FULL DEVICE INFECTION\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/triple_x': `╔══════════════════════════════════╗\n║ 🔞 TRIPLE X BUG ACTIVATED 🔞 ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: ADULT CONTENT FLOOD\n║ 💀 EFFECT: NOTIFICATION SPAM\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/ovia_load': `╔══════════════════════════════════╗\n║ ⚡ OVIA LOAD DEPLOYED ⚡ ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: OVERLOAD INJECTED\n║ 💀 EFFECT: CPU 100% USAGE\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/hate_you': `╔══════════════════════════════════╗\n║ 💢 HATE YOU BUG DEPLOYED 💢 ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: EMOTIONAL DAMAGE\n║ 💀 EFFECT: CRASH + FREEZE\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/mini_kill': `╔══════════════════════════════════╗\n║ 🔪 MINI KILL ACTIVATED 🔪 ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: LIGHTWEIGHT KILLER\n║ 💀 EFFECT: APP FORCE STOP\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/ban_wa': `╔══════════════════════════════════╗\n║ 💀 WHATSAPP BAN SUCCESSFUL 💀 ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: PERMANENTLY BANNED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/ban_tg': `╔══════════════════════════════════╗\n║ 💀 TELEGRAM BAN SUCCESSFUL 💀 ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: ACCOUNT RESTRICTED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/ip_hack': `╔══════════════════════════════════╗\n║ 💀 IP TRACE COMPLETED 💀 ║\n╠══════════════════════════════════╣\n║ 🌐 TARGET IP: ${target}\n║ 📍 LOCATION: ${['USA','UK','DE','FR','IN','BR','JP'][Math.floor(Math.random()*7)]}\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/fb_hack': `╔══════════════════════════════════╗\n║ 💀 FACEBOOK HACK COMPLETED 💀 ║\n╠══════════════════════════════════╣\n║ 📘 TARGET: ${target}\n║ 🔑 PASSWORD: ${randomPass()}\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/tiktok_hack': `╔══════════════════════════════════╗\n║ 💀 TIKTOK HACK COMPLETED 💀 ║\n╠══════════════════════════════════╣\n║ 🎵 TARGET: ${target}\n║ 🔑 PASS: ${randomPass()}\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/invis_hell': `╔══════════════════════════════════╗\n║ 👻 INVISIBILITY MODE ACTIVATED ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: WHATSAPP INVISIBLE\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/delay_hell': `╔══════════════════════════════════╗\n║ ⏳ DELAY INJECTION SUCCESSFUL ║\n╠══════════════════════════════════╣\n║ 📱 TARGET: ${target}\n║ 🔥 STATUS: DELAY +5s\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/group_crash': `╔══════════════════════════════════╗\n║ 💥 GROUP CRASH EXECUTED ║\n╠══════════════════════════════════╣\n║ 👥 TARGET GROUP: ${target}\n║ 🔥 STATUS: CRASHED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`,
    '/clone': `╔══════════════════════════════════╗\n║ 💀 BOT CLONING COMPLETED 💀 ║\n╠══════════════════════════════════╣\n║ 🤖 TARGET BOT: ${target.substring(0,30)}...\n║ 🔄 STATUS: CLONED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`
  };
  return replies[command] || `╔══════════════════════════════════╗\n║ 💀 ${command.toUpperCase()} EXECUTED 💀 ║\n╠══════════════════════════════════╣\n║ 🎯 TARGET: ${target}\n║ 🔥 STATUS: COMPLETED\n║ 🕒 TIME: ${time}\n╚══════════════════════════════════╝`;
}

// ================= ADMIN EXECUTES INSTANTLY =================
async function executeHackInstant(ctx, command, toolName) {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ').slice(1);
  const target = args.join(' ');
  if (!target && command !== '/clone') {
    return ctx.reply(`⚠️ USAGE: ${command} <target>\nExample: ${command} 192.168.1.1`);
  }
  const targetValue = target || 'CLONE_TOKEN';
  await logToGroup(`⚡ ADMIN | ${toolName} | BY: ${userId} | TARGET: ${targetValue}`);
  const progressMsg = await ctx.reply(`💀 ${toolName}\n🎯 ${targetValue}\n◐ 0%`);
  await hackerProgress(ctx, progressMsg.message_id, toolName, targetValue);
  await ctx.reply(getHackerReply(command, targetValue));
  await logToGroup(`✅ ADMIN DONE | ${toolName} | ${userId}`);
}

// ================= USER REQUEST APPROVAL =================
async function requestApproval(ctx, command, toolName) {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'Unknown';
  const args = ctx.message.text.split(' ').slice(1);
  const target = args.join(' ');
  if (!target && command !== '/clone') {
    return ctx.reply(`⚠️ USAGE: ${command} <target>`);
  }
  const targetValue = target || 'CLONE_TOKEN';
  const requestId = `${userId}_${Date.now()}`;
  pendingRequests.set(requestId, { userId, username, command, toolName, target: targetValue, chatId: ctx.chat.id });
  await ctx.reply(`⏳ REQUEST SENT TO ADMINS\n🔧 ${toolName}\n🎯 ${targetValue}\n👑 WAITING...`);
  const approveKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ APPROVE', `approve_${requestId}`), Markup.button.callback('❌ REJECT', `reject_${requestId}`)]
  ]);
  await bot.telegram.sendMessage(LOG_GROUP_ID, `⚠️ NEW REQUEST\n👤 ${userId}\n🛠️ ${toolName}\n🎯 ${targetValue}`, approveKeyboard);
}

// ================= APPROVAL CALLBACKS =================
bot.action(/approve_(.+)/, async (ctx) => {
  await ctx.answerCbQuery('✅ Approved');
  const requestId = ctx.match[1];
  if (!isAdmin(ctx.from.id)) return;
  const request = pendingRequests.get(requestId);
  if (!request) return;
  await ctx.editMessageText(`✅ APPROVED by @${ctx.from.username}\n👤 ${request.userId}\n🛠️ ${request.toolName}\n🎯 ${request.target}`);
  await bot.telegram.sendMessage(request.chatId, getHackerReply(request.command, request.target));
  pendingRequests.delete(requestId);
});

bot.action(/reject_(.+)/, async (ctx) => {
  await ctx.answerCbQuery('❌ Rejected');
  const requestId = ctx.match[1];
  if (!isAdmin(ctx.from.id)) return;
  const request = pendingRequests.get(requestId);
  if (!request) return;
  await ctx.editMessageText(`❌ REJECTED by @${ctx.from.username}\n👤 ${request.userId}\n🛠️ ${request.toolName}`);
  await bot.telegram.sendMessage(request.chatId, `❌ REQUEST DENIED\n👑 ${OWNER_USERNAME}`);
  pendingRequests.delete(requestId);
});

// ================= COMMAND HANDLER =================
const handleCmd = async (ctx, cmd, tool) => {
  if (isAdmin(ctx.from.id)) executeHackInstant(ctx, cmd, tool);
  else if (isPremium(ctx.from.id)) requestApproval(ctx, cmd, tool);
  else ctx.reply(`🔒 PREMIUM REQUIRED\n📲 ${PREMIUM_BOT}\n👑 ${OWNER_USERNAME}`);
};

// ================= REGISTER ALL COMMANDS =================
bot.command('droid_virus', (ctx) => handleCmd(ctx, '/droid_virus', 'ANDROID_VIRUS'));
bot.command('ios_virus', (ctx) => handleCmd(ctx, '/ios_virus', 'IOS_VIRUS'));
bot.command('linux_virus', (ctx) => handleCmd(ctx, '/linux_virus', 'LINUX_VIRUS'));
bot.command('pc_kill', (ctx) => handleCmd(ctx, '/pc_kill', 'PC_KILLER'));
bot.command('destroy', (ctx) => handleCmd(ctx, '/destroy', 'SYSTEM_DESTROYER'));
bot.command('infect_ill', (ctx) => handleCmd(ctx, '/infect_ill', 'INFECT_ILL'));
bot.command('triple_x', (ctx) => handleCmd(ctx, '/triple_x', 'TRIPLE_X'));
bot.command('ovia_load', (ctx) => handleCmd(ctx, '/ovia_load', 'OVIA_LOAD'));
bot.command('hate_you', (ctx) => handleCmd(ctx, '/hate_you', 'HATE_YOU'));
bot.command('mini_kill', (ctx) => handleCmd(ctx, '/mini_kill', 'MINI_KILL'));
bot.command('ban_wa', (ctx) => handleCmd(ctx, '/ban_wa', 'WHATSAPP_BAN'));
bot.command('ban_tg', (ctx) => handleCmd(ctx, '/ban_tg', 'TELEGRAM_BAN'));
bot.command('ip_hack', (ctx) => handleCmd(ctx, '/ip_hack', 'IP_TRACE'));
bot.command('fb_hack', (ctx) => handleCmd(ctx, '/fb_hack', 'FACEBOOK_HACK'));
bot.command('tiktok_hack', (ctx) => handleCmd(ctx, '/tiktok_hack', 'TIKTOK_HACK'));
bot.command('invis_hell', (ctx) => handleCmd(ctx, '/invis_hell', 'INVISIBILITY_MODE'));
bot.command('delay_hell', (ctx) => handleCmd(ctx, '/delay_hell', 'DELAY_INJECTION'));
bot.command('group_crash', (ctx) => handleCmd(ctx, '/group_crash', 'GROUP_CRASH'));
bot.command('clone', (ctx) => handleCmd(ctx, '/clone', 'CLONE_BOT'));
bot.command('menu', async (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔮 SHOW MENU', 'show_menu')]
  ]);
  await ctx.reply('🔮 *C̸l̸i̸c̸k̸ ̸t̸o̸ ̸u̸n̸l̸o̸c̸k̸ ̸t̸h̸e̸ ̸d̸a̸r̸k̸ ̸m̸e̸n̸u̸* 🔮', { parse_mode: 'Markdown', ...keyboard });
});

// ================= START COMMAND - FANCY HACKER STYLE =================
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'Unknown';
  
  if (!allUsers.has(userId)) {
    allUsers.add(userId);
    saveAllUsers();
    await logToGroup(`🆕 NEW USER | ${userId} | @${username}`);
  }

  // Build community buttons
  const communityRows = [];
  for (let i = 0; i < COMMUNITY_BUTTONS.length; i += 2) {
    const row = COMMUNITY_BUTTONS.slice(i, i+2).map(btn => Markup.button.url(btn.name, btn.url));
    communityRows.push(row);
  }

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📜 ⚡ V̸I̸E̸W̸ ̸C̸O̸M̸M̸A̸N̸D̸S̸ ⚡', 'show_menu')],
    ...communityRows,
    [Markup.button.callback('💎 ⚡ C̸H̸E̸C̸K̸ ̸P̸R̸E̸M̸I̸U̸M̸ ⚡', 'check_premium')],
    [Markup.button.url('👑 ⚡ O̸W̸N̸E̸R̸ ⚡', `https://t.me/${OWNER_USERNAME.replace('@', '')}`)]
  ]);

  const welcomeMsg = `┌─────────────────────────────────────┐
│  🔥 *${BOT_NAME}* 🔥  │
├─────────────────────────────────────┤
│  ☠️ *W̸E̸L̸C̸O̸M̸E̸ ̸T̸O̸ ̸T̸H̸E̸ ̸D̸A̸R̸K̸ ̸S̸I̸D̸E̸* ☠️  │
│  ✨ *${ctx.from.first_name || 'HACKER'}* ✨  │
├─────────────────────────────────────┤
│  💀 *C̸l̸i̸c̸k̸ ̸b̸e̸l̸o̸w̸ ̸f̸o̸r̸ ̸c̸o̸m̸m̸a̸n̸d̸s̸* 💀  │
├─────────────────────────────────────┤
│  ⚡ *P̸o̸w̸e̸r̸e̸d̸ ̸b̸y̸ ̸L̸o̸r̸d̸ ̸S̸a̸t̸a̸n̸u̸s̸* ⚡  │
└─────────────────────────────────────┘`;

  try {
    await ctx.replyWithPhoto(START_IMAGE, { caption: welcomeMsg, parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    await ctx.reply(welcomeMsg, { parse_mode: 'Markdown', ...keyboard });
  }
});

// ================= MENU BUTTON - FANCY HACKER STYLE =================
bot.action('show_menu', async (ctx) => {
  await ctx.answerCbQuery('📜 Loading dark commands...');
  
  const menuText = `┌─────────────────────────────────────────────────────────────┐
│                    💀 *${BOT_NAME}* 💀                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  █▀▀ █   █▀▀ █   █▀▀ █▀█ █▀▀ █   █▀▀ █▀█                  │
│  █▄▄ █   ██▄ █   ██▄ █▀▄ ██▄ █   ██▄ █▀▄                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🤖 *V̸I̸R̸U̸S̸ ̸C̸O̸M̸M̸A̸N̸D̸S̸* 🤖                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  🔥 /droid_virus <ip>     - Android Virus                  │
│  🔥 /ios_virus <ip>       - iOS Virus                      │
│  🔥 /linux_virus <ip>     - Linux Virus                    │
│  🔥 /pc_kill <ip>         - PC Killer                      │
│  🔥 /destroy <ip>         - System Destroyer               │
│                                                             │
│  🐛 *B̸U̸G̸ ̸C̸O̸M̸M̸A̸N̸D̸S̸* 🐛                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ⚡ /infect_ill <target>   - Infect Ill                    │
│  ⚡ /triple_x <target>     - Triple X                      │
│  ⚡ /ovia_load <target>    - Ovia Load                     │
│  ⚡ /hate_you <target>     - Hate You                      │
│  ⚡ /mini_kill <target>    - Mini Kill                     │
│                                                             │
│  💀 *S̸O̸C̸I̸A̸L̸ ̸H̸A̸C̸K̸S̸* 💀                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  📱 /ban_wa <number>       - WhatsApp Ban                  │
│  📱 /ban_tg <username>     - Telegram Ban                  │
│  🌐 /ip_hack <ip>          - IP Trace                      │
│  📘 /fb_hack <email>       - Facebook Hack                 │
│  🎵 /tiktok_hack <user>    - TikTok Hack                   │
│                                                             │
│  📱 *W̸H̸A̸T̸S̸A̸P̸P̸ ̸T̸O̸O̸L̸S̸* 📱                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  👻 /invis_hell <phone>    - Invisible Mode                │
│  ⏳ /delay_hell <phone>    - Delay Injection               │
│  💥 /group_crash <group>   - Group Crash                   │
│                                                             │
│  🤖 *O̸T̸H̸E̸R̸* 🤖                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  🔄 /clone <token>         - Clone Bot                     │
│                                                             │
│  👑 *O̸W̸N̸E̸R̸ ̸C̸O̸M̸M̸A̸N̸D̸S̸* 👑                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ⭐ /addprem <id>          - Add Premium User              │
│  ❌ /delprem <id>          - Remove Premium User           │
│  📢 /broadcast <msg>       - Broadcast Message             │
│  📋 /listusers             - List Premium Users            │
│  👥 /allusers              - List All Users                │
│  👑 /addadmin <id>         - Add Admin                     │
│  ❌ /deladmin <id>         - Remove Admin                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              📢 *J̸O̸I̸N̸ ̸O̸U̸R̸ ̸C̸O̸M̸M̸U̸N̸I̸T̸Y̸* 📢              │
└─────────────────────────────────────────────────────────────┘`;

  const menuKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('👥 MAIN GROUP', 'https://t.me/lordsatanusmaingc'), Markup.button.url('📢 MAIN CHANNEL', 'https://t.me/lordsatanusmainchannel')],
    [Markup.button.url('🔥 RYOMEN TECH', 'https://t.me/RyomenTechtheuprising'), Markup.button.url('💀 FYT_13', 'https://t.me/FYT_13')],
    [Markup.button.url('💰 EARNING BIT SATAN', 'https://t.me/earningbitsatan664'), Markup.button.url('⚡ HELL GUARD', 'https://t.me/hellgaurd666')],
    [Markup.button.callback('💎 CHECK PREMIUM', 'check_premium')]
  ]);

  await ctx.reply(menuText, { parse_mode: 'Markdown', ...menuKeyboard });
});

// ================= PREMIUM CHECK - FANCY STYLE =================
bot.action('check_premium', async (ctx) => {
  await ctx.answerCbQuery('💎 Checking dark privileges...');
  const userId = ctx.from.id;
  if (isPremium(userId)) {
    await ctx.reply(`┌─────────────────────────────────┐
│       ⭐ *P̸R̸E̸M̸I̸U̸M̸ ̸U̸S̸E̸R̸* ⭐        │
├─────────────────────────────────┤
│  👤 ID: ${userId}                │
│  🔥 All tools unlocked          │
│  💀 Welcome to the elite club   │
└─────────────────────────────────┘`, { parse_mode: 'Markdown' });
  } else {
    await ctx.reply(`┌─────────────────────────────────┐
│       🔴 *F̸R̸E̸E̸ ̸U̸S̸E̸R̸* 🔴        │
├─────────────────────────────────┤
│  💎 Upgrade: ${PREMIUM_BOT}      │
│  👑 Owner: ${OWNER_USERNAME}     │
│  🔓 Unlock all dark powers      │
└─────────────────────────────────┘`, { parse_mode: 'Markdown' });
  }
});

// ================= ADMIN COMMANDS =================
bot.command('addadmin', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 *O̸W̸N̸E̸R̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('⚠️ *U̸s̸a̸g̸e̸:̸ /addadmin <id>*', { parse_mode: 'Markdown' });
  adminIds.add(uid);
  saveAdmins();
  ctx.reply(`✅ *A̸d̸m̸i̸n̸ ̸a̸d̸d̸e̸d̸:̸ ${uid}*`, { parse_mode: 'Markdown' });
});

bot.command('deladmin', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 *O̸W̸N̸E̸R̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('⚠️ *U̸s̸a̸g̸e̸:̸ /deladmin <id>*', { parse_mode: 'Markdown' });
  if (uid === OWNER_ID) return ctx.reply('❌ *C̸a̸n̸n̸o̸t̸ ̸r̸e̸m̸o̸v̸e̸ ̸o̸w̸n̸e̸r̸*', { parse_mode: 'Markdown' });
  adminIds.delete(uid);
  saveAdmins();
  ctx.reply(`❌ *A̸d̸m̸i̸n̸ ̸r̸e̸m̸o̸v̸e̸d̸:̸ ${uid}*`, { parse_mode: 'Markdown' });
});

bot.command('addprem', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 *O̸W̸N̸E̸R̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('⚠️ *U̸s̸a̸g̸e̸:̸ /addprem <id>*', { parse_mode: 'Markdown' });
  premiumUsers.add(uid);
  savePremiumUsers();
  ctx.reply(`✅ *P̸r̸e̸m̸i̸u̸m̸ ̸a̸d̸d̸e̸d̸:̸ ${uid}*`, { parse_mode: 'Markdown' });
});

bot.command('delprem', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 *O̸W̸N̸E̸R̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('⚠️ *U̸s̸a̸g̸e̸:̸ /delprem <id>*', { parse_mode: 'Markdown' });
  premiumUsers.delete(uid);
  savePremiumUsers();
  ctx.reply(`❌ *P̸r̸e̸m̸i̸u̸m̸ ̸r̸e̸m̸o̸v̸e̸d̸:̸ ${uid}*`, { parse_mode: 'Markdown' });
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('🔒 *A̸D̸M̸I̸N̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  const msg = ctx.message.text.split(' ').slice(1).join(' ');
  if (!msg) return ctx.reply('⚠️ *U̸s̸a̸g̸e̸:̸ /broadcast <message>*', { parse_mode: 'Markdown' });
  let sent = 0;
  for (const uid of allUsers) {
    try { await bot.telegram.sendMessage(uid, `📢 *BROADCAST*\n\n${msg}`, { parse_mode: 'Markdown' }); sent++; } catch(e) {}
    await new Promise(r => setTimeout(r, 50));
  }
  ctx.reply(`✅ *S̸e̸n̸t̸ ̸t̸o̸ ${sent} u̸s̸e̸r̸s̸*`, { parse_mode: 'Markdown' });
});

bot.command('listusers', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 *O̸W̸N̸E̸R̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  if (premiumUsers.size === 0) return ctx.reply('📭 *N̸o̸ ̸p̸r̸e̸m̸i̸u̸m̸ ̸u̸s̸e̸r̸s̸*', { parse_mode: 'Markdown' });
  ctx.reply(`👑 *P̸r̸e̸m̸i̸u̸m̸ ̸U̸s̸e̸r̸s̸:*\n${[...premiumUsers].join('\n')}`, { parse_mode: 'Markdown' });
});

bot.command('allusers', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 *O̸W̸N̸E̸R̸ ̸O̸N̸L̸Y̸*', { parse_mode: 'Markdown' });
  if (allUsers.size === 0) return ctx.reply('📭 *N̸o̸ ̸u̸s̸e̸r̸s̸*', { parse_mode: 'Markdown' });
  ctx.reply(`👥 *A̸l̸l̸ ̸U̸s̸e̸r̸s̸:*\n${[...allUsers].join('\n')}`, { parse_mode: 'Markdown' });
});

// ================= LAUNCH =================
bot.launch().then(() => {
  console.log(`☠️ ${BOT_NAME} RUNNING ☠️`);
  console.log(`✅ Owner: ${OWNER_USERNAME}`);
  console.log(`✅ Premium: ${premiumUsers.size} | Total: ${allUsers.size}`);
}).catch(err => console.error('Launch error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));