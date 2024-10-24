/**
 * this component is only exposed to the record page of the Custom Object Contract__c
 * this component is a replacements for custom JavaScript buttons used on the Contract__c details page in Salesforce Classic
 * to add a new button to the panel (this component), follow these steps:
 * CASE 1: the button executes a batch
 * 0- suppose the new button executes a batch named MyBatchClassName
 * 2- write a AuraEnabled Apex method called executeMyBatchClassName in the class ButtonsExecutorCmpController that executes the batch MyBatchClassName
 * 3- import the executeMyBatchClassName to this JavaScript file as follows: import executeMyBatchClassName from '@salesforce/apex/ButtonsExecutorCmpController.executeMyBatchClassName';
 * 4- in the function executeBatchForName, add case 'MyBatchClassName' to the Switch that assigns executeMyBatchClassName to the variable promiseMethod
 * 5- add MyBatchClassName to the list variable classNameList
 * 6- in connectedCallback, call this.addButton (see how to use above function)
 * 7-in the metadata file 'negoptimContractPanel.js-meta.xml add a Boolean property to show/hide the new button
 * CASE 2: the button executes javascript
 * 1- in connectedCallback, call this.addButton (see how to use above function)
 * 2-in the metadata file 'negoptimContractPanel.js-meta.xml add a Boolean property to show/hide the new button
 */

import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
// apex methods
import isBatchInstanceRunning from "@salesforce/apex/ButtonsExecutorCmpController.isBatchInstanceRunning";
import getApexJob from "@salesforce/apex/ButtonsExecutorCmpController.getApexJob";
import getBatchSettings from "@salesforce/apex/ButtonsExecutorCmpController.getBatchSettings";
import getPackagePrefix from "@salesforce/apex/NegoptimHelper.getPackagePrefix";

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getObjectName from "@salesforce/apex/ButtonsExecutorCmpController.getObjectName";
import getRecordData from "@salesforce/apex/ButtonsExecutorCmpController.getRecordData";
import updateRecord from '@salesforce/apex/ButtonsExecutorCmpController.updateRecord';

/**** Group Contract Batch ****/
import executeGroupContractScanBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGroupContractScanBatch';
import executeGroupContractSynchroBatch from "@salesforce/apex/ButtonsExecutorCmpController.executeGroupContractSynchroBatch";
/**** Group Invoice Batch ****/
import executeGroupInvoiceScanBatch from "@salesforce/apex/ButtonsExecutorCmpController.executeGroupInvoiceScanBatch";
import executeGroupInvoiceSynchroBatch from "@salesforce/apex/ButtonsExecutorCmpController.executeGroupInvoiceSynchroBatch";
/**** Group Invoice Payment Batch ****/
import executeGroupInvoicePaymentScanBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGroupInvoicePaymentScanBatch';
import executeGroupInvoicePaymentSynchroBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGroupInvoicePaymentSynchroBatch';
/**** Group Rebate Payment Batch ****/
import executeGroupRebatePaymentScanBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGroupRebatePaymentScanBatch';
import executeGroupRebatePaymentSynchroBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGroupRebatePaymentSynchroBatch';
/**** Contract Batch ****/
import executeCalculateBaseTOBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeCalculateBaseTOBatch';
import executeContractBalancingBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeContractBalancingBatch';
import executeDispatchingBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeDispatchingBatch';
import executeGenerateGRCRatesBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGenerateGRCRatesBatch';
import executeSellinToPurchaseBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeSellinToPurchaseBatch';
import executeReparentingSellinBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeReparentingSellinBatch';
/**** Contract_Discount__c Batch ****/
import executeGenerateInvoicesBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeGenerateInvoicesBatch';
/**** Commercial Plan Batch ****/
import executeCommercialPlanScanBatch from "@salesforce/apex/ButtonsExecutorCmpController.executeCommercialPlanScanBatch";
/**** Supply_Penalty__c Batch ****/
import executePenaltiesScanSynchroBatch from '@salesforce/apex/ButtonsExecutorCmpController.executePenaltiesScanSynchroBatch';
/**** Commercial_Plan_Detail__c ****/
import executeNegoPrintPromoDetail from '@salesforce/apex/ButtonsExecutorCmpController.executeNegoPrintPromoDetail';
/**** Market_Data_Collection_Head__c ****/
import executeMarketDataCollectionHeadScanBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeMarketDataCollectionHeadScanBatch';
import executeMarketDataCollectionSynchroBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeMarketDataCollectionSynchroBatch';
/**** Product2 Batch ****/
import executeMassProductsSwitchBatch from '@salesforce/apex/ButtonsExecutorCmpController.executeMassProductsSwitchBatch';

//custom labels
import LBL_Scan from '@salesforce/label/c.LBL_Scan';
import LBL_Synchro from '@salesforce/label/c.LBL_Synchro';
import LBL_ExecuteCalculateBaseTOBatch from '@salesforce/label/c.LBL_ExecuteCalculateBaseTOBatch';
import LBL_ExecuteContractBalancingBatch from '@salesforce/label/c.LBL_ExecuteContractBalancingBatch';
import LBL_ExecuteDispatchingBatch from '@salesforce/label/c.LBL_ExecuteDispatchingBatch';
import LBL_ExecuteGenerateGRCRatesBatch from '@salesforce/label/c.LBL_ExecuteGenerateGRCRatesBatch';
import LBL_ExecuteGenerateInvoicesBatch from '@salesforce/label/c.LBL_ExecuteGenerateInvoicesBatch';
import LBL_MergeContract from '@salesforce/label/c.LBL_MergeContract';
import LBL_ExecuteSellinToPurchaseBatch from '@salesforce/label/c.LBL_ExecuteSellinToPurchaseBatch';
import LBL_ExecuteReparentingSellinBatch from '@salesforce/label/c.LBL_ExecuteReparentingSellinBatch';
import LBL_Update_Extraction_Status from "@salesforce/label/c.LBL_Update_Extraction_Status";
import LBL_Update_with_promo_fact from "@salesforce/label/c.LBL_Update_with_promo_fact";
import LBL_ExecutePenaltiesScanSynchroBatch from '@salesforce/label/c.LBL_ExecutePenaltiesScanSynchroBatch';
import LBL_GenerateInvoice from '@salesforce/label/c.LBL_GenerateInvoice';
import LBL_Nego_Print from '@salesforce/label/c.LBL_Nego_Print';
import LBL_Print_Justif from '@salesforce/label/c.LBL_Print_Justif';
import LBL_SyncRefAddresse_Account from '@salesforce/label/c.LBL_SyncRefAddresse_Account';
import LBL_SyncRefAddresse_Admin from '@salesforce/label/c.LBL_SyncRefAddresse_Admin';
import LBL_Mass_Switch from '@salesforce/label/c.LBL_Mass_Switch';

//Labels for tooltipText:
import LBL_GroupContractScanBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupContractScanBatch_ButtonTooltip';
import LBL_GroupContractSynchroBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupContractSynchroBatch_ButtonTooltip';
import LBL_GroupInvoiceScanBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupInvoiceScanBatch_ButtonTooltip';
import LBL_GroupInvoicePaymentScanBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupInvoicePaymentScanBatch_ButtonTooltip';
import LBL_GroupInvoicePaymentSynchroBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupInvoicePaymentSynchroBatch_ButtonTooltip';
import LBL_GroupRebatePaymentScanBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupRebatePaymentScanBatch_ButtonTooltip';
import LBL_GroupRebatePaymentSynchroBatch_ButtonTooltip from '@salesforce/label/c.LBL_GroupRebatePaymentSynchroBatch_ButtonTooltip';
import LBL_CalculateBaseTOBatch_ButtonTooltip from '@salesforce/label/c.LBL_CalculateBaseTOBatch_ButtonTooltip';
import LBL_ContractBalancingBatch_ButtonTooltip from '@salesforce/label/c.LBL_ContractBalancingBatch_ButtonTooltip';
import LBL_DispatchingBatch_ButtonTooltip from '@salesforce/label/c.LBL_DispatchingBatch_ButtonTooltip';
import LBL_GenerateGRCRatesBatch_ButtonTooltip from '@salesforce/label/c.LBL_GenerateGRCRatesBatch_ButtonTooltip';
import LBL_GenerateInvoicesBatch_ButtonTooltip from '@salesforce/label/c.LBL_GenerateInvoicesBatch_ButtonTooltip';
import LBL_MergeContract_ButtonTooltip from '@salesforce/label/c.LBL_MergeContract_ButtonTooltip';
import LBL_SellinToPurchaseBatch_ButtonTooltip from '@salesforce/label/c.LBL_SellinToPurchaseBatch_ButtonTooltip';
import LBL_ReparentingSellinBatch_ButtonTooltip from '@salesforce/label/c.LBL_ReparentingSellinBatch_ButtonTooltip';
import LBL_PenaltiesScanSynchroBatch_ButtonTooltip from '@salesforce/label/c.LBL_PenaltiesScanSynchroBatch_ButtonTooltip';
import LBL_NegoPrint_ButtonTooltip from '@salesforce/label/c.LBL_NegoPrint_ButtonTooltip';
import LBL_PrintJustif_ButtonTooltip from '@salesforce/label/c.LBL_PrintJustif_ButtonTooltip';
import LBL_SyncRefAddresse_Account_ButtonTooltip from '@salesforce/label/c.LBL_SyncRefAddresse_Account_ButtonTooltip';
import LBL_SyncRefAddresse_Admin_ButtonTooltip from '@salesforce/label/c.LBL_SyncRefAddresse_Admin_ButtonTooltip';
import LBL_MassProductsSwitchBatch_ButtonTooltip from '@salesforce/label/c.LBL_MassProductsSwitchBatch_ButtonTooltip';

//message pour les toast:
import MSG_Batch_Executed from '@salesforce/label/c.MSG_Batch_Executed';
import MSG_Run_Successfully from '@salesforce/label/c.MSG_Run_Successfully';
import MSG_Batch_Status from '@salesforce/label/c.MSG_Batch_Status';
import MSG_Batch_Not_Found from '@salesforce/label/c.MSG_Batch_Not_Found';

export default class buttonsExecutor extends LightningElement {
    @api recordId; // case record detail
    @api record;
    @api selectedRecordsId; // case records list
    @api classNameList;
    @api sforce;
    @api objectNameFromVf;
    @api objectApiName;

    //to get background-color, text color, and font size from property:
    @api bgcolorStyle;
    @api textcolorStyle;
    @api fontSizeStyle;

    @track bgcolorVal;
    @track colorWithFontSizeVal;
    @track fontSizeDisabledVal;
    @track showSpinner;
    @track panelButtons;
    @track batchNames = [];
    @track objectName;
    //to resize buttons container:
    @track sldsColSizeButton = 'slds-size_1-of-';
    /**
     * map object detail and list of buttons
    */
    @track objectDetailsMap = new Map();
    @track prefix;

    async connectedCallback() {
        this.bgcolorVal = 'background-color:' + this.bgcolorStyle + ';';
        this.colorWithFontSizeVal = 'color:' + this.textcolorStyle + '; font-size:' + this.fontSizeStyle + ';';
        this.fontSizeDisabledVal = 'font-size:' + this.fontSizeStyle + ';';
        await getPackagePrefix({ includeUnderscore: true }).then(results => {
            this.prefix = results;
        }).catch(error => {
            this.toastMessage("error", "Error", error.body.message, "dismissable");
        });
        this.objectDetailsMap = new Map([
            [this.prefix + 'Contract_Group__c',
            [{ key: "1", name: "GroupContractScanBatch", label: LBL_Scan, display: true, isBatch: true, tooltipText: LBL_GroupContractScanBatch_ButtonTooltip },
            { key: "2", name: "GroupContractSynchroBatch", label: LBL_Synchro, display: true, isBatch: true, tooltipText: LBL_GroupContractSynchroBatch_ButtonTooltip }]],
            [this.prefix + 'Invoice_Group__c',
            [{ key: "1", name: "GroupInvoiceScanBatch", label: LBL_Scan, display: true, isBatch: true, tooltipText: LBL_GroupInvoiceScanBatch_ButtonTooltip }]],
            [this.prefix + 'Invoice_Payment_Group__c',
            [{ key: "1", name: "GroupInvoicePaymentScanBatch", label: LBL_Scan, display: true, isBatch: true, tooltipText: LBL_GroupInvoicePaymentScanBatch_ButtonTooltip },
            { key: "2", name: "GroupInvoicePaymentSynchroBatch", label: LBL_Synchro, display: true, isBatch: true, tooltipText: LBL_GroupInvoicePaymentSynchroBatch_ButtonTooltip }]],
            [this.prefix + 'Rebate_Payment_Group__c',
            [{ key: "1", name: "GroupRebatePaymentScanBatch", label: LBL_Scan, display: true, isBatch: true, tooltipText: LBL_GroupRebatePaymentScanBatch_ButtonTooltip },
            { key: "2", name: "GroupRebatePaymentSynchroBatch", label: LBL_Synchro, display: true, isBatch: true, tooltipText: LBL_GroupRebatePaymentSynchroBatch_ButtonTooltip }]],
            [this.prefix + 'Contract__c',
            [{ key: "1", name: "CalculateBaseTOBatch", label: LBL_ExecuteCalculateBaseTOBatch, display: true, isBatch: true, tooltipText: LBL_CalculateBaseTOBatch_ButtonTooltip },
            { key: "2", name: "ContractBalancingBatch", label: LBL_ExecuteContractBalancingBatch, display: true, isBatch: true, tooltipText: LBL_ContractBalancingBatch_ButtonTooltip },
            { key: "3", name: "DispatchingBatch", label: LBL_ExecuteDispatchingBatch, display: true, isBatch: true, tooltipText: LBL_DispatchingBatch_ButtonTooltip },
            { key: "4", name: "GenerateGRCRatesBatch", label: LBL_ExecuteGenerateGRCRatesBatch, display: true, isBatch: true, tooltipText: LBL_GenerateGRCRatesBatch_ButtonTooltip },
            { key: "5", name: "GenerateInvoicesBatch", label: LBL_ExecuteGenerateInvoicesBatch, display: true, isBatch: true, tooltipText: LBL_GenerateInvoicesBatch_ButtonTooltip },
            { key: "6", name: "MergeContract", label: LBL_MergeContract, display: true, isBatch: false, tooltipText: LBL_MergeContract_ButtonTooltip },
            { key: "7", name: "SellinToPurchaseBatch", label: LBL_ExecuteSellinToPurchaseBatch, display: true, isBatch: true, tooltipText: LBL_SellinToPurchaseBatch_ButtonTooltip },
            { key: "8", name: "ReparentingSellinBatch", label: LBL_ExecuteReparentingSellinBatch, display: true, isBatch: true, tooltipText: LBL_ReparentingSellinBatch_ButtonTooltip }]],
            [this.prefix + 'Supply_Penalty__c',
            [{ key: "1", name: "PenaltiesScanSynchroBatch", label: LBL_ExecutePenaltiesScanSynchroBatch, display: true, isBatch: true, tooltipText: LBL_PenaltiesScanSynchroBatch_ButtonTooltip }]],
            [this.prefix + 'Contract_Discount__c',
            [{ key: "1", name: "GenerateInvoicesBatch", label: LBL_GenerateInvoice, display: true, isBatch: true, tooltipText: LBL_GenerateInvoicesBatch_ButtonTooltip }]],
            [this.prefix + 'Commercial_Plan_Detail__c',
            [{ key: "1", name: "NegoPrint", label: LBL_Nego_Print, display: true, isBatch: false, tooltipText: LBL_NegoPrint_ButtonTooltip }]],
            [this.prefix + 'Sup_Supplier__c',
            [{ key: "1", name: "SyncRefAddresse_Account", label: LBL_SyncRefAddresse_Account, display: true, isBatch: false, tooltipText: LBL_SyncRefAddresse_Account_ButtonTooltip },
            { key: "2", name: "SyncRefAddresse_Admin", label: LBL_SyncRefAddresse_Admin, display: true, isBatch: false, tooltipText: LBL_SyncRefAddresse_Admin_ButtonTooltip }]],
            ['Product2',
                [{ key: "1", name: "MassProductsSwitchBatch", label: LBL_Mass_Switch, display: true, isBatch: true, tooltipText: LBL_MassProductsSwitchBatch_ButtonTooltip }]]
        ]);
        this.showSpinner = true;
        this.batchInProgessIdList = [];
        this.batchIdToClassNameMap = new Map();
        this.panelButtons = [];
        if (this.currentPageReference != undefined) this.recordId = this.currentPageReference.state.c__recordId;
        // get object name
        if (this.recordId != undefined) {
            await getObjectName({ recordId: this.recordId })
                .then(result => {
                    this.objectName = result;
                    // get record data
                    getRecordData({ objectname: this.objectName, recordId: this.recordId })
                        .then(data => {
                            this.record = Object.assign({}, data);
                            // get classes by object detail
                            this.classNameList = this.objectDetailsMap.get(this.objectName);
                            this.fillClasses();
                            this.disableObjectButtons();
                        })
                        .catch(error => {
                            this.toastMessage("error", "Error", error.body.message, "dismissable");
                        });
                })
                .catch(error => {
                    this.toastMessage("error", "Error", error.body.message, "dismissable");
                });
        } else {
            this.fillClasses();
        }
        this.showSpinner = false;
    }

    fillClasses() {
        if (this.objectNameFromVf === undefined)
            this.sldsColSizeButton += this.objectDetailsMap.get(this.objectApiName) ? this.objectDetailsMap.get(this.objectApiName).length : 0;
        else
            this.sldsColSizeButton += this.objectDetailsMap.get(this.objectNameFromVf) ? this.objectDetailsMap.get(this.objectNameFromVf).length + 1 : 0;
        // add buttons
        if (this.classNameList != undefined) {
            for (var i = 0; i < this.classNameList.length; i++) {
                if (this.classNameList[i].isBatch == true) this.batchNames.push(this.classNameList[i].name);
                this.addButton(
                    this.classNameList[i].key,
                    this.classNameList[i].name,
                    this.classNameList[i].label,
                    this.classNameList[i].isBatch,
                    "brand",
                    this.classNameList[i].display,
                    (i === this.classNameList.length - 1) ? this.sldsColSizeButton : this.sldsColSizeButton + ' slds-p-right_small',
                    this.classNameList[i].tooltipText
                );
            }
        }
        // get batch settings
        if (this.batchNames != undefined && this.batchNames.length > 0) {
            getBatchSettings({ batchNameList: this.batchNames })
                .then(result => {
                    if (result) {
                        for (let batchClassName in result) {
                            let button = this.getButtonByName(batchClassName);
                            button.disabled = !result[batchClassName][this.prefix + 'Active__c'];
                            if (!result[batchClassName][this.prefix + 'Active__c']) {
                                button.tooltipText = batchClassName + " is inactive for your profile in Batch Settings";
                                button.disabled = true;
                            }
                        }
                    }
                })
                .catch(error => {
                    this.toastMessage("error", "Error", error.body.message, "dismissable");
                });
        }
    }

    disableObjectButtons() {
        switch (this.objectName) {
            case this.prefix + 'Contract__c':
                if (this.record[this.prefix + 'Contract_Type__c'] !== 'Simulation' || this.record[this.prefix + 'Status__c'] !== 'Published') {
                    let button = this.getButtonByName('MergeContract');
                    button.disabled = true;
                    button.tooltipText = 'Contract Status isn\'t published or Contract_Type isn\'t Simulation';
                }
                break;
            default: break;
        }
    }

    /**
     *
     * @param {string} key a unique key for the button - if the button executes a batch use the batch class name (MyBatchClassName)
     * @param {string} label the button label
     * @param {string} variant can have on of the following values: base, Neutral, brand, destructive, sucess
     * @param {boolean} display indicates weither to display the button or not
     * @param {function} onclick the function to be executed when the button is clicked
     * @param {string} styleClass the button css class. slds-p-left_x-small is used if null.
     */
    addButton(key, name, label, isBatch, variant, display, classList, tooltip, styleClass) {
        let item = {
            key: key,
            name: name,
            label: label,
            isBatch: isBatch,
            variant: variant,
            display: display,
            disabled: false,
            classList: classList,
            tooltipText: tooltip,
            onclick: function () {
                let button = this.getButtonByKey(key);
                if (button.isBatch == true) {
                    this.executeBatch(key, name);
                } else if (button.name == 'Cancel') {
                    var url = window.location.href;
                    var value = url.substr(0, url.lastIndexOf('/') + 1);
                    window.history.back();
                    return false;
                } else if (this.objectName != undefined) {
                    switch (this.objectName) {
                        case this.prefix + 'Contract__c':
                            if (!this.getButtonByName('MergeContract').disabled)
                                window.location = '/apex/Nego360_Merge_Contract?cId=' + this.record[this.prefix + 'Contract_BU__c'] + '&pId=' + this.record[this.prefix + 'Parent_Contract__c'] + '&Id=' + this.record.Id;
                            break;
                        case this.prefix + 'Commercial_Plan__c':
                            if (!button.disabled) {
                                if (button.name == 'CommercialPlanSimulator')
                                    window.location = '/apex/CommercialPlanSimulator?id=' + this.recordId;
                                else if (button.name == 'UpdateWithPromoFact')
                                    window.location = '/apex/CommercialPlanSimulator?id=' + this.recordId + '&&updatePromoFact=true';
                                else if (button.name == 'CancelPromo')
                                    window.location = '/apex/CancelPromo?id=' + this.recordId;
                            }
                            break;
                        case this.prefix + 'Commercial_Plan_Detail__c':
                            var commercialPlanDetailId = '';
                            executeNegoPrintPromoDetail({ 'promoDetailId': this.recordId, 'status': this.record[this.prefix + 'Statut__c'] })
                                .then(result => {
                                    commercialPlanDetailId = result;
                                    if (button.name == 'NegoPrint') {
                                        window.location = '/apex/SingleRecordPrint?id=' + commercialPlanDetailId;
                                    }
                                })
                                .catch(error => {
                                    this.toastMessage("error", "Error", error.body.message, "dismissable");
                                });
                            break;
                        case this.prefix + 'Sup_Supplier__c':
                            if (button.name == 'SyncRefAddresse_Account') {
                                this.syncSupplier('Acc');
                            } else if (button.name == 'SyncRefAddresse_Admin') {
                                this.syncSupplier('Admin');
                            }
                            break;
                        default: break;
                    }
                }
            },
            ////class: typeof styleClass === "undefined" ? "link-button" : styleClass
        };
        this.panelButtons.push(item);
    }

    syncSupplier(syncType) {
        if (syncType === 'Acc' || syncType === 'Admin') {
            let fieldsBase = [this.prefix + 'Raison__c', this.prefix + 'Address1__c', this.prefix + 'Address2__c', this.prefix + 'City__c', this.prefix + 'PostCode__c', this.prefix + 'Country__c', this.prefix + 'Fax__c', this.prefix + 'Phone1__c', this.prefix + 'Phone2__c'];
            let fields = [this.prefix + syncType + '_Address_External_Synchro__c'];
            this.record[this.prefix + syncType + '_Address_External_Synchro__c'] = true;
            for (let index = 0; index < fieldsBase.length; index++) {
                let fieldBase = fieldsBase[index];
                fields.push(this.prefix + syncType + '_' + fieldBase);
                this.record[this.prefix + syncType + '_' + fieldBase] = this.record[this.prefix + 'Ref_' + fieldBase];
            }
            // update record
            updateRecord({ record: this.record, fields: fields })
                .then(success => {
                    if (success) {
                        this.toastMessage("Success", "Supplier Sync Successful", "Supplier Updated", "dismissable");
                        // eslint-disable-next-line no-eval
                        eval("$A.get('e.force:refreshView').fire();");
                    }
                })
                .catch(error => {
                    this.toastMessage("error", "Error", error.body.message, "dismissable");
                })
        }
    }
    /**
     *
     * @param {string} key a button's unique key
     * @returns the button object
     */
    getButtonByKey(key) {
        for (let i = 0; i < this.panelButtons.length; i++) {
            if (this.panelButtons[i].key === key) {
                return this.panelButtons[i];
            }
        }
        return undefined;
    }

    /**
     *
     * @param {string} name a button's : class name
     * @returns the button object
     */
    getButtonByName(name) {
        for (let i = 0; i < this.panelButtons.length; i++) {
            if (this.panelButtons[i].name === name) {
                return this.panelButtons[i];
            }
        }
        return undefined;
    }

    /**
     * loops over batchInProgessIdList and checks the progress and status of batches
     * if a batch has finished executing (success or failer), a toast is displayed, its id is removed from the list and the respective button is rendered enabled
     * if batchInProgessIdList is empty then the timeout is killed
     */
    checkBatchesProgess(key) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.timerLoop = setTimeout(() => {
            if (this.batchInProgessIdList.length > 0) {
                let tempList = [];
                for (let i = 0; i < this.batchInProgessIdList.length; i++) {
                    tempList.push(this.batchInProgessIdList[i]);
                }
                for (let i = 0; i < tempList.length; i++) {
                    let button = this.getButtonByKey(key/*this.batchIdToClassNameMap.get(tempList[i])*/);
                    this._interval = setInterval(() => {
                        getApexJob({ asyncApexjobId: tempList[i] })
                            .then(asyncApexjob => {
                                if (["Aborted", "Completed", "Failed"].includes(asyncApexjob.Status)) {
                                    button.disabled = false;
                                    this.batchInProgessIdList.splice(i, 1);
                                    this.toastMessage("info", MSG_Batch_Status, "Batch " + asyncApexjob.Status, "dismissable");
                                    clearInterval(this._interval);
                                }
                            })
                            .catch(error => {
                                button.disabled = false;
                                this.batchInProgessIdList.splice(i, 1);
                                this.toastMessage("error", "Error!!", error.body.message, "dismissable");
                            });
                    }, 2000);
                }
            } else {
                clearTimeout(this.timerLoop);
            }
        }, 2500);
    }

    /**
     * executes the batch that name is passesd as parameter and renders its respective button disabled
     * and it adds the job id to batchInProgessIdList to keep checking for progress
     */
    executeBatch(key, batchClassName) {
        this.showSpinner = true;
        let promiseMethod;
        if (this.recordId != undefined) this.selectedRecordsId = this.recordId;
        let button = this.getButtonByKey(key);
        switch (batchClassName) {
            case 'GroupContractScanBatch':
                promiseMethod = executeGroupContractScanBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'GroupContractSynchroBatch':
                promiseMethod = executeGroupContractSynchroBatch({ recordIds: this.selectedRecordsId });
                break;
            case "GroupInvoiceScanBatch":
                promiseMethod = executeGroupInvoiceScanBatch({ recordIds: this.selectedRecordsId });
                break;
            case "GroupInvoiceSynchroBatch":
                promiseMethod = executeGroupInvoiceSynchroBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'GroupInvoicePaymentScanBatch':
                promiseMethod = executeGroupInvoicePaymentScanBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'GroupInvoicePaymentSynchroBatch':
                promiseMethod = executeGroupInvoicePaymentSynchroBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'GroupRebatePaymentScanBatch':
                promiseMethod = executeGroupRebatePaymentScanBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'GroupRebatePaymentSynchroBatch':
                promiseMethod = executeGroupRebatePaymentSynchroBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'CalculateBaseTOBatch':
                promiseMethod = executeCalculateBaseTOBatch({ 'contractIdList': this.selectedRecordsId });
                break;
            case 'ContractBalancingBatch':
                promiseMethod = executeContractBalancingBatch({ 'contractIdList': this.selectedRecordsId });
                break;
            case 'DispatchingBatch':
                promiseMethod = executeDispatchingBatch({ 'contractIdList': this.selectedRecordsId });
                break;
            case 'GenerateGRCRatesBatch':
                promiseMethod = executeGenerateGRCRatesBatch({ 'contractIdList': this.selectedRecordsId });
                break;
            case 'GenerateInvoicesBatch':
                let contractIds = [], conditionIds = [];
                if (this.objectName == this.prefix + 'Contract_Discount__c' && this.recordId != undefined) {
                    contractIds.push(this.record[this.prefix + 'Contract__c']);
                    conditionIds.push(this.recordId);
                } else {
                    contractIds = this.selectedRecordsId;
                }
                promiseMethod = executeGenerateInvoicesBatch({ 'contractIds': contractIds, 'conditionIds': conditionIds });
                break;
            case 'SellinToPurchaseBatch':
                promiseMethod = executeSellinToPurchaseBatch({ 'contractIdList': this.selectedRecordsId });
                break;
            case 'ReparentingSellinBatch':
                promiseMethod = executeReparentingSellinBatch({ 'contractIdList': this.selectedRecordsId });
                break;
            case 'CommercialPlanScanBatch':
                if (button.label == LBL_Update_Extraction_Status)
                    promiseMethod = executeCommercialPlanScanBatch({ 'commercialPlanIds': this.selectedRecordsId, 'fillContract': false, 'updateStatus': true });
                else
                    promiseMethod = executeCommercialPlanScanBatch({ 'commercialPlanIds': this.selectedRecordsId, 'fillContract': true, 'updateStatus': false });
                break;
            case 'PenaltiesScanSynchroBatch':
                promiseMethod = executePenaltiesScanSynchroBatch({ recordIds: this.selectedRecordsId });
                break;
            case 'MarketDataCollectionHeadScanBatch':
                promiseMethod = executeMarketDataCollectionHeadScanBatch({ marketHeadIds: this.selectedRecordsId });
                break;
            case 'MarketDataCollectionSynchroBatch':
                promiseMethod = executeMarketDataCollectionSynchroBatch({ marketHeadIds: this.selectedRecordsId });
                break;
            case 'MassProductsSwitchBatch':
                promiseMethod = executeMassProductsSwitchBatch({ productIds: this.selectedRecordsId });
                break;
            default: this.toastMessage("error", batchClassName, MSG_Batch_Not_Found, "dismissable");
        }
        this.batchRunningInterval = setInterval(() => {
            isBatchInstanceRunning({ batchName: batchClassName })
                .then(isRunning => {
                    button.disabled = true;
                    button.tooltipText = "an instance of " + batchClassName + " is already executing";
                    if (!isRunning) {
                        promiseMethod
                            .then(batchId => {
                                clearInterval(this.batchRunningInterval);
                                this.batchInProgessIdList.push(batchId);
                                this.batchIdToClassNameMap.set(batchId, batchClassName);
                                this.checkBatchesProgess(key);
                                this.showSpinner = false;
                                this.toastMessage("success", MSG_Batch_Executed, batchClassName + MSG_Run_Successfully, "dismissable");
                            })
                            .catch(error => {
                                this.showSpinner = false;
                                this.toastMessage("error", "Error!!", error.body.message, "dismissable");
                            });
                    } /*else {
                    console.log('>>>>> error2 batch already running');
                    this.showSpinner = false;
                    this.toastMessage("error", "Error!!", "batch already running", "dismissable");
                }*/
                })
                .catch(error => {
                    this.showSpinner = false;
                    this.toastMessage("error", "Error!!", error.body.message, "dismissable");
                });
        }, 2000);
    }

    toastMessage(messageType, title, message, mode) {
        this.showSpinner = false;
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: messageType,
            mode: mode
        });
        if (this.sforce === undefined) {
            this.dispatchEvent(evt);
        } else {
            this.sforce.one.showToast({
                'title': title,
                'message': message,
                'type': messageType
            });
        }
    }
}