/**
* @author ULiT
* @date 04-01-2024
* @description CaseRecordPageV2
*******************************************************************************************************************************************
*/
import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { RefreshEvent } from 'lightning/refresh';
import { loadScript } from 'lightning/platformResourceLoader';

//APEX
import getData from "@salesforce/apex/CaseRecordPageCtrlV2.getData";
import saveData from "@salesforce/apex/CaseRecordPageCtrlV2.saveData";
import getAllFieldsTemplate from "@salesforce/apex/CaseRecordPageCtrlV2.getAllFieldsTemplate";
import getFieldConfigByDevName from "@salesforce/apex/CaseRecordPageCtrlV2.getFieldConfigByDevName";

//LABELS
import LBL_Qualify_Ticket from '@salesforce/label/c.LBL_Qualify_Ticket';
import LBL_Set_Email_Notifications from '@salesforce/label/c.LBL_Set_Email_Notifications';
import LBL_Register_Communication from '@salesforce/label/c.LBL_Register_Communication';
import LBL_Changer_Le_Status from '@salesforce/label/c.LBL_Changer_Le_Status';
import LBL_Change_RecordType from '@salesforce/label/c.LBL_Change_RecordType';
import LBL_QA from '@salesforce/label/c.LBL_QA';
import LBL_Activity_Summary from '@salesforce/label/c.LBL_Activity_Summary';
import LBL_Related_Tickets from '@salesforce/label/c.LBL_Related_Tickets';
import LBL_Current_Cases from '@salesforce/label/c.LBL_Current_Cases';
import LBL_Missed_Deadline from '@salesforce/label/c.LBL_Missed_Deadline';
import LBL_All_Cases from '@salesforce/label/c.LBL_All_Cases';
import LBL_Internal_QA from '@salesforce/label/c.LBL_Internal_QA';
import LBL_Save from '@salesforce/label/c.LBL_Save';
import LBL_Next_Steps from '@salesforce/label/c.LBL_Next_Steps';
import LBL_Add from '@salesforce/label/c.LBL_Add';
import LBL_Cancel from '@salesforce/label/c.LBL_Cancel';
import LBL_No_Item_To_Display from '@salesforce/label/c.LBL_No_Item_To_Display';
import LBL_Created_Date from '@salesforce/label/c.LBL_Created_Date';
import LBL_Contact from '@salesforce/label/c.LBL_Contact';
import LBL_Subject from '@salesforce/label/c.LBL_Subject';
import LBL_Created_By from '@salesforce/label/c.LBL_Created_By';
import LBL_Edit from '@salesforce/label/c.LBL_Edit';
import MSG_Nothing_To_Save from '@salesforce/label/c.MSG_Nothing_To_Save';
import LBL_Add_Task from '@salesforce/label/c.LBL_Add_Task';
import LBL_No_Product_Found from '@salesforce/label/c.LBL_No_Product_Found';
import LBL_Filter from '@salesforce/label/c.LBL_Filter';
import LBL_Sort from '@salesforce/label/c.LBL_Sort';
import LBL_Apply from '@salesforce/label/c.LBL_Apply';
import MSG_Successfully_Cloned from '@salesforce/label/c.MSG_Successfully_Cloned';
import MSG_Successfully_Deleted from '@salesforce/label/c.MSG_Successfully_Deleted';
import LBL_Dev_Requests from '@salesforce/label/c.LBL_Dev_Requests';
import LBL_Spec_Library from '@salesforce/label/c.LBL_Spec_Library';
import Attachments from '@salesforce/label/c.Attachments';
import agf__ADM_Chatter from '@salesforce/label/agf.ADM_Chatter';
import agf__ADM_Work_Create from '@salesforce/label/agf.ADM_Work_Create';
import LBL_Labels from '@salesforce/label/c.LBL_Labels';
import LBL_Deliveries from '@salesforce/label/c.LBL_Deliveries';
import LBL_History from '@salesforce/label/c.LBL_History';

//STATIC RESOURCE
import Factory_Logo_Green from "@salesforce/resourceUrl/Factory_Logo_Green";
import Phone_Logo_Purple from "@salesforce/resourceUrl/Phone_Logo_Purple";
import Contact_Logo_Blue from "@salesforce/resourceUrl/Contact_Logo_Blue";
import Question_Logo_Blue from "@salesforce/resourceUrl/Question_Logo_Blue";

import P1_Logo_Red from "@salesforce/resourceUrl/P1_Logo_Red";
import P2_Logo_Orange from "@salesforce/resourceUrl/P2_Logo_Orange";
import P3_Logo_Blue from "@salesforce/resourceUrl/P3_Logo_Blue";

import Instagram_Logo from "@salesforce/resourceUrl/Instagram_Logo";
import Facebook_Logo from "@salesforce/resourceUrl/Facebook_Logo";
import Call_Channel_Logo from "@salesforce/resourceUrl/Call_Channel_Logo";
import Email_Channel_Logo from "@salesforce/resourceUrl/Email_Channel_Logo";

import New_Case_Logo_Green from '@salesforce/resourceUrl/New_Case_Logo_Green';
import Assignee_Logo_Green from '@salesforce/resourceUrl/Assignee_Logo_Green';
import QA_Sent_Logo_Yellow from '@salesforce/resourceUrl/QA_Sent_Logo_Yellow';
import QA_Submitted_Logo_Green from '@salesforce/resourceUrl/QA_Submitted_Logo_Green';
import Factory_Logo_Yellow from '@salesforce/resourceUrl/Factory_Logo_Yellow';
import Marketing_Logo_Yellow from '@salesforce/resourceUrl/Marketing_Logo_Yellow';
import Quality_Logo_Yellow from '@salesforce/resourceUrl/Quality_Logo_Yellow';
import Message_Logo_Green from '@salesforce/resourceUrl/Message_Logo_Green';

import agf__Subject__c from "@salesforce/schema/agf__ADM_Task__c.agf__Subject__c";
import agf__Status__c from "@salesforce/schema/agf__ADM_Task__c.agf__Status__c";
import agf__Due_By__c from "@salesforce/schema/agf__ADM_Task__c.agf__Due_By__c";
import agf__Assigned_To__c from "@salesforce/schema/agf__ADM_Task__c.agf__Assigned_To__c";
import Reminder_Date__c from "@salesforce/schema/agf__ADM_Task__c.Reminder_Date__c";
import agf__Completed_On__c from "@salesforce/schema/agf__ADM_Task__c.agf__Completed_On__c";
//SCRIPTS
import ExcelJSScript from '@salesforce/resourceUrl/ExcelJSLib';

export default class CaseRecordPageV2 extends LightningElement {
taskFields = [agf__Subject__c , agf__Status__c, agf__Due_By__c, agf__Assigned_To__c,Reminder_Date__c, agf__Completed_On__c];
    //APIS
    ////@api recordId = 'a1DJ90000008T64MAE';
    ////@api recordId = 'a1DJ90000008RN8MAM';
    @api recordId;
    ////@api recordId;
    //LABELS
    labels = {
        LBL_Sort,
        LBL_Filter,
        LBL_Apply,
        LBL_Edit,
        LBL_Add,
        LBL_Created_Date,
        LBL_Contact,
        LBL_Subject,
        LBL_Created_By,
        LBL_Save,
        LBL_Internal_QA,
        LBL_Activity_Summary,
        LBL_QA,
        LBL_Qualify_Ticket,
        LBL_Set_Email_Notifications,
        LBL_Register_Communication,
        LBL_Changer_Le_Status,
        LBL_Change_RecordType,
        LBL_Related_Tickets,
        LBL_Current_Cases,
        LBL_Missed_Deadline,
        LBL_Cancel,
        LBL_All_Cases,
        LBL_No_Item_To_Display,
        LBL_Next_Steps,
        MSG_Nothing_To_Save,
        LBL_Add_Task,
        LBL_No_Product_Found,
        MSG_Successfully_Cloned,
        MSG_Successfully_Deleted,
        LBL_Dev_Requests,
        LBL_Spec_Library,
        Attachments,
        agf__ADM_Chatter,
        agf__ADM_Work_Create,
        LBL_Labels,
        LBL_Deliveries,
        LBL_History,
    }
    //FILTERS
    // task_filter = {
    //     criteria: [
    //         {
    //             fieldPath: 'RecordTypeId',
    //             operator: 'eq',
    //             value: '0121v000000BaXiAAK',
    //         },
    //     ],
    //     filterLogic: '1'
    // }
    //STATIC RESOURCE
    factoryLogoIcon = Factory_Logo_Green;
    Phone_Logo_Purple_Icon = Phone_Logo_Purple;
    Contact_Logo_Blue_Icon = 'width:60px;height:60px;background-image: url('+ Contact_Logo_Blue +');background-size: contain;background-position: left;background-repeat: no-repeat;';
    Question_Logo_Blue_Icon = 'width:60px;height:60px;background-image: url('+ Question_Logo_Blue +');background-size: contain;background-position: left;background-repeat: no-repeat;';;
    P2_Logo_Orange = P2_Logo_Orange;
    P3_Logo_Blue = P3_Logo_Blue;
    P1_Logo_Red = P1_Logo_Red;
    Instagram_Logo = Instagram_Logo;
    Facebook_Logo = Facebook_Logo;
    Call_Channel_Logo = Call_Channel_Logo;
    Email_Channel_Logo = Email_Channel_Logo;
    New_Case_Logo_Green = New_Case_Logo_Green;
    Assignee_Logo_Green = Assignee_Logo_Green;
    QA_Sent_Logo_Yellow = QA_Sent_Logo_Yellow;
    QA_Submitted_Logo_Green = QA_Submitted_Logo_Green;
    Factory_Logo_Yellow = Factory_Logo_Yellow;
    Marketing_Logo_Yellow = Marketing_Logo_Yellow;
    Quality_Logo_Yellow = Quality_Logo_Yellow;
    Message_Logo_Green = Message_Logo_Green;
    //STYLES
    @track p1Style = '';
    @track p2Style = '';
    @track p3Style = '';
    //OBJECTS
    @track storeCase;
    @track changeSet = {};
    @track currentStatus = {};
    @track fieldLabelsMap;
    //LISTS
    @track promoTaskList;
    @track externalQuestionList = [];
    @track externalQuestionListClone = [];
    @track promoTaskList;
    @track internalQuestionList = [];
    tempInternalQuestionList = [];
    tempExternalQuestionList = [];
    @track relatedStoreCases = [];
    activityList = [];
    questionnaireTemplateOptions = [];
    planTaskTemplateOptions = [];
    stepList = [];
    statusHistoryList = [];
    questionsToUpsert = [];
    inputs;
    @track taskInputs;
    @track taskIdTodelete;
    //BOOLEANS
    show_NextStep_Popover = false;
    externalEditMode = false;
    tabSetLoading = false;
    noData = true;
    hasRelatedStoreCases = false;
    mainLoading = true;
    caseTabLoading = true;
    isEditPopupLoading = false;
    launchFlow = true;
    showEditPopup = false;
    showEditStoreCase = false;
    showEditContact = false;
    showEditStoreCaseGrid = false;
    showRelatedCases = false;
    popupFlow = false;
    popupFlow1 = false;
    popupFlow2 = false;
    popupFlow3 = false;
    popupFlow4 = false;
    popupFlow5 = false;
    popupFlow6 = false;
    popupFlow7 = false;
    popupFlow8 = false;
    Internal_QA_IsEditMode = false;
    popupDeleteMessage = false;
    @track newSectionLoading = false;


    // STRING
    @track timeZone;
    @track currentTaskName;
    //INTEGERS
    @track allCasesCount;
    @track currentCasesCount;
    @track missedDeadlineCasesCount;
    //GETTERS
    @track Work_Ticket_Qualification_Process_flowApiName = 'SCREEN_Work_Ticket_Qualification_Process';
    @track Work_Email_Notification_Activation_flowApiName = 'SCREEN_Work_Email_Notification_Activation';
    @track Work_Register_Communication_Process_flowApiName = 'SCREEN_Work_Register_Communication_Process';
    @track Work_Status_Change_Process_flowApiName = 'SCREEN_Work_Status_Change_Process';
    @track Store_Case_Update_Record_Type_flowApiName = 'SCREEN_Work_Change_Record_Type';
    @track Work_Create_New_Bug_Task_flowApiName = 'SCREEN_Work_Create_New_Bug_Task';
    @track Commercial_Plan_Task_List_Update_Task_flowApiName = 'SCREEN_Task_Update_Task';
    @track Work_Create_Dev_Request_From_Bug_Or_User_Story_flowApiName = 'SCREEN_Work_Create_Dev_Request_From_Bug_Or_User_Story';

    //Templates for Field_Configuration__mdt:
    @track fieldConfigOptions = [];
    @track selectedFieldConfig = '';
    @track fieldconfigResult = [];
    //WIRES
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
    }

    @wire(getAllFieldsTemplate)
    getAllFieldsTemplate({ error, data }) {
        if (data) {
            this.fieldConfigOptions = Object.keys(data).map(key => {
                return { label: data[key].Label, value: key };
            });
        } else if (error) {
            console.error(error);
        }
    }
 
    handleChangeFieldConfig(event) {
        this.selectedFieldConfig = event.detail.value;
        let fieldconfigResult = {};
        getFieldConfigByDevName({devname: this.selectedFieldConfig}).then((result) => {
            fieldconfigResult = JSON.parse(result);
           // Check if the parsed result is an array
           if (Array.isArray(fieldconfigResult)) {
            fieldconfigResult.forEach((item, index) => {
                console.log(">>>>1", item.fieldsPerRow);
                item.fields.forEach(element => {
                    console.log(">>>>2", element.apiName);
                    console.log(">>>>3", element.isMandatory);
                })
                
            });
            this.fieldconfigResult = fieldconfigResult;
            ////this.showEditStoreCaseGrid = !this.showEditStoreCaseGrid;
            ////if (this.showEditStoreCaseGrid) {
                this.changeSet = {
                    attributes: {
                        'type': 'agf__ADM_Work__c'
                    },
                    Id: this.storeCase.Id
                }
            ////}
        } else {
            console.log("Parsed result is not an array:", fieldconfigResult);
        }
        }).catch((error) => {
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        });
    }

    //LIFECYCLE
    setPageSize = () => {
        try {
            let productTabClass = this.template.querySelector(".productTabClass");
            let sectionTitle = this.template.querySelector(".sectionTitle");
            let buttonGroupContainer = this.template.querySelector(".buttonGroupContainer");
            let statusTitle = this.template.querySelector(".statusTitle");
            let statusList = this.template.querySelector(".statusList");
            if (
                productTabClass != null &&
                sectionTitle != null &&
                buttonGroupContainer != null &&
                statusTitle != null &&
                statusList != null
            ) {
                statusList.style.height = (buttonGroupContainer.offsetHeight + sectionTitle.offsetHeight + productTabClass.offsetHeight) - statusTitle.offsetHeight + 5 + "px";
            }
            let tabSetClass = this.template.querySelector(".tabSetClass");
            let div2 = this.template.querySelector(".div2");
            if (
                tabSetClass != null &&
                div2 != null
            ) {
                tabSetClass.style.width = div2.offsetWidth +  "px";
            }
        } catch (error) {
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        }
    }
    popoverTimeout;
    stepEditPopoverOpen = false;
    toggleEditPopover(event) {
        let index = event.target.dataset.index;
        if (!index) {
            return;
        }
        if (!this.promoTaskList[index].isEditPopoverOpen) {
            this.promoTaskList.forEach(element =>  {
                element.isEditPopoverOpen = false;
            });
            this.promoTaskList[index].isEditPopoverOpen = true;
            this.stepEditPopoverOpen = true;
        }
    }
    openPopover(event) {
        let index = event.target.dataset.index;
        if (!index || this.stepEditPopoverOpen) {
            return
        }
        this.promoTaskList.forEach(element =>  {
            element.isPopoverOpen = false;
        });
        window.clearTimeout(this.popoverTimeout);
        this.popoverTimeout = setTimeout(() => {
            this.promoTaskList[index].isPopoverOpen = true;
        }, 100); 
    }
    closeEditPopovers() {
        this.promoTaskList.forEach(element =>  {
            element.isPopoverOpen = false;
            element.isEditPopoverOpen = false;
        });
        this.stepEditPopoverOpen = false;
    }
    closePopover(event) {
        // if (this.stepEditPopoverOpen) {
        //     console.log('disable')
        //     return
        // }
        setTimeout(() => {
            this.promoTaskList.forEach(element =>  {
                element.isPopoverOpen = false;
            });
        }, 100); 
    }
    togglePopover(event) {
        let index = event.target.dataset.index;
        if (!index) {
            return
        }
        this.promoTaskList.forEach(element =>  {
            element.isPopoverOpen = false;
        });
        window.clearTimeout(this.popoverTimeout);
        this.popoverTimeout = setTimeout(() => {
            this.promoTaskList[index].isPopoverOpen = !this.promoTaskList[index].isPopoverOpen;
        }, 100); 
    }
    connectedCallback() {
        try {
            loadScript(this, ExcelJSScript).then(() => {
            }).catch(error => {
            });
            let self = this;
            this.inputs = [{
                name: "recordId",
                type: "String",
                value: self.recordId
            }];
            addEventListener('resize', this.setPageSize);
            // const isHover = e => e.parentElement.querySelector(':hover') === e; 
            // const myDiv = document.getElementById('nextStepRow');
            // console.log('myDiv: ' + myDiv)
            // document.addEventListener('mousemove', function checkHover() {
            //     const hovered = isHover(myDiv);
            //     if (hovered !== checkHover.hovered) {
            //         console.log(hovered ? 'hovered' : 'not hovered');
            //     }
            // });

            const inputAligncenter = document.createElement('style');
            inputAligncenter.innerText = '.input-text-align_right input{ text-align: right!important; }';
            document.body.appendChild(inputAligncenter);
            this.loadData();
        } catch (error) {
            console.error('Error2'+error);
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        }
    }
    renderedCallback() {
        try {
            setTimeout(() => {
                this.setPageSize()
            }, 200);
        } catch (error) {
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
            this.loading = true;
        }
    }
    //LOAD
    loadData() {
        getData({
            storeCaseId: this.recordId,
        }).then((result) => {
            this.afterload(result);
            this.cancelDescentProduct();
            this.tabSetLoading = false;
        }).catch((error) => {
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        });
    }
    afterload(result) {
        let parsedResult = JSON.parse(result);
        this.timeZone = parsedResult.timeZone;
        this.fieldLabelsMap = parsedResult.fieldLabelsMap;
        this.picklistLabelsMap = parsedResult.picklistLabelsMap;
        let questionnaireTemplateOptions = [];
        let devrequestsWork = parsedResult.devRequestWorks;
        devrequestsWork.forEach(item => {
            item.Name = item.Name;
            item.Subject = item.agf__Subject__c;
            item.DevStatus = item.Dev_Status__c;
            item.manager = item.agf__Senior_Management_POC__r.Name;
            item.Developer = item.Developpeur__r.Name;
        });
        this.devrequestsWork = devrequestsWork;
        let specLibraries = parsedResult.specLibraries;
        specLibraries.forEach(item => {
            item.Name = item.Name;
            item.documentName = item.Document_Name__c;
            item.latestVersion = item.Latest_Version__c;
            item.viewAllversions = item.View_All_Versions__c;
            item.viewFile = item.View_File__c;
            item.SpecCreatedDate = item.Spec_Library__r.CreatedDate;
        });
        this.specLibraries = specLibraries;
        parsedResult.templateList.forEach(template => {
            questionnaireTemplateOptions.push({ label: template.Name, value: template.Id })
        });
        this.questionnaireTemplateOptions = questionnaireTemplateOptions;
        let planTaskTemplateOptions = [];
        parsedResult.planTaskTemplateList.forEach(template => {
            planTaskTemplateOptions.push({ label: template.Name, value: template.Id })
        });
        this.planTaskTemplateOptions = planTaskTemplateOptions;
        //BUILD TASKS
        let promoTaskList = parsedResult.promoTaskList;
        promoTaskList.forEach(item => {
            item.contactLink = '/' + item.agf__Assigned_To__c;
            item.togglePopover = false;
            item.isEditMode = false;
        });
        this.promoTaskList = promoTaskList;
        //BUILD STORE CASE INFO
        let storeCase = parsedResult.storeCase;
        this.relatedStoreCases = parsedResult.relatedStoreCases;
        for (let relatedStoreCase of this.relatedStoreCases) {
            if (relatedStoreCase.agf__Status__c != null) {
                relatedStoreCase.agf__Status__c = this.picklistLabelsMap['agf__ADM_Work__c-agf__Status__c'][relatedStoreCase.agf__Status__c]
            }
            relatedStoreCase.ticketLink = '/' + relatedStoreCase.Id;
        }
        this.hasRelatedStoreCases = this.relatedStoreCases && this.relatedStoreCases.length;
        storeCase.productLink = '/' + storeCase.Product__c;
        storeCase.assignedToLink = '/' + storeCase.agf__Assignee__c;
        storeCase.createdByLink = '/' + storeCase.CreatedBy.Id;
       //commented by khaldoun
        /*if (storeCase.Sub_Epic__c != null) {
            storeCase.Sub_Epic__c = this.picklistLabelsMap['agf__ADM_Work__c-Sub_Epic__c'][storeCase.Sub_Epic__c]
        }
        
        if (storeCase.Business_Process__c != null) {
            storeCase.Business_Process__c = this.picklistLabelsMap['agf__ADM_Work__c-Business_Process__c'][storeCase.Business_Process__c]
        }*/
        if (storeCase.agf__Status__c != null) {
            storeCase.agf__Status__c = this.picklistLabelsMap['agf__ADM_Work__c-agf__Status__c'][storeCase.agf__Status__c]
        }
        this.storeCase = storeCase;
        //STORE CASE COUNT
        this.allCasesCount = parsedResult.allCasesCount;
        this.currentCasesCount = parsedResult.currentCasesCount;
        this.missedDeadlineCasesCount = parsedResult.missedDeadlineCasesCount;
        //BUILD Q&A
        let externalQuestionList = [];
        let internalQuestionList = [];
        parsedResult.questionnaireDetails.forEach(question => {
            question.Department__c = this.picklistLabelsMap['Contact-Department__c'][question.Department__c]
            question.RespondentLink = '/' + question.Respondent__c;
            if (question.RecordType.DeveloperName == 'Customer') {
                externalQuestionList.push(question);
            }
            if (question.RecordType.DeveloperName == 'Internal') {
                internalQuestionList.push(question);
            }
        });
        this.externalQuestionList = externalQuestionList;
        this.internalQuestionList = internalQuestionList;
        this.mainLoading = false;
        //BUILD ACTIVITY LIST
        let emailTypes = ['Customer Email', 'Internal Email'];
        let callTypes = ['Customer Call', 'Internal Call'];
        let activityList = [];
        let statusHistoryList = [];
        parsedResult.storeCaseActivity.forEach(activity => {
            activity.Activity_Type_Logo = 'width:30px;height:30px;background-image: url('+ activity.Activity_Type_Logo_URL__c +');background-size: contain;background-position: left;background-repeat: no-repeat;'
            activity.Status_Logo = 'width:30px;height:30px; opacity: 0.5;background-image: url('+ activity.Status_Logo_URL__c +');background-size: contain;background-position: left;background-repeat: no-repeat;'

            activity.CreatedBy = 'width:30px;height:30px; opacity: 0.5;background-image: url('+ activity.CreatedBy?.SmallPhotoUrl +');background-size: contain;background-position: left;background-repeat: no-repeat;'
            activity.Assigned_To = 'width:30px;height:30px; opacity: 0.5;background-image: url('+ activity.Assigned_To__r?.SmallPhotoUrl +');background-size: contain;background-position: left;background-repeat: no-repeat;'
            
            if (activity.Activity_Type__c != 'Status Change') {
                if (activity.Activity_Type__c != null) {
                    activity.Activity_Type__c = this.picklistLabelsMap['Work_Activity__c-Activity_Type__c'][activity.Activity_Type__c];
                }
                activityList.push(activity);
            } else {
                if (activity.Activity_Type__c != null) {
                    activity.Activity_Type__c = this.picklistLabelsMap['Work_Activity__c-Activity_Type__c'][activity.Activity_Type__c];
                }
                activity.isOpen = ['Open'].includes(activity.Status__c);
                activity.isAssigned = ['Assigned'].includes(activity.Status__c);
                activity.displayPic = activity.isOpen || activity.isAssigned;
                activity.isClosed = ['QA Requested', 'QA Submitted', 'Resolved', 'Closed'].includes(activity.Status__c);
                activity.isPending = ['Awaiting Factory', 'Awaiting Marketing', 'Awaiting Quality'].includes(activity.Status__c);
                if (activity.Status__c != null) {
                    activity.Status__c = this.picklistLabelsMap['Work_Activity__c-Status__c'][activity.Status__c];
                }
                statusHistoryList.push(activity);
            }
        });
        this.activityList = activityList;
        this.statusHistoryList = statusHistoryList;
        if (this.statusHistoryList.length > 0) {
            this.currentStatus = this.statusHistoryList[0];
        }
        this.p1Style = 'width:80px;height:80px;background-image: url('+ this.storeCase.Priority_Logo__c +');background-size: contain;background-position: left;background-repeat: no-repeat;'
        this.p2Style = 'width:35px;height:35px;background-image: url('+ this.storeCase.Channel_Logo__c +');background-size: contain;background-position: left;background-repeat: no-repeat;'
        this.p3Style = 'width:50px;height:50px;background-image: url('+ this.storeCase.Status_Logo__c +');background-size: contain;background-position: left;background-repeat: no-repeat;'
        this.caseTabLoading = false;
    }
    //HANDLE TOGGLES
    toggleDiv1(event) {
        let div3 = this.template.querySelector('.div3');
        let div1 = this.template.querySelector('.div1');
        let div1Toggle = this.template.querySelector('.div1Toggle');
        let div3Toggle = this.template.querySelector('.div3Toggle');
        this.showElement(div1);
        this.showElement(div3Toggle);
        this.hideElement(div3);
        this.hideElement(div1Toggle);
    }
    //HANDLE TOGGLES
    toggleDiv3(event) {
        let div3 = this.template.querySelector('.div3');
        let div1 = this.template.querySelector('.div1');
        let div1Toggle = this.template.querySelector('.div1Toggle');
        let div3Toggle = this.template.querySelector('.div3Toggle');
        this.showElement(div3);
        this.showElement(div1Toggle);
        this.hideElement(div1);
        this.hideElement(div3Toggle);
    }
    showElement(element) {
        element.classList.add('dinline');
        element.classList.remove('dnone');
    }
    hideElement(element) {
        element.classList.add('dnone');
        element.classList.remove('dinline');
    }
    toggleConfirmPopup() {
        this.popupDeleteMessage = !this.popupDeleteMessage;
    }
    handleRecordCall(event) {
        let name = event.target.dataset.name;
        this.cancelDescentProduct();
        if (name == this.Work_Ticket_Qualification_Process_flowApiName) {
            this.popupFlow1 = !this.popupFlow1;
            this.popupFlow = !this.popupFlow;
        } else if (name == this.Work_Email_Notification_Activation_flowApiName) {
            this.popupFlow = !this.popupFlow;
            this.popupFlow2 = !this.popupFlow2;
        } else if (name == this.Work_Register_Communication_Process_flowApiName) {
            this.popupFlow = !this.popupFlow;
            this.popupFlow3 = !this.popupFlow3;
        } else if (name == this.Work_Status_Change_Process_flowApiName) {
            this.popupFlow = !this.popupFlow;
            this.popupFlow4 = !this.popupFlow4;
        } else if (name == this.Store_Case_Update_Record_Type_flowApiName) {
            this.popupFlow = !this.popupFlow;
            this.popupFlow5 = !this.popupFlow5;
        } else if (name == this.Work_Create_New_Bug_Task_flowApiName) {
            this.popupFlow = !this.popupFlow;
            this.popupFlow6 = !this.popupFlow6;
        } else if (name == this.Work_Create_Dev_Request_From_Bug_Or_User_Story_flowApiName) {
            this.popupFlow = !this.popupFlow;
            this.popupFlow8 = !this.popupFlow8;
        }else if (name == this.Commercial_Plan_Task_List_Update_Task_flowApiName) {
            for (let task of this.promoTaskList) {
                if (task.Id == event.target.dataset.id) {
                    task.isEditMode = true;
                    task.togglePopover = true;
                }
            }
        } else if (name == "store_case") {
            this.showEditPopup = !this.showEditPopup;
            this.showEditStoreCase = !this.showEditStoreCase;
            if (this.showEditStoreCase) {
                this.changeSet = {
                    attributes: {
                        'type': 'agf__ADM_Work__c'
                    },
                    Id: this.storeCase.Id
                }
            }
        } else if (name == "contact") {
            this.showEditPopup = !this.showEditPopup;
            this.showEditContact = !this.showEditContact;
            if (this.showEditContact) {
                this.changeSet = {
                    attributes: {
                        'type': 'Contact'
                    },
                    Id: this.storeCase.agf__CS_Contact__c
                }
            }
        } else if (name == "store_case_full") {
            this.showEditStoreCaseGrid = !this.showEditStoreCaseGrid;
            if (this.showEditStoreCaseGrid) {
                this.changeSet = {
                    attributes: {
                        'type': 'agf__ADM_Work__c'
                    },
                    Id: this.storeCase.Id
                }
            }
        } else if (name == "related_cases") {
            this.showEditPopup = !this.showEditPopup;
            this.showRelatedCases = !this.showRelatedCases;
        }
    }
    // Delete / Clone task on Section new Task
    handleCloneDeleteTask(event) {
        let taskName = event.target.dataset.name;
        let taskId = event.target.dataset.id;
        if (taskName == "cloneTask") {  
        this.newSectionLoading = true;  
        let recordListToClone = this.promoTaskList.filter((a) => a.Id == taskId);
        let listToDelete = [];
        if (recordListToClone) {
            recordListToClone.forEach(element => {
                element.Id = null;
            });
            saveData({
                recordsToUpsertJSON: JSON.stringify(recordListToClone),
                recordsToDeleteJSON: JSON.stringify(listToDelete)
            }).then((result) => {
                if (result == 'SUCCESS') {
                    this.showNotification('Success',this.labels.MSG_Successfully_Cloned, 'success');
                } else {
                    this.showNotification('Error', result, 'error');
                }
                this.newSectionLoading = false;
                this.loadData();
        }).catch(error => {
            this.showNotification('Error', error, 'error');
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        });
        }
        } else if (taskName == "deleteTask") { 
            this.popupDeleteMessage = true; 
            this.taskIdTodelete = taskId;
        }     
    }
    
    handleFirstTab() {
       
    }

    handleSecondTab() {
        setTimeout(() => {
            this.setPageSize()
        }, 150);
    }

    handleThirdTab() {
        setTimeout(() => {
            this.setPageSize()
        }, 150);
    }

    handleFlowStatusChange(event) {
        //TODO : store the output values (event.detail.outputVariables)
        if (/* event.detail.status === "ERROR" ||  */event.detail.status === "FINISHED") {
            this.popupFlow1 = false;
            this.popupFlow2 = false;
            this.popupFlow3 = false;
            this.popupFlow4 = false;
            this.popupFlow5 = false;
            this.popupFlow6 = false;
            this.popupFlow7 = false;
            this.popupFlow = false;
            this.dispatchEvent(new RefreshEvent());
        }
    }
    toggleEditProductMode(event) {
        let qId = event.target.dataset.id;
        let filterResult = this.externalQuestionList.filter( (a)=> a.Id == qId);
        if (filterResult) {
            let question = {
                attributes: {
                    'type': 'Questionnaire_Details__c'
                },
                Related_Work__c: this.recordId,
                Question_Title__c: filterResult[0].Question_Title__c,
                Short_Answer__c: filterResult[0].Short_Answer__c,
                RecordTypeId: '0121v000000BaXJAA0',
                rowStyle: 'background: #FFFF8F;',
                isNew: true
            }
            this.externalQuestionList.unshift(question);
        }
    }
    toggleExternalQuestionEditMode(event) {
        this.changeSet = {
            attributes: {
                'type': 'agf__ADM_Work__c'
            },
            Id: this.storeCase.Id
        }
        this.externalEditMode = !this.externalEditMode;
        this.tempExternalQuestionList = JSON.parse(JSON.stringify(this.externalQuestionList));
    }
    handleCancelExternal(event) {
        this.externalEditMode = false;
        this.externalQuestionList = JSON.parse(JSON.stringify(this.tempExternalQuestionList));
    }
    cancelDescentProduct() {
        this.popupFlow1 = false;
        this.popupFlow2 = false;
        this.popupFlow3 = false;
        this.popupFlow4 = false;
        this.popupFlow5 = false;
        this.popupFlow6 = false;
        this.popupFlow7 = false;
        this.popupFlow8 = false;
        this.popupFlow = false;
        this.showEditPopup = false;
        this.isEditPopupLoading = false;
        this.showEditStoreCase = false;
        this.showEditContact = false;
        this.showRelatedCases = false;
        this.showEditStoreCaseGrid = false;
        this.closeEditPopovers();
        this.closePopover();
        this.changeSet = {};
    }
    handleEditMode(event) {
        this.changeSet = {
            attributes: {
                'type': 'agf__ADM_Work__c'
            },
            Id: this.storeCase.Id
        }
        let table = event.target.dataset.table;
        this[table + '_IsEditMode'] = true;
        this.tempInternalQuestionList = JSON.parse(JSON.stringify(this.internalQuestionList));
    }
    handleCancel(event) {
        let table = event.target.dataset.table;
        this[table + '_IsEditMode'] = false;
        this.internalQuestionList = JSON.parse(JSON.stringify(this.tempInternalQuestionList));
    }
    handleSortInternal(event) {
        console.log('handleSortInternal')
    }
    ////HANDLE CHANGE
    handleListFieldEdit(event) {
        let list = event.target.dataset.list;
        let field = event.target.dataset.field;
        let value = field == 'TMP_Is_Answered__c' ? event.target.checked : event.target.value;
        let index = event.target.dataset.index;
        if (list == 'QandA') {
            this.externalQuestionList[index][field] = value;
            this.externalQuestionList[index].isUpdated = true;
        } else if (list == 'internalQandA') {
            this.internalQuestionList[index][field] = value;
            this.internalQuestionList[index].isUpdated = true;
        }
    }
    handleFieldEdits(event) {
        try {
            let field = event.target.dataset.field;
            let value = event.detail.recordId != null ? event.detail.recordId : event.target.value;
            if (field != 'MailingAddress') {
                this.changeSet[field] = value;
            } else {
                this.changeSet.MailingCity = value.MailingCity;
                this.changeSet.MailingCountry = value.MailingCountry;
                this.changeSet.MailingGeocodeAccuracy = value.MailingGeocodeAccuracy;
                this.changeSet.MailingLatitude = value.MailingLatitude;
                this.changeSet.MailingLongitude = value.MailingLongitude;
                this.changeSet.MailingPostalCode = value.MailingPostalCode;
                this.changeSet.MailingState = value.MailingState;
                this.changeSet.MailingStreet = value.MailingStreet;
            }
        } catch (error) {
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        }
    }
    toggleDeleteTask() {
        this.newSectionLoading = true;
        if (this.taskIdTodelete != null) {
            let listToDelete = this.promoTaskList.filter((a) => a.Id == this.taskIdTodelete);
            let listToUpsert = [];
            if (listToDelete) {
                saveData({
                    recordsToUpsertJSON: JSON.stringify(listToUpsert),
                    recordsToDeleteJSON: JSON.stringify(listToDelete)
                }).then((result) => {
                    if (result == 'SUCCESS') {
                        this.showNotification('Success', this.labels.MSG_Successfully_Deleted, 'success');
                    } else {
                        this.showNotification('Error', result, 'error');
                    }
                    this.popupDeleteMessage = false;
                    this.newSectionLoading = false;
                    this.loadData();
                    
            }).catch(error => {
                this.showNotification('Error', error, 'error');
                console.log('%c' + error.message, 'color : red');
                console.log('%c' + error.body?.message, 'color : red');
            });
        }   
    }
    }
    //HANDLE NEW
    handleNewInternalQA(event) {
        let question = {
            attributes: {
                'type': 'Questionnaire_Details__c'
            },
            Topic__c: '',
            Department__c: '',
            Related_Work__c: this.recordId,
            Respondent_Phone__c: '',
            Question_Title__c: '',
            agf__Due_By__c: '',
            Sent_Date__c: '',
            Answer__c: '',
            TMP_Is_Answered__c: '',
            Completed_Date__c: '',
            RecordTypeId: '0121v000000BaXEAA0',
            rowStyle: 'background: #FFFF8F;',
            isNew: true
        }
        this.internalQuestionList.unshift(question);
    }
    handleNewExternalQA(event) {
        let question = {
            attributes: {
                'type': 'Questionnaire_Details__c'
            },
            Related_Work__c: this.recordId,
            Question_Title__c: '',
            Short_Answer__c: '',
            RecordTypeId: '0121v000000BaXJAA0',
            rowStyle: 'background: #FFFF8F;',
            isNew: true
        }
        this.externalQuestionList.unshift(question);
    }
    //HANDLE DELETE
    handleDeleteList(event) {
        let listToUpsertname = event.target.dataset.list;
        let index = event.target.dataset.index;
        if (listToUpsertname == 'QandA') {
            this.externalQuestionList[index]
            if (this.externalQuestionList[index].Id != null) {
                this.externalQuestionList[index].isDeleted = true;
            } else {
                this.externalQuestionList.splice(index, 1);
            }
        } else if (listToUpsertname == 'internalQandA') {
            this.internalQuestionList[index]
            if (this.internalQuestionList[index].Id != null) {
                this.internalQuestionList[index].isDeleted = true;
            } else {
                this.internalQuestionList.splice(index, 1);
            }
        }
    }
    //HANDLE SAVE
    handleSaveList(event) {
        let listToUpsertname = event.target.dataset.list;
        let listToUpsert = [];
        let listToDelete = []
        if (listToUpsertname == 'QandA') {
            listToUpsert = this.externalQuestionList.filter(element => ((element.isNew || element.isUpdated) && !element.isDeleted && (element.Question_Title__c != '' || element.Short_Answer__c != '')));
            listToUpsert.forEach(element => {
                delete element.RespondentLink;
                delete element.isUpdated;
                delete element.isNew;
            });
            listToDelete = this.externalQuestionList.filter(element => (element.isDeleted));
        } else if (listToUpsertname == 'internalQandA') {
            listToUpsert = this.internalQuestionList.filter(element => ((element.isNew || element.isUpdated) && !element.isDeleted));
            listToUpsert.forEach(element => {
                delete element.RespondentLink;
                delete element.isUpdated;
                delete element.isNew;
            });
            listToDelete = this.internalQuestionList.filter(element => (element.isDeleted));
        }
        // let changeLogsToDelete = this.currentChangeset.changeLogList.filter(element => element.isDeleted);
        if (listToUpsert.length == 0 && listToDelete.length == 0 && this.changeSet == {}) {
            this.showNotification('', this.labels.MSG_Nothing_To_Save, 'info')
            return;
        }
        this.Internal_QA_IsEditMode = false;
        this.externalEditMode = false;
        this.tabSetLoading = true;
        this.tableLoading = true;
        if (this.changeSet != {}) {
            listToUpsert.push(this.changeSet);
        }
        saveData({
            recordsToUpsertJSON: JSON.stringify(listToUpsert),
            recordsToDeleteJSON: JSON.stringify(listToDelete)
        }).then((result) => {
            if (result == 'SUCCESS') {
                this.showNotification('Success', 'Saved successfully !', 'success');
            } else {
                this.showNotification('Error', result, 'error');
            }
            this.loadData();
        }).catch(error => {
            this.showNotification('Error', error, 'error');
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        });
    }
    saveHandler(event) {
        try {
            let object = event.target.dataset.object;
            let changesets = [];
            changesets.push(this.changeSet);
            this.isEditPopupLoading = true;
            saveData({
                recordsToUpsertJSON: JSON.stringify(changesets),
                recordsToDeleteJSON: JSON.stringify([])
            }).then((result) => {
                if (result == 'SUCCESS') {
                    this.showNotification('Success', 'Saved successfully !', 'success');
                } else {
                    this.showNotification('Error', result, 'error');
                }
                this.loadData();
            }).catch((error) => {
                this.cancelDescentProduct();
                this.showNotification('Error', error, 'error');
                console.log('%c' + error.message, 'color : red');
                console.log('%c' + error.body?.message, 'color : red');
            });
        } catch (error) {
            this.cancelDescentProduct();
            this.showNotification('Error', error, 'error');
            console.log('%c' + error.message, 'color : red');
            console.log('%c' + error.body?.message, 'color : red');
        }
    }
    //EXPORT EXCEL
    exportExcel() {
        try {
            let workbook = new ExcelJS.Workbook();
            let worksheet = workbook.addWorksheet('Q and A')
            worksheet.properties.defaultRowHeight = 25;
            worksheet.properties.defaultColWidth = 20;
            let columns = [];
            columns.push({ header: 'Test', key: 'Test', width: 70, style: { alignment: { vertical: 'middle', horizontal: 'left' } } });
            worksheet.columns = columns;
            let headerRow = {};
            headerRow['Test'] = 'test';
            worksheet.addRow(headerRow);
            for (let question of this.internalQuestionList) {
                let row = { Id: question.id };
                worksheet.addRow(row);
            }
            workbook.xlsx.writeBuffer().then(result => {
                let a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                let base64Bin = result.toString('base64');
                a.href = "data:application/vnd.ms-excel;base64," + base64Bin;
                a.download = 'QandA.xlsx';
                a.click();
            })
        } catch (error) {
            console.log(error.message);
            console.log(error.body?.message);
        }
    }
    //FILTERS
    filterWrapper = {};
    internalFilterOpen = false;
    toggleFilterPanel(event) {
        this.internalFilterOpen = !this.internalFilterOpen;
    }
    handleChangeFilter(event) {
        let field = event.target.dataset.field;
        let type = event.target.dataset.type;
        let value = event.target.value;
        if (this.filterWrapper[field] == null) {
            this.filterWrapper[field] = {};
        }
        this.filterWrapper[field].value = value;
        this.filterWrapper[field].type = type;
    }
    handleApplyFilters(event) {
        console.log('handleApplyFilters')
    }
    internalSort_Ascending = false;
    handleSortInternal(event) {
        this.internalSort_Ascending = !this.internalSort_Ascending;
        //GET INTERNAL QUESTIONS

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
 
    get computedFieldConfig() {
        return this.fieldconfigResult.map(fieldconfig => {
            return {
                ...fieldconfig,
                fields: fieldconfig.fields.map(field => {
                    return {
                        ...field,
                        value: this.storeCase[field.apiName] || '',
                        isMandatory: this.storeCase[field.isMandatory] || '',
                        isReadOnly: this.storeCase[field.isReadOnly] || ''

                    };
                })
            };
        });
    }
}