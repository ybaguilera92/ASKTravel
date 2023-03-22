export class QuestionFilter {
    private _statusId: string;
    private _tagId: string;
    private _pageNo: number;
    private _pageSize: number;

    constructor(statusId?: string, tagId?: string) {
        this._statusId = statusId;
        this._tagId = tagId;
        this._pageNo = 0;
        this._pageSize = 10;
    }

    public get tag() {
        return this._tagId;
    }

    public set tag(tag: string) {
        this._tagId = tag;
    }

    public get status() {
        return this._statusId;
    }

    public set status(status: string) {
        this._statusId = status;
    }

    public get pageNo(): number {
        return this._pageNo;
    }

    public set pageNo(pageNo: number) {
        this._pageNo = pageNo;
    }

    public get pageSize(): number {
        return this._pageSize;
    }

    public set pageSize(pageSize: number) {
        this._pageSize = pageSize;
    }
}