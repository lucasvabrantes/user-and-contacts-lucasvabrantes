import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { Contact } from "./entities/contact.entity";
import { UpdateContactDto } from "./dto/update-contact.dto";

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) {}

    async create(createContactDto: CreateContactDto, userId: string) {
        const contact = new Contact();
        Object.assign(contact, { ...createContactDto });

        const contactExists = await this.prisma.contact.findFirst({
            where: { email: createContactDto.email },
        });

        if (contactExists) {
            throw new ConflictException(
                "This contact already exists. You can update. If so, just add '/:id' on your route."
            );
        }

        const newContact = await this.prisma.contact.create({
            data: { ...contact, userId },
        });

        return newContact;
    }

    async findOne(id: string) {
        return await this.prisma.contact.findFirst({
            where: { id },
        });
    }

    async findAll() {
        return await this.prisma.contact.findMany();
    }

    async update(updateContactDto: UpdateContactDto, id: string) {
        const updatedContact = await this.prisma.user.update({
            where: { id },
            data: { ...updateContactDto },
        });

        return updatedContact;
    }

    async remove(id: string) {
        const contact = await this.prisma.user.findUnique({ where: { id } });
        if (!contact) {
            throw new NotFoundException("Contact not found");
        }

        await this.prisma.user.delete({ where: { id } });
    }
}
