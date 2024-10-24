/**
 * @author ULiT
 * @date 10-10-2019
 * @description JS Class for LWC indicatorsBox
 * */
import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// Controller methods
import getData from '@salesforce/apex/IndicatorsBoxCmpController.getData';
import getFieldNames from '@salesforce/apex/IndicatorsBoxCmpController.getFieldNames';
// Labels 
import MSG_Error_Occurred from '@salesforce/label/c.MSG_Error_Occurred';
import MSG_Field_Already_Used from '@salesforce/label/c.MSG_Field_Already_Used';

export default class IndicatorsBox extends LightningElement {
  
  @api recordId; // record Id. either automatically set if component is used in a record page or manually by admin if component is used in an app page or home page
  @api description; // a short text to describe the box. it is displayed in the component
  @api backgroundColor; // the component's background color
  @api fieldsStackOrientation; // if more than 1 fields are displayed, this attriutes indicates if they are stacked on top of or next to each other.
  @track objectName;
  // First Field Properties
  @api field1; // API Name of the field
  @api render1 = false; // if true the field is displayed in the box. is attribute is irrelevant if field1 is empty or invalid
  @api greaterThanValue1; // the top threshold value to compare with
  @api greaterThanColor1; // text color to apply if value > greaterT hanValue
  @api lessThanValue1; // the bottom threshold value to compare with
  @api lessThancolor1;// text color to apply if value < lessThanValue
  @api borderColor1; // border color around field
  @api backgroundColor1; // background behind field

  //Second Field Properties
  @api field2;
  @api render2 = false;
  @api greaterThanValue2;
  @api greaterThanColor2;
  @api lessThanValue2;
  @api lessThancolor2;
  @api borderColor2;
  @api backgroundColor2;

  //Third Field Properties
  @api field3;
  @api render3 = false;
  @api greaterThanValue3;
  @api greaterThanColor3;
  @api lessThanValue3;
  @api lessThancolor3;
  @api borderColor3;
  @api backgroundColor3;

  @track recordName; // the record Name is Displayed at the bottom of the component as a link to the record's details page
  @track recordUrl;
  @track boxes = [];

  connectedCallback() {
    let self = this;
    this.backgroundColor = (this.backgroundColor) ? "background :" + this.backgroundColor : '';
    if (this.recordId) {
      let fields = [];
      let fieldsIndexMap = new Map();
      for (let index = 1; index <= 3; ++index) {
        if (this['field' + index] && this['render' + index]) {
          if (this['field' + index].apiName) {
            this['field' + index] = this['field' + index].apiName;
          }
          console.log(`field api : ${this['field' + index]}`);
          if (!fields.includes(this['field' + index])) {
            fieldsIndexMap.set(this['field' + index], index);
            fields.push(this['field' + index]);
          } else {
            this.dispatchEvent(new ShowToastEvent({
              title: MSG_Error_Occurred,
              message: MSG_Field_Already_Used,
              variant: 'info'
            }));
          }
        }
      }
      if (fields.length > 0) {
        let boxesMap = new Map();
        getFieldNames({ recordId: this.recordId, fields: fields })
          .then(getFieldNamesData => {
            let fieldsMap = JSON.parse(getFieldNamesData);
            for (let index = 0; index < fields.length; index++) {
              boxesMap.set(fields[index],{label : fieldsMap[fields[index]].fieldLabel});
            }
            console.log(fieldsMap);
            getData({ recordId: this.recordId, fields: fields })
              .then(data => {
                this.recordName = data.Name;
                this.recordUrl = '/' + data.Id;
                for (let index = 0; index < fields.length; index++) {
                  let boxIndex = fieldsIndexMap.get(fields[index]);
                  let fieldName = fieldsMap[fields[index]].fieldApiName;
                  let isGreaterThan = data[fieldName] > this["greaterThanValue" + boxIndex];
                  let isLessThan = data[fieldName] < this["lessThanValue" + boxIndex];
                  let item = boxesMap.get(fields[index]);
                  let greaterThanStyle = "color :" + this["greaterThanColor" + boxIndex] +';'; 
                  let lessThanStyle = "color :" + this["lessThancolor" + boxIndex] +';'; 
                  item.fractiondigits = fieldsMap[fields[index]].scale;
                  item.isCurrency = ('CURRENCY' == fieldsMap[fields[index]].objectType) ? true : false;
                  item.isNumber = ('DOUBLE' == fieldsMap[fields[index]].objectType || 'Integer' == fieldsMap[fields[index]].objectType) ? true : false;
                  item.isPercent = ('PERCENT' == fieldsMap[fields[index]].objectType) ? true : false;
                  item.currencyIsoCode = data['CurrencyIsoCode'];
                  item.fieldName = fieldName;
                  item.index = boxIndex;
                  item.value = (!item.isPercent) ? data[fieldName] : parseFloat(data[fieldName])/100;
                  item.boxStyle = "background :" + this["backgroundColor" + boxIndex] + ";border-color:" + this["borderColor" + boxIndex];
                  item.currentStyle = (isGreaterThan) ? greaterThanStyle + '  font-size: 2rem' : ((isLessThan) ? lessThanStyle + '  font-size: 2rem' : ' font-size: 2rem');
                  item.fieldStyle = (isGreaterThan) ? greaterThanStyle + '  font-size: 1rem' : ((isLessThan) ? lessThanStyle + '  font-size: 1rem': ' font-size: 1rem');
                  console.log(`l5ara is ${item.currentStyle}`);
                  console.log(`l5ara is ${item.fieldStyle}`);
                  boxesMap.set(fields[index], item);
                }
                console.log(JSON.stringify(boxesMap));
                self.boxes = [];
                boxesMap.forEach(function (element) {
                  self.boxes.push(element);
                });
              })
              .catch(error => {
                // display error
                this.dispatchEvent(new ShowToastEvent({
                  title: MSG_Error_Occurred,
                  message: error.body.message,
                  variant: 'error'
                }));
              });
          })
          .catch(getFieldNamesError => {
            // display error
            this.dispatchEvent(new ShowToastEvent({
              title: MSG_Error_Occurred,
              message: getFieldNamesError.body.message,
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