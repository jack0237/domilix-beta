'use strict'

const express      = require('express')
const cors         = require('cors')
const path         = require('path')
const fs           = require('fs')
const ExcelJS      = require('exceljs')
const nodemailer   = require('nodemailer')

const app       = express()
const PORT      = process.env.PORT      || 3001
const ADMIN_KEY = process.env.ADMIN_KEY || 'domilix-admin-2026'
const DATA_DIR  = path.join(__dirname, '..', 'data')
const XLSX_PATH = path.join(DATA_DIR, 'beta_testers.xlsx')
const SHEET     = 'Testeurs Bêta'

// ── Mailer ────────────────────────────────────────────────────────────────────
const SMTP_CONFIGURED = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

const transporter = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

const SMTP_FROM = process.env.SMTP_FROM || 'Domilix <noreply@domilix.com>'

function buildConfirmationEmail(email) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue dans la bêta Domilix !</title>
</head>
<body style="margin:0;padding:0;background:#f5e5d8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5e5d8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(82,69,52,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:#e8921a;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:4px;font-family:Arial,sans-serif;">
                DOMILIX
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">
                Programme Testeurs Bêta
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px 32px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#221a12;line-height:1.3;">
                Merci de rejoindre l'aventure Domilix ! 🎉
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#534435;line-height:1.75;">
                Bonjour,
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#534435;line-height:1.75;">
                Nous avons bien reçu votre inscription au <strong style="color:#221a12;">programme de bêta testing</strong> de l'application mobile <strong style="color:#e8921a;">Domilix</strong>. Nous sommes ravis de vous compter parmi nos premiers testeurs !
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#534435;line-height:1.75;">
                Domilix est la plateforme immobilière et mobilier haut de gamme pensée pour <strong style="color:#221a12;">Douala et Yaoundé</strong>. Votre retour est précieux pour nous aider à offrir la meilleure expérience possible avant le lancement officiel.
              </p>

              <!-- Étapes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f4;border-radius:12px;padding:0;margin-bottom:32px;">
                <tr>
                  <td style="padding:28px 28px 4px;">
                    <p style="margin:0 0 20px;font-size:14px;font-weight:700;color:#221a12;text-transform:uppercase;letter-spacing:1px;">
                      Prochaines étapes
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;">
                          <div style="width:28px;height:28px;background:#e8921a;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">1</div>
                        </td>
                        <td style="padding-bottom:16px;">
                          <p style="margin:4px 0 2px;font-size:14px;font-weight:700;color:#221a12;">Invitation Google Play</p>
                          <p style="margin:0;font-size:13px;color:#534435;line-height:1.6;">Vous recevrez un e-mail de Google Play vous invitant à rejoindre le programme de test.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;">
                          <div style="width:28px;height:28px;background:#e8921a;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">2</div>
                        </td>
                        <td style="padding-bottom:16px;">
                          <p style="margin:4px 0 2px;font-size:14px;font-weight:700;color:#221a12;">Installation de l'app</p>
                          <p style="margin:0;font-size:13px;color:#534435;line-height:1.6;">Suivez le lien pour installer la version bêta de Domilix sur votre appareil Android.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align:top;padding-right:14px;">
                          <div style="width:28px;height:28px;background:#e8921a;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">3</div>
                        </td>
                        <td style="padding-bottom:16px;">
                          <p style="margin:4px 0 2px;font-size:14px;font-weight:700;color:#221a12;">Partagez vos retours</p>
                          <p style="margin:0;font-size:13px;color:#534435;line-height:1.6;">Explorez l'app et signalez tout problème directement via Google Play.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 40px;font-size:15px;color:#534435;line-height:1.75;">
                En attendant, gardez un œil sur votre boîte mail. L'invitation sera envoyée dès que le programme est ouvert.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  <td style="background:#e8921a;border-radius:12px;padding:14px 28px;box-shadow:0 4px 12px rgba(99,63,0,0.22);">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                      Votre prochaine adresse commence ici.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#534435;line-height:1.75;">
                Merci encore pour votre confiance,<br />
                <strong style="color:#221a12;">L'équipe Domilix</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#221a12;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#e8921a;letter-spacing:3px;">DOMILIX</p>
              <p style="margin:0;font-size:12px;color:rgba(217,195,175,0.6);">
                © ${new Date().getFullYear()} Domilix. Tous droits réservés.<br />
                Cet e-mail vous a été envoyé suite à votre inscription au programme bêta.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`

  const text = `
Merci de rejoindre le programme bêta Domilix !

Bonjour,

Nous avons bien reçu votre inscription (${email}) au programme de bêta testing de l'application mobile Domilix.

Prochaines étapes :
1. Vous recevrez un e-mail de Google Play vous invitant à rejoindre le test bêta.
2. Suivez le lien pour installer Domilix sur votre appareil Android.
3. Explorez l'app et partagez vos retours via Google Play.

Merci pour votre confiance !
L'équipe Domilix
`

  return { html, text }
}

async function sendConfirmationEmail(to) {
  if (!transporter) {
    console.warn('[mailer] SMTP non configuré — e-mail de confirmation ignoré.')
    return
  }
  const { html, text } = buildConfirmationEmail(to)
  await transporter.sendMail({
    from:    SMTP_FROM,
    to,
    subject: '🎉 Bienvenue dans le programme bêta Domilix !',
    text,
    html,
  })
  console.log(`[mailer] Confirmation envoyée à ${to}`)
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173' }))
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ── Excel helpers ─────────────────────────────────────────────────────────────
async function loadWorkbook() {
  const wb = new ExcelJS.Workbook()

  if (fs.existsSync(XLSX_PATH)) {
    await wb.xlsx.readFile(XLSX_PATH)
  } else {
    const ws = wb.addWorksheet(SHEET)
    ws.columns = [
      { header: 'Email',              key: 'email', width: 42 },
      { header: "Date d'inscription", key: 'date',  width: 26 },
    ]
    const header = ws.getRow(1)
    header.font      = { bold: true, color: { argb: 'FFFFFFFF' } }
    header.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8921A' } }
    header.alignment = { vertical: 'middle', horizontal: 'center' }
    header.height    = 24
  }

  return wb
}

async function saveWorkbook(wb) {
  await wb.xlsx.writeFile(XLSX_PATH)
}

function getSheet(wb) {
  return wb.getWorksheet(SHEET) || wb.worksheets[0]
}

function emailExists(ws, email) {
  let found = false
  ws.eachRow((row, i) => {
    if (i > 1 && String(row.getCell(1).value || '').toLowerCase() === email.toLowerCase()) {
      found = true
    }
  })
  return found
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/subscribe
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body || {}

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: 'Adresse e-mail invalide.' })
  }

  const clean = email.trim().toLowerCase()

  try {
    const wb = await loadWorkbook()
    const ws = getSheet(wb)

    if (emailExists(ws, clean)) {
      return res.status(409).json({ message: 'Cette adresse e-mail est déjà inscrite. Vous serez notifié(e) !' })
    }

    ws.addRow([
      clean,
      new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
    ])

    await saveWorkbook(wb)
    console.log(`[+] Nouveau testeur : ${clean}`)

    // Envoyer le mail de confirmation (sans bloquer la réponse si ça échoue)
    sendConfirmationEmail(clean).catch(err =>
      console.error('[mailer] Échec envoi confirmation :', err.message)
    )

    res.json({ message: 'Inscription réussie !' })
  } catch (err) {
    console.error('[subscribe] erreur :', err)
    res.status(500).json({ message: 'Erreur serveur. Réessayez plus tard.' })
  }
})

// GET /api/health — Docker healthcheck
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// GET /api/count
app.get('/api/count', async (_req, res) => {
  try {
    if (!fs.existsSync(XLSX_PATH)) return res.json({ count: 0 })
    const wb    = await loadWorkbook()
    const ws    = getSheet(wb)
    const count = Math.max(0, ws.rowCount - 1)
    res.json({ count })
  } catch {
    res.json({ count: 0 })
  }
})

// GET /api/download?key=xxx  — télécharger le fichier Excel (admin)
app.get('/api/download', async (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(403).json({ message: 'Accès refusé.' })
  }
  if (!fs.existsSync(XLSX_PATH)) {
    return res.status(404).json({ message: 'Aucune inscription pour le moment.' })
  }
  res.download(XLSX_PATH, 'domilix_beta_testers.xlsx')
})

// ── Serve Preact build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Domilix Bêta API`)
  console.log(`  → http://localhost:${PORT}`)
  console.log(`  → Admin : http://localhost:${PORT}/api/download?key=${ADMIN_KEY}`)
  console.log(`  → Mailer : ${SMTP_CONFIGURED ? `configuré (${process.env.SMTP_HOST})` : 'non configuré (définir SMTP_HOST, SMTP_USER, SMTP_PASS)'}\n`)
})
