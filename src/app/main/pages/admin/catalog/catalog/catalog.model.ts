import { FuseUtils } from '@fuse/utils';

export class CatalogModel
{
    id: string;
    idTabla: string;
    tablaArgumento: string;
    tablaDescription: string;
    tablaReferencia: string;
    status: string;

    /**
     * Constructor
     *
     * @param product
     */
    constructor(catalog?)
    {
        catalog = catalog || {};
        this.id = catalog.id || null;
        this.idTabla = catalog.idTabla;
        this.tablaDescription = catalog.tablaDescription;
        this.tablaArgumento = catalog.tablaArgumento;
        this.tablaReferencia = catalog.tablaReferencia;
        this.status = catalog.status;
    }
}
