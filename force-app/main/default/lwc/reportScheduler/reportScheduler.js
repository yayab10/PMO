/* eslint-disable no-alert */
import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
// labels
import LBL_Report_Scheduler from '@salesforce/label/c.LBL_Report_Scheduler';
import LBL_Choose_Folder from '@salesforce/label/c.LBL_Choose_Folder';
import LBL_Choose_Report from '@salesforce/label/c.LBL_Choose_Report';
import LBL_Run_Schedule from '@salesforce/label/c.LBL_Run_Schedule';
import LBL_Run_Schedule_Description from '@salesforce/label/c.LBL_Run_Schedule_Description';
import LBL_Frequency from '@salesforce/label/c.LBL_Frequency';
import LBL_Time from '@salesforce/label/c.LBL_Time';
import LBL_Daily from '@salesforce/label/c.LBL_Daily';
import LBL_Weekly from '@salesforce/label/c.LBL_Weekly';
import LBL_Monthly from '@salesforce/label/c.LBL_Monthly';
import LBL_Everyday from '@salesforce/label/c.LBL_Everyday';
import LBL_Every from '@salesforce/label/c.LBL_Every';
import LBL_Starting_On from '@salesforce/label/c.LBL_Starting_On';
import LBL_Schedule from '@salesforce/label/c.LBL_Schedule';
import LBL_On_Day from '@salesforce/label/c.LBL_On_Day';
import LBL_On_The from '@salesforce/label/c.LBL_On_The';
import LBL_First_Abbr from '@salesforce/label/c.LBL_First_Abbr';
import LBL_Second_Abbr from '@salesforce/label/c.LBL_Second_Abbr';
import LBL_Third_Abbr from '@salesforce/label/c.LBL_Third_Abbr';
import LBL_Fourth_Abbr from '@salesforce/label/c.LBL_Fourth_Abbr';
import LBL_Fifth_Abbr from '@salesforce/label/c.LBL_Fifth_Abbr';
import LBL_Of_Every from '@salesforce/label/c.LBL_Of_Every';
import LBL_Month from '@salesforce/label/c.LBL_Month';
import Monday from '@salesforce/label/c.Monday';
import Tuesday from '@salesforce/label/c.Tuesday';
import Wednesday from '@salesforce/label/c.Wednesday';
import Thursday from '@salesforce/label/c.Thursday';
import Friday from '@salesforce/label/c.Friday';
import Saturday from '@salesforce/label/c.Saturday';
import Sunday from '@salesforce/label/c.Sunday';
import LBL_Scheduled_Jobs from '@salesforce/label/c.LBL_Scheduled_Jobs';
import LBL_Logs from '@salesforce/label/c.LBL_Logs';
import LBL_Reports from '@salesforce/label/c.LBL_Reports';
import LBL_Abort from '@salesforce/label/c.LBL_Abort';
import MSG_Success from '@salesforce/label/c.MSG_Success';
import MSG_Report_Successfully_Scheduled from '@salesforce/label/c.MSG_Report_Successfully_Scheduled';
import MSG_Job_Aborted from '@salesforce/label/c.MSG_Job_Aborted';
import MSG_Error_Occurred from '@salesforce/label/c.MSG_Error_Occurred';
import MSG_Select_Days_Of_The_Week from '@salesforce/label/c.MSG_Select_Days_Of_The_Week';
import MSG_Select_Group_Or_Email from '@salesforce/label/c.MSG_Select_Group_Or_Email';
import LBL_Section from '@salesforce/label/c.LBL_Section';
import LBL_Schedule_Execution from '@salesforce/label/c.LBL_Schedule_Execution';
import LBL_Recipients from '@salesforce/label/c.LBL_Recipients';
import LBL_Filter from '@salesforce/label/c.LBL_Filter';
import LBL_Scheduler_Type from '@salesforce/label/c.LBL_Scheduler_Type';
import LBL_CronExpression from '@salesforce/label/c.LBL_CronExpression';
import LBL_Using_CronExpression from '@salesforce/label/c.LBL_Using_CronExpression';
import LBL_Without_CronExpression from '@salesforce/label/c.LBL_Without_CronExpression';
import LBL_Email_Subject from '@salesforce/label/c.LBL_Email_Subject';
import LBL_Email_Body from '@salesforce/label/c.LBL_Email_Body';
import LBL_Additionals_Emails from '@salesforce/label/c.LBL_Additionals_Emails';
import LBL_Group_User from '@salesforce/label/c.LBL_Group_User';
import LBL_Next_Run from '@salesforce/label/c.LBL_Next_Run';
// schema objects
import LOGOBJ from '@salesforce/schema/Log__c';
import ASSBUOBJ from '@salesforce/schema/Assortment_BU__c';
// schema objects fields
import CompletedDate__c from '@salesforce/schema/Log__c.CompletedDate__c';
import Status__c from '@salesforce/schema/Log__c.Status__c';
import TraceLog__c from '@salesforce/schema/Log__c.TraceLog__c';
import BU_source__c from '@salesforce/schema/Assortment_BU__c.BU_source__c';
import BU_Target__c from '@salesforce/schema/Assortment_BU__c.BU_Target__c';
import Orga_HE__c from '@salesforce/schema/Assortment_BU__c.Orga_HE__c';
import Year__c from '@salesforce/schema/Assortment_BU__c.Year__c';
import Format_Origin__c from '@salesforce/schema/Orga_BU__c.Format_Origin__c';
import Path__c from '@salesforce/schema/Orga_HE__c.Path__c';

// apex methods
import getFieldLabel from '@salesforce/apex/ReportSchedulerCmpController.getFieldLabel';
import getReportsFoldersNames from '@salesforce/apex/ReportSchedulerCmpController.getReportsFoldersNames';
import getReportsByFolderName from '@salesforce/apex/ReportSchedulerCmpController.getReportsByFolderName';
import scheduleExportReport from '@salesforce/apex/ReportSchedulerCmpController.scheduleExportReport';
import getCronTriggers from '@salesforce/apex/ReportSchedulerCmpController.getCronTriggers';
import abortCronTrigger from '@salesforce/apex/ReportSchedulerCmpController.abortCronTrigger';
import getLogs from '@salesforce/apex/ReportSchedulerCmpController.getLogs';
import isAdminProfile from '@salesforce/apex/ReportSchedulerCmpController.isAdminProfile';
import getAllUserGroup from '@salesforce/apex/ReportSchedulerCmpController.getAllUserGroup';
import getBannersWithMasterBu from '@salesforce/apex/ReportViewerCmpController.getBannersWithMasterBu';
import getAllCategoriesLevel1 from '@salesforce/apex/ReportViewerCmpController.getAllCategoriesLevel1';
import getAllBuTargets from '@salesforce/apex/ReportViewerCmpController.getAllBuTargets';
import getEmailSubject from '@salesforce/apex/ReportSchedulerCmpController.getEmailSubject';
////import getPackagePrefix from "@salesforce/apex/NegoptimHelper.getPackagePrefix";
export default class ReportScheduler extends LightningElement {

    @api folderId;
    @track folderName = LBL_Report_Scheduler;
    normalizedApiFields = {
        CompletedDate__c: CompletedDate__c.fieldApiName,
        Status__c: Status__c.fieldApiName,
        TraceLog__c: TraceLog__c.fieldApiName,
        BU_source__c: BU_source__c.fieldApiName,
        BU_Target__c: BU_Target__c.fieldApiName,
        Orga_HE__c: Orga_HE__c.fieldApiName,
        Year__c: Year__c.fieldApiName,
        Format_Origin__c: Format_Origin__c.fieldApiName,
        Path__c: Path__c.fieldApiName,
    }
    ////@track prefixValue = '';
    // labels from custom labels and fields
    @track labels = {
        LBL_Report_Scheduler, LBL_Choose_Folder, LBL_Choose_Report, LBL_Run_Schedule,
        LBL_Run_Schedule_Description, LBL_Frequency, LBL_Time, LBL_Daily, LBL_Weekly, LBL_Monthly,
        LBL_Everyday, LBL_Every, LBL_Starting_On, LBL_Schedule, LBL_Scheduled_Jobs, LBL_On_Day, LBL_On_The,
        LBL_First_Abbr, LBL_Second_Abbr, LBL_Third_Abbr, LBL_Fourth_Abbr, LBL_Fifth_Abbr, LBL_Of_Every, LBL_Month, LBL_Logs,
        LBL_Reports, LBL_Abort, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday,
        MSG_Success, MSG_Report_Successfully_Scheduled, MSG_Job_Aborted, MSG_Error_Occurred, MSG_Select_Days_Of_The_Week,
        MSG_Select_Group_Or_Email, LBL_Section, LBL_Schedule_Execution, LBL_Recipients, LBL_Filter, LBL_Scheduler_Type,
        LBL_CronExpression, LBL_Using_CronExpression, LBL_Without_CronExpression, LBL_Email_Body,
        LBL_Additionals_Emails, LBL_Group_User, LBL_Email_Subject, LBL_Next_Run,
        CronTrigger: {}, Log__c: {}, Assortment_BU__c: {}
    };
    // get labels for CronTrigger fields
    @wire(getFieldLabel, { objectName: 'CronTrigger' })
    setCronTriggerLabels({ error, data }) {
        if (data) {
            let cronTriggerLabels = {
                'CronJobDetail': data.cronjobdetailid,
                'PreviousFireTime': data.previousfiretime,
                'NextFireTime': data.nextfiretime,
                'State': data.state,
                'TimesTriggered': data.timestriggered,
                'CreatedById': data.createdbyid
            };
            this.labels.CronTrigger = cronTriggerLabels;
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }
    // get labels for Log__c fields
    @wire(getObjectInfo, { objectApiName: LOGOBJ })
    setLogLabels({ data, error }) {
        if (data) {
            let logLabels = {
                'Name': data.label,
                'CompletedDate__c': data.fields[this.normalizedApiFields.CompletedDate__c].label,
                'Status__c': data.fields[this.normalizedApiFields.Status__c].label,
                'TraceLog__c': data.fields[this.normalizedApiFields.TraceLog__c].label,
                'CreatedById': data.fields.CreatedById.label
            }
            this.labels.Log__c = logLabels;
        }
        if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }
    // get labels for Assormtent_BU__c fields
    @wire(getObjectInfo, { objectApiName: ASSBUOBJ })
    getAssortmentBULabels({ data, error }) {
        if (data) {
            let assortmentBULabels = {
                'BU_source__c': data.fields[this.normalizedApiFields.BU_source__c].label,
                'BU_Target__c': data.fields[this.normalizedApiFields.BU_Target__c].label,
                'Orga_HE__c': data.fields[this.normalizedApiFields.Orga_HE__c].label,
                'Year__c': data.fields[this.normalizedApiFields.Year__c].label,
            };
            this.labels.Assortment_BU__c = assortmentBULabels;
        }
        if (error) {
            this.handleToastMessage(MSG_Error_Occurred, this.handleErrorType(error), 'error');
        }
    }
    @track reportsOptions;
    @track selectedReportId;
    @track cronTriggersData = [];
    @track logsData = [];
    // scheduler form
    @track schedulerTypeOptions = [
        { label: LBL_Using_CronExpression, value: '1' },
        { label: LBL_Without_CronExpression, value: '0' }
    ];
    @track schedulerTypeCron = true;
    @track cronExpr;
    @track cronExpressionHelpText;
    // cron expression form
    @track frequenciesOptions = [
        { value: 'daily', label: LBL_Daily },
        { value: 'weekly', label: LBL_Weekly },
        { value: 'monthly', label: LBL_Monthly }
    ];
    @track selectedFrequency = 'daily';
    @track scheduleStartTime = '00:00:00.000';
    @track isDaily = true;
    @track isWeekly = false;
    @track isMonthly = false;
    // daily attributes
    @track isEverydaySelected = true;
    @track numberOfDays = '';
    @track daysOfTheWeekOptions = [
        { value: '1', label: Sunday },
        { value: '2', label: Monday },
        { value: '3', label: Tuesday },
        { value: '4', label: Wednesday },
        { value: '5', label: Thursday },
        { value: '6', label: Friday },
        { value: '7', label: Saturday }
    ];
    @track selectedDayOfTheWeek = '';
    // weekly attributes
    @track selectedDaysOfTheWeek = '';
    // monthly attributes
    @track monthlyOption1 = true;
    @track monthlyOption2 = false;
    get dayOfTheMonthOptions() {
        var dayOfTheMonthOptions = [];
        for (let index = 1; index <= 31; index++) {
            dayOfTheMonthOptions.push({ value: index.toString(), label: index.toString() });
        }
        return dayOfTheMonthOptions;
    }
    @track selectedDayOfTheMonth = '1';
    @track numberOfMonths = 1;
    @track sequenceOptions = [
        { value: '1', label: LBL_First_Abbr },
        { value: '2', label: LBL_Second_Abbr },
        { value: '3', label: LBL_Third_Abbr },
        { value: '4', label: LBL_Fourth_Abbr },
        { value: '5', label: LBL_Fifth_Abbr }
    ];
    @track selectedSequence = '1';
    @track selectedSequenceType = '1';
    @track showLogsTab = false;

    @track userGroupOptions;
    @track selectedUserGroup;
    @track additionalEmails;
    @track buSourceOptions;
    @track buTargetList;
    @track selectedBuSource;
    @track selectedBuTarget;
    @track categoriesOptions;
    @track selectedCategory;
    @track selectedYear;
    @track buTargetDisabled = true;

    @track reportName;
    @track emailSubject;
    @track emailBody;
    @track countAdditionalMail = 0;
    @track additionnalEmaillist = [{ key: this.countAdditionalMail++, value: '' }];
    ////@wire(getPackagePrefix, { includeUnderscore: true }) prefix;
    @wire(getReportsFoldersNames)
    getFolderNames({ error, data }) {
        if (data) {
            this.folderMap = new Map();
            for (let i = 0; i < data.length; i++) {
                this.folderMap.set(data[i].DeveloperName, data[i].Name);
            }
            if (this.folderId !== undefined && this.folderId !== null && this.folderId !== '') {
                this.getReportsByFolderName();
            }
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    getReportsByFolderName() {
        getReportsByFolderName({ folderName: this.folderMap.get(this.folderId) })
            .then(data => {
                if (data.length > 0) {
                    this.reportsOptions = [];
                    this.reportsMap = new Map();
                    for (let i = 0; i < data.length; i++) {
                        this.reportsOptions.push({ label: data[i].Name, value: data[i].Id });
                        this.reportsMap.set(data[i].Id, data[i].Name);
                    }
                    this.selectedReportId = this.reportsOptions[0].value;
                    this.folderName += ' - ' + this.folderMap.get(this.folderId);
                    this.reportName = this.reportsMap.get(this.selectedReportId);
                }
            })
            .catch(error => {
                this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
            });

        isAdminProfile()
            .then(result => {
                if (result) {
                    this.showLogsTab = true;
                }
            })
            .catch(error => {
                this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
            });
    }

    @wire(getCronTriggers)
    setCronTriggersList(provisionedValue) {
        this.getCronTriggersData = provisionedValue;
        const { data, error } = provisionedValue;
        if (data) {
            this.cronTriggersData = [];
            for (let i = 0; i < data.length; i++) {
                let clone = Object.assign({}, data[i]);
                clone.index = i + 1;
                clone.reportName = clone.cronJobDetailName.replace(/[^-]*-[^-]*-/g, '');
                this.cronTriggersData.push(clone);
            }
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    @wire(getLogs)
    setLogsList(provisionedValue) {
        this.getLogsData = provisionedValue;
        const { data, error } = provisionedValue;
        if (data) {
            this.logsData = [];
            for (let i = 0; i < data.length; i++) {
                let clone = Object.assign({}, data[i]);
                clone.index = i + 1;
                let traceLogValue = '' + data[i].TraceLog;
                traceLogValue = traceLogValue.replace(/<[^>]+>/g, '');
                let match = traceLogValue.match(new RegExp('(Groupe Name:)\\s*(.*)},', 'g'));
                clone.TraceLog = match !== null ? match[0] : '';
                clone.Report = data[i].MethodName;
                clone.link = "/" + data[i].Id;
                this.logsData.push(clone);
            }
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    @wire(getAllUserGroup)
    setUserGroupOptions({ error, data }) {
        this.userGroupOptions = [];
        if (data) {
            for (let i = 0; i < data.length; i++) {
                this.userGroupOptions.push({ label: data[i].Name, value: data[i].Id });
            }
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    @wire(getBannersWithMasterBu)
    setBUSourceOptions({ error, data }) {
        this.buSourceOptions = [];
        if (data) {
            for (let i = 0; i < data.length; i++) {
                this.buSourceOptions.push({
                    label: data[i].Name, value: data[i].Id, formatOrigin: data[i][this.normalizedApiFields.Format_Origin__c]
                });
            }
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    @wire(getAllCategoriesLevel1)
    setCategoriesOptions({ error, data }) {
        this.categoriesOptions = [];
        if (data) {
            for (let i = 0; i < data.length; i++) {
                this.categoriesOptions.push({
                    label: data[i].Name, value: data[i][this.normalizedApiFields.Path__c]
                });
            }
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }
    @wire(isAdminProfile)
    setShowLogsTab({ error, data }) {
        this.showLogsTab = data;
        if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    @wire(getEmailSubject, { reportName: '$reportName' })
    wiredInitData({ error, data }) {
        if (data) {
            this.emailSubject = data;
        } else if (error) {
            this.error = error;
        }
    }

    connectedCallback() {
        this.buildCronDefaultValue();
        /*getPackagePrefix({ includeUnderscore: true }).then(prefix => {
            this.prefixValue = prefix ? prefix : '';
        }).catch(error => {
            this.handleToastMessage('Error', error.body.message, 'error');
        });*/
    }

    renderedCallback() {
        //it's used to override the slds of icon :
        const style = document.createElement("style");
        style.innerText = "c-report-scheduler .slds-button__icon.deleteIcon{fill: red;}";
        this.template.querySelector("lightning-button-icon").appendChild(style);
        ////this.template.querySelector("lightning-button-icon").blur();
    }

    buildCronDefaultValue() {
        // set default cron expression
        let dt = new Date();
        dt.setMinutes(dt.getMinutes() + 5);
        let dateSplited = dt.toString().split(' ');
        let year = dateSplited[3];
        let month = dateSplited[1];
        let dayOfTheMonth = dateSplited[2];
        let hour = dateSplited[4].split(':')[0];
        let min = dateSplited[4].split(':')[1];
        if (dayOfTheMonth.startsWith('0')) {
            dayOfTheMonth = dayOfTheMonth.substring(1);
        }
        if (min.startsWith('0')) {
            min = min.substring(1);
        }
        if (hour.startsWith('0')) {
            hour = hour.substring(1);
        }
        this.cronExpressionHelpText = this.labels.LBL_Next_Run + hour + ':' + min;
        this.cronExpr = '0 ' + min + ' ' + hour + ' ' + dayOfTheMonth + ' ' + month + ' ? ' + year;
    }

    changeScheduleStartTime(evt) {
        this.scheduleStartTime = evt.target.value;
    }

    changeFrequency(evt) {
        this.selectedFrequency = evt.target.value;
        this.isDaily = this.selectedFrequency === 'daily';
        this.isWeekly = this.selectedFrequency === 'weekly';
        this.isMonthly = this.selectedFrequency === 'monthly';
    }

    toggleIsEverydaySelected() {
        this.isEverydaySelected = !this.isEverydaySelected;
        if (this.isEverydaySelected) {
            this.numberOfDays = '';
            this.selectedDayOfTheWeek = '';
        } else {
            this.numberOfDays = 1;
            this.selectedDayOfTheWeek = '1';
        }
    }

    changeNumberOfDays(evt) {
        this.numberOfDays = evt.target.value;
    }

    changeDaysOfTheWeek(evt) {
        this.selectedDayOfTheWeek = evt.target.value;
    }

    changeWeeklyValue(evt) {
        this.selectedDaysOfTheWeek = evt.detail.value;
    }

    switchMonthlyOption() {
        this.monthlyOption1 = !this.monthlyOption1;
        this.monthlyOption2 = !this.monthlyOption2;
    }

    changeDayOfMonth(evt) {
        this.selectedDayOfTheMonth = evt.target.value;
    }

    changeNumberOfMonths(evt) {
        this.numberOfMonths = evt.target.value;
    }

    changeSequence(evt) {
        this.selectedSequence = evt.target.value;
    }

    changeSequenceType(evt) {
        this.selectedSequenceType = evt.target.value;
    }

    changeSchedulerType(evt) {
        this.schedulerTypeCron = evt.detail.value === '1';
        if (this.schedulerTypeCron)
            this.buildCronDefaultValue();
    }

    changeSelectedReport(evt) {
        this.selectedReportId = evt.target.value;
    }

    changeGroup(evt) {
        this.selectedUserGroup = evt.detail.value;
    }

    changeCronExpr(evt) {
        this.cronExpr = evt.target.value;
    }

    changeEmail(evt) {
        let additionaEmailValue = evt.target.value;
        additionaEmailValue = additionaEmailValue.replace(/\s/g, '').replace(/\n/g, '');
        let index = evt.target.dataset.index;
        this.additionnalEmaillist[index].value = additionaEmailValue;
    }

    changeBuSource(evt) {
        this.selectedBuSource = evt.target.value;
        this.selectedBuSourceName = evt.target.options.find(opt => opt.value === evt.detail.value).label;
        this.buTargetList = [];
        if (typeof this.selectedBuSource !== 'undefined') {
            let formatOrigin;
            this.buTargetDisabled = false;
            for (let i = 0; i < this.buSourceOptions.length; i++) {
                if (this.buSourceOptions[i].value === this.selectedBuSource) {
                    formatOrigin = this.buSourceOptions[i].formatOrigin;
                    break;
                }
            }
            getAllBuTargets({ formatOriginVal: formatOrigin })
                .then(results => {
                    for (let i = 0; i < results.length; i++) {
                        this.buTargetList.push(results[i]);
                    }
                }
                )
                .catch(error => {
                    this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
                });
        }
    }

    get buTargetOptions() {
        let buTargetOptions = [];
        if (typeof this.buTargetList !== 'undefined') {
            for (let i = 0; i < this.buTargetList.length; i++) {
                buTargetOptions.push({ label: this.buTargetList[i].Name, value: this.buTargetList[i].Id });
            }
        }
        return buTargetOptions;
    }

    changeBuTarget(evt) {
        this.selectedBuTarget = evt.target.value;
        this.selectedBuTargetName = evt.target.options.find(opt => opt.value === evt.detail.value).label;
    }

    changeCategory(evt) {
        this.selectedCategory = evt.target.value;
    }

    changeYear(evt) {
        this.selectedYear = evt.target.value;
    }

    //to handle add multiple input mail text area
    addNewEmailInput() {
        this.additionnalEmaillist.push({ key: this.countAdditionalMail++, value: '' });
    }

    //to handle delete email input:
    deleteEmailInput(evt) {
        let index = evt.target.dataset.index;
        this.additionnalEmaillist.splice(index, 1);
    }

    //to handle email subject change:
    changeEmailSubject(evt) {
        this.emailSubject = evt.target.value;
    }

    changeEmailBody(evt) {
        this.emailBody = evt.detail.value;
    }

    //to call email send method:
    scheduleExportReport() {
        //used for filter expression:
        let filterExpression = '';

        //to handle additional emails value:

        let additionalEmails = [];
        this.additionnalEmaillist.forEach(item => {
            if (item.value) additionalEmails.push(item.value);
        });
        //handle required fields:
        if (this.selectedReportId === undefined || this.selectedReportId === null || this.selectedReportId === '') {
            this.handleToastMessage(MSG_Error_Occurred, LBL_Choose_Report, 'error');
            return;
        } else if ((this.selectedUserGroup === undefined || this.selectedUserGroup === null || this.selectedUserGroup === '')
            && (!additionalEmails || (additionalEmails && additionalEmails.length === 0))) {
            this.handleToastMessage(MSG_Error_Occurred, MSG_Select_Group_Or_Email, 'error');
            return;
        }
        //handling filter exxpression:
        filterExpression = '?fv0=' + this.selectedBuSourceName + '&fv1=' + this.selectedBuTargetName + '&fv2=' + this.selectedCategory + '&fv3=' + this.selectedYear;
        filterExpression = filterExpression.replace(/&(fv\d+=undefined)|\?(fv\d+=undefined)|&(fv\d+=Null)|\?(fv\d+=Null)/g, '');
        if (this.selectedYear === "") {
            filterExpression = filterExpression.replace('fv3=', '');
            filterExpression = filterExpression.replace('&fv3=', '');
        }
        if (this.selectedBuSourceName === '') {
            filterExpression = filterExpression.replace('?fv0=', '');
            filterExpression = filterExpression.replace('&fv0=', '');
        }
        if (this.selectedBuTargetName === "") {
            filterExpression = filterExpression.replace('?fv1=', '');
            filterExpression = filterExpression.replace('&fv1=', '');
        }
        if (this.selectedCategory === "") {
            filterExpression = filterExpression.replace('?fv2=', '');
            filterExpression = filterExpression.replace('&fv2=', '');
        }
        if (filterExpression.startsWith('&'))
            filterExpression = filterExpression.replace('&', '?');

        //build cron expression:
        let timeSplit = this.scheduleStartTime.split(':');
        let sec = '0';
        let min = timeSplit[1];
        let hour = timeSplit[0];
        let day = '?'
        let month = '*';
        let dayOfTheWeek = '?';
        if (this.isDaily) {
            if (this.isEverydaySelected) {
                day = '*'
            } else {
                dayOfTheWeek = this.selectedDayOfTheWeek + '/' + this.numberOfDays;
            }
        } else if (this.isWeekly) {
            if (this.selectedDaysOfTheWeek === '' || this.selectedDaysOfTheWeek.length === 0) {
                this.handleToastMessage(MSG_Error_Occurred, MSG_Select_Days_Of_The_Week, 'error');
                return;
            }
            dayOfTheWeek = this.selectedDaysOfTheWeek;
        } else if (this.isMonthly) {
            month = '*/' + this.numberOfMonths;
            if (this.monthlyOption1) {
                day = this.selectedDayOfTheMonth;
                dayOfTheWeek = '?';
            } else if (this.monthlyOption2) {
                day = '?'
                dayOfTheWeek = this.selectedSequenceType + '#' + this.selectedSequence;
            }
        }
        let cronExpression = sec + ' ' + min + ' ' + hour + ' ' + day + ' ' + month + ' ' + dayOfTheWeek;
        if (!this.schedulerTypeCron) {
            this.cronExpr = cronExpression;
        }
        let additionalEmailsJSON = JSON.stringify(additionalEmails);
        scheduleExportReport({ reportId: this.selectedReportId, reportName: this.reportsMap.get(this.selectedReportId), cron: this.cronExpr, groupUser: this.selectedUserGroup, emailList: additionalEmailsJSON, filterReport: filterExpression, folderDevName: this.folderId, emailSubject: this.emailSubject, emailBody: this.emailBody })
            .then(() => {
                this.handleToastMessage(MSG_Success, MSG_Report_Successfully_Scheduled, 'success');
                refreshApex(this.getCronTriggersData);
            })
            .catch(error => {
                this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
            });
    }

    abortCronTrigger(evt) {
        abortCronTrigger({ CronTriggerId: evt.target.value })
            .then(() => {
                this.handleToastMessage(MSG_Success, MSG_Job_Aborted, 'success');
                refreshApex(this.getCronTriggersData);
            })
            .catch(error => {
                this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
            });
    }

    refreshScheduleTable() {
        refreshApex(this.getCronTriggersData);
    }

    handleToastMessage(title, message, variant) {
        if (typeof this.sforce === 'undefined') {
            this.dispatchEvent(new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            }));
        } else {
            confirm(message);
            /*
            this.sforce.one.showToast({
              title: title,
              message: message,
              variant: variant
            });*/
        }
    }
}