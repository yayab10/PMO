import LightningDatatable from 'lightning/datatable';
import DatatablePicklistTemplate from './picklist-template.html';
import DatatableIconTemplate from './icon-template.html';
/*import { loadStyle } from 'lightning/platformResourceLoader';
import CustomDataTableResource from '@salesforce/resourceUrl/CustomDataTable';*/

export default class CustomDataTable extends LightningDatatable {
    static customTypes = {
        picklist: {
            template: DatatablePicklistTemplate,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context'],
        },
        icon: {
            template: DatatableIconTemplate,
            standardCellLayout: true,
            typeAttributes: ['name', 'class', 'title', 'size', 'variant', 'alternativeText']
        }
    };
    /*
        renderedCallback() {
            Promise.all([
                loadStyle(this, CustomDataTableResource),
            ]).then(() => { })
        }*/
}