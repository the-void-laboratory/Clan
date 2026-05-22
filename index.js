require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

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

// ================= COUNTRY DATABASE (based on number prefix) =================
const countryDatabase = {
  '234': { name: 'Nigeria', flag: '🇳🇬', states: ['Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Delta', 'Enugu', 'Kaduna'], cities: { 'Lagos': ['Ikeja', 'VI', 'Lekki', 'Ajah', 'Surulere'], 'Abuja': ['Garki', 'Wuse', 'Maitama', 'Kubwa'], 'Rivers': ['Port Harcourt', 'Oyigbo'], 'Oyo': ['Ibadan', 'Oyo'], 'Kano': ['Kano City', 'Fagge'], 'Delta': ['Asaba', 'Warri'], 'Enugu': ['Enugu City', 'Nsukka'], 'Kaduna': ['Kaduna City', 'Zaria'] }, streets: ['Allen Avenue', 'Ahmadu Bello Way', 'Admiralty Way', 'Ladoke Akintola Blvd', 'Amina Way', 'Kashim Ibrahim Way', 'Aba Road', 'Trans Amadi', 'Bodija Road', 'Ring Road', 'Nnebisi Road', 'Effurun Road', 'Okpara Avenue', 'Ogui Road', 'Ali Akilu Road'] },
  '1': { name: 'USA', flag: '🇺🇸', states: ['New York', 'California', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia'], cities: { 'New York': ['Manhattan', 'Brooklyn', 'Queens'], 'California': ['Los Angeles', 'San Francisco', 'San Diego'], 'Texas': ['Houston', 'Dallas', 'Austin'], 'Florida': ['Miami', 'Orlando', 'Tampa'] }, streets: ['Broadway', 'Hollywood Blvd', 'Wall Street', 'Main Street', 'Sunset Blvd', 'Michigan Ave'] },
  '44': { name: 'UK', flag: '🇬🇧', states: ['England', 'Scotland', 'Wales', 'Northern Ireland'], cities: { 'England': ['London', 'Manchester', 'Birmingham', 'Liverpool'], 'Scotland': ['Edinburgh', 'Glasgow'], 'Wales': ['Cardiff', 'Swansea'] }, streets: ['Oxford Street', 'Baker Street', 'Downing Street', 'King\'s Road', 'Princes Street'] },
  '91': { name: 'India', flag: '🇮🇳', states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal'], cities: { 'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'], 'Delhi': ['New Delhi', 'Noida', 'Gurgaon'], 'Karnataka': ['Bangalore', 'Mysore'] }, streets: ['MG Road', 'Brigade Road', 'Park Street', 'Connaught Place', 'Commercial Street'] },
  '55': { name: 'Brazil', flag: '🇧🇷', states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia'], cities: { 'São Paulo': ['São Paulo City', 'Campinas'], 'Rio de Janeiro': ['Rio City', 'Niterói'] }, streets: ['Paulista Avenue', 'Copacabana Beach', 'Atlântica Avenue', 'Rio Branco Avenue'] },
  '49': { name: 'Germany', flag: '🇩🇪', states: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse'], cities: { 'Bavaria': ['Munich', 'Nuremberg'], 'Berlin': ['Mitte', 'Kreuzberg'] }, streets: ['Unter den Linden', 'Kurfürstendamm', 'Reeperbahn', 'Zeil'] },
  '33': { name: 'France', flag: '🇫🇷', states: ['Île-de-France', 'Provence', 'Normandy', 'Bordeaux'], cities: { 'Île-de-France': ['Paris', 'Versailles'], 'Provence': ['Marseille', 'Nice'] }, streets: ['Champs-Élysées', 'Rivoli Street', 'Mirabeau Boulevard', 'Cannes Promenade'] },
  '81': { name: 'Japan', flag: '🇯🇵', states: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], cities: { 'Tokyo': ['Shinjuku', 'Shibuya', 'Ginza'], 'Osaka': ['Namba', 'Umeda'] }, streets: ['Omotesando', 'Dotonbori', 'Shijo Street', 'Akihabara'] },
  '7': { name: 'Russia', flag: '🇷🇺', states: ['Moscow', 'Saint Petersburg', 'Novosibirsk'], cities: { 'Moscow': ['Tverskoy', 'Arbat'], 'Saint Petersburg': ['Nevsky', 'Vasilyevsky'] }, streets: ['Tverskaya Street', 'Nevsky Prospect', 'Arbat Street', 'Ligovsky Ave'] },
  '61': { name: 'Australia', flag: '🇦🇺', states: ['New South Wales', 'Victoria', 'Queensland'], cities: { 'New South Wales': ['Sydney', 'Newcastle'], 'Victoria': ['Melbourne', 'Geelong'] }, streets: ['George Street', 'Swanston Street', 'Queen Street', 'King George Square'] },
  '86': { name: 'China', flag: '🇨🇳', states: ['Beijing', 'Shanghai', 'Guangdong', 'Zhejiang'], cities: { 'Beijing': ['Chaoyang', 'Haidian'], 'Shanghai': ['Pudong', 'Huangpu'] }, streets: ['Nanjing Road', 'Wangfujing Street', 'Huaihai Road', 'Beijing Road'] },
  '82': { name: 'South Korea', flag: '🇰🇷', states: ['Seoul', 'Busan', 'Incheon'], cities: { 'Seoul': ['Gangnam', 'Myeongdong'], 'Busan': ['Haeundae', 'Seomyeon'] }, streets: ['Gangnam-daero', 'Myeongdong-gil', 'Gwangbok-ro', 'Hongdae Street'] },
  '39': { name: 'Italy', flag: '🇮🇹', states: ['Lazio', 'Lombardy', 'Campania'], cities: { 'Lazio': ['Rome', 'Latina'], 'Lombardy': ['Milan', 'Bergamo'] }, streets: ['Via del Corso', 'Via Montenapoleone', 'Via Toledo', 'Via Roma'] },
  '34': { name: 'Spain', flag: '🇪🇸', states: ['Madrid', 'Catalonia', 'Andalusia'], cities: { 'Madrid': ['Salamanca', 'Centro'], 'Catalonia': ['Barcelona', 'Girona'] }, streets: ['Gran Vía', 'Passeig de Gràcia', 'La Rambla', 'Calle Serrano'] },
  '27': { name: 'South Africa', flag: '🇿🇦', states: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'], cities: { 'Gauteng': ['Johannesburg', 'Pretoria'], 'Western Cape': ['Cape Town', 'Stellenbosch'] }, streets: ['Vilakazi Street', 'Long Street', 'Florida Road', 'Melle Street'] }
};

// ================= HACKED USERNAMES DATABASE =================
const hackedUsernames = [
  "dark_shadow_99", "elite_hacker_x", "ghost_rider_666", "anonymous_byte", "null_pointer_7",
  "satanic_coder", "hell_fire_hack", "virus_spreader", "root_access_777", "kali_master",
  "cyber_demon", "infected_soul", "dark_web_ghost", "zero_day_exploit", "malware_king",
  "sql_injector", "backdoor_creator", "ransom_ware_666", "black_hat_hacker", "dark_side_hack"
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

// ================= GENERATE MIXED PASSWORD =================
function generateMixedPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specials = '!@#$%^&*';
  let password = '';
  for(let i = 0; i < 3; i++) password += upper[Math.floor(Math.random() * upper.length)];
  for(let i = 0; i < 4; i++) password += lower[Math.floor(Math.random() * lower.length)];
  for(let i = 0; i < 3; i++) password += numbers[Math.floor(Math.random() * numbers.length)];
  for(let i = 0; i < 2; i++) password += specials[Math.floor(Math.random() * specials.length)];
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ================= GET COUNTRY INFO FROM NUMBER =================
function getCountryInfo(phoneNumber) {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  for (const [code, country] of Object.entries(countryDatabase)) {
    if (cleanNumber.startsWith(code)) {
      const state = country.states[Math.floor(Math.random() * country.states.length)];
      const cities = country.cities[state] || ['Main City'];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const street = country.streets[Math.floor(Math.random() * country.streets.length)];
      return {
        name: country.name,
        flag: country.flag,
        state: state,
        city: city,
        street: street,
        code: code
      };
    }
  }
  return {
    name: 'Unknown',
    flag: '🌍',
    state: 'Unknown Region',
    city: 'Unknown City',
    street: 'Unknown Street',
    code: 'unknown'
  };
}

// ================= GET RANDOM HACKED USERNAME =================
function getHackedUsername() {
  return hackedUsernames[Math.floor(Math.random() * hackedUsernames.length)];
}

// ================= SIMPLE REPLY (for bugs and other commands) =================
function simpleReply(command, target) {
  const time = new Date().toLocaleString();
  const commandName = command.replace('/', '').toUpperCase();
  return `✅ MISSION ACCOMPLISHED!\n🎯 TARGET: ${target}\n💀 ${commandName} EXECUTED\n🕒 ${time}`;
}

// ================= SOCIAL HACK REPLY (with password) =================
function socialHackReply(command, target) {
  const time = new Date().toLocaleString();
  const hackedUser = getHackedUsername();
  const mixedPass = generateMixedPassword();
  const commandName = command.replace('/', '').toUpperCase();
  return `✅ MISSION ACCOMPLISHED!\n🎯 TARGET: ${target}\n🔓 HACKED USER: ${hackedUser}\n🔑 PASSWORD: ${mixedPass}\n💀 ${commandName} HACKED\n🕒 ${time}`;
}

// ================= IP TRACK REPLY (with country location) =================
function ipTrackReply(target) {
  const time = new Date().toLocaleString();
  const country = getCountryInfo(target);
  return `✅ MISSION ACCOMPLISHED!\n🌐 TARGET NUMBER: ${target}\n📍 COUNTRY: ${country.flag} ${country.name}\n🏛️ STATE: ${country.state}\n🏙️ CITY: ${country.city}\n🏠 STREET: ${country.street}\n📡 CARRIER: ${['MTN', 'GLO', 'Airtel', 'Vodafone', 'Verizon', 'T-Mobile', 'Orange', 'Deutsche Telekom'][Math.floor(Math.random()*8)]}\n📱 DEVICE: ${['iPhone', 'Samsung', 'Tecno', 'Infinix', 'Google Pixel', 'OnePlus', 'Xiaomi', 'Huawei'][Math.floor(Math.random()*8)]}\n🕒 ${time}`;
}

// ================= HACKER REPLIES =================
function getHackerReply(command, target) {
  // Social Hacks (show password)
  if (command === '/fb_hack' || command === '/tiktok_hack' || command === '/twitter_hack' || command === '/snap_hack') {
    return socialHackReply(command, target);
  }
  
  // IP Hack (show location)
  if (command === '/ip_hack') {
    return ipTrackReply(target);
  }
  
  // All other commands (simple reply)
  return simpleReply(command, target);
}

// ================= ADMIN EXECUTES INSTANTLY =================
async function executeHackInstant(ctx, command, toolName) {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ').slice(1);
  const target = args.join(' ');
  if (!target && command !== '/clone') {
    return ctx.reply(`⚠️ USAGE: ${command} <target>\nExample: ${command} 08012345678`);
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
// Virus Commands
bot.command('droid_virus', (ctx) => handleCmd(ctx, '/droid_virus', 'DROID_VIRUS'));
bot.command('ios_virus', (ctx) => handleCmd(ctx, '/ios_virus', 'IOS_VIRUS'));
bot.command('linux_virus', (ctx) => handleCmd(ctx, '/linux_virus', 'LINUX_VIRUS'));
bot.command('pc_kill', (ctx) => handleCmd(ctx, '/pc_kill', 'PC_KILLER'));
bot.command('destroy', (ctx) => handleCmd(ctx, '/destroy', 'DESTROYER'));

// Bug Commands (NO password, simple reply)
bot.command('infect_ill', (ctx) => handleCmd(ctx, '/infect_ill', 'INFECT_ILL'));
bot.command('triple_x', (ctx) => handleCmd(ctx, '/triple_x', 'TRIPLE_X'));
bot.command('ovia_load', (ctx) => handleCmd(ctx, '/ovia_load', 'OVIA_LOAD'));
bot.command('hate_you', (ctx) => handleCmd(ctx, '/hate_you', 'HATE_YOU'));
bot.command('mini_kill', (ctx) => handleCmd(ctx, '/mini_kill', 'MINI_KILL'));

// Social Hacks (WITH password)
bot.command('fb_hack', (ctx) => handleCmd(ctx, '/fb_hack', 'FB_HACK'));
bot.command('tiktok_hack', (ctx) => handleCmd(ctx, '/tiktok_hack', 'TIKTOK_HACK'));
bot.command('twitter_hack', (ctx) => handleCmd(ctx, '/twitter_hack', 'TWITTER_HACK'));
bot.command('snap_hack', (ctx) => handleCmd(ctx, '/snap_hack', 'SNAP_HACK'));

// Other Social
bot.command('ban_wa', (ctx) => handleCmd(ctx, '/ban_wa', 'WA_BAN'));
bot.command('ban_tg', (ctx) => handleCmd(ctx, '/ban_tg', 'TG_BAN'));
bot.command('ip_hack', (ctx) => handleCmd(ctx, '/ip_hack', 'IP_TRACE'));
bot.command('invis_hell', (ctx) => handleCmd(ctx, '/invis_hell', 'INVISIBLE'));
bot.command('delay_hell', (ctx) => handleCmd(ctx, '/delay_hell', 'DELAY'));
bot.command('group_crash', (ctx) => handleCmd(ctx, '/group_crash', 'GROUP_CRASH'));
bot.command('clone', (ctx) => handleCmd(ctx, '/clone', 'CLONE'));

// ================= START COMMAND =================
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
    [Markup.button.callback('📜 VIEW COMMANDS', 'show_menu')],
    ...communityRows,
    [Markup.button.callback('💎 CHECK PREMIUM', 'check_premium')],
    [Markup.button.url('👑 OWNER', `https://t.me/${OWNER_USERNAME.replace('@', '')}`)]
  ]);

  const menuText = `┌─────────────────────────────────┐
│ 💀 ${BOT_NAME} 💀 │
├─────────────────────────────────┤
│ 🔥 VIRUS                        │
│ /droid_virus <ip>  - Android    │
│ /ios_virus <ip>    - iOS        │
│ /linux_virus <ip>  - Linux      │
│ /pc_kill <ip>      - PC Killer  │
│ /destroy <ip>      - Destroyer  │
├─────────────────────────────────┤
│ 🐛 BUGS                         │
│ /infect_ill <x>    - Infect Ill │
│ /triple_x <x>      - Triple X   │
│ /ovia_load <x>     - Ovia Load  │
│ /hate_you <x>      - Hate You   │
│ /mini_kill <x>     - Mini Kill  │
├─────────────────────────────────┤
│ 💀 SOCIAL HACKS                  │
│ /fb_hack <email>   - Facebook   │
│ /tiktok_hack <user>- TikTok     │
│ /twitter_hack <user>- Twitter   │
│ /snap_hack <user>  - Snapchat   │
│ /ban_wa <num>      - WhatsApp   │
│ /ban_tg <user>     - Telegram   │
│ /ip_hack <num>     - IP Trace   │
├─────────────────────────────────┤
│ 📱 WA TOOLS                     │
│ /invis_hell <num>  - Invisible  │
│ /delay_hell <num>  - Delay      │
│ /group_crash <gc>  - Group Crash│
├─────────────────────────────────┤
│ 🤖 OTHER                        │
│ /clone <token>     - Clone Bot  │
├─────────────────────────────────┤
│ 👑 OWNER                        │
│ /addprem /delprem /broadcast    │
│ /listusers /allusers /addadmin  │
└─────────────────────────────────┘`;

  const welcomeMsg = `🔥 *${BOT_NAME}* 🔥

☠️ *WELCOME ${ctx.from.first_name || 'HACKER'}* ☠️

💀 *CLICK BUTTON BELOW FOR COMMANDS* 💀

⚡ *POWERED BY LORD SATANUS* ⚡`;

  try {
    await ctx.replyWithPhoto(START_IMAGE, { caption: welcomeMsg, parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    await ctx.reply(welcomeMsg, { parse_mode: 'Markdown', ...keyboard });
  }
});

// ================= MENU BUTTON =================
bot.action('show_menu', async (ctx) => {
  await ctx.answerCbQuery('📜 Loading commands...');
  
  const menuText = `┌─────────────────────────────────┐
│ 💀 ${BOT_NAME} 💀 │
├─────────────────────────────────┤
│ 🔥 VIRUS                        │
│ /droid_virus <ip>  - Android    │
│ /ios_virus <ip>    - iOS        │
│ /linux_virus <ip>  - Linux      │
│ /pc_kill <ip>      - PC Killer  │
│ /destroy <ip>      - Destroyer  │
├─────────────────────────────────┤
│ 🐛 BUGS                         │
│ /infect_ill <x>    - Infect Ill │
│ /triple_x <x>      - Triple X   │
│ /ovia_load <x>     - Ovia Load  │
│ /hate_you <x>      - Hate You   │
│ /mini_kill <x>     - Mini Kill  │
├─────────────────────────────────┤
│ 💀 SOCIAL HACKS                  │
│ /fb_hack <email>   - Facebook   │
│ /tiktok_hack <user>- TikTok     │
│ /twitter_hack <user>- Twitter   │
│ /snap_hack <user>  - Snapchat   │
│ /ban_wa <num>      - WhatsApp   │
│ /ban_tg <user>     - Telegram   │
│ /ip_hack <num>     - IP Trace   │
├─────────────────────────────────┤
│ 📱 WA TOOLS                     │
│ /invis_hell <num>  - Invisible  │
│ /delay_hell <num>  - Delay      │
│ /group_crash <gc>  - Group Crash│
├─────────────────────────────────┤
│ 🤖 OTHER                        │
│ /clone <token>     - Clone Bot  │
├─────────────────────────────────┤
│ 👑 OWNER                        │
│ /addprem /delprem /broadcast    │
│ /listusers /allusers /addadmin  │
└─────────────────────────────────┘`;

  const menuKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('👥 MAIN GROUP', 'https://t.me/lordsatanusmaingc'), Markup.button.url('📢 MAIN CHANNEL', 'https://t.me/lordsatanusmainchannel')],
    [Markup.button.url('🔥 RYOMEN TECH', 'https://t.me/RyomenTechtheuprising'), Markup.button.url('💀 FYT_13', 'https://t.me/FYT_13')],
    [Markup.button.url('💰 EARNING BIT SATAN', 'https://t.me/earningbitsatan664'), Markup.button.url('⚡ HELL GUARD', 'https://t.me/hellgaurd666')],
    [Markup.button.callback('💎 CHECK PREMIUM', 'check_premium')]
  ]);

  await ctx.reply(menuText, { parse_mode: 'Markdown', ...menuKeyboard });
});

// ================= PREMIUM CHECK =================
bot.action('check_premium', async (ctx) => {
  await ctx.answerCbQuery('💎 Checking...');
  const userId = ctx.from.id;
  if (isPremium(userId)) {
    await ctx.reply(`⭐ *PREMIUM USER* ⭐\n👤 ID: ${userId}\n🔥 ALL TOOLS UNLOCKED`, { parse_mode: 'Markdown' });
  } else {
    await ctx.reply(`🔴 *FREE USER* 🔴\n💎 UPGRADE: ${PREMIUM_BOT}\n👑 OWNER: ${OWNER_USERNAME}`, { parse_mode: 'Markdown' });
  }
});

// ================= ADMIN COMMANDS =================
bot.command('addadmin', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 OWNER ONLY');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('Usage: /addadmin <id>');
  adminIds.add(uid);
  saveAdmins();
  ctx.reply(`✅ Admin added: ${uid}`);
});

bot.command('deladmin', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 OWNER ONLY');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('Usage: /deladmin <id>');
  if (uid === OWNER_ID) return ctx.reply('❌ Cannot remove owner');
  adminIds.delete(uid);
  saveAdmins();
  ctx.reply(`❌ Admin removed: ${uid}`);
});

bot.command('addprem', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 OWNER ONLY');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('Usage: /addprem <id>');
  premiumUsers.add(uid);
  savePremiumUsers();
  ctx.reply(`✅ Premium added: ${uid}`);
});

bot.command('delprem', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 OWNER ONLY');
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('Usage: /delprem <id>');
  premiumUsers.delete(uid);
  savePremiumUsers();
  ctx.reply(`❌ Premium removed: ${uid}`);
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('🔒 ADMIN ONLY');
  const msg = ctx.message.text.split(' ').slice(1).join(' ');
  if (!msg) return ctx.reply('Usage: /broadcast <message>');
  let sent = 0;
  for (const uid of allUsers) {
    try { await bot.telegram.sendMessage(uid, `📢 *BROADCAST*\n\n${msg}`, { parse_mode: 'Markdown' }); sent++; } catch(e) {}
    await new Promise(r => setTimeout(r, 50));
  }
  ctx.reply(`✅ Sent to ${sent} users`);
});

bot.command('listusers', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 OWNER ONLY');
  if (premiumUsers.size === 0) return ctx.reply('No premium users');
  ctx.reply(`👑 *Premium Users:*\n${[...premiumUsers].join('\n')}`, { parse_mode: 'Markdown' });
});

bot.command('allusers', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply('🔒 OWNER ONLY');
  if (allUsers.size === 0) return ctx.reply('No users');
  ctx.reply(`👥 *All Users:*\n${[...allUsers].join('\n')}`, { parse_mode: 'Markdown' });
});

// ================= LAUNCH =================
bot.launch().then(() => {
  console.log(`☠️ ${BOT_NAME} RUNNING ☠️`);
  console.log(`✅ Owner: ${OWNER_USERNAME}`);
  console.log(`✅ Premium: ${premiumUsers.size} | Total: ${allUsers.size}`);
}).catch(err => console.error('Launch error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));