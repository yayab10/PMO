import { LightningElement, api, track } from 'lwc';
import searchRecords from "@salesforce/apex/GridSettingsPluginCmpController.searchRecords";
import deleteRecords from "@salesforce/apex/GridSettingsPluginCmpController.deleteRecords";
import saveRecords from "@salesforce/apex/GridSettingsPluginCmpController.saveRecords";
import cloneRecord from "@salesforce/apex/GridSettingsPluginCmpController.cloneRecord";
import addNewRowToRecordsList from "@salesforce/apex/GridSettingsPluginCmpController.addNewRowToRecordsList";
import getMasterInfoData from "@salesforce/apex/GridSettingsPluginCmpController.getMasterInfoData";
import getTotalAggregation from "@salesforce/apex/GridSettingsPluginCmpController.getTotalAggregation";
import { encodeDefaultFieldValues } from "lightning/pageReferenceUtils";
import processRest from "@salesforce/apex/GridSettingsPluginCmpController.processRest";
import attachFileToRecords from "@salesforce/apex/GridSettingsPluginCmpController.attachFileToRecords";
import getLocale from "@salesforce/apex/GridSettingsPluginCmpController.getLocale";
import { loadStyle } from 'lightning/platformResourceLoader';
import GridSettings from '@salesforce/resourceUrl/GridSettings';
import { toastWarning, toastInfo, toastError, toastSuccess, Labels, incrementFormat, encodeXml, processControllerFields } from "c/gridSettingsHelper";
import { NavigationMixin } from 'lightning/navigation';
export default class GridSettingsPlugin extends NavigationMixin(LightningElement) {
    Labels = Labels;
    domParser = new DOMParser();
    @api templateName;
    @api recordId;
    @api displayNewButton;
    @api displayCloneButton;
    @api displayNewInlineButton;
    @api labelNewInlineButton;
    @api nameAsURL;
    @api allowExport;
    @api partialSave;
    @api cmpHeight;
    @track selectedFile = '';
    @track currentUploadfileRecord;
    @track recordsSize;
    bigObjectOldData;
    currentUploadfileRecordIndex;
    @track locale;
    @track currentUploadfileField = {};
    @track uploadedFileMap = {};
    //@api displayDeleteInlineButton;
    @api displayShowHideColumns;
    @api refreshViewAfterSave;
    @api numberFixedColumns;
    @track numberOfFixedColumns = 0;
    @api filterOnNoneDisplayedFields;
    @api allowDelete;
    @api allowFilter;
    @api readOnly;
    @api showSubTotal;
    @api doNotLoadDataByDefault;
    @track isFilterOpen = false;
    @track selectedRows = [];
    firstLoad = true;
    @track aggregationFields = [];
    @track totals = [];
    @track isBigObject = false;
    masterObjectInfo = {};
    @track fieldToClearOnClone = [];
    get cloneAvailable() {
        return this.displayCloneButton && !this.isBigObject;
    }
    get deleteAvailable() {
        return this.allowDelete && !this.isBigObject;
    }
    get hasTotalFields() {
        return this.showSubTotal && this.aggregationFields.length > 0;
    }
    get hasFilterSettingsFields() {
        try {
            let filterSettingsFields = this.instance && this.instance.filterSettingsFields ? this.instance.filterSettingsFields : '[]';
            filterSettingsFields = JSON.parse(filterSettingsFields);
            return this.allowFilter; /*&& filterSettingsFields && filterSettingsFields.length && filterSettingsFields.some(item => item.hasOwnProperty('userFilterable'))*/;
        } catch (error) {
            console.log(error);
        }
        return false;
    };
    get hasMenu() {
        return this.hasData && (this.allowDelete || this.displayShowHideColumns || this.allowExport);
    }
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
        hasLoadMoreData: false,
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
        uploadFilePopup: false,
        showHideColumns: false,
        selectedFields: [],
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
    selectedFields = [];
    selectedGridFields = [];
    selectedGridFieldsMap = {};
    rejectedRecords = [];
    get panelHeight() {
        if(this.cmpHeight) {
            return this.cmpHeight;
        } else {
            let height;
            let tableContainer = this.template.querySelector('.tableContainer');
            if(tableContainer) {
                height = tableContainer.getBoundingClientRect().height;
            }
            return '' + height;
        }
    }
    get tableStyle() {
        return (this.cmpHeight ? 'height: ' + this.cmpHeight + ';' : '') /*+ (this.isFilterOpen ? 'max-height: 56vh;' : '')*/;
    }
    Events = {
        confirmFilterSettings: 'confirmfiltersettings',
        cancelFilterSettings: 'cancelfiltersettings',
        fixedColumns: 'fixedcolumns',
    }
    pageSizeOptions = [{ label: '5', value: '5' }, { label: '10', value: '10' }, { label: '25', value: '25' }, { label: '50', value: '50' }, { label: '75', value: '75' }, { label: '100', value: '100' },];
    /*errorCallback(error, stack) {
        console.log('error>>> ' + error);
        console.log(stack);
        console.log(error, stack);
        toastError(this, error);
        this.instance.Loading = false;
        this.instance.tableLoading = false;
    }*/
    closeFilterSettings() {
        this.isFilterOpen = false;
    }
    confirmFilterSettings(event) {
        try {
            let self = this;
            let fields = JSON.parse(event.detail.value);
            let fieldsMap = {};
            console.log('grid settings plugin -- 222');
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
        } catch (error) {
            console.error(error);
        }
    }
    fixedColumnsChanged(event) {
        this.numberOfFixedColumns = Number(event.detail.value);
        this.setSticky();
    }
    //get data on component load
    connectedCallback() {
        this.instance.Loading = true;
        Promise.all([
            loadStyle(this, GridSettings + '/customStyle.css'),
        ]).then(() => { }).catch(error => {
            console.log("Error " + error.body.message);
        });
        getLocale({}).then(result => {
            this.locale = result;
            this.refreshData();
        });
    }
    openFullScreen(event) {
        var elem = this.template.querySelector('.main-container');
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        } else {
            toastWarning(elem, 'Open Full Screen is locked');
        }
    }
    handleEnterHasDropDownElementSticky(event) {
        let closestTd = event.target.closest("td");
        for (var elem of this.template.querySelectorAll('.stickyTD')) {
            elem.style.zIndex = 3;
        }
        if (closestTd.style.position == 'sticky') {
            closestTd.style.zIndex = 5;
        }
    }
    handleLeaveHasDropDownElementSticky(event) {
        let closestTd = event.target.closest("td");
        if (closestTd.style.position == 'sticky') {
            closestTd.style.zIndex = 3;
        }
    }
    renderedCallback() {
        this.setSticky();
        let filterCmp = this.template.querySelector(`[data-id="filter-panel-cmp"]`);
        if (filterCmp && filterCmp.refreshPanelHeight) {
            filterCmp.refreshPanelHeight(this.panelHeight);
        }
    }
    // save Data changes
    saveChangesHandler() {
        let self = this;
        let changesMap = this.instance.changesMap;
        let resultWrapper = this.instance.resultWrapper;
        let selectedGridFieldsMap = this.selectedGridFieldsMap;
        let recordsMap = {};
        let records = Object.keys(changesMap).map(key => {
            let item = JSON.parse(JSON.stringify(changesMap[key]));
            if (!Number.isNaN(+key)) {
                item.sobjectType = resultWrapper.objectName;
            } else {
                item.Id = key;
            }
            for (let fieldName of Object.keys(item)) {
                let field = selectedGridFieldsMap[fieldName];
                if (field && field.isNumberField) {
                    item[fieldName] = +item[fieldName];
                }
            }
            recordsMap[key] = item;
            return item;
        });
        if (records && records.length) {
            this.instance.tableLoading = true;
            //console.log('changesMap ' + JSON.stringify(changesMap));
            saveRecords({ recordsMap: recordsMap, partialSave: this.partialSave }).then(result => {
                let saveResult = JSON.parse(result);
                if (saveResult.isSuccess) {
                    this.rejectedRecords = [];
                    toastSuccess(self, "Save success");
                    self.handelGetTotalAggregation();
                    self.refreshData();
                    self.instance.changesMap = {};
                    if (self.refreshViewAfterSave) {
                        eval("$A.get('e.force:refreshView').fire();");
                    }
                } else {
                    this.rejectedRecords = [];
                    let changesMap = {};
                    Object.keys(saveResult.errorMessages).map(key => {
                        toastError(self, saveResult.errorMessages[key]);
                        this.rejectedRecords.push(key);
                        changesMap[key] = self.instance.changesMap[key];
                        return '' + key;
                    });
                    let records = this.instance.resultWrapper.records;
                    self.instance.changesMap = changesMap;
                    Object.keys(saveResult.newRecords).forEach(key => {
                        if (records.length > key) {
                            records[key] = saveResult.newRecords[key];
                        }
                    });
                    self.handleLoad(self.instance.resultWrapper, false, false);
                    self.instance.tableLoading = false;
                }
            }).catch(error => {
                for (var e of error.body.pageErrors) {
                    toastError(self, e.message);
                }
                self.instance.tableLoading = false;
            });
        }
    }
    // cancel Data cahnges
    cancelChangesHandler() {
        this.instance.changesMap = {};
        this.instance.selectedRecordsIds = [];
        this.rejectedRecords = [];
        this.refreshData();
        this.refreshView(true);
    }
    // generic change handler
    genericChangeHandler(event) {
        let self = this;
        let fieldName = event.target.dataset.fieldName;
        let Id = event.target.dataset.id
        let rowIndex = event.target.closest("td").dataset.rowIndex;
        let mergeId = Id ? Id : rowIndex;
        /*console.log('nearest td index ' + Id);
        let parent = event.target;
        while (parent && parent.parentNode && !parent.dataset.row) {
            parent = parent.parentNode;
        }
        if (!Id) {
            Id = parent.rowIndex;
        }
        console.log(' Id >>> ' + Id);*/
        let value = event.detail.hasOwnProperty('value') ? (event.detail.value ? (typeof event.detail.value == 'string' || typeof event.detail.value == 'number' ? event.detail.value : (event.detail.value.join ? event.detail.value.join(';') : event.detail.value)) : '') : event.detail.hasOwnProperty('checked') ? event.target.checked : null;
        if (!this.instance.changesMap.hasOwnProperty(mergeId) || this.instance.changesMap[mergeId] == undefined) {
            this.instance.changesMap[mergeId] = {};
        }
        this.instance.changesMap[mergeId][fieldName] = value;
        if (this.instance.changesMap[mergeId] == {}) {
            delete this.instance.changesMap[mergeId];
        }
        let originalRecord = this.instance.resultWrapper.dataMap.hasOwnProperty(mergeId) ? JSON.parse(JSON.stringify(this.instance.resultWrapper.dataMap[mergeId].record)) : {};
        let record = this.instance.changesMap[mergeId];
        originalRecord = Object.assign(originalRecord, JSON.parse(JSON.stringify(record)));
        let fields = this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS || [];
        for (let field of fields) {
            field.isNumber = field.stringFieldType === 'DOUBLE' || field.stringFieldType === 'INTEGER' || field.stringFieldType === 'LONG' || field.stringFieldType === 'CURRENCY' || field.stringFieldType === 'PERCENT';
            if (field.defaultExpression && !field.hasOwnProperty('expFields') && !field.hasOwnProperty('expressionHandler')) {
                field.expFields = [];
                let builder = '';
                let hasOpen = false;
                let hasExclamation = false;
                for (let character of field.defaultExpression) { // {!field1} - {!field2} + {!field1}
                    if (character == '{') {
                        builder = '';
                        hasOpen = true;
                    } else if (hasOpen && character == '!') {
                        hasExclamation = true;
                    } else if (hasOpen && hasExclamation && character == '}') {
                        hasOpen = false;
                        hasExclamation = false;
                        field.expFields.push(builder);
                        builder = '';
                    } else if (hasOpen && hasExclamation && character != '!' && character != '{' && character != '}') {
                        builder += character;
                    }
                }
                field.expressionHandler = (currentRecord) => {
                    let expression = field.defaultExpression;
                    field.expFields.forEach(expFieldName => {
                        if (field.isNumber) {
                            expression = expression.replace(new RegExp('\{\!' + expFieldName + '\}', 'gi'), currentRecord.hasOwnProperty(expFieldName) && currentRecord[expFieldName] ? currentRecord[expFieldName] : '0');
                        } else {
                            expression = expression.replace(new RegExp('\{\!' + expFieldName + '\}', 'gi'), currentRecord.hasOwnProperty(expFieldName) && currentRecord[expFieldName] ? currentRecord[expFieldName] : '');
                        }
                    });
                    let val;
                    try {
                        if (field.isNumber) {
                            val = eval(expression);
                        } else {
                            val = expression;
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                    return val;
                };
            }
            if (field.defaultExpression && field.expFields && field.expFields.includes(fieldName) && field.fieldName != fieldName) {
                record[field.fieldName] = field.expressionHandler(originalRecord);
            }
            if (field.controllerFieldActions) {
                processControllerFields(this, originalRecord, field, true, fieldName);
            }
        }
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
        })
            /*.catch(error => {
                        toastError(self, error);
                        self.refreshData();
                    })*/
            ;
    }
    // delete Selected
    deleteSelected() {
        if (this.instance && this.instance.selectedRecordsIds && this.instance.selectedRecordsIds.length) {
            this.instance.deletePopup.deleteIds = this.instance.selectedRecordsIds.map(item => item);
            this.instance.deletePopup.show = true;
        }
    }
    // export Excel
    exportExcel() {
        let self = this;
        let resultWrapper = JSON.parse(JSON.stringify(this.instance.resultWrapper));
        resultWrapper.records = [];
        let tablebodyRows = '';
        resultWrapper.dataoffset = 0;
        processRest({ url: resultWrapper.baseUrl + '/services/data/v50.0/query/?q=' + encodeURI(resultWrapper.query) }).then((result) => {
            if (result) {
                if (JSON.parse(result).hasOwnProperty('body')) {
                    try {
                        let oldData = JSON.parse(JSON.parse(result).body);
                        if (oldData.hasOwnProperty('done')) {
                            if (oldData.records) {
                                resultWrapper.data = [];
                                resultWrapper.records = oldData.records;
                                resultWrapper.dataoffset += oldData.records.length;
                                self.handleLoad(resultWrapper, true);
                                tablebodyRows += self.fillTableBodyRow(resultWrapper);
                            }
                            if (oldData.done) {
                                self.export(resultWrapper, tablebodyRows);
                            } else {
                                self.excelLoadMore(resultWrapper, oldData, tablebodyRows);
                            }
                        }
                    } catch (error) {
                        toastError(this, error);
                    }
                }
            }
        });
    }
    excelLoadMore(resultWrapper, oldData, tablebodyRows) {
        let self = this;
        if (!oldData.done) {
            processRest({ url: resultWrapper.baseUrl + oldData.nextRecordsUrl }).then((result) => {
                if (result) {
                    if (JSON.parse(result).hasOwnProperty('body')) {
                        try {
                            oldData = JSON.parse(JSON.parse(result).body);
                            if (oldData.hasOwnProperty('done')) {
                                if (oldData.records) {
                                    resultWrapper.data = [];
                                    resultWrapper.records = oldData.records;
                                    resultWrapper.dataoffset += oldData.records.length;
                                    self.handleLoad(resultWrapper, true);
                                    tablebodyRows += self.fillTableBodyRow(resultWrapper);
                                }
                                if (oldData.done) {
                                    self.export(resultWrapper, tablebodyRows);
                                } else {
                                    self.excelLoadMore(resultWrapper, oldData, tablebodyRows);
                                }
                            }
                        } catch (error) {
                            toastError(this, JSON.parse(result).body);
                        }
                    }
                }
            });
        } else {
            self.export(resultWrapper, tablebodyRows);
        }
    }
    bigObjectLoadMore() {
        let self = this;
        let resultWrapper = this.instance.resultWrapper;
        //resultWrapper.records = [];
        //resultWrapper.dataoffset = 0;
        if (!this.bigObjectOldData.done) {
            processRest({ url: resultWrapper.baseUrl + this.bigObjectOldData.nextRecordsUrl }).then((result) => {
                if (result) {
                    if (JSON.parse(result).hasOwnProperty('body')) {
                        try {
                            this.bigObjectOldData = JSON.parse(JSON.parse(result).body);
                            if (this.bigObjectOldData.hasOwnProperty('done')) {
                                if (this.bigObjectOldData.records) {
                                    //resultWrapper.data = [];
                                    //resultWrapper.records = oldData.records;
                                    resultWrapper.records.push(...this.bigObjectOldData.records);
                                    console.log('load more size >>> ' + this.bigObjectOldData.records.length);
                                    resultWrapper.total += this.bigObjectOldData.records.length;
                                    resultWrapper.dataoffset += this.bigObjectOldData.records.length;
                                    // self.handleLoad(resultWrapper, true);
                                    if (this.firstLoad) {
                                        for (let field of this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS) {
                                            this.instance.selectedFields.push(field.fieldName);
                                            this.selectedGridFields.push(field);
                                            this.selectedGridFieldsMap[field.fieldName] = field;
                                        }
                                        this.firstLoad = false;
                                    }
                                    self.refreshView(false); //TODO Make handleLoad Just on the New Records
                                }
                            }
                        } catch (error) {
                            toastError(this, error);
                        }
                    }
                    this.instance.hasLoadMoreData = false;
                }
            });
        } else  {
            this.instance.hasLoadMoreData = false;
        }
    }
    export(resultWrapper, tablebodyRows) {
        let date = new Date(Date.now());
        let columns = JSON.parse(JSON.stringify(this.selectedGridFields));
        let header = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel">';
        let style = '<Styles>';
        style += '<Style ss:ID="Normal"><Borders/><Font/><Interior/><NumberFormat/><Protection/></Style>';
        style += '<Style ss:ID="NormalDateTime"><NumberFormat ss:Format="Short Date"/><Borders/><Font/><Interior/><Protection/></Style>';
        style += '<Style ss:ID="header"><Font ss:bgcolor="#e3deb8" ss:Bold="1" ss:FontName="Calibri" ss:Size="12"/><Interior ss:Color="#f8f8f8" ss:Pattern="Solid"/></Style>';
        let tablebody = '<Row>';
        columns = columns.map(item => {
            if (!item.isPersonalised) {
                tablebody += '<Cell ss:StyleID="header"><Data ss:Type="String">' + item.fieldLabel + '</Data></Cell>';
                if (item.isNumber) {
                    style += '<Style ss:ID="' + item.fieldName.replace(/_/g, '') + '"><NumberFormat ss:Format="' + (new Number(0).toFixed(item.scale)) + (item.isPercent ? '%' : '') + '"/><Borders/><Font/><Interior/><Protection/></Style>';
                }
                if (!item.max_width || item.max_width < item.fieldLabel.length) {
                    item.max_width = item.fieldLabel.length;
                }
            }
            return item;
        });
        style += '</Styles>';
        tablebody += '</Row>';
        tablebody += tablebodyRows;
        let body = '<Worksheet ss:Name="' + this.templateName + '">';
        body += '<Table>';
        columns.forEach(item => {
            if (!item.isPersonalised) {
                body += '<Column ss:Width="' + Math.trunc(item.max_width ? item.max_width * 6.5 : 80) + '"></Column>';
            }
        });
        body += tablebody;
        body += '</Table>';
        body += '</Worksheet>';
        body += '</Workbook>';
        let a = document.createElement('a');
        a.style.display = 'none';
        a.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(header + style + body);
        a.download = this.templateName + '_' + date.toLocaleString().replace(/[:,\/]/g, '-') + ".xls";
        document.body.appendChild(a);
        a.click();
    }
    fillTableBodyRow(resultWrapper) {
        let tablebodyRows = '';
        if (resultWrapper.data) {
            resultWrapper.data.forEach(item => {
                tablebodyRows += '<Row>';
                item.fields.forEach(field => {
                    if (this.instance.selectedFields.includes(field.key)) {
                        try {
                            // tablebodyRows += '<Cell ss:StyleID="' + (field.isDate || field.isDateTime ? 'NormalDateTime' : (field.isNumber ? '' + field.key.replace(/_/g, '') : 'Normal')) + '"><Data ss:Type="' + (field.isNumber ? 'Number' : field.isDate || field.isDateTime ? 'DateTime' : 'String') + '">' + (field.isNumber ? (field.value ? new Number(field.value).toFixed(15) * (field.isPercent ? 0.01 : 1) : 0) : (field.isBoolean ? (field.value == true ? '✓' : '') : (field.value ? (field.isRichText ? encodeXml(field.value) : field.value) : ''))) + '</Data></Cell>';
                            tablebodyRows += '<Cell ss:StyleID="';
                            if (field.isDate || field.isDateTime) {
                                tablebodyRows += 'NormalDateTime';
                            } else if (field.isNumber) {
                                tablebodyRows += field.key.replace(/_/g, '');
                            } else {
                                tablebodyRows += 'Normal';
                            }
                            tablebodyRows += '"><Data ss:Type="';
                            if (field.isNumber) {
                                tablebodyRows += 'Number'
                            } else if ((field.isDate || field.isDateTime) && (field.value)) {
                                tablebodyRows += 'DateTime';
                            } else {
                                tablebodyRows += 'String';
                            }
                            tablebodyRows += '">';
                            if (field.isNumber) {
                                if (field.value) {
                                    tablebodyRows += new Number(field.value).toFixed(15) * (field.isPercent ? 0.01 : 1);
                                } else {
                                    tablebodyRows += 0;
                                }
                            } else if (field.isBoolean) {
                                if (field.value == true) {
                                    tablebodyRows += '✓';
                                } else {
                                    tablebodyRows += ''
                                }
                            } else if (field.isPicklist) {
                                if (field.value) {
                                    if (field.pickListValueMap && field.pickListValueMap.hasOwnProperty(field.value)) {
                                        tablebodyRows += field.pickListValueMap[field.value];
                                    } else {
                                        tablebodyRows += field.value;
                                    }
                                }
                            } else if (field.isMultiPicklist) {
                                if (field.value && field.value.length) {
                                    tablebodyRows += field.value.map(val => {
                                        val = val.trim();
                                        return field.pickListValueMap && field.pickListValueMap.hasOwnProperty(val) ? field.pickListValueMap[val] : val;
                                    }).join(', ');
                                }
                            } else if (field.value) {
                                if (field.isRichText) {
                                    tablebodyRows += encodeXml(field.value)
                                } else {
                                    tablebodyRows += field.value;
                                }
                            }
                            tablebodyRows += '</Data></Cell>';
                        } catch (error) { console.log(error); }
                    }
                });
                tablebodyRows += '</Row>';
            });
        }
        return tablebodyRows;
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
            for (let item of this.instance.deletePopup.deleteIds) {
                if (this.instance.changesMap.hasOwnProperty(item)) {
                    delete this.instance.changesMap[item];
                }
            }
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
        if (this.instance.hasChanges) {
            alert('You Should Save Before you Moved');
        } else {
            this.instance.pageSize = event.detail.value;
            this.instance.offset = 0;
            this.instance.tableLoading = true;
            this.refreshData();
        }
    }
    //handle row selection changed
    handleRowSelection(event) { }
    //handle search input change and if the user clear the seach input it resets the filter
    searchInputChangeHandler(event) {
        this.instance.offset = 0;
        if (event.detail.value == '' || event.detail.value != '') {
            this.instance.searchTerm = event.detail.value;
        }
        if (event.detail.value == '') {
            var r = this.instance.hasChanges ? confirm('Your changes will be lost, Are you sure?!') : true;
            if (r == true) {
                this.instance.tableLoading = true;
                this.refreshData();
            }
        }
    }
    //search if user presses enter in search box
    submitSearchKeyPressHandler(event) {
        if (this.instance.searchTerm && (event.which == 13 || event.keyCode == 13)) {
            var r = this.instance.hasChanges ? confirm('Your changes will be lost, Are you sure?!') : true;
            if (r == true) {
                this.instance.changesMap = {};
                this.instance.offset = 0;
                this.instance.tableLoading = true;
                this.refreshData();
                event.target.blur();
            }
        }
    }
    //if search box lose focus
    submitSearchFocusOutHandler(event) {
        if (this.instance.searchTerm && this.instance.searchTerm.length > 2) {
            var r = this.instance.hasChanges ? confirm('Your changes will be lost, Are you sure?!') : true;
            if (r == true) {
                this.instance.changesMap = {};
                this.instance.offset = 0;
                this.instance.tableLoading = true;
                this.refreshData();
            }
        }
    }
    //search in grid
    searchBtnHandler() {
        var r = this.instance.hasChanges ? confirm('Your changes will be lost, Are you sure?!') : true;
        if (r == true) {
            this.instance.changesMap = {};
            this.instance.tableLoading = true;
            this.handelGetTotalAggregation();
            this.refreshData();
        }
    }
    //refresh data in the grid
    refreshData() {
        // Id recordId, String searchTerm, Integer offset, Integer pageSize, String metadataDeveloperName
        searchRecords({
            recordId: this.recordId,
            searchTerm: this.instance.searchTerm,
            offset: this.instance.offset,
            pageSize: this.instance.pageSize,
            metadataDeveloperName: this.templateName,
            filter: this.instance.__filtersFieldsMap != undefined ? JSON.stringify(Object.values(this.instance.__filtersFieldsMap).map(item => {
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
            this.isFilterOpen = this.doNotLoadDataByDefault && this.allowFilter && this.isBigObject;
            if (this.instance.objectName.endsWith('__b')) {
                this.queryBigObject();
            } else {
                if (this.firstLoad) {
                    ///Collect picklist fields to get their values
                    let fields = this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS || [];
                    let masterFields = [];
                    for (let field of fields) {
                        if (field.defaultType == 'master' && field.defaultValue) {
                            masterFields.push(field.defaultValue.split('.')[1]);
                        }
                        if (field.defaultExpression) {
                            let expFields = [];
                            let builder = '';
                            let hasOpen = false;
                            let hasExclamation = false;
                            for (let character of field.defaultExpression) {
                                if (character == '{') {
                                    builder = '';
                                    hasOpen = true;
                                } else if (hasOpen && character == '!') {
                                    hasExclamation = true;
                                } else if (hasOpen && hasExclamation && character == '}') {
                                    hasOpen = false;
                                    hasExclamation = false;
                                    expFields.push(builder);
                                    builder = '';
                                } else if (hasOpen && hasExclamation && character != '!' && character != '{' && character != '}') {
                                    builder += character;
                                }
                            }
                        }
                    }
                    if (masterFields.length != 0) {
                        getMasterInfoData({ recordId: this.recordId, masterObjectApiName: this.instance.resultWrapper.masterObjectName, fieldsName: masterFields }).then(result => {
                            this.masterObjectInfo = result;
                        });
                    }
                    let gridFieldsName = [];
                    if (fields) {
                        fields.forEach(field => {
                            if (!field.isHidden) {
                                gridFieldsName.push(field.fieldName);
                            }
                            if (field.showInTotal && field.isNumberField) {
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
                    if (this.recordId && localStorage.getItem(this.templateName)) {
                        try {
                            let cachedData = JSON.parse(localStorage.getItem(this.templateName));
                            let savedLocalGrid = cachedData.map(field => field.fieldName);
                            for (let field of this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS) {
                                if (savedLocalGrid.includes(field.fieldName)) {
                                    this.selectedGridFields.push(field);
                                    this.selectedGridFieldsMap[field.fieldName] = field;
                                    this.instance.selectedFields.push(field.fieldName);
                                }
                            }
                        } catch (e) { }
                    } else {
                        for (let field of this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS) {
                            this.instance.selectedFields.push(field.fieldName);
                            this.selectedGridFields.push(field);
                            this.selectedGridFieldsMap[field.fieldName] = field;
                        }
                    }
                    this.firstLoad = false;
                    this.refreshView(false);
                } else {
                    this.refreshView(false);
                }
            }
            })
        }/*.catch(error => {
                            toastError(this, error);
                    });*/
    queryBigObject() {
        let self = this;
        let resultWrapper = this.instance.resultWrapper;
        resultWrapper.records = [];
        resultWrapper.dataoffset = 0;
        console.log('resultWrapper.query>>>>> ' + resultWrapper.query );
        processRest({ url: resultWrapper.baseUrl + '/services/data/v50.0/query/?q=' + encodeURI(resultWrapper.query) }).then((result) => {
            if (result) {
                if (JSON.parse(result).hasOwnProperty('body')) {
                    try {
                        this.bigObjectOldData = JSON.parse(JSON.parse(result).body);
                        if (this.bigObjectOldData.hasOwnProperty('done')) {
                            if (this.bigObjectOldData.records) {
                                resultWrapper.data = [];
                                resultWrapper.records = this.bigObjectOldData.records;
                                console.log('record size >>> ' + this.bigObjectOldData.records.length);
                                resultWrapper.total = this.bigObjectOldData.records.length;
                                resultWrapper.dataoffset += this.bigObjectOldData.records.length;
                                // self.handleLoad(resultWrapper, true);
                                if (this.firstLoad) {
                                    for (let field of this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS) {
                                        this.instance.selectedFields.push(field.fieldName);
                                        this.selectedGridFields.push(field);
                                        this.selectedGridFieldsMap[field.fieldName] = field;
                                    }
                                }
                                self.refreshView(false);
                                this.firstLoad = false;
                            }
                            // if (oldData.done) {
                            // this.refreshView(false);
                            // self.export(resultWrapper, tablebodyRows);
                            // } else {
                            // self.excelLoadMore(resultWrapper, oldData, tablebodyRows);
                            // }
                        }
                    } catch (error) {
                        toastError(this, error);
                    }
                }
            }
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
            var defaultValues = "";
            if (this.recordId) {
                let masterRelationName = this.instance.resultWrapper.gridSettingsManager.relationName;
                let defaultMasterLookupField = {};
                defaultMasterLookupField[masterRelationName] = this.recordId;
                let fields = this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS || [];
                for (let field of fields) {
                    if (field.defaultValue != null) {
                        if (field.defaultType == 'master') {
                            defaultMasterLookupField[field.fieldName] = this.masterObjectInfo[field.defaultValue.split('.')[1]];
                        } else if (field.defaultType == 'text') {
                            defaultMasterLookupField[field.fieldName] = field.defaultValue;
                        }
                    }
                }
                try {
                    defaultValues = encodeDefaultFieldValues(defaultMasterLookupField);
                } catch (error) {
                    console.error('error ' + error);
                }
            }
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: objectName,
                    actionName: 'new',
                },
                state: {
                    useRecordTypeCheck: 1,
                    navigationLocation: 'RELATED_LIST',
                    defaultFieldValues: defaultValues
                }
            });
        } else {
            toastError(this, 'can not create new record of type undefined');
        }
    }
    newInlineRecord() {
        addNewRowToRecordsList({ recordId: this.recordId, objectApiName: this.instance.resultWrapper.objectName, parent: this.recordId, masterRelationName: this.instance.resultWrapper.gridSettingsManager.relationName }).then(result => {
            this.instance.resultWrapper.records.push(result);
            if (this.recordId) {
                this.instance.changesMap[this.instance.resultWrapper.records.length] = {};
                this.instance.changesMap[this.instance.resultWrapper.records.length][this.instance.resultWrapper.gridSettingsManager.relationName] = this.recordId;
            }
            let fields = this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS || [];
            fields.forEach(field => {
                if (field.defaultValue != null) {
                    if (!this.instance.changesMap[this.instance.resultWrapper.records.length]) this.instance.changesMap[this.instance.resultWrapper.records.length] = {};
                    if (field.defaultType == 'master') {
                        if (!this.instance.changesMap[this.instance.resultWrapper.records.length][field.fieldName]) {
                            this.instance.changesMap[this.instance.resultWrapper.records.length][field.fieldName] = this.masterObjectInfo[field.defaultValue.split('.')[1]];
                        }
                    } else if (field.defaultType == 'text') {
                        if (!this.instance.changesMap[this.instance.resultWrapper.records.length][field.fieldName]) {
                            this.instance.changesMap[this.instance.resultWrapper.records.length][field.fieldName] = field.defaultValue;
                        }
                    } else if (field.defaultType == 'curent') {
                        if (!this.instance.changesMap[this.instance.resultWrapper.records.length][field.fieldName]) {
                            this.instance.changesMap[this.instance.resultWrapper.records.length][field.fieldName] = this.instance.changesMap[this.instance.resultWrapper.records.length][field.defaultValue] ? this.instance.changeMap[this.instance.resultWrapper.records.length][field.defaultValue] : record[field.defaultValue];
                        }
                    }
                } else {
                    field.defaultType = null;
                }
            });
            this.handleLoad(this.instance.resultWrapper, false, false);
            /*let changesMap = this.instance.changesMap;
            let ChangesMapKeys = Object.keys(changesMap);
            console.log(JSON.stringify(ChangesMapKeys));
            for (let key of ChangesMapKeys) {
                if (!Number.isNaN(parseInt(key)) && key > 1) {
                    let item = JSON.parse(JSON.stringify(changesMap[key]));
                    delete changesMap[key + 1];
                    changesMap[key] = item;
                }
            }*/
            this.instance.tableLoading = false;
            setTimeout(() => {
                var objDiv = this.template.querySelector(".tableContainer");
                objDiv.scrollTop = objDiv.scrollHeight;
                //console.log('scrollHeight1 ' + objDiv.scrollHeight);
            }, 200);
            //console.log('scrollHeight2 ' + objDiv.scrollHeight);
        }).catch(error => {
            toastError(this, error);
            this.instance.tableLoading = false;
        });
    }
    cloneRecord(event) {
        this.instance.tableLoading = true;
        /*let parent = event.target;
        while (!parent.dataset.row) {
            parent = parent.parentNode;
        }
        let index = parent.rowIndex;*/
        let index = event.target.dataset.rowIndex;
        try {
            cloneRecord({ recordId: event.target.dataset.id, fieldNames: this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS.map(obj => obj.fieldName), objectApiName: this.instance.resultWrapper.objectName }).then(result => {
                if (result != null) {
                    for (let field of this.fieldToClearOnClone) {
                        for (let fieldName of Object.keys(result)) {
                            if (fieldName == field || fieldName.startsWith(field.replace('__c', '__r'))) {
                                if (fieldName.endsWith('__r')) {
                                    for (let refFieldName of Object.keys(result[fieldName])) {
                                        result[fieldName][refFieldName] = '';
                                    }
                                }
                                result[fieldName] = '';
                            }
                        }
                    }
                    this.instance.resultWrapper.records.push(result);
                    this.handleLoad(this.instance.resultWrapper, false, false);
                    let changesMap = this.instance.changesMap;
                    /*let ChangesMapKeys = Object.keys(changesMap);
                    for (let key of ChangesMapKeys) {
                        if (key > index) {
                            let item = JSON.parse(JSON.stringify(changesMap[key]));
                            if (!Number.isNaN(parseInt(key))) {
                                delete changesMap[key + 1];
                                changesMap[key] = item;
                            }
                        }
                    }*/
                    changesMap[this.instance.resultWrapper.records.length] = {};
                    for (let fieldName of Object.keys(result)) {
                        changesMap[this.instance.resultWrapper.records.length][fieldName] = result[fieldName];
                    }
                    let masterRelationName = this.instance.resultWrapper.gridSettingsManager.relationName;
                    if (masterRelationName) {
                        changesMap[this.instance.resultWrapper.records.length][masterRelationName] = this.recordId;
                    }
                    this.instance.tableLoading = false;
                }
            }).catch(error => {
                console.log('ERROR:: ' + error);
                console.log('ERROR:: ' + JSON.stringify(error));
                //toastError(this, error);
                this.instance.tableLoading = false;
            });
        } catch (error) {
            console.log('ERROR:: ' + error);
            console.log('ERROR:: ' + JSON.stringify(error));
        }
    }
    handelGetTotalAggregation() {
        if (this.aggregationFields.length > 0) {
            getTotalAggregation({ recordId: this.recordId, aggregationFields: JSON.stringify(this.aggregationFields), objectApiName: this.instance.resultWrapper.objectName, masterObjectApiName: this.instance.resultWrapper.masterObjectName, metadataDeveloperName: this.templateName }).then(result => {
                this.aggregationFields = JSON.parse(result);
            }).catch(error => {
                console.log("Error " + error.body.message);
            });
        }
    }
    handleLoad(resultWrapper, isExport, isCancel) {
        let self = this;
        let readOnly = this.readOnly;
        let fields = resultWrapper.gridSettingsManager.GRID_FIELDS || [];
        let changeMap = isExport ? {} : JSON.parse(JSON.stringify(this.instance.changesMap));
        if (fields) {
            fields.forEach(field => {
                console.log(field.fieldName + '---- ' + field.stringFieldType);
                field.isId = field.stringFieldType == 'ID';
                field.isText = field.stringFieldType == 'STRING' || field.stringFieldType == 'PHONE' ||  field.stringFieldType == 'FAX' ||  field.stringFieldType == 'ADDRESS';
                field.isTextArea = field.stringFieldType == 'TEXTAREA';
                field.isBoolean = field.stringFieldType == 'BOOLEAN';
                field.isDate = field.stringFieldType == 'DATE';
                field.isDateTime = field.stringFieldType == 'DATETIME';
                field.isMultiPicklist = field.stringFieldType == 'MULTIPICKLIST';
                field.isPicklist = field.stringFieldType == 'PICKLIST';
                field.isNumber = field.stringFieldType === 'DOUBLE' || field.stringFieldType === 'INTEGER' || field.stringFieldType === 'LONG' || field.stringFieldType === 'CURRENCY' || field.stringFieldType === 'PERCENT';
                field.isCurrency = field.stringFieldType == 'CURRENCY';
                field.isPercent = field.stringFieldType == 'PERCENT';
                field.isUrl = field.stringFieldType == 'URL';
                field.nameAsURL = (this.nameAsURL && field.fieldName.toLowerCase() == "name");
                field.isOnlyNumber = field.isNumber && !field.isPercent && !field.isCurrency;
                field.isSortable = field.isSortable;
                field.controllerFieldActions = field.controllerFieldActions;
                field.ascSortDirection = field.isSortable;
                field.total = field.showInTotal && this.aggregationFields.filter(obj => obj.fieldName == field.fieldName).length > '0' ? this.aggregationFields.filter(obj => obj.fieldName == field.fieldName)[0].totalVal == null ? 0 : this.aggregationFields.filter(obj => obj.fieldName == field.fieldName)[0].totalVal : '';
                if (field.clearOnClone) this.fieldToClearOnClone.push(field.fieldName);
            });
            this.isBigObject = resultWrapper.objectName.endsWith('__b');
            let dataMap = {};
            if (!this.isBigObject) {
                resultWrapper.data = [];
            }
            let index = 1;
            if ((this.firstLoad && !this.doNotLoadDataByDefault) || !this.firstLoad) {
                resultWrapper.records.forEach(record => {
                    let newRecord = { record: record, Id: record.Id, url: '/' + record.Id, fields: [], isSelected: self.instance.selectedRecordsIds.some(item => item == record.Id) };
                    newRecord.rowColor = '';
                    if ((record.Id && this.rejectedRecords.includes(record.Id)) || (!record.Id && this.rejectedRecords.includes(index + ''))) {
                        newRecord.hasError = true;
                    } else {
                        newRecord.hasError = false;
                    }
                    fields.forEach(field => {
                        if (this.instance.selectedFields.includes(field.fieldName) || field.isHidden) {
                            let item = { style: field.style };
                            item.isHidden = field.isHidden;
                            item.nameAsURL = record.Id && field.nameAsURL;
                            item.nameURL = '/' + record.Id;
                            item.hasFileInput = field.hasFileInput;
                            item.URLOption = field.URLOption;
                            item.displayFullURL = field.displayFullURL;
                            item.replaceWithText = field.URLOption == "TextReplace";
                            item.replaceWithIcon = field.URLOption == "IconReplace";
                            item.replaceURLWith = field.replaceURLWith;
                            ////
                            item.relatedField = field.fieldName.includes(".");
                            if (item.relatedField) {
                                item.refObject = field.fieldName.toString().split(".")[0].replace(/__r/, '__c');
                                item.refField = field.fieldName.toString().split(".")[1];
                                item.refId = record[item.refObject];
                            }
                            ////
                            let fieldValue = '';
                            if (field.isReference && !field.isInputField && record.Id == undefined && changeMap.hasOwnProperty(index) && changeMap[index].hasOwnProperty(field.fieldName)) {
                                item.class = 'slds-cell-edit slds-is-edited slds-border_left';
                                fieldValue = changeMap[index][field.fieldName];
                            } else if (field.isReference && (!field.isInputField || readOnly)) {
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
                                if (record.Id != undefined && changeMap.hasOwnProperty(record.Id) && changeMap[record.Id].hasOwnProperty(field.fieldName)) {
                                    item.class = 'slds-cell-edit slds-is-edited slds-border_left';
                                    fieldValue = changeMap[record.Id][field.fieldName];
                                } else if (record.Id == undefined && changeMap.hasOwnProperty(index) && changeMap[index].hasOwnProperty(field.fieldName)) {
                                    item.class = 'slds-cell-edit slds-is-edited slds-border_left';
                                    fieldValue = changeMap[index][field.fieldName];
                                } else {
                                    fieldValue = record[field.fieldName];
                                }
                            }
                            item.isReference = field.stringFieldType == "REFERENCE";
                            if (item.isReference && !field.isInputField && record.Id == undefined && changeMap.hasOwnProperty(index) && changeMap[index].hasOwnProperty(field.fieldName)) {
                                item.class = 'slds-cell-edit slds-is-edited slds-border_left';
                                fieldValue = changeMap[index][field.fieldName];
                            } else if (item.isReference && (!field.isInputField || readOnly)) {
                                item.url = '/' + (fieldValue || '');
                                fieldValue = record;
                                let relatedfields = field.fieldName.toString().split(".");
                                for (let j = 0; j < relatedfields.length - 1; j++) {
                                    fieldValue = fieldValue[relatedfields[j]];
                                }
                                let refFieldName = '';
                                if (relatedfields[relatedfields.length - 1].endsWith('__c')) {
                                    refFieldName = relatedfields[relatedfields.length - 1].replace(/__c/, '__r');
                                } else if (relatedfields[relatedfields.length - 1].toLowerCase().endsWith('id')) {
                                    let lastID_occurence = relatedfields[relatedfields.length - 1].toLowerCase().lastIndexOf('id');
                                    refFieldName = relatedfields[relatedfields.length - 1].substring(0, lastID_occurence);
                                }
                                if (fieldValue && fieldValue[refFieldName] && fieldValue[refFieldName].Name) {
                                    fieldValue = fieldValue[refFieldName].Name;
                                } else {
                                    fieldValue = fieldValue ? fieldValue[relatedfields[relatedfields.length - 1]] : null;
                                }
                                /*if (fieldValue[relatedfields[relatedfields.length - 1].replace(/__c/, '__r')] && fieldValue[relatedfields[relatedfields.length - 1].replace(/__c/, '__r')].Name) {
                                    fieldValue = fieldValue[relatedfields[relatedfields.length - 1].replace(/__c/, '__r')].Name;
                                } else {
                                    fieldValue = fieldValue[relatedfields[relatedfields.length - 1]];
                                }*/
                            }
                            item.key = field.fieldName;
                            item.pickListValueMap = {};
                            item.pickListValues = field.pickListValues ? field.pickListValues.map(pick => {
                                item.pickListValueMap[pick.value] = pick.label;
                                return pick;
                            }) : [];
                            item.isInputField = (!readOnly && !field.internallyCalculated && field.isInputField) || (record.Id == undefined  && !resultWrapper.objectName.endsWith('__b') && !field.isCalculated && !field.fieldName.includes(".") && !field.internallyCalculated);
                            item.isPersonalised = field.isPersonalised;
                            item.isId = field.stringFieldType == 'ID';
                            item.isText = field.stringFieldType == 'STRING' || field.isText;
                            item.isTextArea = field.stringFieldType == 'TEXTAREA';
                            item.isBoolean = field.stringFieldType == 'BOOLEAN';
                            item.isDate = field.stringFieldType == 'DATE';
                            item.isDateTime = field.stringFieldType == 'DATETIME';
                            item.isMultiPicklist = field.stringFieldType == 'MULTIPICKLIST';
                            item.isPicklist = field.stringFieldType == 'PICKLIST';
                            item.isNumber = field.stringFieldType === 'DOUBLE' || field.stringFieldType === 'INTEGER' || field.stringFieldType === 'LONG' || field.stringFieldType === 'CURRENCY' || field.stringFieldType === 'PERCENT';
                            item.isCurrency = field.stringFieldType == 'CURRENCY';
                            item.isPercent = field.stringFieldType == 'PERCENT';
                            item.isUrl = field.stringFieldType == 'URL';
                            item.isHTMLFormatted = field.isHTMLFormatted;
                            item.isRichText = field.isRichText;
                            item.isOnlyNumber = item.isNumber && !item.isPercent && !item.isCurrency;
                            if (item.isNumber) {
                                item.scale = field.scale;
                                item.increment = incrementFormat(field.scale);
                            }
                            item.class = (item.isReference ? '' : 'limited-cell') + ' slds-border_left' + (item.isBoolean ? ' slds-text-align_center' : '');
                            // item.contentClass = item.isText || item.isTextArea || item.isReference ? 'slds-text-align_left' : 'slds-text-align_center';
                            item.value = fieldValue;
                            if (item.isId) {
                                item.url = '/' + (item.value || '');
                            }
                            if (item.isPicklist) {
                                if (!item.value) {
                                    item.value = '';
                                }
                                item.controllerName = field.controllerName;
                                item.controllerValue = record[item.controllerName] ? record[item.controllerName] : '';
                                let idRecord = record.Id ? record.Id : index;
                                if (changeMap[idRecord] && changeMap[idRecord][item.controllerName]) {
                                    item.controllerValue = changeMap[idRecord][item.controllerName];
                                }
                                newRecord.rowColor += field.picklistColorsMap && item.value != '' && field.picklistColorsMap.hasOwnProperty(item.value) && field.picklistColorsMap[item.value] != '' ? 'background-color: ' + field.picklistColorsMap[item.value] + ';' : '';
                                item.pickListValues.unshift({ label: self.Labels.LBL_None, value: '' });
                            }
                            if (item.isBoolean) {
                                item.value = (fieldValue + '').toLocaleLowerCase() == 'true';
                            }
                            let localeParts = this.locale.split('_');
                            this.locale = localeParts.length > 2 ? localeParts[0] + '_' + localeParts[0] : this.locale;
                            if (item.isDateTime) {
                                try {
                                    item.value = item.value != null && item.value != "" && !item.isInputField ? new Date(fieldValue).toLocaleDateString(this.locale.replace('_', '-')) + ' ' + new Date(fieldValue).toLocaleTimeString(this.locale.replace('_', '-')) : item.value;
                                } catch {
                                    item.value = item.value != null && item.value != "" && !item.isInputField ? new Date(fieldValue).getTime() : item.value;
                                }
                            }
                            if (item.isDate) {
                                try {
                                    item.value = item.value != null && item.value != "" && !item.isInputField ? new Date(fieldValue).toLocaleDateString(this.locale.replace('_', '-')) : item.value;
                                } catch {
                                    item.value = item.value != null && item.value != "" && !item.isInputField ? item.value : item.value;
                                }
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
                                    // item.value = fieldValue ? fieldValue.split(';').map(val => val.trim()).map(val => item.pickListValueMap[val]).join(', ') : '';
                                    item.value = fieldValue ? fieldValue.split(';').map(val => val.trim()).map(val => item.pickListValueMap[val]) : '';
                                }
                            }
                            /*if (field.isCalculated) {
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
                            }*/
                            item.SObjectName = field.SObjectName || '';
                            if (field.controllerFieldActions) {
                                let originalRecord = JSON.parse(JSON.stringify(record));
                                let recordd = changeMap[record.Id || index] || {};
                                originalRecord = Object.assign(originalRecord, JSON.parse(JSON.stringify(recordd)));
                                item.isDisabled = processControllerFields(this, originalRecord, field, false, null);
                            }
                            newRecord.fields.push(item);
                        }
                    });
                    // resultWrapper.dataMap[newRecord.Id] = newRecord;
                    newRecord.index = index;
                    if (newRecord.rowColor != '') {
                        newRecord.fields.forEach(field => {
                            if (!field.style.includes('background-color')) {
                                field.style += newRecord.rowColor;
                            }
                        });
                    } else if (this.numberFixedColumns != null && this.numberFixedColumns > 0) {
                        newRecord.fields.forEach(field => {
                            if (!field.style.includes('background-color')) {
                                field.style += 'background-color:white;';
                            }
                        });
                    }
                    if (!this.isBigObject && newRecord.Id != undefined) {
                        dataMap[newRecord.Id] = newRecord;
                    } else {
                        dataMap[index] = newRecord;
                    }
                    index++;
                    if (this.uploadedFileMap != {}) {
                        if (Object.values(this.uploadedFileMap).includes(newRecord.index.toString())) {
                            for (var key of Object.keys(this.uploadedFileMap)) {
                                if (this.uploadedFileMap[key] == newRecord.index.toString() && newRecord.Id != undefined) {
                                    this.uploadedFileMap[key] = newRecord.Id;
                                }
                            }
                        }
                    }
                });
            }
            if (this.uploadedFileMap != {}) {
                attachFileToRecords({ filesToRecordsSerialized: JSON.stringify(this.uploadedFileMap) }).then(() => {
                    this.uploadedFileMap = {};
                });
            }
            // resultWrapper.data = Object.values(resultWrapper.dataMap);
            if (!isCancel) {
                if (this.isBigObject) {
                    resultWrapper.dataMap = dataMap;
                    resultWrapper.data.push(...Object.values(dataMap));
                } else {
                    resultWrapper.dataMap = dataMap;
                    resultWrapper.data = Object.values(dataMap);
                }
            } else {
                setTimeout(() => {
                    if (this.isBigObject) {
                        resultWrapper.dataMap = dataMap;
                        resultWrapper.data.push(...Object.values(dataMap));
                    } else {
                        resultWrapper.dataMap = dataMap;
                        resultWrapper.data = Object.values(dataMap);
                    }
                }, 200);
            }
            resultWrapper.data.sort((a, b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));
            if (!isExport) {
                if (this.instance.validButHasWarrning) {
                    this.instance.warningMessages.forEach(item => toastWarning(self, item));
                }
                this.instance.tableLoading = false;
                this.instance.Loading = false;
            }
            this.instance.tableLoading = false;
            this.instance.Loading = false;
        }
    }
    loadMoreDataDelay(event) {
        if (this.isBigObject) {
            //console.log('table height>>> ' + event.target.querySelector('table').clientHeight);
            //console.log('target scroll to>>> ' + event.target.scrollTop);
            if (((event.target.querySelector('table').clientHeight - event.target.querySelector('table').clientHeight/10  < (event.target.scrollTop)))) {
                if (!this.bigObjectOldData.done && !this.instance.hasLoadMoreData) {
                    this.instance.hasLoadMoreData = true;
                    console.log('loading...');
                    this.bigObjectLoadMore();
                }
            }
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
    handleFileUploadChange(event) {
        if (event.detail.files) {
            this.selectedFile = event.detail.files[0];
            let newFileUrl = this.instance.resultWrapper.baseUrl + '/sfc/servlet.shepherd/document/download/' + this.selectedFile.documentId;
            this.currentUploadfileField.fieldValue = newFileUrl;
            let recordKey;
            //let recordKey = this.currentUploadfileRecord ? this.currentUploadfileRecord : this.currentUploadfileRecordIndex;
            if (this.currentUploadfileRecord) {
                recordKey = this.currentUploadfileRecord;
            } else {
                recordKey = this.currentUploadfileRecordIndex;
                this.uploadedFileMap[this.selectedFile.documentId] = recordKey;
            }
        } else {
            this.currentUploadfileField.fieldValue = event.target.value;
        }
    }
    handleSaveFileUpload() {
        let recordRow = this.currentUploadfileRecord ? this.currentUploadfileRecord : this.currentUploadfileRecordIndex;
        if (!this.instance.changesMap.hasOwnProperty(recordRow) || this.instance.changesMap[recordRow] == undefined) {
            this.instance.changesMap[recordRow] = {};
        }
        this.instance.changesMap[recordRow][this.currentUploadfileField.fieldName] = this.currentUploadfileField.fieldValue;
        this.instance.resultWrapper.data = this.instance.resultWrapper.data.filter(rec => {
            if (rec.Id == recordRow || rec.index == recordRow) {
                rec.fields = rec.fields.filter(f => {
                    if (f.key == this.currentUploadfileField.fieldName) {
                        f.value = this.currentUploadfileField.fieldValue;
                    }
                    return f;
                })
            }
            return rec;
        });
        this.handleToggleInputFilePopup();
    }
    handleDeleteInputFilePopup(event) {
        let currentUploadfileRecord = event.target.dataset.id;
        let currentUploadfileRecordIndex = event.target.dataset.rowIndex;
        let fieldName = event.target.dataset.fieldName;
        let recordRow = currentUploadfileRecord ? currentUploadfileRecord : currentUploadfileRecordIndex;
        if (!this.instance.changesMap.hasOwnProperty(recordRow) || this.instance.changesMap[recordRow] == undefined) {
            this.instance.changesMap[recordRow] = {};
        }
        this.instance.changesMap[recordRow][fieldName] = '';
        this.instance.resultWrapper.data = this.instance.resultWrapper.data.filter(rec => {
            if (rec.Id == recordRow || rec.index == recordRow) {
                rec.fields = rec.fields.filter(f => {
                    if (f.key == fieldName) {
                        f.value = '';
                    }
                    return f;
                })
            }
            return rec;
        });
    }
    handleToggleInputFilePopup(event) {
        this.instance.uploadFilePopup = !this.instance.uploadFilePopup
        if (this.instance.uploadFilePopup) {
            this.currentUploadfileRecord = event.target.dataset.id;
            if (!this.currentUploadfileRecord) {
                this.currentUploadfileRecordIndex = event.target.dataset.rowIndex;
            }
            this.currentUploadfileField.fieldName = event.target.dataset.fieldName;
            this.currentUploadfileField.fieldValue = event.target.dataset.fieldValue;
        } else {
            this.currentUploadfileField = {};
            this.currentUploadfileRecordIndex = '';
            this.currentUploadfileRecord = '';
            this.selectedFile = {};
        }
    }
    setSticky() {
        let fixedSticky = this.displayCloneButton ? 2 : 1;
        if (this.numberOfFixedColumns != null && this.numberOfFixedColumns > 0) {
            var headRows = this.template.querySelectorAll('.initial-table thead tr');
            let top = 0;
            for (let index = 0; headRows && index < headRows.length; index++) {
                let childrens = headRows[index].children;
                let left = 0;
                for (let index2 = 0; childrens && index2 < childrens.length; index2++) {
                    if (index2 < (this.numberOfFixedColumns + fixedSticky)) {
                        childrens[index2].style.zIndex = 5;
                        childrens[index2].style.left = left + 'px ';
                        left += childrens[index2].offsetWidth;
                    } else {
                        childrens[index2].style.zIndex = 4;
                        childrens[index2].style.left = 'unset';
                    }
                    childrens[index2].style.position = 'sticky';
                    childrens[index2].style.top = top + 'px';
                }
                //top += 28;
                top += headRows[index].offsetHeight;
            }
            var rows = this.template.querySelector('.initial-table') ? this.template.querySelector('.initial-table tbody').rows : [];
            for (let index = 0; rows && index < rows.length; index++) {
                let childrens = rows[index].children;
                let left = 0;
                for (let index2 = 0; childrens && index2 < childrens.length; index2++) {
                    if (index2 < (this.numberOfFixedColumns + fixedSticky)) {
                        childrens[index2].style.position = 'sticky';
                        childrens[index2].style.left = left + 'px';
                        childrens[index2].style.zIndex = 3;
                        left += childrens[index2].offsetWidth;
                        childrens[index2].classList.add('stickyTD');
                        childrens[index2].style.backgroundColor = childrens[index2].style.backgroundColor ? childrens[index2].style.backgroundColor : 'white';
                    } else {
                        childrens[index2].style.position = 'unset';
                        childrens[index2].style.left = 'unset';
                        childrens[index2].style.zIndex = 0;
                        childrens[index2].classList.remove('stickyTD');
                    }
                }
            }
        }
    }
    // //reset changes done to the table
    // reset() {
    //     this.draftValues = [];
    //     this.draftValuesMap = {};
    //     this.selectedRowsMap = {};
    //     this.selectedRows = [];
    //     this.errors = { rows: [] };
    //     this.Loading = true;
    //     setTimeout(() => {
    //         this.Loading = false;
    //     }, 50);
    // }
    changeSortDirection(event) {
        let sortedField = event.target.dataset.id;
        let sortDirection = event.target.dataset.sortDirection == 'true';
        if (sortDirection) {
            this.instance.resultWrapper.data.sort((a, b) => (a.record[sortedField] > b.record[sortedField]) ? 1 : ((b.record[sortedField] > a.record[sortedField]) ? -1 : 0));
        } else {
            this.instance.resultWrapper.data.sort((a, b) => (a.record[sortedField] < b.record[sortedField]) ? 1 : ((b.record[sortedField] < a.record[sortedField]) ? -1 : 0));
        }
        this.selectedGridFields.forEach(f => {
            if (f.fieldName == sortedField) {
                f.ascSortDirection = !sortDirection
            }
        });
    }
    checkBeforeMove() {
        if (this.instance.hasChanges) {
            alert('You Should Save Before you Moved');
            return false;
        }
        return true;
    }
    //open first page
    first() {
        if (this.checkBeforeMove()) {
            let newoffset = 0;
            if (this.instance.offset != newoffset) {
                this.instance.offset = newoffset;
                this.instance.tableLoading = true;
                this.refreshData();
            }
        }
    }
    //open previous page
    previous() {
        if (this.checkBeforeMove()) {
            let pageSize = parseInt(this.instance.pageSize);
            let newoffset = this.instance.offset - pageSize >= 0 ? this.instance.offset - pageSize : this.instance.offset;
            if (this.instance.offset != newoffset) {
                this.instance.offset = newoffset;
                this.instance.tableLoading = true;
                this.refreshData();
            }
        }
    }
    //open next page
    next() {
        if (this.checkBeforeMove()) {
            let pageSize = parseInt(this.instance.pageSize);
            let newoffset = this.instance.offset + pageSize < this.instance.resultWrapper.total ? this.instance.offset + pageSize : this.instance.offset;
            if (this.instance.offset != newoffset) {
                this.instance.offset = newoffset;
                this.instance.tableLoading = true;
                this.refreshData();
            }
        }
    }
    //open last page
    last() {
        if (this.checkBeforeMove()) {
            let pageSize = parseInt(this.instance.pageSize);
            let newoffset = (Math.floor(this.instance.resultWrapper.total / pageSize) == (this.instance.resultWrapper.total / pageSize) ? Math.floor(this.instance.resultWrapper.total / pageSize) - 1 : Math.floor(this.instance.resultWrapper.total / pageSize)) * pageSize;
            if (this.instance.offset != newoffset) {
                this.instance.offset = newoffset;
                this.instance.tableLoading = true;
                this.refreshData();
            }
        }
    }
    showHideColumns() {
        this.instance.showHideColumns = !this.instance.showHideColumns;
    }
    handleChangeSelectedFields(event) {
        this.selectedFields = event.detail.value;
    }
    confirmSelectionFields() {
        this.selectedGridFields = [];
        this.selectedGridFieldsMap = {};
        this.instance.selectedFields = [];
        for (let field of this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS) {
            if (this.selectedFields.includes(field.fieldName)) {
                this.selectedGridFields.push(field);
                this.selectedGridFieldsMap[field.fieldName] = field;
                this.instance.selectedFields.push(field.fieldName);
            }
        }
        if (this.recordId) {
            localStorage.setItem(this.templateName, JSON.stringify(this.selectedGridFields));
        }
        this.instance.showHideColumns = !this.instance.showHideColumns;
        this.refreshView(false);
    }
    get fieldOptions() {
        let options = [];
        for (let field of this.instance.resultWrapper.gridSettingsManager.GRID_FIELDS) {
            if (!field.isHidden) {
                options.push({ value: field.fieldName, label: field.fieldLabel });
            }
        }
        return options;
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