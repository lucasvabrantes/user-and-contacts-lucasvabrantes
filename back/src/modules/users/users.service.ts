import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/database/prisma.service";
import { User } from "./entities/user.entity";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const findUser = await this.prisma.user.findFirst({
            where: { email: createUserDto.email },
        });

        if (findUser) {
            throw new ConflictException("User already exists");
        }

        const findUserByPhone = await this.prisma.user.findFirst({
            where: { phone: createUserDto.phone },
        });

        if (findUserByPhone) {
            throw new ConflictException("User already exists");
        }

        const user = new User();
        Object.assign(user, { ...createUserDto });
        await this.prisma.user.create({ data: { ...user } });

        return plainToInstance(User, user);
    }

    async findByEmail(email: string) {
        const findUser = await this.prisma.user.findFirst({
            where: { email },
        });

        return findUser;
    }

    async findAll() {
        const allUsers = await this.prisma.user.findMany();
        return plainToInstance(User, allUsers);
    }

    async findUserContacts(id: string) {
        const userContacts = await this.prisma.user.findUnique({
            where: { id },
            include: {
                contacts: true,
            },
        });

        if (!userContacts) {
            throw new NotFoundException("User not Found");
        }

        return userContacts.contacts;
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                contacts: true,
            },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return plainToInstance(User, user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { ...updateUserDto },
        });
        return plainToInstance(User, updatedUser);
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        await this.prisma.user.delete({ where: { id } });
    }
}
