import { User, UserProps } from './User.js';
import { UserRepository } from './UserRepository.js';
import { Hasher } from '../../Shared/Utils/Hasher.js';
import { BooleanConverter } from '../../Shared/Utils/BooleanConverter.js';
import { throwError} from '../../Configs/Errors/ErrorHandler.js';
import { ErrorCode } from '../../Configs/Errors/errorCode.js';


type UserDataInput = Partial<UserProps> & {
  user_id?: string;
  user_email?: string;
  email?: string;
  user_name?: string | null;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
};

export class UserService {

  constructor(private userRepository: UserRepository) {}
  private parser(data: UserDataInput, isPublic:boolean = false): UserProps {
    return {
      userId: (data.userId || data.user_id) as string,
      userEmail: (data.userEmail || data.user_email || data.email) as string,
      password:  isPublic? '' : data.password,
      nickname: data.nickname || null,
      userName: (data.userName || data.user_name || data.name) || null,
      role: data.role as string,
      enabled: typeof data.enabled === 'boolean' ? data.enabled : BooleanConverter.intToBool((data.enabled as number) ?? 1),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    }
  }


  async createUser(userData: { userEmail: string; password?: string, role?:string }) {
      const record = await this.userRepository.findByEmail(userData.userEmail);
      if(record) throwError('Email is already registered',ErrorCode.DATA_CONFLICT);
      
      const hashedPassword = userData.password ? await Hasher.hash(userData.password) : undefined;
      
      const user = User.register({
        userEmail: userData.userEmail,
        password: hashedPassword,
        role: userData.role? userData.role : 'USER'
      });

      await this.userRepository.create(user.toPersistence());
      return user.toDTO();
  }

  async getAll() {
      const records = await this.userRepository.getAll();
      return records!.map((r: UserProps) => {
        const parsed = this.parser(r, true);
        // const { password, ...safeUser } = parsed;
        // password
        return parsed
      });
  }

  async getById(userId: string) {
      const record = await this.userRepository.getById(userId);
      
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record!));
      return user.toDTO();
  }

  async changeStatus(userId: string, enabled: boolean) {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record!));
      
      // Aplicamos dominio para variar estatus
      if(enabled===true) {
        user.enabledUser();
      } else {
        user.disableUser();
      }
      
      await this.userRepository.update(userId, user.toPersistence());
      return user.toDTO();
  }
  async changeEmail(userId: string, email: string){
      const exists = await this.userRepository.findByEmail(email);
      if(exists) throwError('Email is already registered', ErrorCode.DATA_CONFLICT);
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found',ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record!));
      user.changeEmail(email);
      
      await this.userRepository.update(userId, user.toPersistence() );
      return user.toDTO();
  }

  async updateProfile(userId: string, updateData: import('./User.js').UserUpdate) {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record!));
      user.updateProfile(updateData);
      
      await this.userRepository.update(userId, user.toPersistence());
      return user.toDTO();
  }

  async changeRole(userId: string, newRole: string) {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      const user = new User(this.parser(record!));
      user.changeRole(newRole);
      
      await this.userRepository.update(userId, user.toPersistence());
      return user.toDTO();
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
      const record = await this.userRepository.getById(userId);
      if (!record) throwError('User not found', ErrorCode.NOT_FOUND);

      // Verificamos el password actual con Hasher
      const isMatch = await Hasher.compare(currentPassword, record!.password as string);
      if (!isMatch) throwError('Invalid current password', ErrorCode.ACCESS_DENIED);

      // Hasheamos el nuevo password
      const hashedNewPassword = await Hasher.hash(newPassword);

      // Aplicamos el cambio
      const user = new User(this.parser(record!));
      user.changePassword(hashedNewPassword);
      
      await this.userRepository.update(userId, user.toPersistence());
      return user.toDTO();
  }

  async authenticate(email: string, plainPassword: string) {
      const record = await this.userRepository.findByEmail(email);
      
      // Mensaje ambiguo intencional por seguridad (OWASP)
      if (!record) throwError('Invalid email or password', ErrorCode.ACCESS_DENIED);

      const isMatch = await Hasher.compare(plainPassword, record!.password as string);
      if (!isMatch) throwError('Invalid email or password', ErrorCode.ACCESS_DENIED);

      const user = new User(this.parser(record!));
      return user.toDTO();
  }
}
