import { User } from "../entity/user.entity";

export interface LoginResponse {
    user: User;
    token: string;
}