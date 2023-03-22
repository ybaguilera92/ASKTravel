import { Catalog } from './catalog';
import {FuseUtils} from "../../@fuse/utils";

export enum Role {
    User = 'ROLE_USER',
    Admin = 'ROLE_ADMIN'
}

export class User {
    id: number;
    username: string;
    password: string;
    email: string;
    //firstName: string;
    name: string;
    lastName: string;
    enabled: boolean;
    verificationCode: string;
    token?: string;
    roles: any;
    fullName?:string;
    profile?: {};
    fileEncode?: any;

    /**
     * Constructor
     *
     * @param product
     */
    constructor(user?)
    {
        user = user || {};
        this.id = user.id || FuseUtils.generateGUID();
        this.username = user.username;
        this.name = user.name;
        this.lastName = user.lastName;
        this.email = user.email;
        this.enabled = user.enabled;
        this.roles = user.roles;
        this.profile = user.profile;
        this.fileEncode = user.fileEncode;
    }
}