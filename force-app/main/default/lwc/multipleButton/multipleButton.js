/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
/* eslint-disable vars-on-top */
/* eslint-disable @lwc/lwc/valid-api */
import { LightningElement, api, track } from 'lwc';

export default class multipleButton extends LightningElement {
    @track buttons = [];
    @api btnfirstlabel1;
    @api btnsecondlabel1;
    @api btnurl1;
    @api isnewtab1 = false;
    @api btncolorhex1 = '0000FF';
    @api btntextcolorhex1 = 'FFFFFF';
    @api show1 = false;
    @api buttonicon1;
    @api borderradius1;
    @api btnfirstlabel2;
    @api btnsecondlabel2;
    @api btnurl2;
    @api isnewtab2 = false;
    @api btncolorhex2 = '0000FF';
    @api btntextcolorhex2 = 'FFFFFF';
    @api show2 = false;
    @api buttonicon2;
    @api borderradius2;
    @api btnfirstlabel3;
    @api btnsecondlabel3;
    @api btnurl3;
    @api isnewtab3 = false;
    @api btncolorhex3 = '0000FF';
    @api btntextcolorhex3 = 'FFFFFF';
    @api show3 = false;
    @api buttonicon3;
    @api borderradius3;
    @api btnfirstlabel4;
    @api btnsecondlabel4;
    @api btnurl4;
    @api isnewtab4 = false;
    @api btncolorhex4 = '0000FF';
    @api btntextcolorhex4 = 'FFFFFF';
    @api show4 = false;
    @api buttonicon4;
    @api borderradius4;
    @api btnfirstlabel5;
    @api btnsecondlabel5;
    @api btnurl5;
    @api isnewtab5 = false;
    @api btncolorhex5 = '0000FF';
    @api btntextcolorhex5 = 'FFFFFF';
    @api show5 = false;
    @api buttonicon5;
    @api borderradius5;
    @api btnfirstlabel6;
    @api btnsecondlabel6;
    @api btnurl6;
    @api isnewtab6 = false;
    @api btncolorhex6 = '0000FF';
    @api btntextcolorhex6 = 'FFFFFF';
    @api show6 = false;
    @api buttonicon6;
    @api borderradius6;
    @api minheight;
    @api iconClass;
    @track eachComponentCSSclass;
    connectedCallback() {
        var count = 0;
        this.buttons = [];
        for (var index = 1; index <= 6; index++) {
            if (this['show' + index]) {
                this.buttons.push({
                    btnfirstlabel: this['btnfirstlabel' + index],
                    btnsecondlabel: this['btnsecondlabel' + index],
                    btnurl: this['btnurl' + index],
                    btncolorhex: this['btncolorhex' + index],
                    btntextcolorhex: this['btntextcolorhex' + index],
                    isnewtab: this['isnewtab' + index],
                    show: this['show' + index],
                    minheight: this.minheight,
                    iconName: this['buttonicon' + index],
                    iconClass: 'filterIcon' + index,
                    borderradius: this['borderradius' + index]
                });
                count++;
            }
        }
        this.eachComponentCSSclass = 'slds-col slds-p-horizontal_xx-small slds-size_1-of-' + count;
    }

}