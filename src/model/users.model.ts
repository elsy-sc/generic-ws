import { Property } from "src/annotation/property.annotation";
import { Sequence } from "src/annotation/sequence.annotation";
import { GenModel } from "./gen.model";
import { HashUtil } from "src/util/hash.util";
import { Logger } from "@nestjs/common";

export class Users extends GenModel {
    @Sequence({ name: 'user_seq', prefix: 'USR' })
    @Property()
    public id: string;
    @Property()
    public firstName?: string;
    @Property()
    public lastName?: string;
    @Property()
    public email?: string;
    @Property()
    public password?: string;

    @Property()
    public createdAt: Date;

    async setPassword(password: string, hash?: boolean): Promise<void> {
        this.password = hash ? await HashUtil.hash(password) : password;
    }

    constructor(firstName?: string, lastName?: string, email?: string, password?: string) {
        super('users');
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    public async login(): Promise<Users | null> {
        const user: Users | null = ((await new Users(undefined, undefined, this.email).read()) as Users[])[0];
        if (user && await HashUtil.verify(this.password || '', user.password || '')) {
            return user;
        }
        return null;
    }
}