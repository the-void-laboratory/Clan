require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

// ================= FANCY FONT STYLES =================
const style = {
  // Glitch/Strikethrough style for headers
  glitch: (t) => t.split('').join('̸'),
  // Small caps style
  small: (t) => t.toUpperCase(),
  // Boxed style for replies
  box: (t) => `┌─[ ${t} ]─┐`,
  // Arrow style
  arrow: (t) => `➤ ${t}`,
  // Skull style for danger
  skull: (t) => `💀 ${t} 💀`,
  // Fire style for success
  fire: (t) => `🔥 ${t} 🔥`,
  // Hacker code style
  code: (t) => `[${t}]`,
  // Compact box for replies
  replyBox: (t) => `├─ ${t} ─┤`
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
  const steps = ['◐ 0%', '◓ 15%', '◑ 30%', '◒ 45%', '◐ 60%', '◓ 75%', '◑ 90%', '✅ 100%'];
  for (const step of steps) {
    await new Promise(r => setTimeout(r, 300));
    try {
      await bot.telegram.editMessageText(ctx.chat.id, messageId, null,
        `┌─[ ${toolName} ]─┐\n├─ 🎯 ${target}\n├─ ⚡ ${step}\n└─────────────┘`);
    } catch(e) {}
  }
}

// ================= FANCY HACKER REPLY STYLE =================
function fancyReply(command, target, status, extra = '') {
  const time = new Date().toLocaleString();
  return `┌─[ ${command.toUpperCase()} ]─┐
├─ 🎯 ${target}
├─ 🔥 ${status}
${extra ? `├─ 💀 ${extra}\n` : ''}├─ 🕒 ${time}
└─────────────────┘`;
}

function getHackerReply(command, target) {
  const randomPass = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for(let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  };

  const replies = {
    '/droid_virus': fancyReply('DROID VIRUS', target, 'S Y S T E M   I N F E C T E D', 'Remote Access Granted'),
    '/ios_virus': fancyReply('IOS VIRUS', target, 'K E R N E L   E X P L O I T E D', 'Full Control Obtained'),
    '/linux_virus': fancyReply('LINUX VIRUS', target, 'R O O T K I T   I N S T A L L E D', 'Persistent Backdoor'),
    '/pc_kill': fancyReply('PC KILLER', target, 'S Y S T E M   B R I C K E D', 'Permanent Damage'),
    '/destroy': fancyReply('DESTROYER', target, 'C O M P L E T E   A N N I H I L A T I O N', 'Data Wiped'),
    '/infect_ill': fancyReply('INFECT ILL', target, 'S P R E A D I N G   M A L W A R E', 'Device Infection'),
    '/triple_x': fancyReply('TRIPLE X', target, 'A D U L T   F L O O D', 'Notification Spam'),
    '/ovia_load': fancyReply('OVIA LOAD', target, 'O V E R L O A D   I N J E C T E D', 'CPU 100%'),
    '/hate_you': fancyReply('HATE YOU', target, 'E M O T I O N A L   D A M A G E', 'Crash + Freeze'),
    '/mini_kill': fancyReply('MINI KILL', target, 'L I G H T W E I G H T   K I L L E R', 'App Force Stop'),
    '/ban_wa': fancyReply('WA BAN', target, 'P E R M A N E N T L Y   B A N N E D', 'Account Restricted'),
    '/ban_tg': fancyReply('TG BAN', target, 'A C C O U N T   R E S T R I C T E D', 'Ban Applied'),
    '/ip_hack': fancyReply('IP TRACE', target, `L O C A T I O N : ${['USA','UK','GERMANY','FRANCE','JAPAN','BRAZIL'][Math.floor(Math.random()*6)]}`, 'Trace Complete'),
    '/fb_hack': fancyReply('FB HACK', target, `P A S S : ${randomPass()}`, 'Account Compromised'),
    '/tiktok_hack': fancyReply('TIKTOK HACK', target, `P A S S : ${randomPass()}`, 'Account Hacked'),
    '/invis_hell': fancyReply('INVISIBLE', target, 'W H A T S A P P   I N V I S I B L E', 'Mode Activated'),
    '/delay_hell': fancyReply('DELAY', target, 'D E L A Y   + 5 S E C O N D S', 'Injected'),
    '/group_crash': fancyReply('GROUP CRASH', target, 'G R O U P   C R A S H E D', 'Success'),
    '/clone': fancyReply('CLONE BOT', target.substring(0,25), 'B O T   C L O N E D', 'Ready to run')
  };
  return replies[command] || fancyReply(command.toUpperCase(), target, 'C O M P L E T E D', 'Success');
}

// ================= ADMIN EXECUTES INSTANTLY =================
async function executeHackInstant(ctx, command, toolName) {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ').slice(1);
  const target = args.join(' ');
  if (!target && command !== '/clone') {
    return ctx.reply(`┌─[ USAGE ]─┐\n├─ ${command} <target>\n└────────────┘`);
  }
  const targetValue = target || 'CLONE_TOKEN';
  await logToGroup(`⚡ ADMIN | ${toolName} | BY: ${userId} | TARGET: ${targetValue}`);
  const progressMsg = await ctx.reply(`┌─[ ${toolName} ]─┐\n├─ 🎯 ${targetValue}\n├─ ◐ 0%\n└─────────────┘`);
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
    return ctx.reply(`┌─[ USAGE ]─┐\n├─ ${command} <target>\n└────────────┘`);
  }
  const targetValue = target || 'CLONE_TOKEN';
  const requestId = `${userId}_${Date.now()}`;
  pendingRequests.set(requestId, { userId, username, command, toolName, target: targetValue, chatId: ctx.chat.id });
  await ctx.reply(`┌─[ REQUEST ]─┐\n├─ 🔧 ${toolName}\n├─ 🎯 ${targetValue}\n├─ 👑 WAITING FOR ADMIN\n└──────────────┘`);
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
  await bot.telegram.sendMessage(request.chatId, `┌─[ DENIED ]─┐\n├─ Request rejected\n├─ 👑 ${OWNER_USERNAME}\n└────────────┘`);
  pendingRequests.delete(requestId);
});

// ================= COMMAND HANDLER =================
const handleCmd = async (ctx, cmd, tool) => {
  if (isAdmin(ctx.from.id)) executeHackInstant(ctx, cmd, tool);
  else if (isPremium(ctx.from.id)) requestApproval(ctx, cmd, tool);
  else ctx.reply(`┌─[ PREMIUM ]─┐\n├─ 🔒 Required\n├─ 📲 ${PREMIUM_BOT}\n├─ 👑 ${OWNER_USERNAME}\n└────────────┘`);
};

// ================= REGISTER ALL COMMANDS =================
bot.command('droid_virus', (ctx) => handleCmd(ctx, '/droid_virus', 'DROID_VIRUS'));
bot.command('ios_virus', (ctx) => handleCmd(ctx, '/ios_virus', 'IOS_VIRUS'));
bot.command('linux_virus', (ctx) => handleCmd(ctx, '/linux_virus', 'LINUX_VIRUS'));
bot.command('pc_kill', (ctx) => handleCmd(ctx, '/pc_kill', 'PC_KILLER'));
bot.command('destroy', (ctx) => handleCmd(ctx, '/destroy', 'DESTROYER'));
bot.command('infect_ill', (ctx) => handleCmd(ctx, '/infect_ill', 'INFECT_ILL'));
bot.command('triple_x', (ctx) => handleCmd(ctx, '/triple_x', 'TRIPLE_X'));
bot.command('ovia_load', (ctx) => handleCmd(ctx, '/ovia_load', 'OVIA_LOAD'));
bot.command('hate_you', (ctx) => handleCmd(ctx, '/hate_you', 'HATE_YOU'));
bot.command('mini_kill', (ctx) => handleCmd(ctx, '/mini_kill', 'MINI_KILL'));
bot.command('ban_wa', (ctx) => handleCmd(ctx, '/ban_wa', 'WA_BAN'));
bot.command('ban_tg', (ctx) => handleCmd(ctx, '/ban_tg', 'TG_BAN'));
bot.command('ip_hack', (ctx) => handleCmd(ctx, '/ip_hack', 'IP_TRACE'));
bot.command('fb_hack', (ctx) => handleCmd(ctx, '/fb_hack', 'FB_HACK'));
bot.command('tiktok_hack', (ctx) => handleCmd(ctx, '/tiktok_hack', 'TIKTOK_HACK'));
bot.command('invis_hell', (ctx) => handleCmd(ctx, '/invis_hell', 'INVISIBLE'));
bot.command('delay_hell', (ctx) => handleCmd(ctx, '/delay_hell', 'DELAY'));
bot.command('group_crash', (ctx) => handleCmd(ctx, '/group_crash', 'GROUP_CRASH'));
bot.command('clone', (ctx) => handleCmd(ctx, '/clone', 'CLONE'));

// ================= START COMMAND - COMPACT MENU =================
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
    ...communityRows,
    [Markup.button.callback('💎 CHECK PREMIUM', 'check_premium')],
    [Markup.button.url('👑 OWNER', `https://t.me/${OWNER_USERNAME.replace('@', '')}`)]
  ]);

  // COMPACT MENU - NOT HUGE
  const menuText = `┌─────────────────────────────────────┐
│ 💀 ${BOT_NAME} 💀 │
├─────────────────────────────────────┤
│ 🔥 VIRUS CMDS                        │
│ /droid_virus <ip>  - Android Virus   │
│ /ios_virus <ip>    - iOS Virus       │
│ /linux_virus <ip>  - Linux Virus     │
│ /pc_kill <ip>      - PC Killer       │
│ /destroy <ip>      - Destroyer       │
├─────────────────────────────────────┤
│ 🐛 BUG CMDS                          │
│ /infect_ill <x>    - Infect Ill      │
│ /triple_x <x>      - Triple X        │
│ /ovia_load <x>     - Ovia Load       │
│ /hate_you <x>      - Hate You        │
│ /mini_kill <x>     - Mini Kill       │
├─────────────────────────────────────┤
│ 💀 SOCIAL HACKS                      │
│ /ban_wa <num>      - WhatsApp Ban    │
│ /ban_tg <user>     - Telegram Ban    │
│ /ip_hack <ip>      - IP Trace        │
│ /fb_hack <email>   - Facebook Hack   │
│ /tiktok_hack <user>- TikTok Hack     │
├─────────────────────────────────────┤
│ 📱 WA TOOLS                          │
│ /invis_hell <num>  - Invisible       │
│ /delay_hell <num>  - Delay Inject    │
│ /group_crash <gc>  - Group Crash     │
├─────────────────────────────────────┤
│ 🤖 OTHER                             │
│ /clone <token>     - Clone Bot       │
├─────────────────────────────────────┤
│ 👑 OWNER ONLY                        │
│ /addprem /delprem /broadcast         │
│ /listusers /allusers /addadmin       │
└─────────────────────────────────────┘`;

  const welcomeMsg = `┌─────────────────────┐
│ 🔥 WELCOME ${ctx.from.first_name || 'HACKER'} 🔥 │
│ ☠️ TYPE ANY COMMAND ☠️ │
└─────────────────────┘`;

  try {
    await ctx.replyWithPhoto(START_IMAGE, { caption: welcomeMsg, parse_mode: 'Markdown' });
    await ctx.reply(menuText, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    await ctx.reply(welcomeMsg, { parse_mode: 'Markdown' });
    await ctx.reply(menuText, { parse_mode: 'Markdown', ...keyboard });
  }
});

// ================= PREMIUM CHECK =================
bot.action('check_premium', async (ctx) => {
  await ctx.answerCbQuery('💎 Checking...');
  const userId = ctx.from.id;
  if (isPremium(userId)) {
    await ctx.reply(`┌─[ PREMIUM USER ]─┐\n├─ 👤 ID: ${userId}\n├─ 🔥 ALL TOOLS\n└─────────────────┘`, { parse_mode: 'Markdown' });
  } else {
    await ctx.reply(`┌─[ FREE USER ]─┐\n├─ 💎 ${PREMIUM_BOT}\n├─ 👑 ${OWNER_USERNAME}\n└───────────────┘`, { parse_mode: 'Markdown' });
  }
});

// ================= ADMIN COMMANDS =================
bot.command('addadmin', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('┌─[ DENIED ]─┐\n├─ Owner only\n└────────────┘');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('┌─[ USAGE ]─┐\n├─ /addadmin <id>\n└────────────┘');
  adminIds.add(uid);
  saveAdmins();
  ctx.reply(`┌─[ ADDED ]─┐\n├─ Admin: ${uid}\n└────────────┘`);
});

bot.command('deladmin', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('┌─[ DENIED ]─┐\n├─ Owner only\n└────────────┘');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('┌─[ USAGE ]─┐\n├─ /deladmin <id>\n└────────────┘');
  if (uid === OWNER_ID) return ctx.reply('┌─[ ERROR ]─┐\n├─ Cannot remove owner\n└────────────┘');
  adminIds.delete(uid);
  saveAdmins();
  ctx.reply(`┌─[ REMOVED ]─┐\n├─ Admin: ${uid}\n└──────────────┘`);
});

bot.command('addprem', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('┌─[ DENIED ]─┐\n├─ Owner only\n└────────────┘');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('┌─[ USAGE ]─┐\n├─ /addprem <id>\n└────────────┘');
  premiumUsers.add(uid);
  savePremiumUsers();
  ctx.reply(`┌─[ ADDED ]─┐\n├─ Premium: ${uid}\n└────────────┘`);
});

bot.command('delprem', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('┌─[ DENIED ]─┐\n├─ Owner only\n└────────────┘');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('┌─[ USAGE ]─┐\n├─ /delprem <id>\n└────────────┘');
  premiumUsers.delete(uid);
  savePremiumUsers();
  ctx.reply(`┌─[ REMOVED ]─┐\n├─ Premium: ${uid}\n└──────────────┘`);
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('┌─[ DENIED ]─┐\n├─ Admin only\n└────────────┘');
  const msg = ctx.message.text.split(' ').slice(1).join(' ');
  if (!msg) return ctx.reply('┌─[ USAGE ]─┐\n├─ /broadcast <msg>\n└────────────┘');
  let sent = 0;
  for (const uid of allUsers) {
    try { await bot.telegram.sendMessage(uid, `📢 BROADCAST\n\n${msg}`); sent++; } catch(e) {}
    await new Promise(r => setTimeout(r, 50));
  }
  ctx.reply(`┌─[ SENT ]─┐\n├─ To: ${sent} users\n└────────────┘`);
});

bot.command('listusers', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('┌─[ DENIED ]─┐\n├─ Owner only\n└────────────┘');
  if (premiumUsers.size === 0) return ctx.reply('┌─[ EMPTY ]─┐\n├─ No premium users\n└────────────┘');
  ctx.reply(`┌─[ PREMIUM USERS ]─┐\n├─ ${[...premiumUsers].join('\n├─ ')}\n└───────────────────┘`);
});

bot.command('allusers', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('┌─[ DENIED ]─┐\n├─ Owner only\n└────────────┘');
  if (allUsers.size === 0) return ctx.reply('┌─[ EMPTY ]─┐\n├─ No users\n└────────────┘');
  ctx.reply(`┌─[ ALL USERS ]─┐\n├─ ${[...allUsers].join('\n├─ ')}\n└───────────────┘`);
});

// ================= LAUNCH =================
bot.launch().then(() => {
  console.log(`☠️ ${BOT_NAME} RUNNING ☠️`);
  console.log(`✅ Owner: ${OWNER_USERNAME}`);
  console.log(`✅ Premium: ${premiumUsers.size} | Total: ${allUsers.size}`);
}).catch(err => console.error('Launch error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));