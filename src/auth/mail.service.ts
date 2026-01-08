import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly blueColor = '#2563eb';

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private readonly from = `${process.env.SMTP_FROM_NAME || 'Ticket Eduhuechuraba'} <${process.env.SMTP_USER}>`;

  // --- Generador de Línea de Tiempo ---
  private getTimeline(status: string): string {
    const steps = [
      { id: 'Pendiente', label: 'Ingresado' },
      { id: 'Asignado', label: 'En Proceso' },
      { id: 'Resuelto', label: 'Resuelto' },
      { id: 'Feedback', label: 'Finalizado' }
    ];

    // Mapeo de estados actuales a posiciones de la línea
    let currentStepIndex = 0;
    if (status === 'Asignado') currentStepIndex = 1;
    if (status === 'Resuelto') currentStepIndex = 2;
    if (status === 'Cerrado' || status === 'Validado') currentStepIndex = 3; 

    let timelineHtml = '<div style="margin: 30px 0; text-align: center; width: 100%;">';
    timelineHtml += '<table style="width: 100%; border-collapse: collapse;"><tr>';

    steps.forEach((step, index) => {
      const isCompleted = index <= currentStepIndex;
      const isCurrent = index === currentStepIndex;
      const circleColor = isCompleted ? this.blueColor : '#e2e8f0';
      const textColor = isCompleted ? '#1e293b' : '#94a3b8';
      const fontWeight = isCurrent ? '700' : '400';

      // Línea conectora
      if (index > 0) {
        const lineColor = index <= currentStepIndex ? this.blueColor : '#e2e8f0';
        timelineHtml += `<td style="width: 15%; padding: 0;"><div style="height: 3px; background-color: ${lineColor}; margin-top: -15px;"></div></td>`;
      }

      // Círculo y Etiqueta
      timelineHtml += `
        <td style="width: 20%; text-align: center; padding: 0;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${circleColor}; margin: 0 auto 8px; border: 3px solid ${isCurrent ? '#bfdbfe' : 'transparent'}; box-sizing: content-box;"></div>
          <div style="font-size: 11px; color: ${textColor}; font-weight: ${fontWeight}; font-family: sans-serif;">${step.label} ${isCurrent && status === 'Resuelto' ? '<br>(Feedback Pendiente)' : ''}</div>
        </td>
      `;
    });

    timelineHtml += '</tr></table></div>';
    return timelineHtml;
  }

  // --- Plantilla Base ---
  private getEmailTemplate(title: string, content: string, status?: string): string {
    const timeline = status ? this.getTimeline(status) : '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
          .header { background-color: ${this.blueColor}; padding: 50px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.1em; text-transform: uppercase; }
          .content { padding: 45px 40px; line-height: 1.8; }
          .content h2 { color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px; text-align: center; }
          .content p { margin-bottom: 20px; font-size: 16px; color: #475569; }
          .footer { background-color: #f8fafc; padding: 35px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; }
          .button { display: inline-block; background-color: ${this.blueColor}; color: #ffffff !important; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
          .table-container { margin: 30px 0; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
          table.data-table { width: 100%; border-collapse: collapse; }
          table.data-table td { padding: 18px; border-bottom: 1px solid #f1f5f9; font-size: 15px; }
          .label { background-color: #f8fafc; font-weight: 600; width: 35%; color: #334155; }
          .status-badge { display: inline-block; padding: 6px 16px; border-radius: 10px; font-size: 12px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; }
          .warning-box { background-color: #fff1f2; border-left: 5px solid #e11d48; padding: 20px; margin: 25px 0; border-radius: 8px; color: #9f1239; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>TICKETS EDUHUECHURABA</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              ${timeline}
              ${content}
            </div>
            <div class="footer">
              <p><strong>Municipalidad de Huechuraba</strong></p>
              <p>Departamento de Educación - Área de Soporte</p>
              <p style="margin-top: 15px; font-size: 11px; opacity: 0.7;">&copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const content = `
      <p style="text-align: center;">Hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este correo satisfactoriamente.</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
      </div>
      <p style="font-size: 14px; color: #94a3b8; text-align: center;">Válido por los próximos 60 minutos.</p>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Recuperación de Acceso - Sistema de Tickets',
      html: this.getEmailTemplate('Seguridad de Cuenta', content),
    });
  }

  async sendTicketCreationEmail(to: string, ticket: any): Promise<void> {
    const content = `
      <p>Confirmamos el ingreso de su requerimiento al sistema de soporte.</p>
      <div class="table-container">
        <table class="data-table">
          <tr><td class="label">Folio Ticket</td><td><strong>${ticket.codigoIncidencia}</strong></td></tr>
          <tr><td class="label">Técnico Responsable</td><td><strong>${ticket.assignedTo?.name || 'Pendiente de asignación'}</strong></td></tr>
          <tr><td class="label">Solicitante</td><td>${ticket.nombre}</td></tr>
          <tr><td class="label">Establecimiento</td><td>${ticket.establecimiento?.name}</td></tr>
          <tr><td class="label">Asunto</td><td>${ticket.incidencia}</td></tr>
          <tr><td class="label">Estado</td><td><span class="status-badge" style="background-color: ${this.blueColor};">${ticket.estado}</span></td></tr>
        </table>
      </div>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `Nuevo Ticket: Folio ${ticket.codigoIncidencia}`,
      html: this.getEmailTemplate('Ticket Registrado', content, ticket.estado),
    });
  }

  async sendTicketAssignedEmail(to: string, ticket: any): Promise<void> {
    const content = `
      <p>Se le ha asignado una nueva orden de trabajo bajo el folio <strong>${ticket.codigoIncidencia}</strong>.</p>
      <div class="table-container">
        <table class="data-table">
          <tr><td class="label">Solicitante</td><td>${ticket.nombre}</td></tr>
          <tr><td class="label">Establecimiento</td><td>${ticket.establecimiento?.name}</td></tr>
          <tr><td class="label">Descripción</td><td>${ticket.incidencia}</td></tr>
        </table>
      </div>
      <div style="text-align:center; margin-top: 30px;">
        <a href="https://www.tickets.eduhuechuraba.cl/" class="button">Atender Ticket</a>
      </div>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `Asignación de Soporte: ${ticket.codigoIncidencia}`,
      html: this.getEmailTemplate('Nueva Asignación Técnica', content, ticket.estado),
    });
  }

  async sendTicketUpdateEmail(to: string, ticket: any): Promise<void> {
    const content = `
      <p>Se ha registrado una actualización en el historial del ticket <strong>${ticket.codigoIncidencia}</strong>.</p>
      <div class="table-container">
        <table class="data-table">
          <tr><td class="label">Técnico Asignado</td><td><strong>${ticket.assignedTo?.name}</strong></td></tr>
          <tr><td class="label">Estado Actual</td><td><span class="status-badge" style="background-color: ${this.blueColor};">${ticket.estado}</span></td></tr>
          <tr><td class="label">Observación</td><td>${ticket.comentario || 'Actualización de sistema'}</td></tr>
        </table>
      </div>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `Actualización: Ticket ${ticket.codigoIncidencia}`,
      html: this.getEmailTemplate('Seguimiento de Ticket', content, ticket.estado),
    });
  }

  async sendTicketReopenedEmail(to: string, ticket: any): Promise<void> {
    const content = `
      <div class="warning-box">
        REAPERTURA: El usuario no ha validado la solución y solicita una nueva revisión.
      </div>
      <div class="table-container">
        <table class="data-table">
          <tr><td class="label">Folio</td><td><strong>${ticket.codigoIncidencia}</strong></td></tr>
          <tr><td class="label">Técnico Anterior</td><td><strong>${ticket.assignedTo?.name}</strong></td></tr>
          <tr><td class="label">Motivo</td><td style="color: #e11d48; font-weight: 700;">${ticket.validacion_solicitante}</td></tr>
          <tr><td class="label">Calificación</td><td>${ticket.puntuacion} Estrellas</td></tr>
        </table>
      </div>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `URGENTE: Reapertura Ticket ${ticket.codigoIncidencia}`,
      html: this.getEmailTemplate('Reapertura por Disconformidad', content, ticket.estado),
    });
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const content = `
      <p>Estimado(a) <strong>${userName}</strong>,</p>
      <p>Su cuenta en el Sistema de Gestión de Soporte de Eduhuechuraba ha sido activada con éxito.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.tickets.eduhuechuraba.cl/" class="button">Comenzar a usar</a>
      </div>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Bienvenido - Tickets Eduhuechuraba',
      html: this.getEmailTemplate('Cuenta Activada', content),
    });
  }

  async sendTicketDetailsEmail(to: string, ticket: any): Promise<void> {
    const content = `
      <p>Se adjuntan los detalles técnicos del requerimiento:</p>
      <div class="table-container">
        <table class="data-table">
          <tr><td class="label">Folio</td><td><strong>${ticket.codigoIncidencia}</strong></td></tr>
          <tr><td class="label">Establecimiento</td><td>${ticket.establecimiento?.name}</td></tr>
          <tr><td class="label">Estado Actual</td><td><span class="status-badge" style="background-color: ${this.blueColor};">${ticket.estado}</span></td></tr>
          <tr><td class="label">Resumen</td><td>${ticket.incidencia}</td></tr>
        </table>
      </div>
    `;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `Detalle Informativo: ${ticket.codigoIncidencia}`,
      html: this.getEmailTemplate('Resumen de Requerimiento', content, ticket.estado),
    });
  }
}
