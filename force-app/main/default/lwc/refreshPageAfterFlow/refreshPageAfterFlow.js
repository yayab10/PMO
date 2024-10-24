/**
 * ULIT DEV
 * This component is used in community flows in order to refresh the current page they've been launched from
 *
 */

import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { updateRecord } from 'lightning/uiRecordApi';
import { fireEvent } from 'c/pubSub';
import getBatchDetails from "@salesforce/apex/MonitorBatchExecution.getBatchDetails";
export default class RefreshPageAfterFlow extends NavigationMixin(LightningElement) {
    @api recordId;
    @api usedInCommunity;
    @api reloadSamePage;
    @api batchId;
    @api refreshOtherComponents;
    @api vfPageName;
    @track isTakingLongTime = false;
    @track loading = false;
    connectedCallback() {
        this.isTakingLongTime = false;
        if (this.batchId == null || this.batchId == '') {
            this.refreshLocation();
        } else {
            let counter = 0;
            this.loading = true;
            var interval = setInterval(() => {
                getBatchDetails({ batchId: this.batchId }).then(result => {
                    if (result) {
                        let batch = result;
                        if (batch.Status == 'Completed' || batch.Status == 'Failed' || batch.Status == 'Aborted') {
                            this.loading = false;
                            this.refreshLocation();
                            clearInterval(interval);
                        } else {
                            counter++;
                        }

                        if (counter > 8) {
                            this.isTakingLongTime = true;
                            this.loading = false;
                            clearInterval(interval);
                            this.refreshLocation();
                        }
                    }

                }).catch((error) => {
                    console.log(error);
                });
            }, 2000);
        }
    }
    refreshLocation() {
        if (this.vfPageName == null || this.vfPageName == '') {
            if (this.recordId) {
                let recordId = this.recordId;
                if (this.reloadSamePage) {
                    updateRecord({ fields: { Id: this.recordId } });
                } else {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: recordId,
                            actionName: 'view',
                        },
                    });
                }
            } else {
                location.reload();
            }
            if (this.refreshOtherComponents) {
                fireEvent('refresh', {});
            }
        } else {
            window.open((!this.usedInCommunity ? '/one/one.app#/alohaRedirect' : '') + this.vfPageName, '_top');
        }
    }
}