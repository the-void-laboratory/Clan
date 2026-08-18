import http from 'http'
import process from 'process'
import path from 'path'
import { rm } from 'fs/promises'
import makeWASocket, {
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import * as qrcode from 'qrcode'
import TelegramBot from 'node-telegram-bot-api'

const BOT_NAME = '☩ Void Equalizer ☩'
const AUTH_FOLDER = path.resolve(process.cwd(), 'auth_info_baileys')
const HTTP_PORT = Number(process.env.PORT || 3000)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

let sock: ReturnType<typeof makeWASocket> | null = null
let isStarting = false
let retryTimer: NodeJS.Timeout | null = null

const state = {
  connection: 'init',
  registered: false,
  lastDisconnect: '',
  qrText: '',
  qrDataUrl: '',
}

const pairing = {
  phone: '',
  code: '',
  status: 'idle',
  message: 'No pairing request yet.',
  updatedAt: 0,
  expiresAt: 0,
}

function formatDate(ts: number) {
  return ts ? new Date(ts).toLocaleString('en-US', { hour12: false }) : 'never'
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function resetWhatsAppSession() {
  console.log('Resetting WhatsApp auth folder and restarting socket...')
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  if (sock) {
    const anySock = sock as any
    try {
      await anySock?.logout?.()
    } catch (error) {
      console.warn('Could not call logout on WhatsApp socket:', getErrorMessage(error))
    }
    try {
      anySock?.ws?.close?.()
    } catch (error) {
      console.warn('Could not close WhatsApp websocket:', getErrorMessage(error))
    }
    try {
      sock.ev.removeAllListeners('connection.update')
      sock.ev.removeAllListeners('messages.upsert')
      sock.ev.removeAllListeners('creds.update')
    } catch {
      // ignore
    }
    sock = null
  }

  try {
    await rm(AUTH_FOLDER, { recursive: true, force: true })
    console.log('Auth folder removed:', AUTH_FOLDER)
  } catch (error) {
    console.warn('Unable to remove auth folder:', getErrorMessage(error))
  }

  state.connection = 'init'
  state.registered = false
  state.lastDisconnect = ''
  state.qrText = ''
  state.qrDataUrl = ''

  pairing.phone = ''
  pairing.code = ''
  pairing.status = 'idle'
  pairing.message = 'Session reset. Request a new pairing code or scan QR.'
  pairing.updatedAt = Date.now()
  pairing.expiresAt = 0

  await startWhatsApp()
}

function getMessageText(message: any): string {
  if (!message) return ''
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  )
}

function renderHomePage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${BOT_NAME} — WhatsApp Pairing</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 860px; margin: 24px auto; line-height: 1.5; padding: 0 16px; }
      h1 { margin-top: 0; }
      .box { border: 1px solid #ccc; border-radius: 10px; padding: 18px; margin: 16px 0; background: #f9f9f9; }
      .qr { max-width: 320px; }
      input[type=text] { width: 320px; padding: 8px; border: 1px solid #666; border-radius: 6px; }
      button { padding: 10px 16px; border: none; background: #2d6cdf; color: white; border-radius: 6px; cursor: pointer; }
      button:hover { background: #1f53b3; }
      pre { background: #111; color: #eee; padding: 12px; border-radius: 8px; overflow-x: auto; }
    </style>
  </head>
  <body>
    <h1>${BOT_NAME}</h1>
    <div class="box">
      <strong>WhatsApp connection:</strong> ${state.connection}<br />
      <strong>Registered:</strong> ${state.registered ? 'yes' : 'no'}<br />
      <strong>Last disconnect:</strong> ${state.lastDisconnect || 'none'}<br />
      <strong>Server time:</strong> ${formatDate(Date.now())}
    </div>

    <div class="box">
      <h2>Pairing</h2>
      <p>${pairing.message}</p>
      <p><strong>Phone:</strong> ${pairing.phone || 'none'}</p>
      <p><strong>Status:</strong> ${pairing.status}</p>
      <p><strong>Last updated:</strong> ${formatDate(pairing.updatedAt)}</p>
      ${pairing.code ? `<p><strong>Code:</strong> <code id="pairingCode">${pairing.code}</code> (expires ${formatDate(pairing.expiresAt)})</p>` : ''}
      <form action="/pair" method="get">
        <label for="phone">Request pairing code (country code + number, digits only):</label><br />
        <input id="phone" name="phone" type="text" placeholder="15551234567" required />
        <button type="submit">Request Pairing Code</button>
      </form>
      <div style="margin-top:12px;">
        <button type="button" id="copyPairingCode" ${pairing.code ? '' : 'disabled'}>Copy pairing code</button>
        <button type="button" id="resetSession">Reset WhatsApp session</button>
      </div>
    </div>

    <div class="box">
      <h2>QR Code</h2>
      ${state.qrDataUrl ? `<img class="qr" src="${state.qrDataUrl}" alt="WhatsApp QR code" />` : '<p>No QR code available right now.</p>'}
      ${state.qrText ? `<p>Scan the QR with WhatsApp Linked Devices → Link a device.</p>` : ''}
    </div>

    <div class="box">
      <h2>WhatsApp bot commands</h2>
      <p>Send these commands to the bot in WhatsApp chat:</p>
      <ul>
        <li><code>.ping</code> — bot replies with pong.</li>
        <li><code>.menu</code> — shows the command menu.</li>
        <li><code>.info</code> — shows bot info.</li>
      </ul>
    </div>
      document.getElementById('copyPairingCode')?.addEventListener('click', () => {
        const codeEl = document.getElementById('pairingCode')
        const code = codeEl?.textContent?.trim() || ''
        if (!code) {
          alert('No pairing code available to copy.')
          return
        }
        navigator.clipboard.writeText(code).then(
          () => alert('Pairing code copied to clipboard.'),
          () => alert('Unable to copy pairing code. Please copy it manually.'),
        )
      })

      document.getElementById('resetSession')?.addEventListener('click', () => {
        if (confirm('Reset the WhatsApp session and force a fresh reconnect?')) {
          window.location.href = '/reset'
        }
      })
    })()
  </script>
</body>
</html>`
}

async function sendWhatsAppReply(jid: string, text: string) {
  if (!sock) return
  await sock.sendMessage(jid, { text })
}

async function requestPairingCode(phone: string) {
  if (!sock) {
    throw new Error('WhatsApp socket is not initialized yet.')
  }

  const digits = phone.replace(/\D/g, '')
  if (!digits) {
    throw new Error('Please provide a valid phone number with country code and digits only.')
  }

  if (sock.authState?.creds?.registered) {
    pairing.status = 'paired'
    pairing.message = 'Already registered. If you need a new session, delete the auth folder and restart.'
    pairing.phone = digits
    pairing.updatedAt = Date.now()
    return null
  }

  pairing.phone = digits
  pairing.status = 'waiting'
  pairing.message = 'Requesting pairing code...'
  pairing.updatedAt = Date.now()

  const code = await sock.requestPairingCode(digits)
  pairing.code = code
  pairing.status = 'ready'
  pairing.message = 'Pairing code generated. Enter it on your phone.'
  pairing.expiresAt = Date.now() + 10 * 60 * 1000
  pairing.updatedAt = Date.now()
  return code
}

async function startWhatsApp() {
  if (isStarting) return
  isStarting = true

  try {
    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

    sock = makeWASocket({
      auth: authState,
      browser: Browsers.macOS('Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    })

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        state.qrText = qr
        state.qrDataUrl = await qrcode.toDataURL(qr)
      }

      if (connection) {
        state.connection = connection
      }

      if (connection === 'open') {
        state.registered = sock?.authState?.creds?.registered ?? false
        state.qrText = ''
        state.qrDataUrl = ''
        pairing.status = 'paired'
        pairing.message = 'WhatsApp connected and ready.'
        pairing.updatedAt = Date.now()
        console.log(`${BOT_NAME} connected to WhatsApp.`)
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut
        state.lastDisconnect = statusCode ? String(statusCode) : String(lastDisconnect?.error || 'unknown')

        if (shouldReconnect) {
          console.log('Connection closed. Reconnecting in 3 seconds...')
          if (retryTimer) clearTimeout(retryTimer)
          retryTimer = setTimeout(async () => {
            retryTimer = null
            await startWhatsApp()
          }, 3000)
        } else {
          pairing.status = 'error'
          pairing.message = 'Logged out. Delete auth_info_baileys and restart to re-register.'
          console.log('Logged out from WhatsApp session. Delete auth folder and restart to reconnect.')
        }
      }
    })

    sock.ev.on('messages.upsert', async (event) => {
      if (event.type !== 'notify') return
      for (const message of event.messages) {
        if (!message.message || message.key.fromMe) continue
        const text = getMessageText(message.message)
        if (!text) continue

        const normalized = text.trim().toLowerCase()
        const jid = message.key.remoteJid
        if (!jid) continue

        if (normalized === '.ping') {
          await sendWhatsAppReply(jid, 'pong')
          continue
        }

        if (normalized === '.menu') {
          await sendWhatsAppReply(
            jid,
            `${BOT_NAME} commands:\n.ping - pong reply\n.menu - show this menu\n.info - bot info and status`,
          )
          continue
        }

        if (normalized === '.info') {
          await sendWhatsAppReply(
            jid,
            `${BOT_NAME}\nStatus: ${state.connection}\nRegistered: ${state.registered ? 'yes' : 'no'}\nPairing code: ${pairing.code || 'none'}`,
          )
          continue
        }
      }
    })

    sock.ev.on('creds.update', saveCreds)
  } catch (error) {
    console.error('Failed to start WhatsApp connection:', error)
    pairing.status = 'error'
    pairing.message = `WhatsApp startup failed: ${getErrorMessage(error)}`
  } finally {
    isStarting = false
  }
}

function startHttpServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host}`)

      if (url.pathname === '/pair' && req.method === 'GET') {
        const phone = url.searchParams.get('phone') || ''
        if (!phone) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Missing phone parameter. Use /pair?phone=15551234567')
          return
        }

        try {
          const code = await requestPairingCode(phone)
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(`<!doctype html><html><body><h1>Pairing Code</h1><p>Phone: ${phone}</p><p>Code: ${code ?? 'already paired'}</p><p><a href="/">Back</a></p></body></html>`)
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end(`Pairing request failed: ${getErrorMessage(error)}`)
        }
        return
      }

      if (url.pathname === '/reset' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`<!doctype html><html><body><h1>Resetting session</h1><p>The WhatsApp session is being reset. Refresh the home page in a moment.</p><p><a href="/">Back</a></p></body></html>`)
        resetWhatsAppSession().catch((error) => console.error('Reset failed:', getErrorMessage(error)))
        return
      }

      if (url.pathname === '/qr') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`<!doctype html><html><body><h1>WhatsApp QR code</h1>${state.qrDataUrl ? `<img src="${state.qrDataUrl}" alt="QR code" />` : '<p>No QR code available right now.</p>'}<p><a href="/">Back</a></p></body></html>`)
        return
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(renderHomePage())
    } catch (error) {
      console.error('HTTP server error:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(`Server error: ${getErrorMessage(error)}`)
    }
  })

  server.listen(HTTP_PORT, () => {
    console.log(`HTTP server running at http://localhost:${HTTP_PORT}`)
  })
}

function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('TELEGRAM_BOT_TOKEN is not set. Telegram pairing is disabled.')
    return
  }

  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true })

  bot.onText(/\/start|\/help/, (msg: TelegramBot.Message) => {
    bot.sendMessage(
      msg.chat.id,
      `Hello! I am *${BOT_NAME}*\nUse /pair <number> to request a WhatsApp pairing code.\nCommands:\n/pair 15551234567\n/qr\n/status`,
      { parse_mode: 'Markdown' },
    )
  })

  bot.onText(/\/pair(?:\s+(.+))?/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    const phone = match?.[1]?.trim()
    if (!phone) {
      bot.sendMessage(msg.chat.id, 'Please send /pair followed by the phone number, digits only, including country code. Example: /pair 15551234567')
      return
    }
    try {
      const code = await requestPairingCode(phone)
      const text = code
        ? `Pairing code for +${phone}: ${code}\nEnter it on WhatsApp Linked Devices → Link a device → Link with phone number instead.`
        : `Already paired or session already exists for +${phone}. If you need a fresh session, remove the auth folder and restart.`
      bot.sendMessage(msg.chat.id, text)
    } catch (error) {
      bot.sendMessage(msg.chat.id, `Pairing failed: ${getErrorMessage(error)}`)
    }
  })

  bot.onText(/\/qr/, async (msg: TelegramBot.Message) => {
    if (!state.qrText) {
      bot.sendMessage(msg.chat.id, 'No QR code is available right now. Start or reconnect the WhatsApp socket to generate one.')
      return
    }
    try {
      const imageBuffer = await qrcode.toBuffer(state.qrText, { type: 'png', width: 300 })
      await bot.sendPhoto(msg.chat.id, imageBuffer, {
        caption: `Scan this QR code with WhatsApp Linked Devices → Link a device.`,
      })
    } catch (error) {
      bot.sendMessage(msg.chat.id, `Failed to generate QR image: ${getErrorMessage(error)}`)
    }
  })

  bot.onText(/\/status/, (msg: TelegramBot.Message) => {
    const text = `WhatsApp status: ${state.connection}\nRegistered: ${state.registered ? 'yes' : 'no'}\nPair status: ${pairing.status}\nPhone: ${pairing.phone || 'none'}`
    bot.sendMessage(msg.chat.id, text)
  })

  console.log('Telegram bot started and polling for commands.')
}

async function main() {
  await startWhatsApp()
  startHttpServer()
  startTelegramBot()
}

main().catch((error) => {
  console.error('Fatal startup error:', error)
  process.exit(1)
})