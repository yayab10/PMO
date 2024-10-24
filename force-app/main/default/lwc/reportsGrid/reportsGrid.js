import { LightningElement, track, api } from "lwc";
import getReportByFolderDevName from "@salesforce/apex/ReportsGridCmpController.getReportByFolderDevName";
import getAllCategoriesLevel1 from "@salesforce/apex/ReportsGridCmpController.getAllCategoriesLevel1";
import getBannersWithMasterBu from "@salesforce/apex/ReportsGridCmpController.getBannersWithMasterBu";
import getRowRecords from "@salesforce/apex/ReportsGridCmpController.getQueryRecords";
import getColRecords from "@salesforce/apex/ReportsGridCmpController.getQueryRecords";
import fieldFoundsJs from "@salesforce/apex/ReportsGridCmpController.fieldFoundsJs";
import viewLabel from "@salesforce/label/c.view";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ReportsGrid extends LightningElement {
	
  @api folderName;
  @api height;
  
  //@api objectName;
  //@api objectFields;
  
  @api rowObject;
  @api rowfieldObject1;
  @api rowfilterValue1;
  @api rowfieldObject2;
  @api rowfilterValue2;

  @api colObject;
  @api colfieldObject1;
  @api colfilterValue1;
  @api colfieldObject2;
  @api colfilterValue2;

  @api orderByRow;
  @api orderByCol;

  @track error;
  @track listOfReport;
  @track allCategoryList;
  @track allBanners;
  @track selectedFolder;
  @track selectedFolderApiName;
  @track heightStyle;
  @track i = -1; //used to index the list of banners
  @track j = 0; //used to index the list of categories
  @track k = 0; //counter used to set report id in the true cell.
  @track indexofReport = 0; //used to index the report list
  @track reportID; //used to assign the id of report
  @track lengthOfBannerByCategory; //used to get the size of banners multiple by the size of category to get the 2d dimension of table
  @track lengthOfRowByCol;
  @track loading;
  @track rowData;
  @track colData;
  @track field1FalseRow = false;
  @track field2FalseRow = false;
  @track field1FalseCol = false;
  @track field2FalseCol = false;
  label = {
    viewLabel
  };
  connectedCallback() {
    this.loading = true;
    this.heightStyle = "height:" + this.height + "px";
    this.getReportByFolderDevName();
    //this.getFolderNameByIdReport();
    this.getAllcategoriesLevelOne();
    this.getBanners();

    if (this.rowObject && this.rowfieldObject1 && this.rowfilterValue1) {
      this.getrowObject();
    }
    if (this.colObject && this.colfieldObject1 && this.colfilterValue1)
      this.getColObject();
  }

  renderedCallback() { }

  getrowObject() {
    if (this.rowfieldObject1 && !this.rowfieldObject1.includes('RecordType.')) {
      fieldFoundsJs({
        objName: this.rowObject,
        fieldName: this.rowfieldObject1
      })
        .then(results => {
          if (results === "NotFound") {
            this.field1FalseRow = true;
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
    }
    //
    if (this.rowfieldObject2 && !this.rowfieldObject2.includes('RecordType.')) {
      fieldFoundsJs({
        objName: this.rowObject,
        fieldName: this.rowfieldObject2
      })
        .then(results => {
          if (results === "NotFound") {
            this.field2FalseRow = true;
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
    }
    getRowRecords({
      objectName: this.rowObject,
      fieldName1: this.rowfieldObject1,
      filterValue1: this.rowfilterValue1,
      fieldName2: this.rowfieldObject2,
      filterValue2: this.rowfilterValue2,
      orderBy: this.orderByRow
    })
      .then(result => {
        this.rowData = result;
        if (this.isEmpty(this.rowData)) {
          console.log("Error !!!");
        }
      })
      .catch(error => {
        this.error = error.message.body;
        console.log("Error " + this.error);
      });
  }

  getColObject() {
    if (this.colfieldObject1 && !this.colfieldObject1.includes('RecordType.')) {
      fieldFoundsJs({
        objName: this.colObject,
        fieldName: this.colfieldObject1
      })
        .then(results => {
          if (results === "NotFound") {
            this.field1FalseCol = true;
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
    }
    //
    if (this.colfieldObject2 && !this.colfieldObject2.includes('RecordType.')) {
      fieldFoundsJs({
        objName: this.colObject,
        fieldName: this.colfieldObject2
      })
        .then(results => {
          if (results === "NotFound") {
            this.field2FalseCol = true;
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
    }
    getColRecords({
      objectName: this.colObject,
      fieldName1: this.colfieldObject1,
      filterValue1: this.colfilterValue1,
      fieldName2: this.colfieldObject2,
      filterValue2: this.colfilterValue2,
      orderBy: this.orderByCol
    })
      .then(result => {
        this.colData = result;
        if (this.isEmpty(this.colData)) {
          console.log("Error !!!");
        }
      })
      .catch(error => {
        this.error = error;
        console.log("Error " + this.error);
      });
  }
  isEmpty(obj) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
  get generateUrl() {
    this.lengthOfBannerByCategory =
      this.allBanners.length * this.allCategoryList.length;
    this.reportID = this.listOfReport[this.indexofReport].Id;
    this.k = ++this.k;
    this.i = ++this.i;
    if (this.k % this.lengthOfBannerByCategory === 0)
      this.indexofReport = ++this.indexofReport;

    if (
      this.i <= this.allBanners.length - 1 &&
      this.j <= this.allCategoryList.length - 1
    ) {
      return (
        "/lightning/r/Report/" +
        this.reportID +
        "/view?fv0=" +
        this.allCategoryList[this.j].Path__c +
        "&fv1=" +
        this.allBanners[this.i].NameEncode
      );
    } else if (this.i === this.allBanners.length) {
      this.i = -1;
      this.i = ++this.i;
      this.j = ++this.j;
      if (this.j <= this.allCategoryList.length - 1)
        return (
          "/lightning/r/Report/" +
          this.reportID +
          "/view?fv0=" +
          this.allCategoryList[this.j].Path__c +
          "&fv1=" +
          this.allBanners[this.i].NameEncode
        );
      this.j = 0;
      return (
        "/lightning/r/Report/" +
        this.reportID +
        "/view?fv0=" +
        this.allCategoryList[this.j].Path__c +
        "&fv1=" +
        this.allBanners[this.i].NameEncode
      );
    }
    return "";
  }

  get generateUrlDynamic() {
    this.lengthOfRowByCol = this.colData.length * this.rowData.length;
    this.reportID = this.listOfReport[this.indexofReport].Id;
    this.k = ++this.k;
    this.i = ++this.i;
    if (this.k % this.lengthOfRowByCol === 0)
      this.indexofReport = ++this.indexofReport;

    if (
      this.i <= this.colData.length - 1 &&
      this.j <= this.rowData.length - 1
    ) {
      return (
        "/lightning/r/Report/" +
        this.reportID +
        "/view?fv0=" +
        this.rowData[this.j].Name +
        "&fv1=" +
        this.colData[this.i].Name
      );
    } else if (this.i === this.colData.length) {
      this.i = -1;
      this.i = ++this.i;
      this.j = ++this.j;
      if (this.j <= this.rowData.length - 1)
        return (
          "/lightning/r/Report/" +
          this.reportID +
          "/view?fv0=" +
          this.rowData[this.j].Name +
          "&fv1=" +
          this.colData[this.i].Name
        );
      this.j = 0;
      return (
        "/lightning/r/Report/" +
        this.reportID +
        "/view?fv0=" +
        this.rowData[this.j].Name +
        "&fv1=" +
        this.colData[this.i].Name
      );
    }
    return "";
  }

  getReportByFolderDevName() {
    var k;
    var reportList = [];
    getReportByFolderDevName({ developerName: this.folderName })
      .then(result => {
        this.selectedFolder = result[0].FolderName;
        for (k in result) {
          reportList.push({
            Id: result[k].Id,
            Name: result[k].Name,
            DeveloperName: result[k].DeveloperName
          });
        }
        this.listOfReport = reportList;
      })
      .catch(error => {
        this.error = error;
        console.log("Error " + this.error);
      });
  }

  getAllcategoriesLevelOne() {
    getAllCategoriesLevel1()
      .then(result => {
        this.allCategoryList = result;
      })
      .catch(error => {
        this.error = error;
        console.log("Error " + this.error);
      });
  }

  getBanners() {
    var banners = [];
    var k;
    getBannersWithMasterBu()
      .then(result => {
        for (k in result) {
          banners.push({
            Name: result[k].Name,
            NameEncode: result[k].Name.replace(/\+/g, "%2B")
          });
        }
        this.allBanners = banners;
        this.loading = false;
      })
      .catch(error => {
        this.error = error;
        console.log("Error " + this.error);
      });
  }
}