import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'admin',
        title: 'Administración',
        translate: 'NAV.APPLICATIONS',
        type: 'group',
        children: [           
            {
                id: 'todo',
                title: 'Preguntas',
                translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'question_answer',
                url: '/admin/questions',
            },
            {
                id: 'catalogos',
                title: 'Catálogos',
                translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'description',
                url: '/admin/catalogs',
            },
            {
                id: 'usuarios',
                title: 'Usuarios',
                translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'description',
                url: '/admin/users',
            }           
        ]
    }
];
