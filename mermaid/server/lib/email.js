import nodemailer from 'nodemailer'
import { config } from './config.js'

let transporter = null

function hasSmtpConfig() {
  return Boolean(config.smtp.host)
}

function getTransporter() {
  if (!transporter) {
    const auth = config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth
    })
  }
  return transporter
}

export async function sendLoginCode(email, code) {
  if (!hasSmtpConfig()) {
    console.log(`[auth] Login code for ${email}: ${code}`)
    return
  }

  await getTransporter().sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Mermaid 在线编辑器登录验证码',
    text: `你的 Mermaid 在线编辑器登录验证码是：${code}\n\n验证码将在几分钟后过期。如果不是你本人操作，可以忽略这封邮件。`
  })
}
