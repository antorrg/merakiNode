import { User } from './User.js';
import { UserRepository } from './UserRepository.js';
import { Hasher } from '../../Shared/Utils/Hasher.js';
import { BooleanConverter } from '../../Shared/Utils/BooleanConverter.js';
import { throwError} from '../../Configs/Errors/ErrorHandler.js';
import { ErrorCode } from '../../Configs/Errors/errorCode.js';

export class UserService {

  constructor(private userRepository: UserRepository) {}
  private parser(data:any){
    return {
      userId: data.userId || data.user_id,
      userEmail: data.user_email || data.email,
      password:  data.password,
      nickname: data.nickname,
      userName: data.userName || data.user_name || data.name,
      role: data.role,
      enabled: BooleanConverter.intToBool(data.enabled)
    }
  }


  async createUser(userData: { userEmail: string; password: string, role?:string }) {
    try {
      const record = await this.userRepository.findByEmail(userData.userEmail);
      if(record) throwError('Email is already registered',ErrorCode.DATA_CONFLICT);
      
      const hashedPassword = await Hasher.hash(userData.password);
      
      const user = User.register({
        userEmail: userData.userEmail,
        hashedPassword: hashedPassword,
        role: userData.role? userData.role : 'USER'
      });

      await this.userRepository.create(user.toPersistence());
      return user.toDTO();
    } catch (error: any) {
      // Manejo de errores específicos (ej: constraint unique email)
      if (error.code === '23505') throwError('Email is already registered', ErrorCode.DATA_CONFLICT);
      
      // Errores de validación del Dominio (arrojan mensajes 'Invalid...' o 'Missing...')
      if (error.message && (error.message.includes('Invalid') || error.message.includes('Missing'))) {
        throwError(error.message, ErrorCode.VALIDATION_ERROR);
      }

      throw error;
    }
  }

  async getAll() {
    try {
      const records = await this.userRepository.getAll();
      return records!.map((r: any) => {
        const parsed = this.parser(r);
        const { password, ...safeUser } = parsed;
        return safeUser;
      });
    } catch (error: unknown) {
      throw error;
    }
  }

  async getById(userId: string) {
    try {
      const record = await this.userRepository.getById(userId);
      
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record));
      return user.toDTO();
    } catch (error: unknown) {
      throw error;
    }
  }

  async changeStatus(userId: string, enabled: boolean) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record));
      
      // Aplicamos dominio para variar estatus
      if(enabled===true) {
        user.enabledUser();
      } else {
        user.disableUser();
      }
      
      await this.userRepository.update(userId, user.toPersistence() as any);
      return user.toDTO();
    } catch (error: unknown) {
      throw error;
    }
  }
  async changeEmail(userId: string, email: string){
       try {
      const exists = await this.userRepository.findByEmail(email);
      if(exists) throwError('Email is already registered', ErrorCode.DATA_CONFLICT);
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found',ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record));
      user.changeEmail(email);
      
      await this.userRepository.update(userId, user.toPersistence() as any);
      return user.toDTO();
    } catch (error: unknown) {
      throw error;
    }
  }

  async updateProfile(userId: string, updateData: any) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record));
      user.updateProfile(updateData);
      
      await this.userRepository.update(userId, user.toPersistence() as any);
      return user.toDTO();
    } catch (error: unknown) {
      throw error;
    }
  }

  async changeRole(userId: string, newRole: string) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record));
      user.changeRole(newRole);
      
      await this.userRepository.update(userId, user.toPersistence() as any);
      return user.toDTO();
    } catch (error: unknown) {
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      // Verificamos el password actual con Hasher
      const isMatch = await Hasher.compare(currentPassword, record.data.password as string);
      if (!isMatch) throwError('Invalid current password', ErrorCode.ACCESS_DENIED);

      // Hasheamos el nuevo password
      const hashedNewPassword = await Hasher.hash(newPassword);

      // Aplicamos el cambio
      const user = new User(this.parser(record));
      user.changePassword(hashedNewPassword);
      
      await this.userRepository.update(userId, user.toPersistence() as any);
      return user.toDTO();
    } catch (error: unknown) {
      throw error;
    }
  }

  async authenticate(email: string, plainPassword: string) {
    try {
      const record = await this.userRepository.findByEmail(email);
      
      // Mensaje ambiguo intencional por seguridad (OWASP)
      if (!record) throwError('Invalid email or password', ErrorCode.ACCESS_DENIED);

      const isMatch = await Hasher.compare(plainPassword, record.password as string);
      if (!isMatch) throwError('Invalid email or password', ErrorCode.ACCESS_DENIED);

      const user = new User(this.parser(record));
      return user.toDTO();

    } catch (error: unknown) {
      throw error;
    }
  }
}
