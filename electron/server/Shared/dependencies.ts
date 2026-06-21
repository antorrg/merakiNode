import { UserRepository } from '../Features/user/UserRepository.js';
import { UserService } from '../Features/user/UserService.js';
import { SessionRepository } from '../Features/auth/SessionRepository.js';
import { AuthService } from '../Features/auth/AuthService.js';


// --- Repositories ---
export const userRepository = new UserRepository();
export const sessionRepository = new SessionRepository();


// --- Services ---
export const userService = new UserService(userRepository);
export const authService = new AuthService(sessionRepository, userService);

