import {HttpClient} from "@angular/common/http";
import {Location} from "@angular/common";
import {EnviromentsService} from "../../../../../../../services/enviroments.service";
import {FuseSplashScreenService} from "../../../../../../../../@fuse/services/splash-screen.service";
import {BehaviorSubject} from "rxjs";
import {BaseService} from "../../../../../../../services/base-service.service";
import Swal from 'sweetalert2';


export class AddCommentService extends BaseService<any> {
    private comments = new BehaviorSubject("");
    comments$ = this.comments.asObservable();

    constructor(
        private _httpClient: HttpClient,
        private _location: Location,
        private environment: EnviromentsService,
        private _fuseSplashScreenService: FuseSplashScreenService,
    ) {
        super(
            _httpClient,
            environment.getEnviroment().apiUrl,
            "comments");
    }

    getComments() {
        return this.comments$;
    }

    setComments(data) {
        this.comments.next(data);
    }

    /**
     * Make a comments
     *
     * @returns {Promise<any>}
     */
    makeComment(params): Promise<any> {
        this._fuseSplashScreenService.show();
        return new Promise((resolve, reject) => {
            return this.create({
                "content": params.description,
                "type": params.type,
                "objectId": params.objectId
            }).subscribe((response: any) => {
                resolve(response);
                this.setComments(response['data'])
                this._fuseSplashScreenService.hide();
            }, error => {
                this._fuseSplashScreenService.hide();
                Swal.fire({
                    text: error,
                    icon: 'error'
                });
            });
        });
    }
}