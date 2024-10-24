import { LightningElement, api, track, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import getSobjectFields from '@salesforce/apex/AggregateBoxesCmpController.getSobjectFields';
import getAggregateResult from "@salesforce/apex/AggregateBoxesCmpController.getAggregateResult";
export default class AggregateBoxes extends LightningElement {
  //used in record page:
  @api recordId;
  @api objectApiName;
  //used in wire:
  @track record;
  @track error;
  //fields used in aggregate "where", "and" clause in query:
  @track buSource;
  @track buTarget;
  @track orgaHE;
  @track fieldsInQuery = [];

  @api aggregateQuery1;
  @api text1;
  @api color1;
  @api backgroundColor1;
  @track styleBox1;

  @api aggregateQuery2;
  @api text2;
  @api color2;
  @api backgroundColor2;
  @track styleBox2;

  @api aggregateQuery3;
  @api text3;
  @api color3;
  @api backgroundColor3;
  @track styleBox3;

  @api aggregateQuery4;
  @api text4;
  @api color4;
  @api backgroundColor4;
  @track styleBox4;

  @track count;
  @track error;
  @track displayErrorText = false;
  @track allBox = [];

  //to check the number of wired data:
  @track wiredCount = 0;

  @track allFieldsApiName = [];
  @track allFieldsValue;
  //wire fields value from record page :
  @wire(getRecord, {
    recordId: "$recordId",
    ////fields: ["Assortment_BU__c.BU_source__c", "Assortment_BU__c.BU_Target__c", "Assortment_BU__c.Orga_HE__c"]
    fields: "$allFieldsApiName"
  })
  wiredRecords({ error, data }) {
    if (data) {
      if (this.wiredCount > 0)
        return;
      let commonClass = "common-box-style slds-size_1-of-";
      this.count = 0;

      this.record = data;
      this.error = undefined;
      /*this.buSource = this.record.fields.BU_source__c.value;
      this.buTarget = this.record.fields.BU_Target__c.value;
      this.orgaHE = this.record.fields.Orga_HE__c.value;*/
      this.allFieldsValue = this.record.fields;
      for (let index = 1; index <= 4; index++) {
        if (this["aggregateQuery" + index]) {
          let aggregateQueryValue = this["aggregateQuery" + index];
          aggregateQueryValue = this.replaceFieldValue(aggregateQueryValue);
          this.count += 1;
          this["styleBox" + index] = "background-color:" + this["backgroundColor" + index] + ";color:" + this["color" + index] + ";";
          getAggregateResult({ aggregateQuery: aggregateQueryValue })
            .then(result => {
              this.allBox.push({
                queryResult: result,
                text: this["text" + index],
                style: this["styleBox" + index],
                class: commonClass + this.count
              });
            })
            .catch(err => {
              this.error = err;
              console.log("Error " + this.error);
            });
        }
      }
      this.wiredCount = ++this.wiredCount;
    } else if (error) {
      this.error = error;
      this.record = undefined;
      console.log("Error >>> " + this.error);
    }
  }


  connectedCallback() {
    var commonClass = "common-box-style slds-size_1-of-";
    this.count = 0;
    getSobjectFields({ objectName: this.objectApiName }).then(results => {
      this.allFieldsApiName = results.map(item => {
        console.log('fields ' + item);
        return item;
      });
    }).catch(err => {
      console.log('error ' + err);
    });
    if (this.recordId === undefined) {
      for (let index = 1; index <= 4; index++) {
        if (this["aggregateQuery" + index]) {
          this.count += 1;
          this["styleBox" + index] = "background-color:" + this["backgroundColor" + index] + ";color:" + this["color" + index] + ";";
          getAggregateResult({ aggregateQuery: this["aggregateQuery" + index] })
            .then(result => {
              this.allBox.push({
                queryResult: result,
                text: this["text" + index],
                style: this["styleBox" + index],
                class: commonClass + this.count
              });
            })
            .catch(error => {
              this.error = error;
              console.log("Error " + this.error);
            });
        }
      }
    }
  }


  /**
   * replace string used in where clause or and clause value with true field value Id from record page,
     e.g: where BU_source__c='param1' and Orga_HE__c='param2' ... become:
     BU_source__c='00dffdffdDD' and Orga_HE__c='00AABBfddd'
  */
  replaceFieldValue(aggregateQuery) {
    let aggregateExpressions = aggregateQuery.match(/\[(.*?)\]|\{(.*?)\}/g) || [];
    let expressionTovalueMap = {};
    if (aggregateExpressions.length === 0 || !this.recordId) {
      return aggregateQuery;
    }
    aggregateExpressions.forEach(element => {
      let exp = element;
      let fieldName = element.replace(/[\[\]\{\}\s]/g, '');
      if (this.allFieldsValue[fieldName] && this.allFieldsValue[fieldName].value) {
        //expressionTovalueMap[exp] = this.allFieldsValue[fieldName].value;
        aggregateQuery = aggregateQuery.replace(exp, "'" + this.allFieldsValue[fieldName].value + "'");
      }
    });
    //console.table(expressionTovalueMap);
    console.log(aggregateQuery);
    return aggregateQuery;
    /*let whereClause = aggregateQuery.split("WHERE");
    let andClause = whereClause.length > 1 ? whereClause[1].split("AND") : "";
    let fieldsArray = [];
    for (let k = 0; k < andClause.length; k++) {
      fieldsArray.push({ fieldKey: andClause[k].split("=")[0], fieldVal: andClause[k].split("=")[1] });
    }
    
    for(let l in this.allFieldsApiName) {
      for( let m in fieldsArray) {
        if(fieldsArray[m].fieldKey.includes(this.allFieldsApiName[l].split(".")[1])) {
         aggregateQuery = aggregateQuery.replace(fieldsArray[m].fieldVal, "'"+(this.allFieldsValue[this.allFieldsApiName[l].split(".")[1]].value)+"'");
        }
      }
    }*/
    console.log('>>>test ' + aggregateQuery);
    return aggregateQuery;
  }

}