/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
// Server side methods
import getReportByFolderDevName from "@salesforce/apex/ReportViewerCmpController.getReportByFolderDevName";
import getBannersWithMasterBu from "@salesforce/apex/ReportViewerCmpController.getBannersWithMasterBu";
import getAllCategoriesLevel1 from "@salesforce/apex/ReportViewerCmpController.getAllCategoriesLevel1";
import getAllBuTargets from "@salesforce/apex/ReportViewerCmpController.getAllBuTargets";
import getFieldLabel from "@salesforce/apex/ReportViewerCmpController.getFieldLabel";
import getPackagePrefix from "@salesforce/apex/NegoptimHelper.getPackagePrefix";
//import getFolderNameById from "@salesforce/apex/ReportViewerCmpController.getFolderNameById";
// Custom labels
import LBL_Navigate from "@salesforce/label/c.LBL_Navigate";
import LBL_Show_Filter from "@salesforce/label/c.LBL_Show_Filter";
import LBL_Available from "@salesforce/label/c.LBL_Available";
import LBL_Selected from "@salesforce/label/c.LBL_Selected";
import LBL_All from "@salesforce/label/c.LBL_All";
import LBL_Caracteristics from "@salesforce/label/c.LBL_Caracteristics";
import LBL_Others from "@salesforce/label/c.LBL_Others";
export default class reportViewer extends LightningElement {
  @api folderName;
  @api height;
  @api backgroundColor;
  @api color;
  @track error;
  @track heightTable;
  @track listOfReports = [];
  @track buSourceList = [];
  @track buTargetList = [];
  @track categoriesList = [];
  @track filterIsOpen = false;
  @track folderNameTitle;
  @track tableStyle;
  @track backgroundColorBox;
  @track buTargetDisabled = true;
  @track isBusourceSelected = false;
  @track buSourceLabel;
  @track buTargetLabel;
  @track CategoryLabel;
  @track YearLabel;
  @track reportNameLabel;

  @track selectedBuSource;
  @track selectedBuTarget;
  @track selectedCategory;
  @track selectedYear;
  @track selectedFormatOrigin = '';
  @track silverFilterLabel = '';
  @track GoldFilterLabel = '';
  @track VipFilterLabel = '';
  @track isGoldChecked = false;
  @track isSilverChecked = false;
  @track isVipChecked = false;

  @track selectedSilver = [];
  @track selectedGold = [];
  @track selectedVip = [];
  @track selectedField = [];
  @track selectedCaracteristic = [];
  label = {
    LBL_Navigate,
    LBL_Show_Filter,
    LBL_Available,
    LBL_Selected,
    LBL_All,
    LBL_Caracteristics,
    LBL_Others,
  };
  normalizedAPIFields;
  connectedCallback() {
    let self = this;
    var k;
    var dt = new Date();
    this.heightTable = "height:" + this.height + "px;";
    this.selectedYear = dt.getFullYear();
    this.tableStyle = "color:" + this.color + ";";
    this.backgroundColorBox = "background-color:" + this.backgroundColor + ";";
    //to get package prefix:
    getPackagePrefix({ includeUnderscore: true }).then(results => {
      let prefix = results;
      self.normalizedAPIFields = {
        BU_source__c: prefix.toLowerCase() + "bu_source__c",
        BU_Target__c: prefix.toLowerCase() + "bu_target__c",
        Orga_HE__c: prefix.toLowerCase() + "orga_he__c",
        Year__c: prefix.toLowerCase() + "year__c",
        Assortment_BU__c: prefix + "Assortment_BU__c",
        Product2: "Product2",
        t_Silver_Filter__c: prefix.toLowerCase() + "t_silver_filter__c",
        t_Gold_Filter__c: prefix.toLowerCase() + "t_gold_filter__c",
        t_VIP_Filter__c: prefix.toLowerCase() + "t_vip_filter__c",

      };


      //get all report for selected folder:
      getReportByFolderDevName({ developerName: this.folderName })
        .then(results => {
          this.folderNameTitle = results[0].FolderName;
          for (k in results) {
            this.listOfReports.push({
              Id: results[k].Id,
              Name: results[k].Name,
              DeveloperName: results[k].DeveloperName,
              url: "/lightning/r/Report/" + results[k].Id + "/view?fv4=null&fv5=null&fv6=null&fv7=null"
            });
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });

      //get all bu source:
      getBannersWithMasterBu()
        .then(results => {
          this.buSourceList.push({ label: "", value: "Null", id: "", formatOrigin: "" });
          for (k in results) {
            this.buSourceList.push({ label: results[k].Name, value: results[k].Name, id: results[k].Id, formatOrigin: results[k][prefix + 'Format_Origin__c'] });
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
      //get all categories level 1:
      getAllCategoriesLevel1()
        .then(results => {
          this.categoriesList.push({ label: "", value: "Null" });
          for (k in results) {
            this.categoriesList.push({
              label: results[k].Name,
              value: results[k][prefix + 'Path__c']
            });
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
      //get labels of field from assortment bu object :
      getFieldLabel({ objectName: self.normalizedAPIFields.Assortment_BU__c })
        .then(results => {
          for (k in results) {
            switch (k) {
              case self.normalizedAPIFields.BU_source__c:
                this.buSourceLabel = results[k];
                break;
              case self.normalizedAPIFields.BU_Target__c:
                this.buTargetLabel = results[k];
                break;
              case self.normalizedAPIFields.Orga_HE__c:
                this.CategoryLabel = results[k];
                break;
              case self.normalizedAPIFields.Year__c:
                this.YearLabel = results[k];
                break;
              default:
                break;
            }
          }
        })
        .catch(error => {
          this.error = error.body.message;
          console.log("Error " + this.error);
        });
      //get field label of Report object:
      getFieldLabel({ objectName: "Report" })
        .then(results => {
          for (k in results) {
            switch (k) {
              case "name":
                this.reportNameLabel = results[k];
                break;
              default:
                break;
            }
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
      //get field label of Product object:
      getFieldLabel({ objectName: self.normalizedAPIFields.Product2 })
        .then(results => {
          for (k in results) {
            switch (k) {
              case self.normalizedAPIFields.t_Silver_Filter__c:
                this.silverFilterLabel = results[k];
                break;
              case self.normalizedAPIFields.t_Gold_Filter__c:
                this.GoldFilterLabel = results[k];
                break;
              case self.normalizedAPIFields.t_VIP_Filter__c:
                this.VipFilterLabel = results[k];
                break;
              default:
                break;
            }
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
    }).catch(error => {
      this.error = error;
      console.log("Error " + this.error);
    });
  }

  renderedCallback() {
    //it's used to override the slds of icon :
    const style = document.createElement("style");
    if (this.filterIsOpen) {
      style.innerText =
        "c-report-viewer .slds-button__icon.filterIcon{fill: blue;}";
      this.template.querySelector("lightning-button-icon").appendChild(style);
      this.template.querySelector("lightning-button-icon").blur();
    } else {
      style.innerText =
        "c-report-viewer .slds-button__icon.filterIcon{fill: grey;}";
      this.template.querySelector("lightning-button-icon").appendChild(style);
      this.template.querySelector("lightning-button-icon").blur();
    }
  }
  //get BuSource options :
  get buSourceOptions() {
    return this.buSourceList;
  }

  //get BuTarget options :
  get buTargetOptions() {
    var k;
    var buTargetOptions = [];
    buTargetOptions.push({ label: "", value: "Null" });
    for (k in this.buTargetList) {
      buTargetOptions.push({
        label: this.buTargetList[k].Name,
        value: this.buTargetList[k].Name
      });
    }
    return buTargetOptions;
  }

  //get categories options :
  get categoryOptions() {
    return this.categoriesList;
  }

  get formatOriginOptions() {
    let options = [];
    let splitedFormatOrigin = this.selectedFormatOrigin.split(';');
    for (let index = 0; index < splitedFormatOrigin.length; index++) {
      options.push({ label: splitedFormatOrigin[index], value: splitedFormatOrigin[index] })
    }
    return options;
  }

  get caracteristicOptions() {
    let caracteristicOptionsValue = [];
    caracteristicOptionsValue.push({ label: this.VipFilterLabel, value: this.VipFilterLabel });
    caracteristicOptionsValue.push({ label: this.GoldFilterLabel, value: this.GoldFilterLabel });
    caracteristicOptionsValue.push({ label: this.silverFilterLabel, value: this.silverFilterLabel });
    caracteristicOptionsValue.push({ label: this.label.LBL_Others, value: 'other' });
    caracteristicOptionsValue.push({ label: this.label.LBL_All, value: 'All' });
    return caracteristicOptionsValue;
  }

  get fieldOptions() {
    return [{ label: 'S', value: 'S' },
    { label: 'I', value: 'I' },
    { label: 'R', value: 'R' },
    { label: 'E', value: 'E' },
    { label: 'D', value: 'D' },
    { label: this.label.LBL_All, value: 'All' },];
  }

  changeCaracteristic(evt) {
    let selectedCaracteristic = evt.detail.value;
    let oldFoundAll = this.selectedCaracteristic.some(element => element === 'All');
    let newFoundAll = selectedCaracteristic.some(element => element === 'All');
    let options = this.caracteristicOptions;

    if (newFoundAll && !oldFoundAll) {
      this.selectedCaracteristic = options.map(item => item.value);
    } else if (!newFoundAll && oldFoundAll) {
      this.selectedCaracteristic = [];
    } else if (newFoundAll && oldFoundAll & evt.detail.value.length != this.selectedCaracteristic.length) {
      this.selectedCaracteristic = evt.detail.value.filter(item => item != 'All');
    } else {
      this.selectedCaracteristic = evt.detail.value;
    }

    let foundVip = this.selectedCaracteristic.find(element => element === this.VipFilterLabel);
    let foundGold = this.selectedCaracteristic.find(element => element === this.GoldFilterLabel);
    let foundSilver = this.selectedCaracteristic.find(element => element === this.silverFilterLabel);

    if (foundVip && foundGold && foundSilver) {
      this.isVipChecked = true;
      this.isGoldChecked = true;
      this.isSilverChecked = true;
    }
    if (!foundVip && !foundGold && !foundSilver) {
      this.isVipChecked = false;
      this.isGoldChecked = false;
      this.isSilverChecked = false;
    }
    if (foundVip && !foundGold && foundSilver) {
      this.isVipChecked = true;
      this.isGoldChecked = false;
      this.isSilverChecked = true;
    }
    if (foundVip && !foundGold && !foundSilver) {
      this.isVipChecked = true;
      this.isGoldChecked = false;
      this.isSilverChecked = false;
    }
    if (foundVip && foundGold && !foundSilver) {
      this.isVipChecked = true;
      this.isGoldChecked = true;
      this.isSilverChecked = false;
    }
    if (!foundVip && foundGold && !foundSilver) {
      this.isVipChecked = false;
      this.isGoldChecked = true;
      this.isSilverChecked = false;
    }
    if (!foundVip && foundGold && foundSilver) {
      this.isVipChecked = false;
      this.isGoldChecked = true;
      this.isSilverChecked = true;
    }
    if (!foundVip && !foundGold && foundSilver) {
      this.isVipChecked = false;
      this.isGoldChecked = false;
      this.isSilverChecked = true;
    }
    console.log('>>> selected caract' + this.selectedCaracteristic);
    let urlValue;
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }


  changeBuSource(evt) {
    var k;
    var urlValue;
    var formatOrigin;
    this.buTargetList = [];
    this.selectedBuSource = evt.target.value;
    this.isBusourceSelected = true && this.filterIsOpen;

    console.log('this.selectedBuSource ' + this.selectedBuSource);
    if (this.selectedBuSource !== "Null") {
      this.buTargetDisabled = false;
      for (k in this.buSourceList) {
        if (this.buSourceList[k].label === this.selectedBuSource) {
          formatOrigin = this.buSourceList[k].formatOrigin;
          this.selectedFormatOrigin = this.buSourceList[k].formatOrigin;
          console.log('formatOrigin ' + formatOrigin);
        }
      }
      console.log('this.selectedFormatOrigin ' + this.selectedFormatOrigin);
      getAllBuTargets({
        formatOriginVal: formatOrigin
      })
        .then(results => {
          for (k in results) {
            this.buTargetList.push(results[k]);
          }
        })
        .catch(error => {
          this.error = error;
          console.log("Error " + this.error);
        });
    } else {
      this.buTargetDisabled = true;
      this.selectedBuTarget = "Null";
    }
    for (k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  changeBuTarget(evt) {
    var k;
    var urlValue;
    this.selectedBuTarget = evt.target.value;
    for (k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  changeCategory(evt) {
    var k;
    var urlValue;
    this.selectedCategory = evt.target.value;
    for (k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  handleYearChange(evt) {
    var k;
    var urlValue;
    this.selectedYear = evt.target.value;
    for (k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  changeGold(event) {
    let urlValue;
    this.selectedGold = event.detail.value;
    console.log(`Options selected:` + this.selectedGold);
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  changeSilver(event) {
    let urlValue;
    this.selectedSilver = event.detail.value;
    console.log(`Options selected:` + this.selectedSilver);
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  changeVip(event) {
    let urlValue;
    this.selectedVip = event.detail.value;
    console.log(`Options selected:` + this.selectedVip);
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  changeFieldSelect(evt) {
    let selectedField = evt.detail.value;
    let oldFoundAll = this.selectedField.some(element => element === 'All');
    let newFoundAll = selectedField.some(element => element === 'All');
    let options = this.fieldOptions;
    if (newFoundAll && !oldFoundAll) {
      this.selectedField = options.map(item => item.value);
    } else if (!newFoundAll && oldFoundAll) {
      this.selectedField = [];
    } else if (newFoundAll && oldFoundAll & evt.detail.value.length != this.selectedField.length) {
      this.selectedField = evt.detail.value.filter(item => item != 'All');
    } else {
      this.selectedField = evt.detail.value;
    }
    console.log('selected field >>>' + this.selectedField);
    let urlValue;
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  checkGold(evt) {
    this.isGoldChecked = evt.target.checked;
    let urlValue;
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  checkSilver(evt) {
    this.isSilverChecked = evt.target.checked;
    let urlValue;
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  checkVip(evt) {
    this.isVipChecked = evt.target.checked;
    let urlValue;
    for (let k in this.listOfReports) {
      urlValue = this.url(k);
      this.listOfReports[k].url = urlValue;
    }
  }

  url(k) {
    if (this.selectedBuSource !== undefined)
      this.selectedBuSource = this.selectedBuSource.replace(/\+/g, "%2B");
    this.selectedFormatOrigin = this.selectedFormatOrigin.replace(';', ',');
    if (this.selectedCaracteristic.includes('other') &&  !this.selectedFormatOrigin.includes('--'))
      this.selectedFormatOrigin += ',--';
    let urlValue =
      "/lightning/r/Report/" +
      this.listOfReports[k].Id +
      "/view?fv0=" +
      this.selectedBuSource +
      "&fv1=" +
      this.selectedBuTarget +
      "&fv2=" +
      this.selectedCategory +
      "&fv3=" +
      this.selectedYear;
    if (this.isVipChecked) {
      urlValue += "&fv4=" +
        this.selectedFormatOrigin;
    }
    else
      if (!this.isVipChecked) {
        urlValue += "&fv4=null";
      }

    if (this.isGoldChecked) {
      urlValue += "&fv5=" +
        this.selectedFormatOrigin;
    }
    else
      if (!this.isGoldChecked) {
        urlValue += "&fv5=null";
      }

    if (this.isSilverChecked) {
      urlValue += "&fv6=" +
        this.selectedFormatOrigin;
    }
    else
      if (!this.isSilverChecked) {
        urlValue += "&fv6=null";
      }

    let fieldValue = this.selectedField.toString();
    fieldValue = fieldValue.replace('All', '');
    urlValue += "&fv7=" + fieldValue;

    if (urlValue.endsWith("fv7="))
      urlValue = urlValue.replace("fv7=", "fv7=null");
    /*urlValue = urlValue.replace(
      /&(fv\d+=undefined)|\?(fv\d+=undefined)|&(fv\d+=Null)|\?(fv\d+=Null)|(fv\d+=&)|(&fv\d+=$)|(fv\d+=$)/g,
      ""
    );*/
    urlValue = urlValue.replace(
      /&(fv[012389]\d*=undefined)|\?(fv[012389]\d*=undefined)|&(fv[012389]\d*=Null)|\?(fv[012389]\d*=Null)|(fv[012389]\d*=&)|(&fv[012389]\d*=$)|(fv[012389]\d*=$)/g,
      "");
    if (urlValue.endsWith('&')) {
      urlValue = this.replaceChar(urlValue, '', urlValue.length - 1);
    }

    if (this.selectedYear === "") {
      urlValue = urlValue.replace("?fv3=", "");
      urlValue = urlValue.replace("&fv3=", "");
    }
    if (urlValue.includes("view&"))
      urlValue = urlValue.replace("view&", "view?");
    return urlValue;
  }

  openFilter() {
    if (this.filterIsOpen) this.filterIsOpen = false;
    else this.filterIsOpen = true;
    if (this.isBusourceSelected) this.isBusourceSelected = false;
    else if (this.filterIsOpen && this.isBusourceSelected)
      this.isBusourceSelected = true;
  }

  //Test multiple:
  handleMultipleCategory(evt) {
    console.log("Selected is >>" + evt.detail.value);
  }

  replaceChar(origString, replaceChar, index) {
    let firstPart = origString.substr(0, index);
    let lastPart = origString.substr(index + 1);
    let newString = firstPart + replaceChar + lastPart;
    return newString;
  }
}