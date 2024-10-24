/* eslint-disable no-loop-func */
import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getData from '@salesforce/apex/IndicatorsBoxCmpController.getData';
import getFieldNames from '@salesforce/apex/IndicatorsBoxCmpController.getFieldNames';

import MSG_Error_Occurred from '@salesforce/label/c.MSG_Error_Occurred';

export default class IndicatorsBoxMultiple extends LightningElement {
  @api description; // a short text to describe the box. it is displayed in the component
  @api fieldsStackOrientation; // if more than 1 fields are displayed, this attriutes indicates if they are stacked on top of or next to each other.
  @api backgroundColor; // the component's background color

  @track boxes = [];
  /*
  Fields Explanation:
  recordId[i] : self explanatory.
  field[i] : API of inserted field (type Number).
  link[i] : link to the page of the selected record .
  name[i] : name of the selected record.
  render[i] : choose whether to display field[i] data or not.
  greaterThanValue[i] : a value used to compare with field[i]'s data.
  colorg[i] : it's a font color to use if field[i]'s data is bigger than greaterThanValue[i] .
  lessThanValue[i] : a value used to compare with field[i]'s data.
  lessThancolor[i] : it's a font color to use if field[i]'s data is smaller than lessThanValue[i] .
  borderColor[i] : it's a color to use on the borderColor of the box representing the data.
  backgroundColor[i] : it's a color to use on the background of the box representing the data.
  field[i]DataToDisplay : it's the data retrieved from the database of the inserted field[i].
  sObjectType[i] : it's the type of object of the recordId inserted.
  fieldLabel[i] : it's the label given to field[i].
  
  */
  //First record Properties
  @api recordId1;
  @api render1 = false;
  @api field1;
  @api greaterThanColor1;
  @api lessThancolor1;
  @api greaterThanValue1;
  @api lessThanValue1;
  @api borderColor1;
  @api backgroundColor1;

  //Second record Properties
  @api recordId2;
  @api render2 = false;
  @api field2;
  @api greaterThanColor2;
  @api lessThancolor2;
  @api greaterThanValue2;
  @api lessThanValue2;
  @api borderColor2;
  @api backgroundColor2;

  //Third record Properties
  @api recordId3;
  @api render3 = false;
  @api field3;
  @api greaterThanColor3;
  @api lessThancolor3;
  @api greaterThanValue3;
  @api lessThanValue3;
  @api borderColor3;
  @api backgroundColor3;

  //Forth record Properties
  @api recordId4;
  @api render4 = false;
  @api field4;
  @api greaterThanColor4;
  @api lessThancolor4;
  @api greaterThanValue4;
  @api lessThanValue4;
  @api borderColor4;
  @api backgroundColor4;

  //Fifth record Properties
  @api recordId5;
  @api render5 = false;
  @api field5;
  @api greaterThanColor5;
  @api lessThancolor5;
  @api greaterThanValue5;
  @api lessThanValue5;
  @api borderColor5;
  @api backgroundColor5;

  //Sixth record Properties
  @api recordId6;
  @api render6 = false;
  @api field6;
  @api greaterThanColor6;
  @api lessThancolor6;
  @api greaterThanValue6;
  @api lessThanValue6;
  @api borderColor6;
  @api backgroundColor6;

  connectedCallback() {
    let self = this;
    this.backgroundColor = (this.backgroundColor) ? "background :" + this.backgroundColor : '';
    let boxesMap = {};
    console.log(`>>>>> connect`);
    for (let boxIndex = 1; boxIndex <= 6; boxIndex++) {
      console.log('>>> ' + this['render' + boxIndex]);
      if (this['recordId' + boxIndex] && this['field' + boxIndex] && this['render' + boxIndex]) {
        let fieldName = this["field" + boxIndex];
        let recordId = this['recordId' + boxIndex];
        getFieldNames({ recordId: recordId, fields: [fieldName] })
          .then(getFieldNamesData => {
            console.log(`>>>>> fieldsnames`);
            let fieldsMap = JSON.parse(getFieldNamesData);
            boxesMap[boxIndex] = { label: fieldsMap[fieldName].fieldLabel };

            getData({ recordId: recordId, fields: [fieldName] })
              .then(data => {
                console.log(`>>>>> data`);
                let index = boxIndex;
                let isGreaterThan = data[fieldsMap[fieldName].fieldApiName] > this["greaterThanValue" + boxIndex];
                let isLessThan = data[fieldsMap[fieldName].fieldApiName] < this["lessThanValue" + boxIndex];
                let greaterThanStyle = "font-size: 2rem; color :" + this["greaterThanColor" + boxIndex];
                let lessThanStyle = "font-size: 2rem; color :" + this["lessThancolor" + boxIndex];
                console.log(`>>>>> ${fieldsMap[fieldName].scale}`);
                boxesMap[index] =
                {
                  index: index * 100,
                  label: boxesMap[index].label,
                  recordName: data.Name,
                  fractiondigits: fieldsMap[fieldName].scale,
                  isCurrency: ('CURRENCY' == fieldsMap[fieldName].objectType) ? true : false,
                  isNumber: ('DOUBLE' == fieldsMap[fieldName].objectType || 'Integer' == fieldsMap[fieldName].objectType) ? true : false,
                  isPercent: ('PERCENT' == fieldsMap[fieldName].objectType) ? true : false,
                  currencyIsoCode: data['CurrencyIsoCode'],
                  recordUrl: '/' + data.Id,
                  value: data[fieldsMap[fieldName].fieldApiName],
                  currentStyle : (isGreaterThan) ? greaterThanStyle : ((isLessThan) ? lessThanStyle : 'font-size: 2rem'),
                  boxStyle: "background :" + this["backgroundColor" + boxIndex] + ";border-color:" + this["borderColor" + boxIndex]
                };
                self.boxes = [];
                let boxes = [];
                Object.keys(boxesMap).forEach(box => {
                  boxes.push(boxesMap[box]);
                });
                self.boxes = boxes;
              })
              .catch(error => {
                // display error
                this.dispatchEvent(new ShowToastEvent({
                  title: MSG_Error_Occurred,
                  message: error.message,
                  variant: 'error'
                }));
              });
          })
          .catch(getFieldNamesError => {
            // display error
            this.dispatchEvent(new ShowToastEvent({
              title: MSG_Error_Occurred,
              message: getFieldNamesError.message,
              variant: 'error'
            }));
          });
      }
    }

  }

  //Getters
  get isVertical() {
    return this.fieldsStackOrientation === 'Vertical';
  }
}