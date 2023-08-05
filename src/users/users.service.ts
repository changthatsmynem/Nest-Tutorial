import { Injectable, NotFoundException } from "@nestjs/common";
import { FindManyOptions, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.repo.create({ email, password });

    return this.repo.save(user);
  }

  findOneBy(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    const data: FindManyOptions<User> = { where: { email } };
    return this.repo.find(data);
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOneBy(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneBy(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.repo.remove(user);
  }
}
