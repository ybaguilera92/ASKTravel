import {Catalog} from "../../../../models/catalog";

export class Todo
{
    id: string;
    title: string;
    description: string;
    answer: {
        id: string,
        description: string,
        title: string,
        excerpt: string,
    };
    user: any;
    completed: boolean;
    starred: boolean;
    important: boolean;
    deleted: boolean;
    tags: Catalog[];
    category: Catalog;
    status: Catalog[];
    answers: any[];
    fileEncode: Catalog;
    file?: {
        id: string;
        title: string;
    };
    /**
     * Constructor
     *
     * @param todo
     */
    constructor(todo)
    {
        {
            this.id = todo.id;
            this.title = todo.title;
            this.description = todo.description;
            this.answer = todo.answer;
            this.user = todo.user;
            this.completed = todo.completed;
            this.starred = todo.starred;
            this.important = todo.important;
            this.deleted = todo.deleted;
            this.category = todo.category;
            this.fileEncode = todo.fileEncode;
            this.tags = todo.tags || [];
            this.status = todo.status || [];
            this.file = todo.file;
            this.answers = todo.answers || [];
        }
    }

    /**
     * Toggle star
     */
    toggleStar(): void
    {
        this.starred = !this.starred;
    }

    /**
     * Toggle important
     */
    toggleImportant(): void
    {
        this.important = !this.important;
    }

    /**
     * Toggle completed
     */
    toggleCompleted(): void
    {
        this.completed = !this.completed;
    }

    /**
     * Toggle deleted
     */
    toggleDeleted(): void
    {
        this.deleted = !this.deleted;
    }
}
