/* eslint-disable no-unused-expressions */
/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable no-loop-func */
/* eslint-disable vars-on-top */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-empty */
/* eslint-disable guard-for-in */
import { LightningElement, track, api, wire } from 'lwc';
import getAllReports from '@salesforce/apex/ReportShortcutCmpController.getAllReports';
import hasPermissionsModifyMetadata from '@salesforce/apex/ReportShortcutCmpController.hasPermissionsModifyMetadata';
import getReportFieldsLabelMap from '@salesforce/apex/ReportShortcutCmpController.getReportFieldsLabelMap';
import searchReports from '@salesforce/apex/ReportShortcutCmpController.searchReports';
import cloneReport from '@salesforce/apex/ReportShortcutCmpController.cloneReport';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import LBL_MyReports from "@salesforce/label/c.LBL_MyReports";
import LBL_Create from "@salesforce/label/c.LBL_Create";
import LBL_Cancel from "@salesforce/label/c.LBL_Cancel";
import LBL_Next from "@salesforce/label/c.LBL_Next";
import LBL_Standard_Reports from "@salesforce/label/c.LBL_Standard_Reports";
import LBL_All_Reports from "@salesforce/label/c.LBL_All_Reports";
import LBL_Search from "@salesforce/label/c.LBL_Search";
import LBL_Error_Loading_List from "@salesforce/label/c.LBL_Error_Loading_List";
import LBL_Error_Cloning from "@salesforce/label/c.LBL_Error_Cloning";
import LBL_Error from "@salesforce/label/c.LBL_Error";
import LBL_choose_a_template from "@salesforce/label/c.LBL_choose_a_template";

export default class reportShortcut extends NavigationMixin(LightningElement) {
    @track reportNameLabel;
    @track reportDescriptionLabel;
    @track reportFolderNameLabel;
    @track reports;
    @track allReports;
    @track error;
    @track open = false;
    @track btnNext = true;
    @track allCheck = false;
    @track stCheck = true;
    @track searchText;
    ReportTempCurrent;
    Selected = false;
    idRep = null;
    permission = false;
    @track Loading = true;
    @track Loading2 = true;
    @track Loading3 = false;
    @api BackColor;
    @api TextColor;
    @api StandardFolderName;
    @api CloneFolderName;
    LBL_MyReports = LBL_MyReports;
    LBL_Create = LBL_Create;
    LBL_Cancel = LBL_Cancel;
    LBL_Next = LBL_Next;
    LBL_Standard_Reports = LBL_Standard_Reports;
    LBL_All_Reports = LBL_All_Reports;
    LBL_Search = LBL_Search;
    LBL_Error_Loading_List = LBL_Error_Loading_List;
    LBL_Error_Cloning = LBL_Error_Cloning;
    LBL_Error = LBL_Error;
    LBL_choose_a_template = LBL_choose_a_template;
    @wire(getReportFieldsLabelMap) getReportFieldsLabelMap({ error, data }) {
        if (data) {
            this.reportNameLabel = data.Name;
            this.reportDescriptionLabel = data.Description;
            this.reportFolderNameLabel = data.FolderName;
        } else {
            this.toastError(LBL_Error, error);
        }
    }
    get mainTableInlineCss() {
        let style = '';
        if (this.BackColor) {
            style = style + "background-color:" + this.BackColor + ";";
        }
        if (this.TextColor) {
            style = style + "color:" + this.TextColor + ";";
        }
        return style;
    }
    get textColorInlineCss() {
        let style = '';
        if (this.TextColor) {
            style = style + "color: " + this.TextColor + ";";
        }
        return style;
    }
    get textColorHeaderInlineCss() {
        let style = 'position: sticky;top: 0px;z-index: 2;';

        if (this.TextColor) {
            style = style + "color: " + this.TextColor + ";";
        }
        return style;
    }

    connectedCallback() {
        this.loadReportsByUserId();
        this.loadAllStandardReports();
    }

    loadReportsByUserId() {
        getAllReports({ currentUser: true, hasAccessFolder: false, folderDevName: null })
            .then(result => {
                var self = this;
                setTimeout(() => {
                    self.reports = [];
                    let i = 0;
                    for (i in result) {
                        let row = { Id: result[i].Id, Name: result[i].Name, FolderName: result[i].FolderName, url: "/" + result[i].Id, Description: result[i].Description };
                        self.reports.push(row);
                    }
                    self.Loading = false;
                }, 500);
            })
            .catch(error => {
                this.error = error;
            });
    }

    loadAllStandardReports() {
        getAllReports({ currentUser: false, hasAccessFolder: false, folderDevName: this.StandardFolderName })
            .then(result => {
                var self = this;
                setTimeout(() => {
                    self.allReports = self.mapGroup(result);
                    self.Loading2 = false;
                }, 500);
            });
    }

    loadAllReports() {
        getAllReports({ currentUser: false, hasAccessFolder: true, folderDevName: null })
            .then(result => {
                var self = this;
                setTimeout(() => {
                    self.allReports = self.mapGroup(result);
                    self.Loading2 = false;
                }, 500);
            });
    }

    mapGroup(result) {
        var map = {};
        for (var index = 0; index < result.length; index++) {
            map[
                result[index].FolderName
            ] = result.filter(function (item) {
                return result[index].FolderName == item.FolderName;
            });
        }
        var listofGroupedReports = [];
        for (var key in map) {
            var row = { FolderName: key, list: map[key] };
            listofGroupedReports.push(row);
        }
        return listofGroupedReports;
    }

    createReport() {
        this.loadAllStandardReports();
        this.open = true;
        this.btnNext = true;
    }

    close() {
        this.open = false;
        this.btnNext = true;
    }

    create() {
        let id;
        let self = this;
        self.btnNext = false;
        hasPermissionsModifyMetadata().then(result => {
            if (result) {
                console.log('>>> id report '+this.idRep);
                cloneReport({ reportId: this.idRep, folderDevName: this.CloneFolderName })
                    .then(resultClone => {
                        id = resultClone;
                        self.open = false;
                        self[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: id,
                                objectApiName: 'Report',
                                actionName: 'edit'
                            },
                        });
                        self.allCheck = false;
                        self.stCheck = true;
                    })
                    .catch(error => {
                        self.toastError(LBL_Error, error.body.message);
                        self.open = false;
                        self.allCheck = false;
                        self.stCheck = true;
                    });
            } else if (!result) {
                id = self.idRep;
                self[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: id,
                        objectApiName: 'Report',
                        actionName: 'view'
                    },
                });
            }
        });
    }

    chooseTemplate(event) {
        this.btnNext = false;
        this.idRep = event.currentTarget.dataset.recordid;
        if (this.Selected) {
            this.ReportTempCurrent.style.background = event.currentTarget.style.background;
        }
        event.currentTarget.style.background = "lightBlue";
        this.ReportTempCurrent = event.currentTarget;
        this.Selected = true;
    }

    handleSearchTermChange(event) {
        let val = event.detail.value;
        if (this.allCheck) {
            searchReports({ searchTerm: val, standard: false, folderDevName: null })
                .then(result => {
                    this.allReports = this.mapGroup(result);
                });
        } else if (this.stCheck) {
            searchReports({ searchTerm: val, standard: true, folderDevName: this.StandardFolderName })
                .then(result => {
                    this.allReports = this.mapGroup(result);
                });
        }
    }

    onclickAll() {
        this.stCheck = false;
        this.allCheck = true;
        this.Loading2 = true;
        this.searchText = "";
        this.btnNext = true;
        this.allReports = [];
        this.loadAllReports();
    }

    onclickStdrd() {
        this.allCheck = false;
        this.stCheck = true;
        this.Loading2 = true;
        this.searchText = "";
        this.btnNext = true;
        this.allReports = [];
        this.loadAllStandardReports();
    }

    refreshTable() {
        this.Loading = true;
        this.loadReportsByUserId();
    }

    toastError(title, msg) {
        const evt = new ShowToastEvent({
            title: title,
            message: msg,
            variant: "error",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }

    toastSuccess(title, msg) {
        const evt = new ShowToastEvent({
            title: title,
            message: msg,
            variant: "success",
            mode: "dismissable"
        });
        this.dispatchEvent(evt);
    }
}