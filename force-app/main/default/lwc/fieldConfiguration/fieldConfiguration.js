import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getObjects from '@salesforce/apex/FieldConfigurationCmpController.getObjects';
import getFields from '@salesforce/apex/FieldConfigurationCmpController.getFields';
import save from '@salesforce/apex/FieldConfigurationCmpController.save';
import LBL_Save from '@salesforce/label/c.LBL_Save';

export default class FieldConfiguration extends LightningElement {
    isListening = false;
    pickListOrdered;
    searchResults;

    @track selectedObject;
    @track selectedSearchResult;
    @track templateName = '';

    @track rows = [];
    @track fieldOptions = [];
    @track selectedRows = 3;
    labels = {
        LBL_Save
    }
    @track rowsOptions = [
        { label: '3 Rows', value: 3 },
        { label: '4 Rows', value: 4 },
        { label: '5 Rows', value: 5 },
        { label: '6 Rows', value: 6 }
    ];

    @track fieldPerRowOptions = [
        { label: '1 Field', value: 1 },
        { label: '2 Fields', value: 2 },
        { label: '3 Fields', value: 3 },
    ];

    connectedCallback() {
        getObjects().then((result) => {
            this.pickListOrdered = result;
        });
        this.rows = [];
    }

    renderedCallback() {
        if (this.isListening) return;

        window.addEventListener("click", (event) => {
            this.hideDropdown(event);
        });
        this.isListening = true;
    }

    fetchFields() {
        getFields({ objectName: this.selectedObject })
            .then(data => {
                this.fieldOptions = data.map(field => ({ label: field.label, value: field.apiName }));
            })
            .catch(error => {
                console.error('Error fetching fields:', error);
            });
    }

    get selectedValue() {
        return this.selectedSearchResult?.label ?? null;
    }

    get test() {
        return "Fields Per Row: "+this.rows.id;
    }

    handleRowsChange(event) {
        this.selectedRows = parseInt(event.detail.value, 10);
        this.rows = [];
        let j =0;
        for(let i=0; i< this.selectedRows;i++) {
            ++j;
            this.rows.push({id: i, fieldsPerRow: 1, label:'Fields Per Row '+j});
        }
        
    }

    handleFieldsPerRowChange(event) {
        const rowIndex = event.currentTarget.dataset.index;
        const fieldsPerRow = parseInt(event.detail.value, 10);
        this.rows[rowIndex].fieldsPerRow = fieldsPerRow;

        const fields = [];
        for (let i = 0; i < fieldsPerRow; i++) {
            fields.push({
                id: i,
                apiName: '',
                isMandatory: false,
                isReadOnly: false,
            });
        }
        this.rows[rowIndex].fields = fields;
        this.fetchFields();
    }

    handleFieldChange(event) {
        const rowIndex = event.currentTarget.dataset.rowIndex;
        const fieldIndex = event.currentTarget.dataset.fieldIndex;
        this.rows[rowIndex].fields[fieldIndex].apiName = event.detail.value;
    }

    handleMandatoryChange(event) {
        const rowIndex = event.currentTarget.dataset.rowIndex;
        const fieldIndex = event.currentTarget.dataset.fieldIndex;
        this.rows[rowIndex].fields[fieldIndex].isMandatory = event.target.checked;
    }

    handleReadOnlyChange(event) {
        const rowIndex = event.currentTarget.dataset.rowIndex;
        const fieldIndex = event.currentTarget.dataset.fieldIndex;
        this.rows[rowIndex].fields[fieldIndex].isReadOnly = event.target.checked;
    }

    handleTemplateChange(event){
        this.templateName = event.target.value;
        console.log('Tempalate name: '+this.templateName);
     }

    hideDropdown(event) {
        const cmpName = this.template.host.tagName;
        const clickedElementSrcName = event.target.tagName;
        const isClickedOutside = cmpName !== clickedElementSrcName;
        if (this.searchResults && isClickedOutside) {
            this.clearSearchResults();
        }
    }

    search(event) {
        const input = event.detail.value.toLowerCase();
        const result = this.pickListOrdered.filter((pickListOption) =>
            pickListOption.label.toLowerCase().includes(input)
        );
        this.searchResults = result;
    }

    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.selectedObject = selectedValue;
        this.selectedSearchResult = this.pickListOrdered.find(
            (pickListOption) => pickListOption.value === selectedValue
        );
        this.clearSearchResults();
    }

    clearSearchResults() {
        this.searchResults = null;
    }

    showPickListOptions() {
        if (!this.searchResults) {
            this.searchResults = this.pickListOrdered;
        }
    }

    SaveFieldSettings() {
        console.log(JSON.stringify(this.rows));
        save({ objectName: this.selectedObject,  templateName:this.templateName, selectedRows:this.selectedRows, fieldsConfiguration: JSON.stringify(this.rows)})
        .then(data => {
            console.log(data);
            this.showNotification('Success', 'Saved Successfully', 'Success'); 
            
        })
        .catch(error => {
            console.error('Error fetching fields:', error);
        });
    }
   
       //MISC
       showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

}