import {Catalog} from "./catalog";

export class Question {
    constructor(public id:string,
                public title:string,
                public color: string,
                public fileEncode:any,
                public description,
                public answer,
                public answers: any[],
                public followers: any[],
                public category,
                public createdDate,
                public reactions,
                public visit,
                public status,
                public user,
                public tags: Catalog[]){}
}