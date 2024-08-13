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
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`
    });
  }
}
