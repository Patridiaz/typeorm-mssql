import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Ticket } from './entity/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { User } from 'src/auth/entity/user.entity';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';
import { FileEntity } from './entity/fileTicket.entity';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { Multer } from 'multer';

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
        private readonly fileRepository:Repository<FileEntity>
    ){}
  



    
    async addTicket(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
      const { tipoIncidencia, subTipoIncidencia, establecimiento, ...ticketData } = createTicketDto;
  
      // Generar el código de incidencia
      const codigoIncidencia = await this.generateCodigoIncidencia(tipoIncidencia);
  
      const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['establecimiento'] });
      if (!user) throw new ForbiddenException('Usuario no encontrado');
  
      let tecnicoUser: User | null = null;
      let ticketEstado = 'Pendiente'; // Estado por defecto
  
      const establecimientoEntity = await this.establecimientoRepository.findOne({ where: { id: establecimiento } });
      if (!establecimientoEntity) throw new NotFoundException('Establecimiento no encontrado');
  
      const adminEstablecimientos = [
          "Rayito de Luna",
          "Jorge Inostroza",
          "Sala Cuna Sol de Huechuraba",
          "Los Libertadores",
          "Biblioteca Municipal de Huechuraba", 
          "Departamento Educacion Municipal"
      ];
      
      // Convertimos a minúsculas y eliminamos espacios adicionales para comparar correctamente
      const establecimientoNormalizado = establecimientoEntity.name.trim().toLowerCase();
      const esAdminEstablecimiento = adminEstablecimientos
          .map(e => e.trim().toLowerCase())
          .includes(establecimientoNormalizado);
  
      if (tipoIncidencia === 'Informatica') {
          if (esAdminEstablecimiento) {
              // Asignar aleatoriamente un administrador si el establecimiento está en la lista
              const admins = await this.userRepository.find({ 
                where: { roles: { nombre: 'admin' }},
                relations: ['roles']
              },
              
            );
              if (admins.length > 0) {
                  const randomIndex = Math.floor(Math.random() * admins.length);
                  tecnicoUser = admins[randomIndex];
                  ticketEstado = 'Asignado';
              } else {
                  console.log('No se encontró un administrador para el establecimiento.');
              }
          } else {
              // Asignar al técnico de informática del establecimiento
              tecnicoUser = await this.userRepository.findOne({
                  where: {
                      roles: { nombre: 'tecnico_informatica' },
                      establecimiento: { id: establecimientoEntity.id }
                  },
                  relations: ['roles']
              });
              if (!tecnicoUser) {
                  console.log('No se encontró un técnico informático para el establecimiento.');
              } else {
                  ticketEstado = 'Asignado';
              }
          }
      } else if (tipoIncidencia === 'Mantencion') {
          // Para los tickets de mantención, asignar al admin_mantencion
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
          subTipoIncidencia,  // Guardar el subtipo si está presente
          createdBy: user,
          assignedTo: tecnicoUser,
          estado: ticketEstado,
          establecimiento: establecimientoEntity,
          codigoIncidencia,
      });
  
      try {
          return await this.ticketRepository.save(ticket);
      } catch (error) {
          console.error('Error al guardar el ticket:', error);
          throw new InternalServerErrorException('Error al guardar el ticket');
      }
  }
    
    

    // Obtenemos (FETCH)  todas los tickets de la base de datos
    async fetchTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find();
    }

    async fetchTicketById(id: number): Promise<Ticket> {
      try {
        return await this.ticketRepository.createQueryBuilder('ticket')
          .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
          .leftJoinAndSelect('ticket.createdBy', 'createdBy')
          .leftJoinAndSelect('ticket.establecimiento', 'establecimiento') // Asegúrate de incluir esta relación
          .where('ticket.id = :id', { id })
          .getOne();
      } catch (error) {
        console.error('Error fetching ticket by ID:', error);
        throw new InternalServerErrorException('Error fetching ticket by ID');
      }
    }

    async fetchTicketFileById(id: number): Promise<{ filename: string; path: string } | null> {
      try {
        const ticket = await this.ticketRepository.createQueryBuilder('ticket')
          .leftJoinAndSelect('ticket.file', 'file') // Solo unimos la relación con el archivo
          .where('ticket.id = :id', { id })
          .getOne();
    
        if (!ticket || !ticket.file) return null;
    
        return { filename: ticket.file.filename, path: ticket.file.path };
      } catch (error) {
        console.error('Error fetching file by ticket ID:', error);
        throw new InternalServerErrorException('Error fetching file');
      }
    }
    

    async updateTicket(
      id: number,
      updateTicketDto: UpdateTicketDto,
      file?: Express.Multer.File,
    ): Promise<Ticket> {
      const ticket = await this.ticketRepository.findOne({
        where: { id },
        relations: ['file'], // Cargar la relación con archivos
      });
    
      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }
    
      // Actualizar campos si existen en la solicitud
      const codigoIncidenciaOriginal = ticket.codigoIncidencia;

      if (updateTicketDto.estado) ticket.estado = updateTicketDto.estado;
      if (updateTicketDto.comentario) ticket.comentario = updateTicketDto.comentario;
      if (updateTicketDto.assignedTo !== undefined) {
        const user = await this.userRepository.findOne({ where: { id: updateTicketDto.assignedTo } });
        if (!user) {
          throw new NotFoundException('Técnico no encontrado');
        }
        ticket.assignedTo = user;
      }
      if (updateTicketDto.nombre) ticket.nombre = updateTicketDto.nombre;
      if (updateTicketDto.establecimiento) {
        ticket.establecimiento = await this.establecimientoRepository.findOne({
            where: { id: Number(updateTicketDto.establecimiento) },
        });
    
        if (!ticket.establecimiento) {
            throw new NotFoundException('Establecimiento no encontrado');
        }
    }
    
      if (updateTicketDto.subTipoIncidencia) ticket.subTipoIncidencia = updateTicketDto.subTipoIncidencia;
      if (updateTicketDto.tipoIncidencia) ticket.tipoIncidencia = updateTicketDto.tipoIncidencia;
      if (updateTicketDto.email) ticket.email = updateTicketDto.email;
      if (updateTicketDto.incidencia) ticket.incidencia = updateTicketDto.incidencia;
      if (updateTicketDto.fecha) ticket.fecha = updateTicketDto.fecha;
    
      ticket.codigoIncidencia = codigoIncidenciaOriginal;

      if (file && file.buffer) {
        const uploadDir = './uploads';
        const fileExt = extname(file.originalname);
        const newFileName = `${id}${fileExt}`;
        const filePath = join(uploadDir, newFileName);
    
      // Si el ticket ya tenía un archivo, eliminarlo antes de guardar el nuevo
      if (ticket.file) {

        const oldFilePath = join(uploadDir, ticket.file?.filename);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath); // Eliminar el archivo físico
        }

        await this.fileRepository.delete(ticket.file?.id); // Eliminar el archivo de la base de datos
      }
    
        // Guardar el nuevo archivo
        await writeFile(filePath, file.buffer as Buffer);
    
        // Crear la nueva entidad de archivo
        const newFile = this.fileRepository.create({
            filename: newFileName,
            path: filePath,
            mimetype: file.mimetype,
            size: file.size,
        });
    
        await this.fileRepository.save(newFile);
    
        // Asociar el nuevo archivo al ticket
        ticket.file = newFile;
      }
    
      await this.ticketRepository.save(ticket);
      return ticket;
    }
    
    async saveFileToTicket(ticketId: number, file: Express.Multer.File) {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: ['file'],
      });
    
      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }
    
      // Guardar nueva referencia en la base de datos
      const newFile = this.fileRepository.create({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      });
    
      await this.fileRepository.save(newFile);
    
      // Asociar el nuevo archivo al ticket
      ticket.file = newFile;
      await this.ticketRepository.save(ticket);
    }

    


    // async updateTicket(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    //   const ticket = await this.ticketRepository.findOne({ where: { id } });

    //   if (!ticket) {
    //     throw new NotFoundException('Ticket no encontrado');
    //   }
  
    //   // Actualización de cada campo si se ha proporcionado un valor
    //   if (updateTicketDto.estado) { ticket.estado = updateTicketDto.estado;} 
    //   if (updateTicketDto.comentario) { ticket.comentario = updateTicketDto.comentario;}
    //   if (updateTicketDto.assignedTo !== undefined) { const user = await this.userRepository.findOne({ where: { id: updateTicketDto.assignedTo } });
    //     if (!user) {
    //       throw new NotFoundException('Técnico no encontrado');
    //     }
    //     ticket.assignedTo = user;
    //   }
  
    //   if (updateTicketDto.nombre) { ticket.nombre = updateTicketDto.nombre;}
    //   if (updateTicketDto.establecimiento) { ticket.establecimiento.id = updateTicketDto.establecimiento;}
    //   if (updateTicketDto.subTipoIncidencia) { ticket.subTipoIncidencia = updateTicketDto.subTipoIncidencia;}
    //   if (updateTicketDto.tipoIncidencia) { ticket.tipoIncidencia = updateTicketDto.tipoIncidencia;}
    //   if (updateTicketDto.email) { ticket.email = updateTicketDto.email;}
    //   if (updateTicketDto.anexo) { ticket.anexo = updateTicketDto.anexo;}
    //   if (updateTicketDto.incidencia) { ticket.incidencia = updateTicketDto.incidencia;}
    //   if (updateTicketDto.fecha) {ticket.fecha = updateTicketDto.fecha;
    //   }
  
    //   // Guardar el ticket actualizado
    //   await this.ticketRepository.save(ticket);
  
    //   return ticket; // Devolver el ticket actualizado
    // }
  

    //Eliminar ticket de la base de datos por ID
    async removeTicket(id:string){
        const result = await this.ticketRepository.delete(id);
        if (result.affected === 0){
            throw new NotFoundException(`Ticket "${id}" no se encuentra`)
        }
        return {message: 'Ticket fue eliminado con exito.!'}
    }

  private hasRole(user: User, roleName: string): boolean {
      // 🛑 LOG 1: Muestra el estado de la propiedad user.roles
      console.log(`[DEBUG hasRole] user.roles es null/undefined: ${!user.roles}`);
      
      if (!user.roles) {
          return false;
      }
      
      // 🛑 LOG 2: Muestra si el rol se encontró o no
      const roleExists = user.roles.some(rol => rol.nombre === roleName);
      console.log(`[DEBUG hasRole] ¿Tiene el rol '${roleName}'?: ${roleExists}`);
      
      // user.roles es RolUser[], mapeamos a los nombres para verificar si el rol está presente
      return roleExists;
  }

  async findTickets(user: User): Promise<Ticket[]> {
        const query = this.ticketRepository.createQueryBuilder('ticket');
      
        if (this.hasRole(user, 'admin')) {
          return query.getMany(); // Admin puede ver todos los tickets
        } else if (this.hasRole(user, 'user')) {
          return query
            .where('ticket.createdById = :userId', { userId: user.id })
            .getMany(); // Usuario puede ver solo sus tickets
        } else if (this.hasRole(user, 'tecnico_informatica') || this.hasRole(user, 'admin_mantencion')) {
          // Como técnico o admin de mantención, solo ve sus tickets asignados.
          // Opcional: Si quieres que vean todos sus tickets (asignados y creados)
          
          // Versión que verifica si es técnico O admin_mantencion
          if (this.hasRole(user, 'tecnico_informatica') || this.hasRole(user, 'admin_mantencion')) {
              return query
              .where('ticket.assignedToId = :userId', { userId: user.id })
              .orWhere('ticket.createdById = :userId', { userId: user.id }) 
              .getMany();
          }
        } else {
          throw new ForbiddenException('No tienes permiso para ver tickets');
        }
      }
    
  // Obtener tickets creados por un usuario específico
  async fetchTicketsByUserId(userId: number): Promise<Ticket[]> {
    return this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.establecimiento', 'establecimiento') // Incluye el establecimiento
      .where('ticket.createdById = :userId', { userId })
      .getMany();
  }
  

  async fetchTicketsByTechnicianId(technicianId: number): Promise<Ticket[]> {
    try {
      // console.log('Technician ID:', technicianId); // Verifica que el ID sea correcto
      return await this.ticketRepository.createQueryBuilder('ticket')
        .where('ticket.assignedToId = :technicianId', { technicianId })
        .getMany();
    } catch (error) {
      console.error('Error fetching tickets by technician ID:', error);
      throw new InternalServerErrorException('Error fetching tickets by technician ID');
    }
  }
  
  
    // Método para obtener el total de tickets
    async countTicketsByType(tipoIncidencia: string): Promise<number> {
      try {
        const count = await this.ticketRepository.count({
          where: { tipoIncidencia },
        });
        return count; // Devuelve el conteo
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
        
        if (tickets.length === 0) {
            console.warn('No tickets found.');
        }
        
        // console.log('Tickets fetched:', tickets);
        return tickets;
    } catch (error) {
        console.error('Error fetching latest tickets:', error);
        throw new InternalServerErrorException('Error fetching tickets');
    }
}

async findTicketsByRole(user: User): Promise<Ticket[]> {
  const query = this.ticketRepository.createQueryBuilder('ticket')
    .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')  // Trae los datos del técnico asignado
    .leftJoinAndSelect('ticket.createdBy', 'createdBy')    // Trae los datos del creador del ticket
    .leftJoinAndSelect('ticket.establecimiento', 'establecimiento'); // Trae el establecimiento del ticket

  try {
    let tickets: Ticket[];

    if (this.hasRole (user,'admin')) {
      // El administrador puede ver todos los tickets

      tickets = await query.getMany();

    } else if (this.hasRole(user,'user')) {
      // Los usuarios comunes solo pueden ver los tickets que ellos crearon
      tickets = await query
        .where('ticket.createdById = :userId', { userId: user.id })
        .getMany();

    } else if (this.hasRole(user,'tecnico_informatica') || this.hasRole(user,'admin_mantencion')) {
      // Técnicos informáticos y administradores de mantención pueden ver los tickets creados por ellos o asignados a ellos
      tickets = await query
        .where('ticket.assignedToId = :userId', { userId: user.id })  // Tickets asignados
        .orWhere('ticket.createdById = :userId', { userId: user.id }) // Tickets creados por ellos
        .getMany();

    } else {
      throw new ForbiddenException('No tienes permiso para ver tickets');
    }

    return tickets;

  } catch (error) {
    console.error('Error fetching tickets by role:', error);
    throw new InternalServerErrorException('Error fetching tickets by role');
  }
}



// Lógica para generar el código de incidencia
private async generateCodigoIncidencia(tipoIncidencia: string): Promise<string> {
  let prefix = '';

  // Definir el prefijo basado en el tipo de incidencia
  if (tipoIncidencia === 'Informatica') {
    prefix = 'INFO';
  } else if (tipoIncidencia === 'Mantencion') {
    prefix = 'MANT';
  }

  // Contar los tickets existentes de ese tipo
  const count = await this.ticketRepository.count({
    where: { tipoIncidencia },
  });

  // Incrementar el número de ticket para ese tipo
  const increment = count + 1;

  // Formatear el código con ceros a la izquierda, por ejemplo: INF-01
  return `${prefix}-${increment.toString().padStart(4, '000')}`;
}

}
