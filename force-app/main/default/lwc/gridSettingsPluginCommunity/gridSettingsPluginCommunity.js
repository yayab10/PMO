import { LightningElement, api, track } from 'lwc';
import searchRecords from "@salesforce/apex/GridSettingsPluginCmpController.searchRecords";
import deleteRecords from "@salesforce/apex/GridSettingsPluginCmpController.deleteRecords";
import saveRecords from "@salesforce/apex/GridSettingsPluginCmpController.saveRecords";
import getTotalAggregation from "@salesforce/apex/GridSettingsPluginCmpController.getTotalAggregation";
import { loadStyle } from 'lightning/platformResourceLoader';
import GridSettings from '@salesforce/resourceUrl/GridSettings';
import { toastWarning, toastInfo, toastError, toastSuccess, Labels, incrementFormat } from "c/gridSettingsHelper";
import { NavigationMixin } from 'lightning/navigation';
export default class GridSettingsPluginCommunity extends LightningElement {
    Labels = Labels;
    domParser = new DOMParser();
    @api templateName;
    @api recordId;
    @api displayNewButton;
    @api filterOnNoneDisplayedFields;
    @api allowDelete;
    @api allowFilter;
    @api readOnly;
    @api showSubTotal;
    @track isFilterOpen = false;
    @track selectedRows = [];
    firstLoad = false;
    @track aggregationFields = [];
    @track totals = [];
    get hasTotalFields() {
        return this.showSubTotal && this.aggregationFields.length > 0;
    }
    get hasFilterSettingsFields() {
        try {
            let filterSettingsFields = this.instance && this.instance.filterSettingsFields ? this.instance.filterSettingsFields : '[]';
            filterSettingsFields = JSON.parse(filterSettingsFields);
            return this.allowFilter && filterSettingsFields && filterSettingsFields.length && filterSettingsFields.some(item => item.hasOwnProperty('userFilterable'));
        } catch (error) {
            console.log(error);
        }
        return false;
    };
    @track instance = {
        selfTemplate: this.selfTemplate,
        get objectLabel() {
            return this.resultWrapper && this.resultWrapper.objectLabel ? this.resultWrapper.objectLabel : '';
        },
        resultWrapper: {
            objectLabel: '',
            objectName: '',
            records: [],
            errorMessages: [],
            gridSettingsManager: undefined,
            dataMap: {},
            data: [],
            total: 0,
        },
        get objectName() {
            return this.resultWrapper && this.resultWrapper.objectName ? this.resultWrapper.objectName : undefined;
        },
        get iconName() {
            return this.resultWrapper && this.resultWrapper.gridSettingsManager && this.resultWrapper.gridSettingsManager.iconName && this.resultWrapper.gridSettingsManager.iconSection ? this.resultWrapper.gridSettingsManager.iconSection + ':' + this.resultWrapper.gridSettingsManager.iconName : 'standard:orders';
        },
        get iconClass() {
            return this.resultWrapper && this.resultWrapper.gridSettingsManager && this.resultWrapper.gridSettingsManager.iconClass ? this.resultWrapper.gridSettingsManager.iconClass : 'slds-icon-standard-orders';
        },
        Loading: true,
        tableLoading: true,
        get valid() {
            return this.errorMessages.length == 0;
        },
        get validButHasWarrning() {
            return this.errorMessages.length == 0 && this.warningMessages.length;
        },
        get isAllSelected() {
            return this.resultWrapper && this.resultWrapper.data && this.resultWrapper.data.every(item => item.isSelected);
        },
        get errorMessages() {
            return this.resultWrapper && this.resultWrapper.errorMessages ? this.resultWrapper.errorMessages : [];
        },
        get warningMessages() {
            return this.resultWrapper && this.resultWrapper.warningMessages ? this.resultWrapper.warningMessages : [];
        },
        offset: 0,
        pageSize: null,
        records: [],
        changesMap: {},
        __filtersFieldsMap: undefined,
        firstTime: true,
        deletePopup: { show: false, },
        get filterSettingsFields() {
            let fieldsMap = this.__filtersFieldsMap;
            let includedFields = this.resultWrapper && this.resultWrapper.gridSettingsManager && this.resultWrapper.gridSettingsManager.FILTERS ? this.resultWrapper.gridSettingsManager.FILTERS.map(item => item.fieldName).filter(item => !item.includes('.')) : [];
            if (this.firstTime && this.resultWrapper && this.resultWrapper.gridSettingsManager && this.resultWrapper.gridSettingsManager.FILTERS) {
                this.firstTime = false;
                fieldsMap = {};
                this.resultWrapper.gridSettingsManager.FILTERS.forEach(item => {
                    // if (item.userFilterable) {
                    if (includedFields.includes(item.fieldName)) {
                        if (fieldsMap.hasOwnProperty(item.fieldName)) {
                            let olditem = fieldsMap[item.fieldName];
                            fieldsMap[item.fieldName] = Object.assign(JSON.parse(JSON.stringify(item)), olditem);
                        } else {
                            fieldsMap[item.fieldName] = item;
                        }
                    }
                    // }
                });
            }
            if (this.resultWrapper && this.resultWrapper.gridSettingsManager && this.resultWrapper.gridSettingsManager.FILTERS) {
                this.resultWrapper.gridSettingsManager.FILTERS.forEach(item => {
                    // if (item.userFilterable) {
                    if (includedFields.includes(item.fieldName)) {
                        if (fieldsMap.hasOwnProperty(item.fieldName)) {
                            let olditem = fieldsMap[item.fieldName];
                            fieldsMap[item.fieldName] = Object.assign(JSON.parse(JSON.stringify(item)), olditem);
                        } else {
                            fieldsMap[item.fieldName] = JSON.parse(JSON.stringify(item));
                        }
                    }
                    // }
                });
            }
            this.__filtersFieldsMap = fieldsMap;
            return fieldsMap ? JSON.stringify(Object.values(fieldsMap).map(item => {
                let newItem = {
                    fieldName: item.fieldName,
                    fieldLabel: item.fieldLabel,
                    stringFieldType: item.stringFieldType,
                    pickListValues: item.pickListValues || [],
                    isMultiLevel: item.fieldName && item.fieldName.includes('.'),
                };
                if (item.hasOwnProperty('value1')) {
                    newItem.value1 = item.value1
                }
                if (item.hasOwnProperty('value2')) {
                    newItem.value2 = item.value2
                }
                if (item.hasOwnProperty('values')) {
                    newItem.values = item.values
                }
                if (item.hasOwnProperty('userFilterable')) {
                    newItem.userFilterable = item.userFilterable;
                }
                return newItem;
            }).sort((item1, item2) => item1.fieldName.includes('RecordTypeId') || item2.fieldName.includes('RecordTypeId') ? 1 : item2.fieldName.localeCompare(item2.fieldName))) : undefined;
        },
        get hasChanges() {
            return this.changesMap && Object.keys(this.changesMap).length;
        },
        selectedRecordsIds: [],
        get hasSelected() {
            return this.selectedRecordsIds && this.selectedRecordsIds.length;
        },
        get selectedBadge() {
            return this.selectedRecordsIds ? this.selectedRecordsIds.length + ' ' + Labels.LBL_Selected : '0 ' + Labels.LBL_Selected;
        },
    };
    get tableStyle() {
        return this.isFilterOpen ? 'height: 64vh;' : 'max-height: 64vh; height: 64vh;';
    }
    get hasMenu() {
        // return this.hasData || this.allowDelete;
        return this.hasData && this.allowDelete;
    }
    Events = {
        confirmFilterSettings: 'confirmfiltersettings',
        cancelFilterSettings: 'cancelfiltersettings',
    }
    pageSizeOptions = [{ label: '5', value: '5' }, { label: '10', value: '10' }, { label: '25', value: '25' }, { label: '50', value: '50' }, { label: '75', value: '75' }, { label: '100', value: '100' },];
    errorCallback(error, stack) {
        // console.log(error);
        // console.error(error);
        toastError(this, error);
        this.instance.Loading = false;
        this.instance.tableLoading = false;
    }
    closeFilterSettings() {
        this.isFilterOpen = false;
    }
    confirmFilterSettings(event) {
        let self = this;
        let fields = JSON.parse(event.detail.value);
        let fieldsMap = {};
        fields.forEach(item => {
            let newItem = self.instance.__filtersFieldsMap[item.fieldName] || item;
            newItem.value1 = item.value1;
            newItem.value2 = item.value2;
            newItem.values = item.values;
            if (item.hasOwnProperty('userFilterable')) {
                newItem.userFilterable = item.userFilterable;
            }
            fieldsMap[newItem.fieldName] = newItem;
        });
        this.instance.__filtersFieldsMap = fieldsMap;
        this.isFilterOpen = false;
        this.instance.tableLoading = true;
        this.instance.offset = 0;
        this.refreshData();
    }
    //get data on component load
    connectedCallback() {
        this.instance.Loading = true;
        Promise.all([
            loadStyle(this, GridSettings + '/customStyle.css'),
        ]).then(() => {
        }).catch(error => {
            console.log("Error " + error.body.message);
        });
        this.refreshData();
    }
    // save Data changes
    saveChangesHandler() {
        let self = this;
        let changesMap = this.instance.changesMap;
        let errorKeys = Object.keys(changesMap);
        let records = errorKeys.map(key => {
            let item = JSON.parse(JSON.stringify(changesMap[key]));
            item.Id = key;
            return item;
        });
        if (records && records.length) {
            this.instance.tableLoading = true;
            saveRecords({ records: records }).then(result => {
                let saveResult = JSON.parse(result);
                if (saveResult.isSuccess) {
                    errorKeys = [];
                    toastSuccess(self, "Save success");
                } else {
                    errorKeys = Object.keys(saveResult.errorMessages);
                    errorKeys.forEach(key => {
                        toastError(self, saveResult.errorMessages[key]);
                    });
                }
                let changesMap = {};
                Object.keys(self.instance.changesMap).forEach(id => {
                    if (errorKeys.includes(id)) {
                        changesMap[id] = self.instance.changesMap[id];
                    }
                })
                self.instance.changesMap = changesMap;
                self.refreshData();
                self.handelGetTotalAggregation();
            }).catch(error => {
                toastError(self, error);
                self.instance.tableLoading = false;
            });
        }
    }
    // cancel Data cahnges
    cancelChangesHandler() {
        this.instance.changesMap = {};
        this.instance.selectedRecordsIds = [];
        this.refreshView(true);
    }
    // generic change handler
    genericChangeHandler(event) {
        let fieldName = event.target.dataset.fieldName;
        let Id = event.target.dataset.id;
        let value = event.detail.hasOwnProperty('value') ? (event.detail.value ? (typeof event.detail.value == 'string' || typeof event.detail.value == 'number' ? event.detail.value : (event.detail.value.join ? event.detail.value.join(';') : event.detail.value)) : '') : event.detail.hasOwnProperty('checked') ? event.target.checked : null;
        if (!this.instance.changesMap.hasOwnProperty(Id)) {
            this.instance.changesMap[Id] = {};
        }
        this.instance.changesMap[Id][fieldName] = value;
        this.refreshView(false);
    }
    // delete records
    deleteRecords(ids) {
        this.instance.tableLoading = true;
        let self = this;
        deleteRecords({ recordsIds: ids }).then(result => {
            let deleteResult = JSON.parse(result);
            if (deleteResult.isSuccess) {
                toastSuccess(self, "Delete success");
            } else {
                let errorKeys = Object.keys(deleteResult.errorMessages);
                ids = ids.filter(id => !errorKeys.includes(id));
                errorKeys.forEach(key => {
                    toastError(self, deleteResult.errorMessages[key]);
                });
            }
            self.instance.selectedRecordsIds = self.instance.selectedRecordsIds.filter(item => !ids.includes(item));
            self.refreshData();
        }).catch(error => {
            toastError(self, error);
            self.refreshData();
        });
    }
    // delete Selected
    deleteSelected() {
        if (this.instance && this.instance.selectedRecordsIds && this.instance.selectedRecordsIds.length) {
            this.instance.deletePopup.deleteIds = this.instance.selectedRecordsIds.map(item => item);
            this.instance.deletePopup.show = true;
        }
    }
    // delete by Id Selected
    deleteByItem(event) {
        let id = event.target.dataset.id;
        this.instance.deletePopup.deleteIds = [id];
        this.instance.deletePopup.show = true;
    }
    // cancel delete action
    cancelDelete() {
        this.instance.deletePopup.deleteIds = [];
        this.instance.deletePopup.show = false;
    }
    // confirm delete action
    confirmDelete() {
        if (this.instance.deletePopup.deleteIds) {
            this.deleteRecords(this.instance.deletePopup.deleteIds);
        }
        this.instance.deletePopup.deleteIds = [];
        this.instance.deletePopup.show = false;
    }
    //toggle select Record
    toggleRecordSelect(event) {
        let id = event.target.dataset.id;
        let isChecked = event.detail.checked;
        if (id) {
            if (isChecked) {
                if (!this.instance.selectedRecordsIds.includes(id)) {
                    this.instance.selectedRecordsIds.push(id);
                }
            } else {
                this.instance.selectedRecordsIds = this.instance.selectedRecordsIds.filter(item => item != id);
            }
        }
        this.instance.tableLoading = true;
        this.refreshView(false);
    }
    //toggle select Record
    toggleAllRecordSelect(event) {
        this.instance.tableLoading = true;
        let isChecked = event.detail.checked;
        let recordIds = Object.keys(this.instance.resultWrapper.dataMap);
        let self = this;
        if (isChecked) {
            recordIds.forEach(id => {
                if (!self.instance.selectedRecordsIds.includes(id)) {
                    self.instance.selectedRecordsIds.push(id);
                }
            })
        } else {
            this.instance.selectedRecordsIds = this.instance.selectedRecordsIds.filter(item => !recordIds.includes(item));
        }
        this.refreshView(false);
    }
    //handle sort event in datatable
    handleSorting(event) {
        this.instance.sortedBy = event.detail.fieldName;
        this.instance.sortedDirection = event.detail.sortDirection;
        this.instance.tableLoading = true;
        this.refreshData();
    }
    // sort data depending on the field and direction
    sortData(arr, sortedBy, sortedDirection) {
        return JSON.parse(JSON.stringify(arr.sort((item1, item2) => ((sortedDirection == 'asc' ? 1 : -1) * item1[sortedBy].localeCompare(item2[sortedBy])))));
    }
    //handle page size change
    handlePageSize(event) {
        this.instance.pageSize = event.detail.value;
        this.instance.offset = 0;
        this.instance.tableLoading = true;
        this.refreshData();
    }
    //handle row selection changed
    handleRowSelection(event) {
    }
    //handle search input change and if the user clear the seach input it resets the filter
    searchInputChangeHandler(event) {
        this.instance.offset = 0;
        if (event.detail.value == '' || event.detail.value != '') {
            this.instance.searchTerm = event.detail.value;
        }
        if (event.detail.value == '') {
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //search if user presses enter in search box
    submitSearchKeyPressHandler(event) {
        if (this.instance.searchTerm && (event.which == 13 || event.keyCode == 13)) {
            this.instance.offset = 0;
            this.instance.tableLoading = true;
            this.refreshData();
            event.target.blur();
        }
    }
    //if search box lose focus
    submitSearchFocusOutHandler(event) {
        if (this.instance.searchTerm && this.instance.searchTerm.length > 2) {
            this.instance.offset = 0;
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //search in grid
    searchBtnHandler() {
        this.instance.tableLoading = true;
        this.refreshData();
        this.handelGetTotalAggregation();
    }
    //refresh data in the grid
    refreshData() {
        // Id recordId, String searchTerm, Integer offset, Integer pageSize, String metadataDeveloperName
        searchRecords({
            recordId: this.recordId, searchTerm: this.instance.searchTerm, offset: this.instance.offset, pageSize: this.instance.pageSize, metadataDeveloperName: this.templateName, filter: this.instance.__filtersFieldsMap != undefined ? JSON.stringify(Object.values(this.instance.__filtersFieldsMap).map(item => {
                let newItem = {
                    fieldName: item.fieldName,
                };
                if (item.hasOwnProperty('value1')) {
                    newItem.value1 = item.value1
                }
                if (item.hasOwnProperty('value2')) {
                    newItem.value2 = item.value2
                }
                if (item.hasOwnProperty('values')) {
                    newItem.values = item.values
                }
                return newItem;
            })) : null,
            loadAllFilters: this.filterOnNoneDisplayedFields
        }).then(result => {
            this.instance.resultWrapper = JSON.parse(result);
            if (!this.firstLoad) {
                ///Collect picklist fields to get their values
                let fields = this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS || [];
                if (fields) {
                    fields.forEach(field => {
                        if (field.showInTotal) {
                            this.aggregationFields.push({ fieldName: field.fieldName, aggType: field.totaltype });
                        }
                    });
                }
                //default page size
                if (!this.instance.pageSize) {
                    this.instance.pageSize = '' + this.instance.resultWrapper.gridSettingsManager.Default_Page_Size;
                }
                // get totals
                this.handelGetTotalAggregation();
            } else {
                this.refreshView(false);
            }
        }).catch(error => {
            toastError(this, error);
        });
    }
    toggleFilter() {
        this.isFilterOpen = !this.isFilterOpen && this.allowFilter;
    }
    refreshView(isCancel) {
        this.handleLoad(this.instance.resultWrapper, false, isCancel);
    }
    newRecord() {
        let objectName = this.instance && this.instance.resultWrapper && this.instance.resultWrapper.objectName ? this.instance.resultWrapper.objectName : undefined;
        if (objectName) {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: objectName,
                    actionName: 'new'
                },
                state: {
                    useRecordTypeCheck: 1,
                    navigationLocation: 'RELATED_LIST'
                }
            });
        } else {
            toastError(this, 'can not create new record of type undefined');
        }
    }

    handelGetTotalAggregation() {
        if (this.aggregationFields.length > 0) {
            getTotalAggregation({ recordId: this.recordId, aggregationFields: JSON.stringify(this.aggregationFields), objectApiName: this.instance.resultWrapper.objectName, masterObjectApiName: this.instance.resultWrapper.masterObjectApiName, metadataDeveloperName: this.templateName }).then(result => {
                this.aggregationFields = JSON.parse(result);
                this.refreshView(false);
            });
        } else {
            this.refreshView(false);
        }
    }

    handleLoad(resultWrapper, isExport, isCancel) {
        let self = this;
        let readOnly = this.readOnly;
        let fields = resultWrapper.gridSettingsManager.GRID_FIELDS || [];
        let changeMap = isExport ? {} : JSON.parse(JSON.stringify(this.instance.changesMap));
        if (fields) {
            fields.forEach(field => {
                field.isId = field.stringFieldType == 'ID';
                field.isText = field.stringFieldType == 'STRING';
                field.isTextArea = field.stringFieldType == 'TEXTAREA';
                field.isBoolean = field.stringFieldType == 'BOOLEAN';
                field.isDate = field.stringFieldType == 'DATE';
                field.isDateTime = field.stringFieldType == 'DATETIME';
                field.isMultiPicklist = field.stringFieldType == 'MULTIPICKLIST';
                field.isPicklist = field.stringFieldType == 'PICKLIST';
                field.isNumber = field.stringFieldType === 'DOUBLE' || field.stringFieldType === 'INTEGER' || field.stringFieldType === 'LONG' || field.stringFieldType === 'CURRENCY' || field.stringFieldType === 'PERCENT';
                field.isCurrency = field.stringFieldType == 'CURRENCY';
                field.isPercent = field.stringFieldType == 'PERCENT';
                field.isOnlyNumber = field.isNumber && !field.isPercent && !field.isCurrency;
                field.total = field.showInTotal && this.aggregationFields.filter(obj => obj.fieldName == field.fieldName).length > '0' ? this.aggregationFields.filter(obj => obj.fieldName == field.fieldName)[0].totalVal == null ? 0 : this.aggregationFields.filter(obj => obj.fieldName == field.fieldName)[0].totalVal : '';
            });

            // resultWrapper.dataMap = {};
            let dataMap = {};
            resultWrapper.data = [];
            resultWrapper.records.forEach(record => {
                let newRecord = { Id: record.Id, url: '/' + record.Id, fields: [], isSelected: self.instance.selectedRecordsIds.some(item => item == record.Id) };
                fields.forEach(field => {
                    let item = { style: field.style };
                    let fieldValue = '';
                    if (field.isReference && (!field.isInputField || readOnly)) {
                        fieldValue = record;
                        let relatedfields = field.fieldName.toString().split(".");
                        relatedfields.forEach(fieldName => {
                            if (fieldValue && fieldValue.hasOwnProperty(fieldName)) {
                                fieldValue = fieldValue[fieldName];
                            } else {
                                fieldValue = null;
                                return;
                            }
                        });
                    } else {
                        if (changeMap.hasOwnProperty(record.Id) && changeMap[record.Id].hasOwnProperty(field.fieldName)) {
                            item.class = 'slds-cell-edit slds-is-edited slds-border_left';
                            fieldValue = changeMap[record.Id][field.fieldName];
                        } else {
                            fieldValue = record[field.fieldName];
                        }
                    }
                    item.isReference = field.stringFieldType == "REFERENCE";
                    if (item.isReference && (!field.isInputField || readOnly)) {
                        item.url = '/' + (fieldValue || '');
                        fieldValue = record;
                        let relatedfields = field.fieldName.toString().split(".");
                        for (let j = 0; j < relatedfields.length - 1; j++) {
                            fieldValue = fieldValue[relatedfields[j]];
                        }
                        if (fieldValue[relatedfields[relatedfields.length - 1].replace(/__c/, '__r')] && fieldValue[relatedfields[relatedfields.length - 1].replace(/__c/, '__r')].Name) {
                            fieldValue = fieldValue[relatedfields[relatedfields.length - 1].replace(/__c/, '__r')].Name;
                        }
                        else {
                            fieldValue = fieldValue[relatedfields[relatedfields.length - 1]];
                        }
                    }
                    item.key = field.fieldName;
                    item.pickListValueMap = {};
                    item.pickListValues = field.pickListValues ? field.pickListValues.map(pick => {
                        item.pickListValueMap[pick.value] = pick.label;
                        return pick;
                    }) : [];
                    item.isInputField = !readOnly && field.isInputField;
                    item.isPersonalised = field.isPersonalised;
                    item.isId = field.stringFieldType == 'ID';
                    item.isText = field.stringFieldType == 'STRING';
                    item.isTextArea = field.stringFieldType == 'TEXTAREA';
                    item.isBoolean = field.stringFieldType == 'BOOLEAN';
                    item.isDate = field.stringFieldType == 'DATE';
                    item.isDateTime = field.stringFieldType == 'DATETIME';
                    item.isMultiPicklist = field.stringFieldType == 'MULTIPICKLIST';
                    item.isPicklist = field.stringFieldType == 'PICKLIST';
                    item.isNumber = field.stringFieldType === 'DOUBLE' || field.stringFieldType === 'INTEGER' || field.stringFieldType === 'LONG' || field.stringFieldType === 'CURRENCY' || field.stringFieldType === 'PERCENT';
                    item.isCurrency = field.stringFieldType == 'CURRENCY';
                    item.isPercent = field.stringFieldType == 'PERCENT';
                    item.isOnlyNumber = item.isNumber && !item.isPercent && !item.isCurrency;
                    if (item.isNumber) {
                        item.scale = field.scale;
                        item.increment = incrementFormat(field.scale);
                    }
                    item.class = 'limited-cell slds-border_left' + (item.isBoolean ? ' slds-text-align_center' : '');
                    // item.contentClass = item.isText || item.isTextArea || item.isReference ? 'slds-text-align_left' : 'slds-text-align_center';
                    item.value = fieldValue;
                    if (item.isId) {
                        item.url = '/' + (item.value || '');
                    }
                    if (item.isPicklist) {
                        if (!item.value) {
                            item.value = '';
                        }
                        item.pickListValues.unshift({ label: self.Labels.LBL_None, value: '' })
                    }
                    if (item.isBoolean) {
                        item.value = (fieldValue + '').toLocaleLowerCase() == 'true';
                    }
                    if (item.isDateTime) {
                        item.value = new Date(fieldValue).getTime();
                    }
                    // if (item.isNumber && (item.value == 0 || item.value)) {
                    //     item.value = new Number(item.value);
                    //     if (field.scale == 0 || field.scale)
                    //         item.value = item.value.toFixed(field.scale);
                    // }
                    if (item.isMultiPicklist) {
                        if (item.isInputField) {
                            item.value = fieldValue ? fieldValue.split(';').map(val => val.trim()) : '';
                        } else {
                            item.value = fieldValue ? fieldValue.split(';').map(val => val.trim()).map(val => item.pickListValueMap[val]).join(', ') : '';
                        }
                    }
                    if (field.isCalculated) {
                        try {
                            let image = self.parseImage(fieldValue);
                            if (image && image.tagName == 'IMG') {
                                item.isImage = true;
                                item.image = image;
                            }
                        } catch (error) {
                            // ignore error
                            // console.log(error);
                        }
                    }
                    item.SObjectName = field.SObjectName || '';
                    newRecord.fields.push(item);
                });
                // resultWrapper.dataMap[newRecord.Id] = newRecord;
                dataMap[newRecord.Id] = newRecord;
            });
            // resultWrapper.data = Object.values(resultWrapper.dataMap);
            if (!isCancel) {
                resultWrapper.dataMap = dataMap;
                resultWrapper.data = Object.values(dataMap);
            } else {
                setTimeout(() => {
                    resultWrapper.dataMap = dataMap;
                    resultWrapper.data = Object.values(dataMap);
                }, 200);
            }
            if (!isExport) {
                if (this.instance.validButHasWarrning) {
                    this.instance.warningMessages.forEach(item => toastWarning(self, item));
                }
                this.instance.tableLoading = false;
                this.instance.Loading = false;
            }
            //resultWrapper.dataMap = {};
        }
    }
    parseImage(htmlString) {
        let element;
        try {
            let div = document.createElement('DIV');
            div.innerHTML = htmlString;
            element = div.querySelector('img');
        } catch (error) {
            // ignore failed to find image
            // console.log(error);
        }
        return element;
    }
    //open first page
    first() {
        let newoffset = 0;
        if (this.instance.offset != newoffset) {
            this.instance.offset = newoffset;
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //open previous page
    previous() {
        let pageSize = parseInt(this.instance.pageSize);
        let newoffset = this.instance.offset - pageSize >= 0 ? this.instance.offset - pageSize : this.instance.offset;
        if (this.instance.offset != newoffset) {
            this.instance.offset = newoffset;
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //open next page
    next() {
        let pageSize = parseInt(this.instance.pageSize);
        let newoffset = this.instance.offset + pageSize < this.instance.resultWrapper.total ? this.instance.offset + pageSize : this.instance.offset;
        if (this.instance.offset != newoffset) {
            this.instance.offset = newoffset;
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //open last page
    last() {
        let pageSize = parseInt(this.instance.pageSize);
        let newoffset = (Math.floor(this.instance.resultWrapper.total / pageSize) == (this.instance.resultWrapper.total / pageSize) ? Math.floor(this.instance.resultWrapper.total / pageSize) - 1 : Math.floor(this.instance.resultWrapper.total / pageSize)) * pageSize;
        if (this.instance.offset != newoffset) {
            this.instance.offset = newoffset;
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //build pagination badge ex: 1-10 of 200
    get paginationBadge() {
        let pageSize = parseInt(this.instance.pageSize);
        return (this.instance.offset + 1) + '-' + (this.instance.offset + pageSize < this.instance.resultWrapper.total ? this.instance.offset + pageSize : this.instance.resultWrapper.total) + ' ' + Labels.LBL_Of + ' ' + this.instance.resultWrapper.total;
    }
    //build selection badge ex: 1-10 selected
    get selectedBadge() {
        return this.instance && this.instance.selectedRows ? this.instance.selectedRows.length + ' ' + Labels.LBL_Selected : '0 ' + Labels.LBL_Selected;
    }
    //check if there is data
    get hasData() {
        return this.instance.resultWrapper && this.instance.resultWrapper.data && this.instance.resultWrapper.data.length > 0;
    }
    //check if page is record page
    get isRecordPage() {
        return this.recordId;
    }
    //first and previous button status
    get previousDisabled() {
        return this.instance.offset == 0;
    }
    //next and last button status
    get nextDisabled() {
        let pageSize = parseInt(this.instance.pageSize);
        return this.instance.offset + pageSize >= this.instance.resultWrapper.total;
    }
}