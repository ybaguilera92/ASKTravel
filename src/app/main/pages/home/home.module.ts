
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { FuseSharedModule } from '@fuse/shared.module';

import { HomeService } from 'app/main/pages/home/home.service';
import { HomeComponent } from 'app/main/pages/home/home.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FusePipesModule} from "../../../../@fuse/pipes/pipes.module";
import {MatButtonModule} from "@angular/material/button";
import {NavigationQuestionComponent} from "./navigation-question/navigation-question.component";
import {QuestionsComponent} from "./questions/questions.component";
import {QuestionComponent} from "./questions/question/question.component";
import {QuestionService} from "./questions/question/question.service";
import {ArticleComponent} from "./questions/question/article/article.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ReactionComponent} from "./questions/question/article/reaction/reaction.component";
import {NavBarLeftComponent} from "./nav-bar-left/nav-bar-left.component";
import {InfiniteScrollModule} from "../../../../@fuse/components/infinite-scroll/infinite-scroll.module";
import {AddCommentComponent} from "./questions/question/article/add-comment/add-comment.component";
import {EditorModule} from "@tinymce/tinymce-angular";
import {AddCommentService} from "./questions/question/article/add-comment/add-comment.service";
import {CommentsComponent} from "./questions/question/article/comments/comment.component";
import {AnswerComponent} from "./questions/question/article/answer/answer.component";
import {CommentComponent} from "./questions/question/article/comments/comment/comment.component";
import {MatTooltip, MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {AsideSidebarComponent} from "./aside-sidebar/aside-sidebar.component";
import {ProfileComponent} from "./profile/profile.component";
import {ProfileService} from "./profile/profile.service";
import { MatFormFieldModule } from '@angular/material/form-field';
import { ContentComponent1 } from './content/content1.component';


/*const routes = [
    {
        path     : '',
        component: AsideSidebarComponent
    }
];*/

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path     : '',
                component: NavigationQuestionComponent
            },
            {
                path: 'about',
                component: ContentComponent1
            },
            {
                path     : 'questions',
                component: QuestionsComponent
            },
            {
                path     : 'questions/:moreHandle/:question',
                component: QuestionsComponent
            },
            {
                path     : 'question/:id',
                component: QuestionComponent,
                resolve  : {
                    data: QuestionService
                },
            },
            {
                path     : 'profile/:id',
                component: ProfileComponent,
                resolve  : {
                    profile: ProfileService
                }
            },
        ]
    },
];

@NgModule({
    declarations: [
        HomeComponent,
        NavigationQuestionComponent,
        QuestionsComponent,
        QuestionComponent,
        ArticleComponent,
        ReactionComponent,
        NavBarLeftComponent,
        AsideSidebarComponent,
        AddCommentComponent,
        CommentsComponent,
        AnswerComponent,
        CommentComponent,
        ProfileComponent,
        ContentComponent1
    ],
    imports: [
        RouterModule.forChild(routes),

        MatExpansionModule,
        MatIconModule,

        FuseSharedModule,
        MatAutocompleteModule,
        FusePipesModule,
        MatButtonModule,
        MatFormFieldModule,
        MatTabsModule,
        InfiniteScrollModule,
        EditorModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    providers   : [
        HomeService,
        QuestionService,
        ProfileService,
        AddCommentService
    ]
})
export class HomeModule
{
}
