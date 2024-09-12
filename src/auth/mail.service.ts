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
        pass: 'plzt ukhk nuuu vbcn'
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

// Nuevo método para enviar los detalles del ticket
async sendTicketDetailsEmail(to: string, ticket: any): Promise<void> {
  await this.transporter.sendMail({
    from: 'no-reply@tudominio.com',
    to,
    subject: `Detalles del Ticket Nº ${ticket.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd;">
        <h2 style="background-color: #f7f7f7; color: #333; padding: 20px; border-bottom: 1px solid #ddd; text-align: center;">Detalles del Ticket Nº ${ticket.id}</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Establecimiento:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${ticket.establecimiento?.name}</td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${ticket.email}</td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Nombre de usuario afectado:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${ticket.nombre}</td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Fecha de creación:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(ticket.fecha).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Incidencia:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${ticket.incidencia}</td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Técnico Asignado:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 5px;">${ticket.assignedTo?.name}</span></td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Estado:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="background-color: ${ticket.estado === 'Resuelto' ? '#4CAF50' : '#2da73d'}; color: white; padding: 5px 10px; border-radius: 5px;">${ticket.estado}</span></td>
          </tr>
          <tr>
            <td style="background-color: #f7f7f7; padding: 10px; border: 1px solid #ddd;"><strong>Comentario:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${ticket.comentario}</td>
          </tr>
        </table>

        <div style="background-color: #f7f7f7; padding: 20px; border-top: 1px solid #ddd;">
          <h3>Contacto</h3>
          <p><strong>Nombre:</strong>${ticket.nombre}</p>
          <p><strong>Establecimiento:</strong> ${ticket.establecimiento?.name}</p>
          <p><strong>Anexo:</strong> ${ticket.anexo}</p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #777;">
          Este es un correo automático, por favor no responda a este mensaje.
        </div>
      </div>
    `
  });
}

}
