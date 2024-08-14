// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // o el servicio de correo que estés usando
      auth: {
        user: 'pdiaz290@gmail.com',
        pass: 'kqjd gdoc adua laaq'
      }
    });
  }

 async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'no-reply@tudominio.com',
      to,
      subject: 'Solicitud de Restablecimiento de Contraseña',
      html: `
        <h1>Restablecimiento de Contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
      `
    });
  }
}
