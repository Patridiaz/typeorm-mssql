import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/auth/mail.service';
import { Ticket } from './entity/ticket.entity';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { User } from 'src/auth/entity/user.entity';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';
import { FileEntity } from './entity/fileTicket.entity';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';

@Injectable()
export class TicketService {

    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Establecimiento)
        private readonly establecimientoRepository: Repository<Establecimiento>,
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
        private readonly mailService: MailService
    ) { }

    // =================================================================
    // 1. CREACIÓN DE TICKETS
    // =================================================================

    async addTicket(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
        const { tipoIncidencia, subTipoIncidencia, establecimiento, ...ticketData } = createTicketDto;

        const codigoIncidencia = await this.generateCodigoIncidencia(tipoIncidencia);

        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['establecimiento'] });
        if (!user) throw new ForbiddenException('Usuario no encontrado');

        let tecnicoUser: User | null = null;
        let ticketEstado = 'Pendiente';

        const establecimientoEntity = await this.establecimientoRepository.findOne({ where: { id: establecimiento } });
        if (!establecimientoEntity) throw new NotFoundException('Establecimiento no encontrado');

        const adminEstablecimientos = [
            "Rayito de Luna", "Jorge Inostroza", "Sala Cuna Sol de Huechuraba",
            "Los Libertadores", "Biblioteca Municipal de Huechuraba", "Departamento Educacion Municipal"
        ];

        const establecimientoNormalizado = establecimientoEntity.name.trim().toLowerCase();
        const esAdminEstablecimiento = adminEstablecimientos
            .map(e => e.trim().toLowerCase())
            .includes(establecimientoNormalizado);

        if (tipoIncidencia === 'Informatica') {
            if (esAdminEstablecimiento) {
                const admins = await this.userRepository.find({
                    where: { roles: { nombre: 'admin' } },
                    relations: ['roles']
                });
                if (admins.length > 0) {
                    const randomIndex = Math.floor(Math.random() * admins.length);
                    tecnicoUser = admins[randomIndex];
                    ticketEstado = 'Asignado';
                }
            } else {
                tecnicoUser = await this.userRepository.findOne({
                    where: {
                        roles: { nombre: 'tecnico_informatica' },
                        establecimiento: { id: establecimientoEntity.id }
                    },
                    relations: ['roles']
                });
                if (tecnicoUser) {
                    ticketEstado = 'Asignado';
                }
            }
        } else if (tipoIncidencia === 'Mantencion') {
            tecnicoUser = await this.userRepository.findOne({ where: { roles: { nombre: 'admin_mantencion' } }, relations: ['roles'] });
            if (tecnicoUser) {
                ticketEstado = 'Asignado';
            } else {
                throw new NotFoundException('Administrador de Mantención no encontrado');
            }
        }

        const ticket = this.ticketRepository.create({
            ...ticketData,
            tipoIncidencia,
            subTipoIncidencia,
            createdBy: user,
            assignedTo: tecnicoUser,
            estado: ticketEstado,
            establecimiento: establecimientoEntity,
            codigoIncidencia,
        });

        try {
            const savedTicket = await this.ticketRepository.save(ticket);
            
            // Recargar para tener relaciones completas
            const fullTicket = await this.fetchTicketById(savedTicket.id);

            // Notificar al creador
            await this.mailService.sendTicketCreationEmail(fullTicket.email, fullTicket);

            // Notificar al técnico si está asignado
            if (fullTicket.assignedTo) {
                await this.mailService.sendTicketAssignedEmail(fullTicket.assignedTo.email, fullTicket);
            }

            return savedTicket;
        } catch (error) {
            console.error('Error al guardar el ticket:', error);
            throw new InternalServerErrorException('Error al guardar el ticket');
        }
    }

    // =================================================================
    // 2. OBTENCIÓN DE TICKETS (LÓGICA UNIFICADA Y CORREGIDA)
    // =================================================================

    /**
     * Método principal para buscar tickets según el rol del usuario.
     * Reemplaza la lógica antigua de findTicketsByRole para evitar duplicidad.
     */
async findTickets(user: User): Promise<Ticket[]> {
        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
            .leftJoinAndSelect('ticket.createdBy', 'createdBy')
            .leftJoinAndSelect('ticket.establecimiento', 'establecimiento')
            .orderBy('ticket.fecha', 'DESC'); // Ordenar por fecha

        // 🔍 DEBUG: Ver qué roles está detectando el backend
        console.log(`Usuario: ${user.email}, Roles detectados:`, user.roles);

        // CASO 1: ADMIN (Ve todo)
        if (this.hasRole(user, 'admin')) {
            console.log('--> Acceso ADMIN: Retornando todos los tickets');
            return await query.getMany();
        }

        // CASO 2: MANTENCIÓN VIEW
        // Ve (Tickets de Mantención) O (Tickets creados por él mismo)
        // EXCLUYE implícitamente los de informática de otros.
        if (this.hasRole(user, 'mantencion_view')) {
            console.log('--> Acceso MANTENCION VIEW');
            return await query
                .andWhere(new Brackets((qb) => {
                    qb.where('ticket.tipoIncidencia = :tipo', { tipo: 'Mantencion' })
                      .orWhere('ticket.createdById = :userId', { userId: user.id });
                }))
                .getMany();
        }

        // CASO 3: TÉCNICOS (Informatica o Admin Mantencion)
        // Ve (Asignados a él) O (Creados por él)
        if (this.hasRole(user, 'tecnico_informatica') || this.hasRole(user, 'admin_mantencion')) {
            console.log('--> Acceso TECNICO');
            return await query
                .andWhere(new Brackets((qb) => {
                    qb.where('ticket.assignedToId = :userId', { userId: user.id })
                      .orWhere('ticket.createdById = :userId', { userId: user.id });
                }))
                .getMany();
        }

        // CASO 4: USUARIO COMÚN (Default)
        // Solo ve lo que él creó
        console.log('--> Acceso USUARIO (Default)');
        return await query
            .where('ticket.createdById = :userId', { userId: user.id })
            .getMany();
    }

    // Mantenemos este método por compatibilidad si lo usas en otro lado,
    // pero ahora simplemente delega al método principal corregido.
    async findTicketsByRole(user: User): Promise<Ticket[]> {
        return this.findTickets(user);
    }

    // --- Métodos Auxiliares de Fetch ---

    async fetchTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find();
    }

    async fetchTicketById(id: number): Promise<Ticket> {
        try {
            return await this.ticketRepository.createQueryBuilder('ticket')
                .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
                .leftJoinAndSelect('ticket.createdBy', 'createdBy')
                .leftJoinAndSelect('ticket.establecimiento', 'establecimiento')
                .where('ticket.id = :id', { id })
                .getOne();
        } catch (error) {
            console.error('Error fetching ticket by ID:', error);
            throw new InternalServerErrorException('Error fetching ticket by ID');
        }
    }

    async fetchTicketsByUserId(userId: number): Promise<Ticket[]> {
        return this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.establecimiento', 'establecimiento')
            .where('ticket.createdById = :userId', { userId })
            .getMany();
    }

    // =================================================================
    // 3. ACTUALIZACIÓN Y ARCHIVOS
    // =================================================================

    async updateTicket(id: number, updateTicketDto: UpdateTicketDto, file?: Express.Multer.File): Promise<Ticket> {
        const ticket = await this.ticketRepository.findOne({
            where: { id },
            relations: ['file'],
        });

        if (!ticket) throw new NotFoundException('Ticket no encontrado');

        const codigoIncidenciaOriginal = ticket.codigoIncidencia;

        if (updateTicketDto.estado) ticket.estado = updateTicketDto.estado;
        if (updateTicketDto.comentario) ticket.comentario = updateTicketDto.comentario;
        if (updateTicketDto.assignedTo !== undefined) {
            const user = await this.userRepository.findOne({ where: { id: updateTicketDto.assignedTo } });
            if (!user) throw new NotFoundException('Técnico no encontrado');
            ticket.assignedTo = user;
        }
        if (updateTicketDto.nombre) ticket.nombre = updateTicketDto.nombre;
        if (updateTicketDto.establecimiento) {
            ticket.establecimiento = await this.establecimientoRepository.findOne({
                where: { id: Number(updateTicketDto.establecimiento) },
            });
            if (!ticket.establecimiento) throw new NotFoundException('Establecimiento no encontrado');
        }

        if (updateTicketDto.subTipoIncidencia) ticket.subTipoIncidencia = updateTicketDto.subTipoIncidencia;
        if (updateTicketDto.tipoIncidencia) ticket.tipoIncidencia = updateTicketDto.tipoIncidencia;
        if (updateTicketDto.email) ticket.email = updateTicketDto.email;
        if (updateTicketDto.incidencia) ticket.incidencia = updateTicketDto.incidencia;
        if (updateTicketDto.fecha) ticket.fecha = updateTicketDto.fecha;
        if (updateTicketDto.validacion_solicitante) ticket.validacion_solicitante = updateTicketDto.validacion_solicitante;
        if (updateTicketDto.puntuacion) ticket.puntuacion = updateTicketDto.puntuacion;

        ticket.codigoIncidencia = codigoIncidenciaOriginal;

        if (file && file.buffer) {
            const uploadDir = './uploads';
            const fileExt = extname(file.originalname);
            const newFileName = `${id}${fileExt}`;
            const filePath = join(uploadDir, newFileName);

            if (ticket.file) {
                const oldFilePath = join(uploadDir, ticket.file?.filename);
                if (existsSync(oldFilePath)) await unlink(oldFilePath);
                await this.fileRepository.delete(ticket.file?.id);
            }

            await writeFile(filePath, file.buffer as any);

            const newFile = this.fileRepository.create({
                filename: newFileName,
                path: filePath,
                mimetype: file.mimetype,
                size: file.size,
            });

            await this.fileRepository.save(newFile);
            ticket.file = newFile;
        }

        await this.ticketRepository.save(ticket);

        // Notificar cambios
        const fullTicket = await this.fetchTicketById(id);
        await this.mailService.sendTicketUpdateEmail(fullTicket.email, fullTicket);
        if (fullTicket.assignedTo) {
            await this.mailService.sendTicketUpdateEmail(fullTicket.assignedTo.email, fullTicket);
        }

        return ticket;
    }

    async saveFileToTicket(ticketId: number, file: Express.Multer.File) {
        const ticket = await this.ticketRepository.findOne({
            where: { id: ticketId },
            relations: ['file'],
        });

        if (!ticket) throw new NotFoundException('Ticket no encontrado');

        const newFile = this.fileRepository.create({
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
        });

        await this.fileRepository.save(newFile);
        ticket.file = newFile;
        await this.ticketRepository.save(ticket);
    }

    async fetchTicketFileById(id: number): Promise<{ filename: string; path: string } | null> {
        try {
            const ticket = await this.ticketRepository.createQueryBuilder('ticket')
                .leftJoinAndSelect('ticket.file', 'file')
                .where('ticket.id = :id', { id })
                .getOne();

            if (!ticket || !ticket.file) return null;
            return { filename: ticket.file.filename, path: ticket.file.path };
        } catch (error) {
            console.error('Error fetching file by ticket ID:', error);
            throw new InternalServerErrorException('Error fetching file');
        }
    }

    // =================================================================
    // 4. UTILIDADES Y OTROS
    // =================================================================

    async removeTicket(id: string) {
        const result = await this.ticketRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Ticket "${id}" no se encuentra`);
        return { message: 'Ticket fue eliminado con exito.!' }
    }

    async countTicketsByType(tipoIncidencia: string): Promise<number> {
        try {
            return await this.ticketRepository.count({ where: { tipoIncidencia } });
        } catch (error) {
            throw new InternalServerErrorException('Error al contar tickets por tipo');
        }
    }

    async getLatestTickets(): Promise<Ticket[]> {
        try {
            const tickets = await this.ticketRepository.createQueryBuilder('ticket')
                .orderBy('ticket.fecha', 'DESC')
                .limit(10)
                .getMany();
            return tickets;
        } catch (error) {
            console.error('Error fetching latest tickets:', error);
            throw new InternalServerErrorException('Error fetching tickets');
        }
    }

    private hasRole(user: User, roleName: string): boolean {
        // 1. Validación de seguridad: si no hay roles, retorna falso
        if (!user || !user.roles || !Array.isArray(user.roles)) {
            console.warn('⚠️ Usuario sin roles o estructura incorrecta:', user);
            return false;
        }

        // 2. Buscamos en el arreglo de objetos RolUser
        // user.roles = [{ id: 1, nombre: 'admin' }, { id: 2, nombre: 'user' }]
        return user.roles.some((rol: any) => rol.nombre === roleName);
    }

    private async generateCodigoIncidencia(tipoIncidencia: string): Promise<string> {
        let prefix = '';
        if (tipoIncidencia === 'Informatica') prefix = 'INFO';
        else if (tipoIncidencia === 'Mantencion') prefix = 'MANT';

        const count = await this.ticketRepository.count({ where: { tipoIncidencia } });
        const increment = count + 1;
        return `${prefix}-${increment.toString().padStart(4, '000')}`;
    }
}