import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto"; //scrypt - asynchronous but we have to use a callback instaed of promise
import { promisify } from "util"; //makes use of callbacks and gives back the same function that makes use of promise

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is already used
    const isUser = await this.usersService.find(email);
    if (isUser.length) {
      throw new BadRequestException("Email is already in use");
    }
    //hash user pw
    //generate a salt
    const salt = randomBytes(8).toString("hex");

    //hash pw and salt together
    //TypeScript do not know what is return from hash - scrypt
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //join the hashed pw-salt with salt
    const result = hash.toString("hex") + "." + salt;

    //create new user and save
    const user = await this.usersService.create(email, result);

    //return user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const [storeHashed, salt] = user.password.split(".");

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storeHashed !== hash.toString("hex")) {
      throw new BadRequestException("wrong password");
    }

    return user;
  }
}
