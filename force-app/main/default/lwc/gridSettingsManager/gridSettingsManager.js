import { LightningElement, track, wire } from "lwc";
import { NavigationMixin } from 'lightning/navigation';
// import { loadScript } from 'lightning/platformResourceLoader';
import { loadStyle } from 'lightning/platformResourceLoader';
import save from "@salesforce/apex/GridSettingsCmpController.save";
// import deployZip from "@salesforce/apex/GridSettingsCmpController.deployZip";
import getObjects from "@salesforce/apex/GridSettingsCmpController.getObjects";
import getObjectDetail from "@salesforce/apex/GridSettingsCmpController.getObjectDetail";
import getAllFields from "@salesforce/apex/GridSettingsCmpController.getAllFields";
import getGridLayouts from "@salesforce/apex/GridSettingsCmpController.getGridLayouts";
import getPackagePrefix from "@salesforce/apex/GridSettingsCmpController.getPackagePrefix";
// import deleteMetadata from "@salesforce/apex/GridSettingsCmpController.deleteMetadata";
// import getLastApiVersion from "@salesforce/apex/GridSettingsCmpController.getLastApiVersion";
// import getPreviewTableUrl from "@salesforce/apex/GridSettingsCmpController.getPreviewTableUrl";
import getIconsNamePicklist from "@salesforce/apex/GridSettingsCmpController.getIconsNamePicklist";
import checkDeploymentStatus from "@salesforce/apex/GridSettingsCmpController.checkDeploymentStatus";
import getAllReferenceFields from "@salesforce/apex/GridSettingsCmpController.getAllReferenceFields";
import getGridSettingsFieldsLabel from "@salesforce/apex/GridSettingsCmpController.getGridSettingsFieldsLabel";
import getGridSettingsTypes from "@salesforce/apex/GridSettingsCmpController.getGridSettingsTypes";
// static resources
import GridSettings from '@salesforce/resourceUrl/GridSettings';
// import jsziplib from '@salesforce/resourceUrl/jszip'
// import Columns__c from '@salesforce/schema/Grid_Settings__mdt.Columns__c';
// import Custom_JS__c from '@salesforce/schema/Grid_Settings__mdt.Custom_JS__c';
// import Object_Name__c from '@salesforce/schema/Grid_Settings__mdt.Object_Name__c';
// import Master_Object_Name__c from '@salesforce/schema/Grid_Settings__mdt.Master_Object_Name__c';
// import Master_Object_Columns__c from '@salesforce/schema/Grid_Settings__mdt.Master_Object_Columns__c';
// import Icon__c from '@salesforce/schema/Grid_Settings__mdt.Icon__c';
//labels
import { Labels, toastInfo, toastError, toastSuccess, array_move_one_item, addToArrayIfDoesntExist, trimDeveloperName, trimRegex } from "c/gridSettingsHelper"
export default class GridSettingsManager extends NavigationMixin(LightningElement) {
  Label = Labels;
  userFiltersList = [];
  @track searchTermTemplate = '';
  @track filteredFieldsList = [];
  @track filteredMasterObjFieldsList = [];
  @track queryTermDetail = '';
  @track queryTermMaster = '';
  @track queryTermRef = '';
  @track defaultUserFilter = [];
  @track filterableFieldsList = [];
  @track filteredRefFieldsList = [];
  @track layouts = [];
  @track objectFields = [];
  @track objectRefFields = [];
  @track showEditGridTemplatePopup = false;
  @track instance = {
    get isDisableTemplateSave() {
      return !this.currentTemplate.namespacePrefix
    },
    types: [],
    limit: { detail: 500, banner: 10 },
    iconNamesList: [],
    defaultNewTemplate: { label: this.Label.LBL_New_Template, value: "Custom_Template" },
    deployPopUp: {
      display: false,
    },
    changeTypePopUp: {
      display: false,
      type: '',
    },
    currentTemplate: {
      name: '',
      label: '',
      value: '',
      icon: 'standard:orders',
      type: 'Detail',
      // customJS: '',
      readOnlyCriteria: '{}',
      GeneratedJSON: '[]',
      GeneratedMasterJSON: '[]',
      filters: '[]',
      fields: [],
      Default_Page_Size: '50',
      namespacePrefix: '',
      get fieldslength() { return this.fields.filter(item => !item.key.includes('--- Separator(')).length; },
      masterfields: [],
      get masterfieldslength() { return this.masterfields.length; },
      get displayDetail() {
        return this.isDetail || this.isMasterDetail || this.isNoneMasterDetail || this.isMasterDetailLookup;
      },
      get displayMaster() {
        return this.isMaster || this.isMasterDetail || this.isNoneMasterDetail || this.isMasterDetailLookup;
      },
      get isMaster() {
        return this.type == 'Master';
      },
      get isDetail() {
        return this.type == 'Detail';
      },
      get isMasterDetail() {
        return this.type == 'Master-Detail';
      },
      get isNoneMasterDetail() {
        return this.type == 'None-Master-Detail';
      },
      get isMasterDetailLookup() {
        return this.type == 'Master-Detail-Lookup';
      },
      get isRelationalTemplate() {
        return this.isMasterDetail || this.isMasterDetailLookup;
      },
    },
    get displayGrid() {
      return this.currentTemplate.value && this.currentTemplate.value != this.defaultNewTemplate.value;
    },
    // currentTemplate: {
    //   name: '',
    //   label: this.Label.LBL_New_Template,
    //   value: "Custom_Template",
    //   icon: 'standard:orders',
    //   customJS: '',
    //   GeneratedJSON: '[]',
    //   GeneratedMasterJSON: '[]',
    //   filters: '[]',
    //   fields: [],
    //   get fieldslength() { return this.fields.filter(item => !item.key.includes('--- Separator(')).length; },
    //   masterfields: [],
    //   get masterfieldslength() { return this.masterfields.length; }
    // },
    currentObject: { value: '', status: false, objectFields: [], fieldsMap: {}, },
    currentMasterObject: { value: '', status: false, objectFields: [], fieldsMap: {}, relationName: '' },
    selection: { selectedObjectFields: [], selectedMasterObjectFields: [] },
    __objects: [],
    get objects() {
      if (this.currentTemplate.isMasterDetail) {
        return this.__objects.filter(item => item && item.mastersList && item.mastersList.length);
      } else {
        return this.__objects;
      }
    },
    __objectsMap: {},
    get objectsMap() {
      if (!this.__objectsMap || Object.keys(this.__objectsMap).length == 0) {
        this.__objectsMap = {};
        this.__objects.forEach(item => {
          this.__objectsMap[item.value] = item;
        });
      }
      return this.__objectsMap;
    },
    get masterObjects() {
      let objectsMap = this.objectsMap;
      if (this.currentTemplate.isMasterDetail) {
        return this.currentObject && this.currentObject.value && objectsMap && objectsMap.hasOwnProperty(this.currentObject.value) && objectsMap[this.currentObject.value] && objectsMap[this.currentObject.value].hasOwnProperty('mastersList') && objectsMap[this.currentObject.value].mastersList ?
          objectsMap[this.currentObject.value].mastersList.map(item => {
            if (objectsMap.hasOwnProperty(item.masterName)) {
              let newItem = JSON.parse(JSON.stringify(objectsMap[item.masterName]));
              newItem.label = newItem.objectLabel + ' (' + item.relationLabel + ' - ' + item.relationName + ')';
              newItem.key = newItem.value;
              newItem.value = item.relationName + '-' + item.masterName;
              return newItem;
            }
          }).filter(item => item) : [];
      } else if (this.currentTemplate.isMasterDetailLookup) {
        return this.currentObject && this.currentObject.value && objectsMap && objectsMap.hasOwnProperty(this.currentObject.value) && objectsMap[this.currentObject.value] && objectsMap[this.currentObject.value].hasOwnProperty('lookupList') && objectsMap[this.currentObject.value].lookupList ?
          objectsMap[this.currentObject.value].lookupList.map(item => {
            if (objectsMap.hasOwnProperty(item.masterName)) {
              let newItem = JSON.parse(JSON.stringify(objectsMap[item.masterName]));
              newItem.label = newItem.objectLabel + ' (' + item.relationLabel + ' - ' + item.relationName + ')';
              newItem.key = newItem.value;
              newItem.value = item.relationName + '-' + item.masterName;
              return newItem;
            }
          }).filter(item => item) : [];
      } else if (this.currentTemplate.isDetail) {
        return [];
      } else if (this.currentTemplate.isMaster || this.currentTemplate.isNoneMasterDetail) {
        return this.__objects.map(item => {
          let newItem = JSON.parse(JSON.stringify(item));
          newItem.key = newItem.value;
          return item;
        });
      } else {
        return [];
      }
    },
    get masterRelation() {
      let relationApiName = '';
      let objectsMap = this.objectsMap;
      let masterName = this.currentMasterObject.value;
      if (this.currentTemplate.isMasterDetail) {
        if (masterName && objectsMap && objectsMap.hasOwnProperty(this.currentObject.value) && objectsMap[this.currentObject.value] && objectsMap[this.currentObject.value].hasOwnProperty('mastersList') && objectsMap[this.currentObject.value].mastersList && objectsMap[this.currentObject.value].mastersList.length) {
          objectsMap[this.currentObject.value].mastersList.forEach(item => {
            if (item.masterName == masterName) {
              relationApiName = item.relationName;
            }
          });
        }
      } else if (this.currentTemplate.isMasterDetailLookup) {
        if (masterName && objectsMap && objectsMap.hasOwnProperty(this.currentObject.value) && objectsMap[this.currentObject.value] && objectsMap[this.currentObject.value].hasOwnProperty('lookupList') && objectsMap[this.currentObject.value].lookupList && objectsMap[this.currentObject.value].lookupList.length) {
          objectsMap[this.currentObject.value].lookupList.forEach(item => {
            if (item.masterName == masterName) {
              relationApiName = item.relationName;
            }
          });
        }
      }
      return relationApiName;
    },
    get displayMaster() {
      let masterObjects = this.masterObjects;
      return masterObjects && masterObjects.length > 0
    },
    gridLayouts: [],
    Templates: [],
    previewLink: { url: '', has: false },
    pageLink: { url: '', has: false },
    saveAsTemplateName: '',
    fieldSettings: { show: false },
    filterSettings: { show: false, fields: [] },
    addrelatedFields: { fieldStack: [], originafieldLabel: '', relatedFieldsLabel: '' },
    // personalisedField: {
    //   name: '', type: '', action: '', rerender: '', options: [
    //     { label: this.Label.LBL_Button, value: 'Button' },
    //     { label: this.Label.LBL_Link, value: 'Link' },
    //   ]
    // },
    newTemplatePopUp: {
      display: false,
    }
  };
  @track currentMasterObjectValue;
  @track currentObjectValue;
  @track normalizedApiName = {
    Columns__c: 'Columns__c',
    Type__c: 'Type__c',
    Filters__c: 'Filters__c',
    ReadOnly_Criteria__c: 'ReadOnly_Criteria__c',
    Object_Name__c: 'Object_Name__c',
    Master_Object_Name__c: 'Master_Object_Name__c',
    Master_Object_Columns__c: 'Master_Object_Columns__c',
    Relationship_Name__c: 'Relationship_Name__c',
    Icon__c: 'Icon__c',
    Grid_Configuration__c: 'Grid_Configuration__c',
    NamespacePrefix: 'NamespacePrefix',
  };
  @track generatedZipCode = '';
  generatedBase64Zip = '';
  @track Loading = true;
  readOnlyCriteriaHasError = false;
  @track currentObjectValue;
  @track wantedFields = [];
  selectedObjectRefField = '';
  @track selectedObjectRefFieldLabel = '';
  selectedObjectRefFieldFields = [];
  selectedWantedFields = [];
  @track readOnlyCriteriasJSON = '';
  @track selectedWantedFieldspickListValuesJSON = '';
  @track selectedWantedFieldsJSON;
  @track ObjectRelatedFieldsFields = [];
  @track ObjectRelatedFieldsFieldsShowStatus;
  @track ObjectRelatedFieldsFieldsDisableStatus;
  @track isInputField = false;
  @track InOutValue = 'output';
  @track currentFieldsSettingsLabel = '';
  @track previewCount = [1, 2, 3, 4];
  @track previewTable = [];
  @track showAddrelatedPopup = false;
  @track showPersonalizedAddForm = false;
  @track showPreview = false;
  @track showPreviewValue = false;
  @track showSaveAsMenu = false;
  @track showDeleteConfirm = false;
  @track showConfirmOverwrite = false;
  @track hasLayouts = true;
  apiVersion = '51.0';
  likenessMap = {};
  separatorIndex = 0;
  previewTableUrl;
  Events = {
    confirmEdit: 'confirmedit',
    cancelEdit: 'canceledit',
    confirmFilterSettings: 'confirmfiltersettings',
    cancelFilterSettings: 'cancelfiltersettings',
    confirmReadOnlyExpressionEditor: 'confirmreadonlyexpressioneditor',
    cancelReadOnlyExpressionEditor: 'cancelreadonlyexpressioneditor',
  }
  // errorCallback(error, stack) {
  //   console.log(error);
  //   console.log(stack);
  //   console.log(error, stack);
  //   toastError(this, error, stack);
  //   this.Loading = false;
  // }
  connectedCallback() {
    window.addEventListener('resize', this.changeHeight);
    let self = this;
    this.Loading = true;
    getPackagePrefix().then(result => {
      let prefix = result;
      self.normalizedApiName = {
        Columns__c: prefix + 'Columns__c',
        Type__c: prefix + 'Type__c',
        Filters__c: prefix + 'Filters__c',
        ReadOnly_Criteria__c: prefix + 'ReadOnly_Criteria__c',
        Object_Name__c: prefix + 'Object_Name__c',
        Master_Object_Name__c: prefix + 'Master_Object_Name__c',
        Master_Object_Columns__c: prefix + 'Master_Object_Columns__c',
        Relationship_Name__c: prefix + 'Relationship_Name__c',
        Icon__c: prefix + 'Icon__c',
        Grid_Configuration__c: prefix + 'Grid_Configuration__c',
        NamespacePrefix: 'NamespacePrefix',
      };
      Promise.all([
        // loadScript(this, jsziplib),
        loadStyle(this, GridSettings + '/customStyle.css'),
      ]).then(() => {
        self.Loading = false;
      }).catch(error => {
        // console.log("ERROR >> " + (error && error.body && error.body.message ? error.body.message : error));
        self.Loading = false;
      });
      self.LoadGridLayouts();
    });
  }

  checkDeployementStatus(idDeployment) {
    let self = this;
    let counter = 0;
    let status;
    checkDeploymentStatus({
      'idDeployment': idDeployment,
    }).then(fresult => {
      let fdone = JSON.parse(fresult).deployResult.done;
      status = JSON.parse(fresult).deployResult.status;
      if (!fdone) {
        let interval = setInterval(() => {
          if (counter > 10) {
            self.Loading = false;
            clearInterval(interval);
            toastInfo(self, self.Label.MSG_Request_Timed_Out + ' ' + self.Label.MSG_Deploy_Last_Status + ' ' + status);
          }
          checkDeploymentStatus({
            'idDeployment': idDeployment,
          }).then(result => {
            let done = JSON.parse(result).deployResult.done;
            let success = JSON.parse(result).deployResult.success;
            status = JSON.parse(result).deployResult.status;
            if (done) {
              self.Loading = false;
              clearInterval(interval);
              if (success) {
                toastSuccess(self, self.Label.LBL_Save, self.Label.MSG_Save_Complete);
              } else {
                toastInfo(self, self.Label.MSG_Deploy_Ended_With_Status + ' ' + status);
              }
            }
          });
          counter++;
        }, 5000);
      } else {
        self.Loading = false;
        toastSuccess(self, self.Label.LBL_Save, self.Label.MSG_Save_Complete);
      }
    });
  }

  closeDropdownTemplate(event) {
    let self = this;
    if (self.instance.currentTemplate.name != "") {
      let filteredTemplates = this.instance.gridLayouts.filter(item => item.value == self.instance.currentTemplate.name);
      if (filteredTemplates && filteredTemplates.length) {
        this.searchTermTemplate = filteredTemplates[0].label;
      }
    }
    let templateOptionsSection = this.template.querySelector(".templateOptionsSection");
    if (templateOptionsSection) {
      setTimeout(() => {
        templateOptionsSection.classList.remove("slds-is-open");
      }, 200);
    }
  }
  focusTemplateInput(event) {
    let self = this;
    this.searchTermTemplate = '';
    this.layouts = this.instance.gridLayouts.map(item => item);
    this.hasLayouts = this.layouts.length > 0;
    let templateOptionsSection = this.template.querySelector(".templateOptionsSection");
    if (templateOptionsSection) {
      templateOptionsSection.classList.add("slds-is-open");
    }
  }
  searchTemplate(event) {
    this.searchTermTemplate = event.target.value;
    let searchTermTemplate = trimRegex(event.target.value);
    let queryTermTemplate = searchTermTemplate ? new RegExp(searchTermTemplate.toLowerCase().trim().replace(/\*/g, '.*'), "i") : '';
    this.layouts = queryTermTemplate != '' ? this.instance.gridLayouts.filter(item => {
      let match1 = item.label.match(queryTermTemplate);
      return match1 && match1.length;
    }) : this.instance.gridLayouts.map(item => item);
    this.hasLayouts = this.layouts.length > 0;
    let templateOptionsSection = this.template.querySelector(".templateOptionsSection");
    if (templateOptionsSection) {
      templateOptionsSection.classList.add("slds-is-open");
    }
  }
  renderedCallback() {
    this.changeHeight();
    for (var elem of this.template.querySelectorAll('.menuItem')) {
      if (elem.dataset.id != this.instance.currentTemplate.value) {
        elem.setAttribute('aria-current', false);
      } else {
        elem.setAttribute('aria-current', 'page');
      }
    }
  }

  changeHeight = () => {
    if (this.template.querySelector('.header') != null) {
      let header = this.template.querySelector('.header').getBoundingClientRect().height;
      let body = this.template.querySelector('.body');
      let templatesSplitView = this.template.querySelector('.templatesSplitView');
      body.style.height = (window.innerHeight - header - 150) + 'px';
      templatesSplitView.style.height = body.style.height;
    }
  };
  // renderedCallback() {
  //   let mainContainer = this.template.querySelector('.main-container');
  //   document.addEventListener("scroll", (event) => {
  //     console.log(mainContainer.scrollTop);
  //     console.log(document.documentElement.scrollTop);
  //     console.log(document.documentElement.clientHeight);
  //     const width = window.innerWidth || document.documentElement.clientWidth ||
  //       document.body.clientWidth;
  //     const height = window.innerHeight || document.documentElement.clientHeight ||
  //       document.body.clientHeight;
  //     console.log(width, height);
  //   });
  // }
  LoadGridLayouts() {
    let self = this;
    this.instance.Templates = [];
    this.instance.gridLayouts = [];
    this.Loading = true;
    getGridLayouts().then(result => {
      let Templates = JSON.parse(JSON.stringify(result));
      let gridLayouts = [];
      // gridLayouts.push({
      //   label: self.instance.defaultNewTemplate.label,
      //   value: self.instance.defaultNewTemplate.value
      // });
      let objectsNameList = [];
      for (let item in Templates) {
        gridLayouts.push({
          label: Templates[item].MasterLabel,
          //+ (Templates[item][self.normalizedApiName.Object_Name__c] ? " [" + Templates[item][self.normalizedApiName.Object_Name__c] + "]" : "") + (Templates[item].hasOwnProperty(self.normalizedApiName.Master_Object_Name__c) && Templates[item][self.normalizedApiName.Master_Object_Name__c] ? " [" + Templates[item][self.normalizedApiName.Master_Object_Name__c] + "]" : ""),
          value: item,
          type: Templates[item][self.normalizedApiName.Type__c],
          namespacePrefix: Templates[item].NamespacePrefix,
          currentObject: Templates[item][self.normalizedApiName.Object_Name__c],
          masterObject: Templates[item].hasOwnProperty(self.normalizedApiName.Master_Object_Name__c) && Templates[item][self.normalizedApiName.Master_Object_Name__c] ? Templates[item][self.normalizedApiName.Master_Object_Name__c] : undefined
        });
        if (!objectsNameList.includes(Templates[item][self.normalizedApiName.Object_Name__c])) {
          objectsNameList.push(Templates[item][self.normalizedApiName.Object_Name__c]);
        }
        if (Templates[item].hasOwnProperty(self.normalizedApiName.Master_Object_Name__c) && Templates[item][self.normalizedApiName.Master_Object_Name__c] && !objectsNameList.includes(Templates[item][self.normalizedApiName.Master_Object_Name__c])) {
          objectsNameList.push(Templates[item][self.normalizedApiName.Master_Object_Name__c]);
        }
      }
      if (objectsNameList && objectsNameList.length > 0) {
        self.getObjectDetail(objectsNameList);
      }
      let objectsNamesList = [[],];
      let index = 0;
      self.instance.__objects.forEach(item => {
        if (!objectsNameList.includes(item.value)) {
          if (objectsNamesList[index].length < 100) {
            objectsNamesList[index].push(item.value);
          } else {
            index++;
            objectsNamesList.push([item.value]);
          }
        }
      });
      objectsNamesList.forEach(table => {
        self.getObjectDetail(table);
      });
      setTimeout(() => {
        self.instance.Templates = Templates;
        self.instance.gridLayouts = gridLayouts;
        self.layouts = gridLayouts;
        self.Loading = false;
        if (self.instance.currentTemplate.value == self.instance.defaultNewTemplate.value) {
          self.TemplateChange(self.instance.currentTemplate.value);
        }
      }, 100);
    }).catch(error => {
      toastError(self, error);
    });
  }
  @wire(getGridSettingsTypes)
  getGridSettingsTypes({ error, data }) {
    if (data) {
      this.instance.types = JSON.parse(data).sort((item1, item2) => item1.label.localeCompare(item2.label));
    } else {
      toastError(this, error);
    }
  }
  @wire(getObjects)
  getObjects({ error, data }) {
    if (data) {
      this.instance.__objects = JSON.parse(data).map(item => {
        item.label = item.objectLabel;
        item.value = item.objectName;
        return item;
      }).sort((item1, item2) => item1.label.localeCompare(item2.label));
      this.currentObject = this.instance.__objects.length > 0 ? this.instance.__objects[0].value : '';
    } else {
      toastError(this, error);
    }
  }
  @wire(getIconsNamePicklist)
  getIconsNamePicklist({ error, data }) {
    if (data) {
      let results = JSON.parse(data);
      this.instance.iconNamesList = results.map(item => {
        return { label: item, value: item };
      });
    }
    else {
      toastError(this, error);
    }
  }
  @wire(getAllFields, { objectName: "$currentObjectValue" })
  getAllFields({ error, data }) {
    if (this.currentObjectValue) {
      this.getObjectDetail([this.currentObjectValue]);
    }
    if (data) {
      let self = this;
      let likenessMap = {};
      let fields = [];
      this.instance.currentObject.objectFields = [];
      this.instance.currentObject.fieldsMap = {};
      let fieldsMap = {};
      let filterableFieldsList = [];
      for (let index in data) {
        let item = {};
        for (let property in data[index]) {
          item[property] = data[index][property];
        }
        let name = data[index].fieldName;
        let label = data[index].fieldLabel;
        let Field = { label: label, value: name };
        fields.push(Field);
        fieldsMap[name] = item;
      }
      this.instance.currentObject.fieldsMap = fieldsMap;
      this.instance.currentObject.objectFields = fields.sort((item1, item2) => {
        if ((item1.label.includes('>') && item2.label.includes('>')) || (!item1.label.includes('>') && !item2.label.includes('>'))) {
          return item1.label.localeCompare(item2.label);
        } else if (item1.label.includes('>')) {
          return 1;
        } else {
          return -1;
        }
      });
      this.instance.currentObject.objectFields.forEach(item1 => {
        self.instance.currentObject.objectFields.forEach(item2 => {
          if (item1.value.includes('__c', '') && item2.value.includes('__c', '') && item1.value != item2.value && item1.value.replace(/[\d]/g, '') == item2.value.replace(/[\d]/g, '')) {
            if (!likenessMap.hasOwnProperty(item1.value)) {
              likenessMap[item1.value] = [];
            }
            likenessMap[item1.value].push(item2);
          }
        });
      });
      this.filteredFieldsList = this.instance.currentObject.objectFields;
      this.likenessMap[this.instance.currentObject.value] = likenessMap;
      let excludedTypes = [
        'ADDRESS',
        'TEXTAREA',
        'LOCATION',
      ];
      Object.values(this.instance.currentObject.fieldsMap).forEach(item => {
        if (!item.fieldLabel.includes('>') && item.isFilterable && !item.isCalculated && !excludedTypes.includes(item.fieldType)) {
          let newItem = JSON.parse(JSON.stringify(item));
          filterableFieldsList.push({ label: newItem.fieldLabel, value: newItem.fieldName });
        }
      });
      this.filterableFieldsList = filterableFieldsList;
      this.setSelectedFieldStyle();
    }
    else {
      toastError(this, error);
    }
    this.deselectAllSelects();
    this.Loading = false;
  }
  getObjectDetail(objectsNameList) {
    this.Loading = true;
    let self = this;
    getObjectDetail({ objectsNameList: objectsNameList }).then(data => {
      JSON.parse(data).map(item => {
        item.label = item.objectLabel;
        item.value = item.objectName;
        return item;
      }).sort((item1, item2) => item1.label.localeCompare(item2.label)).forEach(item => {
        self.instance.__objects.map(subItem => {
          if (subItem.value == item.value) {
            Object.assign(subItem, item);
          }
        })
      });
      this.Loading = false;
    }).catch(error => {
      // console.error(error);
      toastError(this, error);
      this.Loading = false;
    });
  }
  @wire(getAllFields, { objectName: "$currentMasterObjectValue" })
  getAllMasterFields({ error, data }) {
    if (data) {
      let self = this;
      let likenessMap = {};
      let fields = [];
      this.instance.currentMasterObject.objectFields = [];
      this.instance.currentMasterObject.fieldsMap = {};
      let fieldsMap = {};
      for (let index in data) {
        let item = {};
        for (let field in data[index]) {
          item[field] = data[index][field];
        }
        let name = data[index].fieldName;
        let label = data[index].fieldLabel;
        let field = { label: label, value: name };
        if (!field.label.includes('>')) {
          fields.push(field);
          fieldsMap[name] = item;
        }
      }
      this.instance.currentMasterObject.fieldsMap = fieldsMap;
      // let fieldsMap = this.instance.currentMasterObject.fieldsMap;
      let readOnlyCriteria = { expression: '', rulesMap: {}, fieldsMap: {} };
      if (this.instance.currentTemplate.readOnlyCriteria) {
        readOnlyCriteria = Object.assign(readOnlyCriteria, JSON.parse(this.instance.currentTemplate.readOnlyCriteria));
      }
      this.readOnlyCriteriasJSON = JSON.stringify({ fieldsMap: fieldsMap, expression: readOnlyCriteria.expression, rulesMap: readOnlyCriteria.rulesMap, });
      let gridSettingsExpressionEditorComp = this.template.querySelector("[data-comp='gridSettingsExpressionEditor']");
      if (gridSettingsExpressionEditorComp) {
        gridSettingsExpressionEditorComp.updateFields(this.readOnlyCriteriasJSON);
      }
      this.instance.currentMasterObject.objectFields = fields.sort((item1, item2) => {
        if ((item1.label.includes('>') && item2.label.includes('>')) || (!item1.label.includes('>') && !item2.label.includes('>'))) {
          return item1.label.localeCompare(item2.label);
        } else if (item1.label.includes('>')) {
          return 1;
        } else {
          return -1;
        }
      });
      this.instance.currentMasterObject.objectFields.forEach(item1 => {
        self.instance.currentMasterObject.objectFields.forEach(item2 => {
          if (item1.value.includes('__c', '') && item2.value.includes('__c', '') && item1.value != item2.value && item1.value.replace(/[\d]/g, '') == item2.value.replace(/[\d]/g, '')) {
            if (!likenessMap.hasOwnProperty(item1.value)) {
              likenessMap[item1.value] = [];
            }
            likenessMap[item1.value].push(item2);
          }
        });
      });
      this.likenessMap[this.instance.currentMasterObject.value] = likenessMap;
    }
    else {
      toastError(this, error);
    }
    this.deselectAllSelects();
    this.Loading = false;
    this.filteredMasterObjFieldsList = this.instance.currentMasterObject.objectFields;
  }
  @wire(getAllReferenceFields, { fieldName: "$selectedObjectRefField", objectName: "$currentObjectValue" })
  getAllReferenceFields({ error, data }) {
    if (data) {
      let fields = [];
      this.ObjectRelatedFieldsFields = [];
      for (let index in data) {
        let item = {};
        for (let field in data[index]) {
          item[field] = data[index][field];
        }
        let name = data[index].fieldName;
        let label = data[index].fieldLabel;
        let Field = { label: label, value: name };
        fields.push(Field);
        this.instance.currentObject.fieldsMap[name] = item;
      }
      this.ObjectRelatedFieldsFields = fields.sort((item1, item2) => {
        if ((item1.label.includes('>') && item2.label.includes('>')) || (!item1.label.includes('>') && !item2.label.includes('>'))) {
          return item1.label.localeCompare(item2.label);
        } else if (item1.label.includes('>')) {
          return 1;
        } else {
          return -1;
        }
      });
      this.filteredRefFieldsList = this.ObjectRelatedFieldsFields;
      if (this.instance.currentObject.value && this.selectedObjectRefField) {
        this.ObjectRelatedFieldsFieldsShowStatus = true;
        this.ObjectRelatedFieldsFieldsDisableStatus = !this.ObjectRelatedFieldsFieldsShowStatus;
      }
      this.setSelectedFieldStyle();
    }
    else {
      toastError(this, error);
    }
    this.Loading = false;
  }
  handleRightClickSettings(event) {
    event.preventDefault();
    let fieldApiName = event.currentTarget.dataset.id;
    let selectedWantedFields = this.instance.currentTemplate.fields.filter(item => item.value == fieldApiName);
    let pickListValues = this.instance.currentObject.fieldsMap.hasOwnProperty(selectedWantedFields[0].value) ? this.instance.currentObject.fieldsMap[selectedWantedFields[0].value].pickListValues : undefined;
    this.selectedWantedFieldspickListValuesJSON = JSON.stringify(pickListValues);
    if (selectedWantedFields.length > 0) {
      this.currentFieldsSettingsLabel = selectedWantedFields[0].fieldLabel;
      this.selectedWantedFields = selectedWantedFields;
      this.selectedWantedFieldsJSON = JSON.stringify(selectedWantedFields);
      this.instance.fieldSettings.show = true;
    } else {
      toastInfo(this, this.Label.MSG_No_Items_Selected);
    }
    return false;
  }
  preventDefaultHandler(event) {
    event.preventDefault();
    return false;
  }
  iconChangeHandler(event) {
    this.instance.currentTemplate.icon = event.detail.value;
  }
  TemplateChangeHandler(event) {
    let templateValue = event.currentTarget.dataset.id;
    this.TemplateChange(templateValue);
    this.closeDropdownTemplate();
  }
  TemplateChange(templateValue) {
    this.searchTermTemplate = '';
    this.queryTermDetail = '';
    this.queryTermMaster = '';
    this.objectRefFields = [];
    this.objectFields = [];
    this.searchFields(null);
    try {
      // this.filterableFieldsList = [];
      this.instance.currentTemplate.fields = [];
      this.instance.currentTemplate.masterfields = [];
      this.defaultUserFilter = [];
      this.userFiltersList = [];
      this.deselectAllSelects();
      this.separatorIndex = 0;
      if (templateValue == this.instance.defaultNewTemplate.value) {
        //this.Default_Page_Size = '50';
        this.instance.currentTemplate.value = this.instance.defaultNewTemplate.value;
        this.instance.currentTemplate.type = 'Detail';
        this.instance.currentTemplate.name = '';
        this.instance.currentTemplate.label = this.instance.Templates.hasOwnProperty(templateValue) ? this.instance.Templates[templateValue].MasterLabel : '';
        // this.instance.currentTemplate.customJS = '';
        this.instance.currentTemplate.filters = '[]';
        this.instance.currentTemplate.icon = 'standard:orders';
        this.currentObjectValue = this.instance.currentObject.value = this.instance.currentObject.value || this.instance.__objects[0].value;
        this.instance.currentMasterObject.value = (this.instance.currentMasterObject && this.instance.currentMasterObject.value ? this.instance.currentMasterObject.value : '') || (this.instance.masterObjects && this.instance.masterObjects.length > 0 ? this.instance.masterObjects[0].value : '');
        this.instance.currentMasterObject.relationName = (this.instance.currentMasterObject && this.instance.currentMasterObject.relationName ? this.instance.currentMasterObject.relationName : '') || (this.instance.masterObjects && this.instance.masterObjects.length > 0 ? this.instance.masterObjects[0].relationName : '');
        this.currentMasterObjectValue = this.instance.currentMasterObject.value;
        this.instance.currentTemplate.fields = [];
        this.instance.currentTemplate.readOnlyCriteria = '{}';
        this.instance.currentTemplate.masterfields = [];
        this.selectedObjectRefField = '';
        this.selectedObjectRefFieldLabel = '';
        this.ObjectRelatedFieldsFieldsShowStatus = false;
        this.ObjectRelatedFieldsFieldsDisableStatus = !this.ObjectRelatedFieldsFieldsShowStatus;
        this.generateJSON();
        this.generateMasterJSON();
      } else {
        // console.table(JSON.parse(JSON.stringify(this.instance.Templates[templateValue])));
        this.instance.currentTemplate.value = templateValue;
        this.instance.currentTemplate.name = templateValue;
        this.instance.currentTemplate.label = this.instance.Templates[templateValue].MasterLabel;
        this.instance.currentTemplate.type = this.instance.Templates[templateValue][this.normalizedApiName.Type__c] || 'Detail';
        // this.instance.currentTemplate.customJS = this.instance.Templates[templateValue][this.normalizedApiName.Custom_JS__c] || '';
        this.instance.currentTemplate.filters = this.instance.Templates[templateValue][this.normalizedApiName.Filters__c] || '[]';
        this.instance.currentTemplate.readOnlyCriteria = this.instance.Templates[templateValue][this.normalizedApiName.ReadOnly_Criteria__c] || '{}';
        this.readOnlyCriteriasJSON = this.instance.Templates[templateValue][this.normalizedApiName.ReadOnly_Criteria__c] || '{}';
        this.instance.currentTemplate.namespacePrefix = this.instance.Templates[templateValue].NamespacePrefix;
        this.defaultUserFilter = JSON.parse(this.instance.currentTemplate.filters).filter(item => {
          if (item && item.hasOwnProperty("userFilterable")) {
            if (item.userFilterable)
              return item;
          }
        }).map(item => item.fieldName);
        this.searchTermTemplate = this.instance.gridLayouts.filter(item => item.value == templateValue)[0].label;
        this.userFiltersList = this.defaultUserFilter;
        this.instance.currentTemplate.icon = this.instance.Templates[templateValue][this.normalizedApiName.Icon__c] || 'standard:orders';
        this.instance.currentTemplate.Default_Page_Size = (this.instance.Templates[templateValue][this.normalizedApiName.Grid_Configuration__c] && JSON.parse(this.instance.Templates[templateValue][this.normalizedApiName.Grid_Configuration__c]).Default_Page_Size || '50') + '';
        this.instance.currentObject.value = this.instance.Templates[templateValue][this.normalizedApiName.Object_Name__c];
        this.currentObjectValue = this.instance.currentObject.value;
        // if (this.instance.displayMaster) {
        //   this.instance.currentMasterObject.value = this.instance.Templates[templateValue][this.normalizedApiName.Master_Object_Name__c];
        //   this.instance.currentMasterObject.relationName = this.instance.Templates[templateValue][this.normalizedApiName.Relationship_Name__c];
        //   this.currentMasterObjectValue = this.instance.currentMasterObject.value;
        // } else {
        //   this.instance.currentMasterObject.value = '';
        //   this.instance.currentMasterObject.relationName = '';
        //   this.currentMasterObjectValue = '';
        //   this.instance.currentTemplate.masterfields = [];
        // }
        this.instance.currentMasterObject.value = this.instance.Templates[templateValue][this.normalizedApiName.Master_Object_Name__c];
        this.instance.currentMasterObject.relationName = this.instance.Templates[templateValue][this.normalizedApiName.Relationship_Name__c] || this.instance.masterRelation;
        if (this.instance.currentMasterObject.relationName) {
          getAllReferenceFields({ fieldName: this.instance.currentMasterObject.relationName, objectName: this.currentObjectValue }).then(result => {
            for (let field of Object.values(result)) {
              this.objectRefFields.push({ label: field.fieldLabel.includes('>') ? field.fieldLabel.substring(0, field.fieldLabel.length - 1) : field.fieldLabel, value: field.fieldName, type: field.fieldType })
            }
          });
        }
        getAllFields({ objectName: this.currentObjectValue }).then(result => {
          for (let field of Object.values(result)) {
            this.objectFields.push({ label: field.fieldLabel, value: field.fieldName, type: field.fieldType })
          }
        });
        this.instance.currentMasterObject.key = this.instance.currentMasterObject.relationName ? this.instance.currentMasterObject.relationName + '-' + this.instance.currentMasterObject.value : this.instance.currentMasterObject.value;
        this.currentMasterObjectValue = this.instance.currentMasterObject.value;
        this.Loading = true;
        let self = this;
        let referenceFields = [];
        getGridSettingsFieldsLabel({
          'objectName': self.instance.currentObject.value,
          'columns': self.instance.Templates[templateValue][self.normalizedApiName.Columns__c]
        }).then(resultJSON => {
          if (resultJSON) {
            self.instance.currentTemplate.fields = [];
            let separatorIndex = 0;
            ////let listField = [];
            let result = JSON.parse(resultJSON);
            let temp = result.map(item => {
              let cssClass = '';
              if (item.fieldName.search('Separator') == 0) {
                separatorIndex++;
                return {
                  key: '--- Separator(' + (separatorIndex) + ') ---',
                  label: '--- Separator(' + (separatorIndex) + ') ---',
                  fieldLabel: '--- Separator(' + (separatorIndex) + ') ---',
                  value: '--- Separator(' + (separatorIndex) + ') ---',
                  isSeparator: true,
                  separatorSettings: item.separatorSettings,
                  cssClass: cssClass
                };
              } else {
                if (item.isPersonalised) {
                  cssClass = 'Personalised';
                } else if (!item.isCalculated && item.isInputField) {
                  cssClass = 'In';
                } else {
                  cssClass = 'Out';
                }
                if (item.fieldName.split('.').length > 1) {
                  referenceFields.push(item.fieldName.split('.')[0]);
                }
                return {
                  key: item.fieldName,
                  label: item.fieldLabel,
                  fieldLabel: item.fieldLabel,
                  helpText: item.helpText,
                  value: item.fieldName,
                  isCalculated: item.isCalculated,
                  isEncrypted: item.isEncrypted,
                  isFilterable: item.isFilterable,
                  isPersonalised: item.isPersonalised,
                  stringFieldType: item.stringFieldType,
                  bgColor: item.bgColor,
                  action: item.action,
                  picklistColorsMap: item.picklistColorsMap,
                  hasFileInput: item.hasFileInput,
                  displayFullURL: item.displayFullURL,
                  URLOption: item.URLOption,
                  replaceURLWith: item.replaceURLWith,
                  isInputField: !item.isCalculated && item.isInputField,
                  showInTotal: item.showInTotal || false,
                  internallyCalculated: item.internallyCalculated || false,
                  totalType: item.totalType || '',
                  fieldType: item.fieldType || '',
                  hasConditionalFormating: item.hasConditionalFormating,
                  nonConditional: item.nonConditional,
                  customJS: item.customJS,
                  formattingRulesList: item.formattingRulesList,
                  cssClass: cssClass,
                  defaultValue: item.defaultValue,
                  defaultExpression: item.defaultExpression,
                  defaultType: item.defaultType,
                  isHidden: item.isHidden,
                  clearOnClone: item.clearOnClone,
                  isSortable: item.isSortable,
                  controllerFieldActions: item.controllerFieldActions,
                };
              }
            });
            /* let columns = JSON.parse(self.instance.Templates[templateValue][self.normalizedApiName.Columns__c]);
            let missingFields = [];
             for (let index = 0; index < columns.length; index++) {
               if (columns[index].FieldName.toLowerCase() && !listField.includes(columns[index].FieldName.toLowerCase())) {
                 missingFields.push(columns[index].FieldName);
               }
             }
             if (missingFields.length > 0) {
               if (missingFields.length > 1) {
                 toastInfo(self,'info', 'Fields: ' + missingFields.join(', ') + ' don\'t exist anymore.');
               } else {
                 toastInfo(self,'info', 'Field: ' + missingFields[0] + ' doesn\'t exist anymore.');
               }
               self.showDissmisableMessage = true;
             }*/
            self.selectedObjectRefField = '';
            self.selectedObjectRefFieldLabel = '';
            self.ObjectRelatedFieldsFieldsShowStatus = false;
            self.ObjectRelatedFieldsFieldsDisableStatus = !self.ObjectRelatedFieldsFieldsShowStatus;
            setTimeout(() => {
              self.separatorIndex = separatorIndex;
              self.instance.currentTemplate.fields = temp;
              self.setSelectedFieldStyle();
              self.Loading = false;
              self.generateJSON();
              if (referenceFields.length > 0) {
                self.loadReferenceData(referenceFields);
              }
            }, 100);
          }
          self.Loading = false;
          if (self.instance.currentMasterObject.value) {
            self.Loading = true;
            getGridSettingsFieldsLabel({
              'objectName': self.instance.currentMasterObject.value,
              'columns': self.instance.Templates[templateValue][self.normalizedApiName.Master_Object_Columns__c]
            }).then(resultMasterJSON => {
              self.instance.currentTemplate.masterfields = [];
              if (resultMasterJSON) {
                let result = JSON.parse(resultMasterJSON);
                let temp = result.map(item => {
                  return {
                    key: item.fieldName,
                    label: item.fieldLabel,
                    fieldLabel: item.fieldLabel,
                    value: item.fieldName,
                  };
                });
                setTimeout(() => {
                  self.instance.currentTemplate.masterfields = temp;
                  self.Loading = false;
                  self.generateMasterJSON();
                }, 100);
              }
              self.Loading = false;
            }).catch(error => {
              toastError(self, error);
              self.Loading = false;
            });
          }
        }).catch(error => {
          console.error(error);
          console.error(JSON.stringify(error));
          toastError(self, error);
          self.Loading = false;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  ObjectTypeChangeHandler(event) {
    let newObjectValue = event && event.detail ? event.detail.value : '';
    if (newObjectValue != this.instance.currentObject.value) {
      this.currentObjectValue = this.instance.currentObject.value = newObjectValue;
      this.instance.currentTemplate.fields = [];
      this.generateJSON();
    }
    let masterObjects = this.instance.masterObjects;
    let currentMasterObjectValue = this.currentMasterObjectValue;
    if (!masterObjects || (masterObjects && currentMasterObjectValue && !masterObjects.some(item => item.value == currentMasterObjectValue || item.key == currentMasterObjectValue))) {
      this.MasterObjectTypeChangeHandler('');
    }
  }
  MasterObjectTypeChangeHandler(event) {
    let newObjectValue = event && event.detail ? event.detail.value : '';
    if (newObjectValue != this.instance.currentMasterObject.value) {
      this.instance.currentMasterObject.key = newObjectValue;
      if (newObjectValue.split('-').length > 1) {
        this.instance.currentMasterObject.value = newObjectValue.split('-')[1];
        this.instance.currentMasterObject.relationName = newObjectValue.split('-')[0];
      } else {
        this.instance.currentMasterObject.value = newObjectValue;
        this.instance.currentMasterObject.relationName = this.instance.masterRelation;
      }
      //TODO
      this.currentMasterObjectValue = this.instance.currentMasterObject.value;
      this.instance.currentTemplate.masterfields = [];
      this.generateMasterJSON();
    }
  }
  handleComboboxClick(event) {
    event.target.classList.toggle('slds-has-focus');
    this.template.querySelector('.comboboxTemplates').classList.toggle('slds-is-open');
  }
  get defaultPageSizeOptions() {
    return [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '25', value: '25' },
      { label: '50', value: '50' },
      { label: '75', value: '75' },
      { label: '100', value: '100' },
    ];
  }
  handleDefaultPageSizeChange(event) {
    this.instance.currentTemplate.Default_Page_Size = event.detail.value;
  }
  ObjectFieldsSelectChangedHandler() {
    let selectedFields = this.template.querySelector('select[data-recordid="ObjectFields"]').selectedOptions;
    this.instance.selection.selectedObjectFields = [];
    let hasReference = false;
    for (let index = 0; index < selectedFields.length; index++) {
      if (selectedFields[index].selected) {
        let item = { label: selectedFields[index].label, value: selectedFields[index].value };
        this.instance.selection.selectedObjectFields.push(item);
        if (!hasReference && item.label.includes('>')) {
          hasReference = true;
        }
      }
    }
    if (hasReference && this.instance.selection.selectedObjectFields.length == 1) {
      this.ObjectRelatedFieldsFieldsShowStatus = false;
      this.ObjectRelatedFieldsFieldsDisableStatus = !this.ObjectRelatedFieldsFieldsShowStatus;
      this.selectedObjectRefFieldLabel = this.instance.selection.selectedObjectFields[0].label;
      this.selectedObjectRefField = this.instance.selection.selectedObjectFields[0].value.includes('__r') ? this.instance.selection.selectedObjectFields[0].value.replace(/__r/g, '__c') : this.instance.selection.selectedObjectFields[0].value + 'Id';
      this.Loading = true;
    } else {
      this.selectedObjectRefField = '';
      this.selectedObjectRefFieldLabel = '';
      this.ObjectRelatedFieldsFieldsShowStatus = false;
      this.ObjectRelatedFieldsFieldsDisableStatus = !this.ObjectRelatedFieldsFieldsShowStatus;
    }
    this.deselectList2();
    this.setSelectedFieldStyle();
  }
  MasterObjectFieldsSelectChangedHandler() {
    let selectedFields = this.template.querySelector('select[data-recordid="MasterObjectFields"]').selectedOptions;
    this.instance.selection.selectedMasterObjectFields = [];
    for (let index = 0; index < selectedFields.length; index++) {
      if (selectedFields[index].selected) {
        let item = { label: selectedFields[index].label, value: selectedFields[index].value };
        this.instance.selection.selectedMasterObjectFields.push(item);
      }
    }
  }
  ObjectRefFieldFieldsSelectChangedHandler() {
    let selectedFields = this.template.querySelector('select[data-recordid="ObjectRelatedFieldsFields"]').selectedOptions;
    this.selectedObjectRefFieldFields = [];
    for (let index = 0; index < selectedFields.length; index++) {
      if (selectedFields[index].selected) {
        let item = { label: selectedFields[index].label, value: selectedFields[index].value };
        this.selectedObjectRefFieldFields.push(item);
      }
    }
    this.setSelectedFieldStyle();
  }
  WantedFieldsChangeHandler() {
    let selectedOptions = this.template.querySelector('select[data-recordid="wantedFields"]').selectedOptions;
    let selectedFields = [];
    for (let index = 0; selectedOptions && index < selectedOptions.length; index++) {
      selectedFields.push(selectedOptions[index].value);
    }
    this.selectedWantedFields = this.instance.currentTemplate.fields.filter(item => selectedFields.includes(item.value));
    this.currentFieldsSettingsLabel = this.selectedWantedFields.map(item => item.fieldLabel).join(', ');
    this.selectedWantedFieldsJSON = JSON.stringify(this.selectedWantedFields);
    this.setSelectedFieldStyle();
  }
  WantedMasterFieldsChangeHandler() {
    let selectedOptions = this.template.querySelector('select[data-recordid="wantedMasterFields"]').selectedOptions;
    let selectedFields = [];
    for (let index = 0; selectedOptions && index < selectedOptions.length; index++) {
      selectedFields.push(selectedOptions[index].value);
    }
    this.selectedMasterWantedFields = this.instance.currentTemplate.masterfields.filter(item => selectedFields.includes(item.value));
    this.selectedMasterWantedFieldsJSON = JSON.stringify(this.selectedMasterWantedFields);
  }
  checkSave() {
    if (!this.instance.currentTemplate.name) {
      toastInfo(this, this.Label.MSG_Template_No_Name);
      return;
    }
    if (!this.instance.currentObject.value && this.instance.currentTemplate.displayDetail) {
      toastInfo(this, this.Label.MSG_Template_No_Detail_Object);
      return;
    }
    if (!this.instance.currentMasterObject.value && this.instance.currentTemplate.displayMaster) {
      toastInfo(this, this.Label.MSG_Template_No_Master_Detail_Object);
      return;
    }
    let templateValue = trimDeveloperName(this.instance.currentTemplate.name).replace(/ /g, '_').replace(/_+/g, '_').substring(0, 40);
    if (this.instance.currentTemplate.value == this.instance.defaultNewTemplate.value && this.instance.gridLayouts.some(item => item.value == templateValue)) {
      this.showConfirmOverwrite = true;
      return;
    }
    this.instance.newTemplatePopUp.display = false;
    this.saveActionHandler();
  }
  confirmSave() {
    this.showConfirmOverwrite = false;
    this.instance.newTemplatePopUp.display = false;
    this.saveActionHandler();
  }
  confirmSaveAs() {
    this.showConfirmOverwrite = false;
    this.instance.newTemplatePopUp.display = false;
    this.showSaveAsMenu = false;
    this.instance.newTemplatePopUp.display = false;
    this.saveAsActionHandler();
  }
  saveActionHandler() {
    if (this.readOnlyCriteriaHasError) {
      toastError(this, this.Label.MSG_Invalid_Expression);
      return;
    }
    if (this.instance.currentTemplate.isMaster) {
      this.instance.currentTemplate.fields = [];
      this.instance.currentObject.value = '';
      this.instance.masterRelation = '';
    } else if (this.instance.currentTemplate.isDetail) {
      this.instance.currentTemplate.masterfields = [];
      this.instance.currentMasterObject.value = '';
      this.instance.masterRelation = '';
    }
    let objectName = this.instance.currentObject.value;
    let masterObjectName = this.instance.currentMasterObject.value;
    let relationName = this.instance.masterRelation;
    let selectedTemplate = this.instance.currentTemplate.value == undefined || this.instance.currentTemplate.value == 'Custom_Template' ? null : this.instance.currentTemplate.value;
    let templateName = trimDeveloperName(this.instance.currentTemplate.name).substring(0, 40);
    let templateLabel = this.instance.currentTemplate.label;
    let icon = this.instance.currentTemplate.icon;
    // let filters = this.instance.currentTemplate.filters;
    var filtersArray = JSON.parse(this.instance.currentTemplate.filters);
    filtersArray = filtersArray.filter(item => (!item.hasOwnProperty('userFilterable') || (item.hasOwnProperty('userFilterable') && ((item.hasOwnProperty('values') && item.values.length > 0) || (item.hasOwnProperty('value1') || item.hasOwnProperty('value2'))))));
    if (this.userFiltersList.length > 0) {
      for (var userFilter of this.userFiltersList) {
        if (filtersArray.filter(obj => obj.fieldName == userFilter).length == 0) {
          filtersArray.push({ "fieldName": userFilter, "values": [], "userFilterable": true });
        } else {
          for (var i in filtersArray) {
            if (filtersArray[i].fieldName == userFilter)
              filtersArray[i] = { "fieldName": filtersArray[i].fieldName, "values": filtersArray[i].values, "value1": filtersArray[i].value1, "value2": filtersArray[i].value2, "userFilterable": true };
          }
        }
      }
    }
    let filters = JSON.stringify(filtersArray);
    let readOnlyCriteria = this.instance.currentTemplate.readOnlyCriteria;
    this.instance.currentTemplate.filters = filters;
    let type = this.instance.currentTemplate.type;
    this.generateJSON();
    this.generateMasterJSON();
    let columns = this.instance.currentTemplate.GeneratedJSON;
    let masterColumns = this.instance.currentTemplate.GeneratedMasterJSON;
    if (this.instance.currentTemplate.value != this.instance.defaultNewTemplate.value) {
      this.instance.Templates[this.instance.currentTemplate.value][this.normalizedApiName.Columns__c] = this.instance.currentTemplate.GeneratedJSON;
      this.instance.Templates[this.instance.currentTemplate.value][this.normalizedApiName.Master_Object_Columns__c] = this.instance.currentTemplate.GeneratedMasterJSON;
      this.instance.Templates[this.instance.currentTemplate.value][this.normalizedApiName.Master_Object_Name__c] = this.instance.currentMasterObject.value;
    }
    let self = this;
    this.Loading = true;
    save({
      'objectName': objectName,
      'masterObjectName': masterObjectName,
      'selectedTemplate': selectedTemplate,
      'templateName': templateName,
      'masterLabel': templateLabel,
      'columns': columns,
      'masterColumns': masterColumns,
      'relationName': relationName,
      'icon': icon,
      'filters': filters,
      'readOnlyCriteria': readOnlyCriteria,
      'type': type,
      'namespacePrefix': this.instance.currentTemplate.namespacePrefix,
      'gridConfiguration': JSON.stringify({ Default_Page_Size: this.instance.currentTemplate.Default_Page_Size })
    }).then(result => {
      self.checkDeployementStatus(result);
      if (self.instance.currentTemplate.value == self.instance.defaultNewTemplate.value) {
        self.instance.currentTemplate.value = trimDeveloperName(self.instance.currentTemplate.name).replace(/ /g, '_').replace(/_+/g, '_').substring(0, 40);
        let gridLayouts = self.instance.gridLayouts;
        self.instance.gridLayouts = [];
        // self.instance.Templates[self.instance.currentTemplate.value] = {
        //   Object_Name__c: self.instance.currentObject.value,
        //   Master_Object_Name__c: self.instance.currentMasterObject.value,
        //   Columns__c: self.instance.currentTemplate.GeneratedJSON,
        //   Master_Object_Columns__c: self.instance.currentTemplate.GeneratedMasterJSON,
        //   Filters__c: self.instance.currentTemplate.filters,
        //   Icon__c: self.instance.currentTemplate.icon,
        //   Type__c: self.instance.currentTemplate.type
        // };
        let template = {};
        template[self.normalizedApiName.Object_Name__c] = self.instance.currentObject.value;
        template[self.normalizedApiName.Master_Object_Name__c] = self.instance.currentMasterObject.value;
        template[self.normalizedApiName.Columns__c] = self.instance.currentTemplate.GeneratedJSON;
        template[self.normalizedApiName.Master_Object_Columns__c] = self.instance.currentTemplate.GeneratedMasterJSON;
        template[self.normalizedApiName.Filters__c] = self.instance.currentTemplate.filters;
        template[self.normalizedApiName.ReadOnly_Criteria__c] = self.instance.currentTemplate.readOnlyCriteria;
        template[self.normalizedApiName.Icon__c] = self.instance.currentTemplate.icon;
        template[self.normalizedApiName.Grid_Configuration__c] = JSON.stringify({ Default_Page_Size: self.instance.currentTemplate.Default_Page_Size });
        template[self.normalizedApiName.Type__c] = self.instance.currentTemplate.type;
        template.MasterLabel = self.instance.currentTemplate.label;
        self.instance.Templates[self.instance.currentTemplate.value] = template;
        gridLayouts.unshift({
          label: self.instance.currentTemplate.label,
          //+ (self.instance.currentObject.value ? " [" + self.instance.currentObject.value + "]" : "") + (self.instance.currentMasterObject.value ? " [" + self.instance.currentMasterObject.value + "]" : ""),
          value: self.instance.currentTemplate.value,
          type: self.instance.currentTemplate.type,
          currentObject: self.instance.currentObject.value,
          masterObject: self.instance.currentMasterObject.value
        });
        self.instance.gridLayouts = gridLayouts;
      } else {
        self.instance.currentTemplate.value = trimDeveloperName(self.instance.currentTemplate.name).substring(0, 40);
        self.instance.gridLayouts = self.instance.gridLayouts.map(item => {
          if (item.value == self.instance.currentTemplate.value) {
            item.label = self.instance.currentTemplate.label,
              //+ " [" + self.instance.currentObject.value + "]" + (self.instance.currentMasterObject.value ? " [" + self.instance.currentMasterObject.value + "]" : "");
              item.value = self.instance.currentTemplate.value,
              item.type = self.instance.currentTemplate.type,
              item.currentObject = self.instance.currentObject.value,
              item.masterObject = self.instance.currentMasterObject.value
          }
          return item;
        });
        // self.instance.Templates[self.instance.currentTemplate.value] = {
        //   Object_Name__c: self.instance.currentObject.value,
        //   Master_Object_Name__c: self.instance.currentMasterObject.value,
        //   Columns__c: self.instance.currentTemplate.GeneratedJSON,
        //   Master_Object_Columns__c: self.instance.currentTemplate.GeneratedMasterJSON,
        //   Filters__c: self.instance.currentTemplate.filters,
        //   Icon__c: self.instance.currentTemplate.icon,
        //   Type__c: self.instance.currentTemplate.type
        // };
        let template = {};
        template[self.normalizedApiName.Object_Name__c] = self.instance.currentObject.value;
        template[self.normalizedApiName.Master_Object_Name__c] = self.instance.currentMasterObject.value;
        template[self.normalizedApiName.Columns__c] = self.instance.currentTemplate.GeneratedJSON;
        template[self.normalizedApiName.Master_Object_Columns__c] = self.instance.currentTemplate.GeneratedMasterJSON;
        template[self.normalizedApiName.Filters__c] = self.instance.currentTemplate.filters;
        template[self.normalizedApiName.ReadOnly_Criteria__c] = self.instance.currentTemplate.readOnlyCriteria;
        template[self.normalizedApiName.Icon__c] = self.instance.currentTemplate.icon;
        template[self.normalizedApiName.Grid_Configuration__c] = JSON.stringify({ Default_Page_Size: self.instance.currentTemplate.Default_Page_Size });
        template[self.normalizedApiName.Type__c] = self.instance.currentTemplate.type;
        template.MasterLabel = self.instance.currentTemplate.label;
        self.instance.Templates[self.instance.currentTemplate.value] = template;
      }
      // setTimeout(() => {
      //   self.Loading = false;
      //   // toastSuccess(self, self.Label.LBL_Save, self.Label.MSG_Save_Complete);
      //   // self.TemplateChange(self.instance.currentTemplate.value);
      // }, 100);
    }).catch(error => {
      toastError(self, error);
      self.Loading = false;
    });
  }
  loadReferenceData(referenceFields) {
    let self = this;
    if (this.currentObjectValue && referenceFields) {
      referenceFields.forEach(referenceField => {
        referenceField = !referenceField.endsWith('__r') && !referenceField.endsWith('Id') ? referenceField + 'Id' : referenceField.replace(/__r/g, '__c');
        getAllReferenceFields({ fieldName: referenceField, objectName: self.currentObjectValue }).then(result => {
          if (result) {
            for (let index in result) {
              let item = {};
              for (let field in result[index]) {
                item[field] = result[index][field];
              }
              let name = result[index].fieldName;
              self.instance.currentObject.fieldsMap[name] = item;
            }
          }
          this.Loading = false;
        }).catch(error => {
          toastError(self, error);
        });
      });
    }
  }
  saveAsBtnHandler() {
    this.instance.saveAsTemplateName = this.instance.currentTemplate.value;
    if (this.instance.currentTemplate.namespacePrefix != null && this.instance.currentTemplate.namespacePrefix != "" && this.instance.saveAsTemplateName.includes(this.instance.currentTemplate.namespacePrefix)) {
      this.instance.saveAsTemplateName = this.instance.saveAsTemplateName.replace(this.instance.currentTemplate.namespacePrefix + '__', '');
    }
    this.showSaveAsMenu = true;
  }
  personalisedFieldHide() {
    this.showPersonalizedAddForm = false;
  }
  saveAsHide() {
    this.showSaveAsMenu = false;
    this.instance.saveAsTemplateName = '';
  }
  cancelConfirmOverwrite() {
    this.showConfirmOverwrite = false;
  }
  deleteConfirmationHide() {
    this.showDeleteConfirm = false;
  }
  saveAsTemplateNameChangeHandler(event) {
    this.instance.saveAsTemplateName = event.detail.value;
  }
  personalisedFieldNameChangeHandler(event) {
    this.instance.personalisedField.name = event.detail.value;
  }
  personalisedFieldTypeChangeHandler(event) {
    this.instance.personalisedField.type = event.detail.value;
  }
  personalisedActionChangeHandler(event) {
    this.instance.personalisedField.action = event.detail.value;
  }
  personalisedRerenderChangeHandler(event) {
    this.instance.personalisedField.rerender = event.detail.value;
  }
  checkSaveAs() {
    if (!this.instance.saveAsTemplateName) {
      toastError(this, this.Label.MSG_Template_No_Name);
      return;
    }
    let templateValue = trimDeveloperName(this.instance.saveAsTemplateName).replace(/ /g, '_').replace(/_+/g, '_').substring(0, 40);
    if (this.instance.gridLayouts.some(item => item.value == templateValue)) {
      this.showConfirmOverwrite = true;
      return;
    } else {
      this.showSaveAsMenu = false;
      this.instance.newTemplatePopUp.display = false;
      this.saveAsActionHandler();
    }
  }
  saveAsActionHandler() {
    if (this.readOnlyCriteriaHasError) {
      toastError(this, this.Label.MSG_Invalid_Expression);
      return;
    }
    if (this.instance.currentTemplate.isMaster) {
      this.instance.currentTemplate.fields = [];
      this.instance.currentObject.value = undefined;
      this.instance.masterRelation = '';
    } else if (this.instance.currentTemplate.isDetail) {
      this.instance.currentTemplate.masterfields = [];
      this.instance.currentMasterObject.value = undefined;
      this.instance.masterRelation = '';
    }
    this.generateJSON();
    this.generateMasterJSON();
    let self = this;
    this.Loading = true;
    if (this.instance.currentTemplate.namespacePrefix != null && this.instance.currentTemplate.namespacePrefix != "" && this.instance.saveAsTemplateName.includes(this.instance.currentTemplate.namespacePrefix)) {
      this.instance.saveAsTemplateName = this.instance.saveAsTemplateName.replace(this.instance.currentTemplate.namespacePrefix + '__', '');
      // toastInfo(this, `Don't enter the name space prefix`);
    }
    this.instance.saveAsTemplateName = trimDeveloperName(this.instance.saveAsTemplateName.replace(/\_\_+/g, '_')).substring(0, 40);
    save({
      'objectName': this.instance.currentObject.value,
      'masterObjectName': this.instance.currentMasterObject.value,
      'selectedTemplate': '',
      'templateName': this.instance.saveAsTemplateName,
      'masterLabel': this.instance.currentTemplate.saveAsTemplateName,
      'columns': this.instance.currentTemplate.GeneratedJSON,
      'masterColumns': this.instance.currentTemplate.GeneratedMasterJSON,
      'relationName': this.instance.masterRelation,
      'icon': this.instance.currentTemplate.icon,
      'gridConfiguration': JSON.stringify({ Default_Page_Size: this.instance.currentTemplate.Default_Page_Size }),
      'filters': this.instance.currentTemplate.filters,
      'readOnlyCriteria': this.instance.currentTemplate.readOnlyCriteria,
      'type': this.instance.currentTemplate.type,
      'namespacePrefix': null,
    }).then(result => {
      self.checkDeployementStatus(result);
      self.instance.currentTemplate.value = self.instance.saveAsTemplateName;
      self.instance.currentTemplate.name = self.instance.currentTemplate.value;
      self.instance.currentTemplate.label = self.instance.currentTemplate.value;
      let gridLayouts = JSON.parse(JSON.stringify(self.instance.gridLayouts));
      self.instance.gridLayouts = [];
      if (gridLayouts.some(item => item.value == self.instance.currentTemplate.value)) {
        self.instance.currentTemplate.name = self.instance.currentTemplate.value;
      } else {
        gridLayouts.push({
          label: self.instance.currentTemplate.value,
          //+ (self.instance.currentObject.value ? " [" + self.instance.currentObject.value + "]" : "") + (self.instance.currentMasterObject.value ? " [" + self.instance.currentMasterObject.value + "]" : ""),
          type: self.instance.currentTemplate.type,
          value: self.instance.currentTemplate.value,
          currentObject: self.instance.currentObject.value,
          masterObject: self.instance.currentMasterObject.value
        });
      }
      // self.instance.Templates[self.instance.currentTemplate.value] = {
      //   Object_Name__c: self.instance.currentObject.value,
      //   Master_Object_Name__c: self.instance.currentMasterObject.value,
      //   Columns__c: self.instance.currentTemplate.GeneratedJSON,
      //   Master_Object_Columns__c: self.instance.currentTemplate.GeneratedMasterJSON,
      //   Filters__c: self.instance.currentTemplate.filters,
      //   Icon__c: self.instance.currentTemplate.icon,
      //   Type__c: self.instance.currentTemplate.type
      // };
      let template = {};
      template[self.normalizedApiName.Object_Name__c] = self.instance.currentObject.value;
      template[self.normalizedApiName.Master_Object_Name__c] = self.instance.currentMasterObject.value;
      template[self.normalizedApiName.Columns__c] = self.instance.currentTemplate.GeneratedJSON;
      template[self.normalizedApiName.Master_Object_Columns__c] = self.instance.currentTemplate.GeneratedMasterJSON;
      template[self.normalizedApiName.Filters__c] = self.instance.currentTemplate.filters;
      template[self.normalizedApiName.ReadOnly_Criteria__c] = self.instance.currentTemplate.readOnlyCriteria;
      template[self.normalizedApiName.Icon__c] = self.instance.currentTemplate.icon;
      template[self.normalizedApiName.Grid_Configuration__c] = JSON.stringify({ Default_Page_Size: self.instance.currentTemplate.Default_Page_Size });
      template[self.normalizedApiName.Type__c] = self.instance.currentTemplate.type;
      self.instance.Templates[self.instance.currentTemplate.value] = template;
      setTimeout(() => {
        self.instance.gridLayouts = gridLayouts;
        // toastSuccess(self, self.Label.LBL_Save_As, self.Label.MSG_Save_As_Complete);
        self.saveAsHide();
        self.showConfirmOverwrite = false;
        self.instance.newTemplatePopUp.display = false;
        self.Loading = false;
        self.TemplateChange(self.instance.currentTemplate.value);
      }, 100);
    }).catch(error => {
      toastError(self, error);
      self.Loading = false;
    });
  }
  openChangeTypePopUpHandler() {
    this.instance.changeTypePopUp.type = this.instance.currentTemplate.type;
    this.instance.changeTypePopUp.display = true;
  }
  closeChangeTypePopUpHandler() {
    this.instance.changeTypePopUp.type = '';
    this.instance.changeTypePopUp.display = false;
  }

  confirmChangeTypePopUpHandler() {
    this.instance.currentTemplate.type = this.instance.changeTypePopUp.type;
    let objects = this.instance.objects;
    let currentObjectValue = this.currentObjectValue;
    if (!objects || (objects && currentObjectValue && !objects.some(item => item.value == currentObjectValue || item.key == currentObjectValue))) {
      this.ObjectTypeChangeHandler('');
    }
    this.instance.changeTypePopUp.type = '';
    this.instance.changeTypePopUp.display = false;
  }
  changeTypePopUpHandler(event) {
    this.instance.changeTypePopUp.type = event.detail.value;
  }
  newBtnHandler() {
    this.TemplateChange(this.instance.defaultNewTemplate.value);
    this.instance.newTemplatePopUp.display = true;
  }
  cancelNewTemplate() {
    this.TemplateChange(this.instance.defaultNewTemplate.value);
    this.instance.newTemplatePopUp.display = false;
  }
  saveNewTemplate() {
    this.checkSave();
  }
  setTemplateTypeHandler(event) {
    this.instance.currentTemplate.type = event.detail.value;
  }
  setTemplateNameHandler(event) {
    this.instance.currentTemplate.label = event.detail.value;
    this.instance.currentTemplate.name = trimDeveloperName(event.detail.value).substring(0, 40);
  }
  cancelBtnHandler() {
    this.searchTermTemplate = '';
    // this[NavigationMixin.Navigate]({
    //   type: 'standard__namedPage',
    //   attributes: {
    //     pageName: 'home'
    //   },
    // });
    this.instance.currentTemplate.value = this.instance.defaultNewTemplate.value;
    this.LoadGridLayouts();
  }
  templateNameChangeHandler(event) {
    this.instance.currentTemplate.name = event.detail.value;
  }
  InOutChangeHandler(event) {
    if (this.InOutValue != event.currentTarget.dataset.recordid) {
      this.InOutValue = event.currentTarget.dataset.recordid;
      this.isInputField = this.InOutValue == 'input';
    }
  }

  setSelectedFieldStyle() {
    this.filteredFieldsList.forEach(item1 => {
      if (this.instance.currentTemplate.fields.some(item2 => item2.fieldName == item1.fieldName && item2.value == item1.value)) {
        item1.cssClass = "dimmedField";
      } else {
        item1.cssClass = "";
      }
    });
    this.ObjectRelatedFieldsFields.forEach(item1 => {
      if (this.instance.currentTemplate.fields.some(item2 => item2.fieldName == item1.fieldName && item2.value == item1.value)) {
        item1.cssClass = "dimmedField";
      } else {
        item1.cssClass = "";
      }
    });
    this.filteredMasterObjFieldsList.forEach(item1 => {
      if (this.instance.currentTemplate.masterfields.some(item2 => item2.fieldName == item1.fieldName && item2.value == item1.value)) {
        item1.cssClass = "dimmedField";
      } else {
        item1.cssClass = "";
      }
    });
  }
  clearSearchQueries() {
    this.queryTermDetail = '';
    this.queryTermMaster = '';
    this.queryTermRef = '';
    this.searchFields(null);
  }
  handleSearchFields(event) {
    let tabName = event.currentTarget.dataset.tab;
    let value = trimRegex(event.target.value);
    let hasChange = false;
    if (tabName == 'detail') {
      hasChange = this.queryTermDetail != value;
      this.queryTermDetail = value;
    } else if (tabName == 'master') {
      hasChange = this.queryTermMaster != value;
      this.queryTermMaster = value;
    } else if (tabName == 'ref-detail') {
      hasChange = this.queryTermRef != value;
      this.queryTermRef = value;
    }
    if (hasChange) {
      this.searchFields(tabName);
    }
  }
  searchFields(tabName) {
    if (!tabName || tabName == 'detail') {
      let queryTermDetail = this.queryTermDetail ? new RegExp(this.queryTermDetail.toLowerCase().trim().replace(/\*/g, '.*'), "i") : '';
      this.filteredFieldsList = queryTermDetail != '' ? this.instance.currentObject.objectFields.filter(item => {
        let match1 = item.label.match(queryTermDetail);
        let match2 = item.value.match(queryTermDetail);
        return (match1 && match1.length) || (match2 && match2.length);
      }) : this.instance.currentObject.objectFields.map(item => item);
      this.deselectAllSelects();
    }
    if (!tabName || tabName == 'master') {
      let queryTermMaster = this.queryTermMaster ? new RegExp(this.queryTermMaster.toLowerCase().trim().replace(/\*/g, '.*'), "i") : '';
      this.filteredMasterObjFieldsList = queryTermMaster != '' ? this.instance.currentMasterObject.objectFields.filter(item => {
        let match1 = item.label.match(queryTermMaster);
        let match2 = item.value.match(queryTermMaster);
        return (match1 && match1.length) || (match2 && match2.length);
      }) : this.instance.currentMasterObject.objectFields.map(item => item);
      this.deselectAllSelects();
    }
    if (!tabName || tabName == 'ref-detail') {
      let queryTermRef = this.queryTermRef ? new RegExp(this.queryTermRef.toLowerCase().trim().replace(/\*/g, '.*'), "i") : '';
      this.filteredRefFieldsList = queryTermRef != '' ? this.ObjectRelatedFieldsFields.filter(item => {
        let match1 = item.label.match(queryTermRef);
        let match2 = item.value.match(queryTermRef);
        return (match1 && match1.length) || (match2 && match2.length);
      }) : this.ObjectRelatedFieldsFields.map(item => item);
      this.deselectList2();
    }
    this.setSelectedFieldStyle();
  }
  openEditGridTemplatePopup() {
    this.showEditGridTemplatePopup = true;
  }
  closeEditGridTemplatePopup() {
    this.showEditGridTemplatePopup = false;
  }
  confirmChangeGridTemplatePopUpHandler() {
    let labelElem = this.template.querySelector(".gridTemplateLabel");
    if (labelElem && labelElem.value) {
      this.instance.currentTemplate.label = labelElem.value;
      this.showEditGridTemplatePopup = false;
    }
  }
  generateJSON() {
    let arrSelectedField = this.instance.currentTemplate.fields;
    let savedFields = [];
    if (arrSelectedField != undefined) {
      for (let field in arrSelectedField) {
        let item = {};
        if (arrSelectedField[field].value.includes('.')) {
          let referenceApiName = arrSelectedField[field].value.split('.')[1];
          if (referenceApiName.includes('Product2')) {
            referenceApiName = 'Product__r';
            item.FieldName = referenceApiName + '.' + arrSelectedField[field].value.split('.')[2];
          } else {
            item.FieldName = arrSelectedField[field].value;
          }
        } else if (arrSelectedField[field].value.includes('Separator')) {
          item.FieldName = "";
          if (arrSelectedField[field].separatorSettings) {
            item.separatorSettings = arrSelectedField[field].separatorSettings;
          }
          savedFields.push(item);
          continue;
        } else {
          item.FieldName = arrSelectedField[field].value;
        }
        if (arrSelectedField[field].customJS) {
          item.customJS = arrSelectedField[field].customJS.replace(/(?:\r\n|\r|\n)/g, "");
        }
        if (arrSelectedField[field].nonConditional) {
          item.nonConditional = arrSelectedField[field].nonConditional;
        }
        if (arrSelectedField[field].hasConditionalFormating) {
          item.hasConditionalFormating = arrSelectedField[field].hasConditionalFormating;
        }
        if (arrSelectedField[field].isPersonalised) {
          item.isPersonalised = arrSelectedField[field].isPersonalised;
          item.stringFieldType = arrSelectedField[field].stringFieldType;
          item.action = arrSelectedField[field].action;
          item.rerender = arrSelectedField[field].rerender;
        }
        if (arrSelectedField[field].isInputField) {
          item.isInputField = arrSelectedField[field].isInputField;
        }
        if (arrSelectedField[field].showInTotal) {
          item.showInTotal = arrSelectedField[field].showInTotal;
          item.totalType = arrSelectedField[field].totalType;
        }
        if (arrSelectedField[field].internallyCalculated) {
          item.internallyCalculated = arrSelectedField[field].internallyCalculated;
        }
        if (arrSelectedField[field].picklistColorsMap) {
          item.picklistColorsMap = arrSelectedField[field].picklistColorsMap;
        }
        if (arrSelectedField[field].controllerFieldActions) {
          item.controllerFieldActions = arrSelectedField[field].controllerFieldActions;
        }
        if (arrSelectedField[field].hasFileInput != null) {
          item.hasFileInput = arrSelectedField[field].hasFileInput;
        }
        if (arrSelectedField[field].displayFullURL != null) {
          item.displayFullURL = arrSelectedField[field].displayFullURL;
        }
        if (arrSelectedField[field].URLOption != null) {
          item.URLOption = arrSelectedField[field].URLOption;
        }
        if (arrSelectedField[field].replaceURLWith != null) {
          item.replaceURLWith = arrSelectedField[field].replaceURLWith;
        }
        if (arrSelectedField[field].defaultType) {
          item.defaultType = arrSelectedField[field].defaultType;
        }
        if (arrSelectedField[field].bgColor) {
          item.bgColor = arrSelectedField[field].bgColor;
        }
        if (arrSelectedField[field].defaultValue) {
          item.defaultValue = arrSelectedField[field].defaultValue;
        }
        if (arrSelectedField[field].defaultExpression) {
          item.defaultExpression = arrSelectedField[field].defaultExpression;
        }
        if (arrSelectedField[field].isHidden) {
          item.isHidden = arrSelectedField[field].isHidden;
        }
        if (arrSelectedField[field].clearOnClone) {
          item.clearOnClone = arrSelectedField[field].clearOnClone;
        }
        if (arrSelectedField[field].isSortable) {
          item.isSortable = arrSelectedField[field].isSortable;
        }
        if (arrSelectedField[field].formattingRulesList && arrSelectedField[field].formattingRulesList != []) {
          let formattingRulesList = arrSelectedField[field].formattingRulesList;
          for (let index = 0; index < formattingRulesList.length; index++) {
            if (formattingRulesList[index].style) {
              formattingRulesList[index].style = formattingRulesList[index].style;
            }
            if (formattingRulesList[index].oppositeStyle) {
              formattingRulesList[index].oppositeStyle = formattingRulesList[index].oppositeStyle;
            }
          }
          item.formattingRulesList = formattingRulesList;
        }
        savedFields.push(item);
      }
    }
    this.instance.currentTemplate.GeneratedJSON = JSON.stringify(savedFields);
    if (this.instance.currentTemplate.GeneratedJSON.length > 131072) {
      toastInfo(this, this.Label.MSG_Field_Length_Limit);
    }
    this.generatePreview();
  }
  generateMasterJSON() {
    let arrSelectedField = this.instance.currentTemplate.masterfields;
    let savedFields = [];
    if (arrSelectedField != undefined) {
      for (let field in arrSelectedField) {
        let item = {};
        if (arrSelectedField[field].value.includes('.')) {
          let referenceApiName = arrSelectedField[field].value.split('.')[1];
          if (referenceApiName.includes('Product2')) {
            referenceApiName = 'Product__r';
            item.FieldName = referenceApiName + '.' + arrSelectedField[field].value.split('.')[2];
          } else {
            item.FieldName = arrSelectedField[field].value;
          }
        } else {
          item.FieldName = arrSelectedField[field].value;
        }
        savedFields.push(item);
      }
    }
    this.instance.currentTemplate.GeneratedMasterJSON = JSON.stringify(savedFields);
    if (this.instance.currentTemplate.GeneratedMasterJSON.length > 131072) {
      toastInfo(this, this.Label.MSG_Field_Length_Limit);
    }
  }
  generatePreview() {
    this.showPreview = false;
    this.previewTable = [];
    let savedFields = [];
    let lastField;
    for (let index = 0; index < this.instance.currentTemplate.fields.length; index++) {
      let label = this.instance.currentTemplate.fields[index].label;
      if (label && label.split('.').length > 1) {
        label = this.instance.currentTemplate.fields[index].label.split('.')[1];
      }
      let item = {};
      item.FieldLabel = label;
      item.formattingRulesList = this.instance.currentTemplate.fields[index].formattingRulesList;
      item.isCalculated = this.instance.currentTemplate.fields[index].isCalculated;
      item.isEncrypted = this.instance.currentTemplate.fields[index].isEncrypted;
      item.isFilterable = this.instance.currentTemplate.fields[index].isFilterable;
      item.isFormulaAndLogo = item.isCalculated && item.FieldLabel.toLowerCase().includes('logo');
      item.isPersonalised = this.instance.currentTemplate.fields[index].isPersonalised;
      item.isButton = item.isPersonalised && this.instance.currentTemplate.fields[index].stringFieldType == 'Button';
      item.isLink = item.isPersonalised && this.instance.currentTemplate.fields[index].stringFieldType == 'Link';
      item.isInputField = !item.isCalculated && this.instance.currentTemplate.fields[index].isInputField;
      item.fieldType = this.instance.currentTemplate.fields[index].fieldType;
      item.fieldApiName = this.instance.currentTemplate.fields[index].value;
      item.isSeparator = this.instance.currentTemplate.fields[index].isSeparator;
      item.nonConditional = this.instance.currentTemplate.fields[index].nonConditional;
      item.isBoolean = item.fieldType == 'BOOLEAN';
      item.isString = item.fieldType == 'STRING';
      item.isTextArea = item.fieldType == 'TEXTAREA';
      item.isDouble = item.fieldType == 'DOUBLE';
      item.isPickList = item.fieldType == 'PICKLIST';
      item.isMultiPickList = item.fieldType == 'MULTIPICKLIST';
      item.isReference = item.fieldType == 'REFERENCE';
      item.isInteger = item.fieldType == 'INTEGER';
      item.isPercent = item.fieldType == 'PERCENT';
      item.isDate = item.fieldType == 'DATE';
      item.isDateTime = item.fieldType == 'DATETIME';
      item.isId = item.fieldType == 'ID';
      item.isCurrency = item.fieldType == 'CURRENCY';
      item.hasHelpText = this.instance.currentTemplate.fields[index].helpText ? true : false;
      item.helpText = this.instance.currentTemplate.fields[index].helpText;
      if (item.isSeparator) {
        item.separatorSettings = this.instance.currentTemplate.fields[index].separatorSettings ? this.instance.currentTemplate.fields[index].separatorSettings : {};
        item.separatorSettings.size = item.separatorSettings.size ? item.separatorSettings.size : '1px';
        item.separatorSettings.color = item.separatorSettings.color ? item.separatorSettings.color : '#000000';
        item.separatorSettings.pattern = item.separatorSettings.pattern ? item.separatorSettings.pattern : 'solid';
      }
      let fieldStyle = item.nonConditional || '';
      let nonConditional = '';
      if (fieldStyle) {
        let textStyle = fieldStyle.textStyle;
        let borderStyle = fieldStyle.borderStyle;
        nonConditional += fieldStyle.width ? 'min-width: ' + fieldStyle.width + '; max-width: ' + fieldStyle.width + '; width: ' + fieldStyle.width + ';' : '';
        nonConditional += fieldStyle.bgColor ? 'background-color: ' + fieldStyle.bgColor + ';' : '';
        if (textStyle) {
          nonConditional += textStyle.isItalic ? 'font-style: italic;' : '';
          nonConditional += textStyle.isBold ? 'font-weight: bold;' : '';
          nonConditional += textStyle.isUnderLine || textStyle.isStrikeThrought ? 'text-decoration:' + (textStyle.isUnderLine ? ' underline ' : '') + (textStyle.isStrikeThrought ? ' line-through ' : '') + ';' : '';
          nonConditional += textStyle.color ? 'color: ' + textStyle.color + ';' : '';
          nonConditional += textStyle.size ? 'font-size: ' + textStyle.size + ';' : '';
          nonConditional += textStyle.align ? 'text-align: ' + textStyle.align + ';' : '';
        }
        if (borderStyle) {
          nonConditional += borderStyle.size ? 'border-width: ' + borderStyle.size + ';' : '';
          nonConditional += borderStyle.color ? 'border-color: ' + borderStyle.color + ';' : '';
          nonConditional += borderStyle.pattern ? 'border-style: ' + borderStyle.pattern + ';' : '';
        }
        if (fieldStyle.isAdvanced) {
          nonConditional = fieldStyle.style;
        }
      }
      item.thnonConditional = 'white-space : nowrap;' + (lastField && lastField.isSeparator ? 'border-left: ' + lastField.separatorSettings.size + ' ' + lastField.separatorSettings.pattern + ' ' + lastField.separatorSettings.color + ';' : ' ') + nonConditional;
      if (item.isSeparator) {
        lastField = item;
      } else {
        lastField = null;
        savedFields.push(item);
      }
    }
    let self = this;
    setTimeout(() => {
      self.previewTable = savedFields;
      self.showPreview = self.showPreviewValue && self.hasPreview;
    }, 100);
  }
  get hasPreview() {
    return this.previewTable && this.previewTable.length > 0;
  }
  previewTableActionHandler(event) {
    let fieldApiName = event.currentTarget.dataset.fieldApiName;
    let field = this.instance.currentTemplate.fields.find(item => item.value == fieldApiName);
    if (field) {
      if (field.customJS) {
        try {
          eval(field.customJS);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
  pickViewhandler() {
    this.showPreviewValue = !this.showPreviewValue;
    this.showPreview = this.showPreviewValue && this.hasPreview;
  }
  resetMasterObjecthandler() {
    this.instance.currentMasterObject.value = '';
    this.instance.currentMasterObject.objectFields = [];
    this.instance.currentTemplate.masterfields = [];
    this.currentMasterObjectValue = this.instance.currentMasterObject.value;
    this.selectedMasterWantedFields = [];
  }
  resetIconhandler() {
    this.instance.currentTemplate.icon = 'standard:orders';
  }
  openSettings(event) {
    if (event)
      event.preventDefault();
    if (this.selectedWantedFieldsJSON) {
      let selectedWantedFields = JSON.parse(this.selectedWantedFieldsJSON);
      if (selectedWantedFields && selectedWantedFields.length == 1) {
        let pickListValues = this.instance.currentObject.fieldsMap.hasOwnProperty(selectedWantedFields[0].value) ? this.instance.currentObject.fieldsMap[selectedWantedFields[0].value].pickListValues : undefined;
        this.selectedWantedFieldspickListValuesJSON = pickListValues ? JSON.stringify(pickListValues) : undefined;
      } else {
        this.selectedWantedFieldspickListValuesJSON = undefined;
      }
      this.instance.fieldSettings.show = true;
    } else {
      toastInfo(this, this.Label.MSG_No_Items_Selected);
    }
  }
  closeSettings() {
    this.instance.fieldSettings.show = false;
  }
  confirmSettings(event) {
    let self = this;
    this.Loading = true;
    let fieldsJSON = event.detail.value;
    let newFieldsList = JSON.parse(fieldsJSON);
    if (!newFieldsList || (newFieldsList && newFieldsList.length == 0)) {
      this.Loading = false;
      return;
    }
    this.closeSettings();
    let temp = this.instance.currentTemplate.fields;
    this.instance.currentTemplate.fields = [];
    this.selectedWantedFields = [];
    temp = temp.map(item => {
      let newItem = JSON.parse(JSON.stringify(item));
      newFieldsList.forEach(item2 => {
        if (item.key == item2.key) {
          newItem = JSON.parse(JSON.stringify(item2));
          newItem.isInputField = !newItem.isCalculated && newItem.isInputField && !newItem.fieldLabel.includes('>');
          if (!newItem.isSeparator) {
            if (newItem.isPersonalised) {
              newItem.cssClass = 'Personalised';
              newItem.label = newItem.value;
              newItem.fieldLabel = newItem.value;
            } else if (newItem.isInputField) {
              newItem.cssClass = 'In';
            } else {
              newItem.cssClass = 'Out';
            }
          }
          self.selectedWantedFields.push(item);
        }
      });
      return newItem;
    });
    setTimeout(() => {
      self.instance.currentTemplate.fields = temp;
      self.generateJSON();
      self.Loading = false;
      self.deselectList3();
      self.selectList3(self.selectedWantedFields);
    }, 100);
  }
  confirmReadOnlyExpressionEditor(event) {
    this.Loading = true;
    let readOnlyCriteriasJSON = event.detail.value;
    this.readOnlyCriteriaHasError = event.detail.hasError;
    this.readOnlyCriteriasJSON = readOnlyCriteriasJSON;
    this.instance.currentTemplate.readOnlyCriteria = readOnlyCriteriasJSON;
    this.Loading = false;
  }
  // openFilterSettings() {
  //   let self = this;
  //   let arrSelectedField = this.instance.currentTemplate.fields;
  //   let filters = JSON.parse(this.instance.currentTemplate.filters);
  //   let filtersMap = {};
  //   filters.forEach(item => {
  //     filtersMap[item.fieldName] = item;
  //   });
  //   if (arrSelectedField != undefined) {
  //     let excludedTypes = [
  //       'ADDRESS',
  //       'TEXTAREA',
  //       'LOCATION',
  //     ];
  //     this.instance.filterSettings.fields = [];
  //     let fields = [];
  //     let key = 'RecordTypeId';
  //     if (this.instance.currentObject.fieldsMap.hasOwnProperty(key)) {
  //       let field = this.instance.currentObject.fieldsMap[key];
  //       filtersMap[field.fieldName] = Object.assign(JSON.parse(JSON.stringify(filtersMap.hasOwnProperty(field.fieldName) ? filtersMap[field.fieldName] : {})), JSON.parse(JSON.stringify({ fieldName: field.fieldName, fieldLabel: field.fieldLabel, stringFieldType: 'RECORDTYPE', pickListValues: field.pickListValues, isMultiLevel: field.fieldName.includes('.') })));
  //     }
  //     arrSelectedField.filter(item => {
  //       return item.isFilterable && !item.isCalculated && !excludedTypes.includes(item.fieldType);
  //     }).forEach(item => {
  //       let pickListValues = self.instance.currentObject.fieldsMap.hasOwnProperty(item.key) ? self.instance.currentObject.fieldsMap[item.key].pickListValues : undefined;
  //       filtersMap[item.key] = Object.assign(JSON.parse(JSON.stringify(filtersMap.hasOwnProperty(item.key) ? filtersMap[item.key] : {})), JSON.parse(JSON.stringify({ fieldName: item.key, fieldLabel: item.fieldLabel, stringFieldType: !item.key.includes('RecordTypeId') ? item.fieldType : 'RECORDTYPE', pickListValues: pickListValues && pickListValues.length ? JSON.parse(JSON.stringify(pickListValues)) : [], isMultiLevel: item.key.includes('.') })));
  //     });
  //     fields = Object.values(filtersMap).sort((item1, item2) => item1.fieldName.includes('RecordTypeId') || item2.fieldName.includes('RecordTypeId') ? 1 : item2.fieldName.localeCompare(item2.fieldName));
  //     if (fields.length) {
  //       this.instance.filterSettings.fields = JSON.stringify(fields);
  //       this.instance.filterSettings.show = true;
  //     }
  //   }
  // }
  openFilterSettings() {
    let self = this;
    let excludedTypes = [
      'ADDRESS',
      'TEXTAREA',
      'LOCATION',
    ];
    let arrSelectedField = [];
    Object.values(this.instance.currentObject.fieldsMap).forEach(item => {
      if (!item.fieldLabel.includes('>') && item.isFilterable  && !excludedTypes.includes(item.fieldType)) {
        let newItem = JSON.parse(JSON.stringify(item));
        newItem.key = newItem.fieldName;
        arrSelectedField.push(newItem);
      }
    });
    let filters = JSON.parse(this.instance.currentTemplate.filters);
    let filtersMap = {};
    filters.forEach(item => {
      filtersMap[item.fieldName] = item;
    });
    if (arrSelectedField) {
      this.instance.filterSettings.fields = [];
      let fields = [];
      let key = 'RecordTypeId';
      if (this.instance.currentObject.fieldsMap.hasOwnProperty(key)) {
        let field = this.instance.currentObject.fieldsMap[key];
        filtersMap[field.fieldName] = Object.assign(JSON.parse(JSON.stringify(filtersMap.hasOwnProperty(field.fieldName) ? filtersMap[field.fieldName] : {})), JSON.parse(JSON.stringify({ fieldName: field.fieldName, fieldLabel: field.fieldLabel, stringFieldType: 'RECORDTYPE', pickListValues: field.pickListValues, isMultiLevel: field.fieldName.includes('.') })));
      }
      arrSelectedField.forEach(item => {
        let pickListValues = self.instance.currentObject.fieldsMap.hasOwnProperty(item.key) ? self.instance.currentObject.fieldsMap[item.key].pickListValues : undefined;
        filtersMap[item.key] = Object.assign(JSON.parse(JSON.stringify(filtersMap.hasOwnProperty(item.key) ? filtersMap[item.key] : {})), JSON.parse(JSON.stringify({ fieldName: item.key, fieldLabel: item.fieldLabel, stringFieldType: !item.key.includes('RecordTypeId') ? item.fieldType : 'RECORDTYPE', pickListValues: pickListValues && pickListValues.length ? JSON.parse(JSON.stringify(pickListValues)) : [], isMultiLevel: item.key.includes('.') })));
      });
      fields = Object.values(filtersMap).sort((item1, item2) => item1.fieldName.includes('RecordTypeId') || item2.fieldName.includes('RecordTypeId') ? 1 : item2.fieldName.localeCompare(item2.fieldName));
      if (fields.length) {
        this.instance.filterSettings.fields = JSON.stringify(fields);
        this.instance.filterSettings.show = true;
      }
    }
  }

  handleUserFilterChange(event) {
    this.userFiltersList = event.detail.value;
  }

  closeFilterSettings() {
    this.instance.filterSettings.show = false;
  }
  confirmFilterSettings(event) {
    let filters = JSON.parse(event.detail.value);
    this.instance.currentTemplate.filters = JSON.stringify(filters);
    this.instance.filterSettings.show = false;
  }
  addSelectedFieldsHandler() {
    if (this.selectedObjectRefFieldFields.length > 0) {
      let temp = this.instance.currentTemplate.fields;
      this.instance.currentTemplate.fields = [];
      let fields = this.selectedObjectRefFieldFields;
      for (let index = 0; index < fields.length; index++) {
        let originalField = this.instance.currentObject.fieldsMap[fields[index].value];
        if (temp.filter(item => !item.key.includes('--- Separator(')).length > (this.instance.limit.detail - 1)) {
          toastInfo(this, this.selectedObjectRefFieldLabel + originalField.fieldLabel + ' ' + this.Label.MSG_Field_Count_Exceded + ' ' + this.instance.limit.detail);
        } else {
          let isInputField = false;
          let cssclass = isInputField ? 'In' : 'Out';
          let item = { key: fields[index].value, fieldLabel: this.selectedObjectRefFieldLabel + originalField.fieldLabel, label: this.selectedObjectRefFieldLabel + originalField.fieldLabel, value: fields[index].value, isPersonalised: false, isInputField: isInputField, isSeparator: false, cssClass: cssclass, fieldType: this.instance.currentObject.fieldsMap[fields[index].value].fieldType, showInTotal: false, internallyCalculated:false, totalType: '' };
          addToArrayIfDoesntExist('value', item, temp);
        }
      }
      this.deselectList2();
      this.instance.currentTemplate.fields = temp;
      this.setSelectedFieldStyle();
      this.generateJSON();
    } else if (this.instance.selection.selectedObjectFields.length > 0) {
      let tobeadded = [];
      let likenessMap = this.likenessMap[this.instance.currentObject.value];
      this.instance.addrelatedFields.fieldStack = [];
      this.instance.selection.selectedObjectFields.forEach(item => {
        if (!item.label.includes('>') && !tobeadded.includes(item)) {
          tobeadded.push(item);
          let relatedFields = [];
          if (likenessMap && likenessMap.hasOwnProperty(item.value)) {
            likenessMap[item.value].forEach(likeField => {
              if (!likeField.label.includes('>') && !tobeadded.includes(likeField) && likeField.value != item.value) {
                tobeadded.push(likeField);
                relatedFields.push(likeField);
              }
            });
          }
          this.instance.addrelatedFields.fieldStack.push({ field: item, relatedFields: relatedFields });
        }
      });
      tobeadded = undefined;
      this.checkAddFromStack();
      this.deselectList2();
    } else {
      toastInfo(this, this.Label.MSG_No_Items_Selected);
    }
  }
  checkAddFromStack() {
    if (this.instance.addrelatedFields.fieldStack && this.instance.addrelatedFields.fieldStack.length > 0) {
      if (this.instance.addrelatedFields.fieldStack[0].relatedFields && this.instance.addrelatedFields.fieldStack[0].relatedFields.length > 0) {
        this.instance.addrelatedFields.originafieldLabel = this.instance.addrelatedFields.fieldStack[0].field.label;
        this.instance.addrelatedFields.relatedFieldsLabel = this.instance.addrelatedFields.fieldStack[0].relatedFields.map(item => item.label).join(', ');
        this.showAddrelatedPopup = true;
      } else {
        this.removeFromStack();
      }
    } else {
      this.showAddrelatedPopup = false;
      this.deselectList1();
      this.generateJSON();
    }
  }
  addFromStack() {
    if (this.instance.addrelatedFields.fieldStack && this.instance.addrelatedFields.fieldStack.length > 0) {
      let temp = this.instance.currentTemplate.fields;
      this.instance.currentTemplate.fields = [];
      let fields = this.instance.addrelatedFields.fieldStack[0].relatedFields;
      fields.push(this.instance.addrelatedFields.fieldStack[0].field);
      fields.sort((item1, item2) => item1.value.toLowerCase().localeCompare(item2.value.toLowerCase()));
      for (let index = 0; index < fields.length; index++) {
        if (temp.filter(item => !item.key.includes('--- Separator(')).length > (this.instance.limit.detail - 1)) {
          toastInfo(this, fields[index].label.replace(/>/g, '') + ' ' + this.Label.MSG_Field_Count_Exceded + ' ' + this.instance.limit.detail);
        } else {
          let isInputField = this.instance.currentObject.fieldsMap[fields[index].value].isCalculated || fields[index].label.includes('>') ? false : this.InOutValue == 'input' ? true : false;
          let cssclass = isInputField ? 'In' : 'Out';
          let item = { key: fields[index].value, label: fields[index].label.replace(/>/g, ''), fieldLabel: fields[index].label.replace(/>/g, ''), value: fields[index].value, isPersonalised: false, isInputField: isInputField, isSeparator: false, cssClass: cssclass, fieldType: this.instance.currentObject.fieldsMap[fields[index].value].fieldType, showInTotal: false, totalType: '', isCalculated: this.instance.currentObject.fieldsMap[fields[index].value].isCalculated, isEncrypted: this.instance.currentObject.fieldsMap[fields[index].value].isEncrypted, isFilterable: this.instance.currentObject.fieldsMap[fields[index].value].isFilterable };
          addToArrayIfDoesntExist('value', item, temp);
        }
      }
      this.instance.currentTemplate.fields = temp;
      this.setSelectedFieldStyle();
      this.instance.addrelatedFields.fieldStack.shift();
      this.showAddrelatedPopup = false;
      this.checkAddFromStack();
    }
  }
  removeFromStack() {
    if (this.instance.addrelatedFields.fieldStack.length > 0) {
      let temp = this.instance.currentTemplate.fields;
      this.instance.currentTemplate.fields = [];
      let fields = [];
      fields.push(this.instance.addrelatedFields.fieldStack[0].field);
      for (let index = 0; index < fields.length; index++) {
        if (temp.filter(item => !item.key.includes('--- Separator(')).length > (this.instance.limit.detail - 1)) {
          toastInfo(this, this.Label.MSG_Field_Count_Exceded + ' ' + this.instance.limit.detail);
        } else {
          let isInputField = this.instance.currentObject.fieldsMap[fields[index].value].isCalculated || fields[index].label.includes('>') ? false : this.InOutValue == 'input' ? true : false;
          let cssclass = isInputField ? 'In' : 'Out';
          let item = { key: fields[index].value, label: fields[index].label.replace(/>/g, ''), fieldLabel: fields[index].label.replace(/>/g, ''), value: fields[index].value, isPersonalised: false, isInputField: isInputField, isSeparator: false, cssClass: cssclass, fieldType: this.instance.currentObject.fieldsMap[fields[index].value].fieldType, showInTotal: false, totalType: '', internallyCalculated:false, isCalculated: this.instance.currentObject.fieldsMap[fields[index].value].isCalculated, isEncrypted: this.instance.currentObject.fieldsMap[fields[index].value].isEncrypted, isFilterable: this.instance.currentObject.fieldsMap[fields[index].value].isFilterable };
          addToArrayIfDoesntExist('value', item, temp);
        }
      }
      this.instance.currentTemplate.fields = temp;
      this.setSelectedFieldStyle();
      this.instance.addrelatedFields.fieldStack.shift();
      this.showAddrelatedPopup = false;
      this.checkAddFromStack();
    }
  }
  addSelectedMasterFieldsHandler() {
    let temp = this.instance.currentTemplate.masterfields;
    let changed = false;
    this.instance.currentTemplate.masterfields = [];
    if (this.instance.selection.selectedMasterObjectFields.length > 0) {
      changed = true;
      let fields = [];
      let likenessMap = this.likenessMap[this.instance.currentMasterObject.value];
      this.instance.selection.selectedMasterObjectFields.forEach(item => {
        if (!fields.includes(item)) {
          fields.push(item);
        }
        if (likenessMap && likenessMap.hasOwnProperty(item.value)) {
          likenessMap[item.value].forEach(likeField => {
            if (!fields.includes(likeField)) {
              fields.push(likeField);
            }
          });
        }
      });
      for (let index = 0; index < fields.length; index++) {
        if (temp.length > (this.instance.limit.banner - 1)) {
          toastInfo(this, fields[index].label.replace(/ >/g, '') + this.Label.MSG_Field_Count_Exceded + ' ' + this.instance.limit.banner);
        } else {
          let item = { key: fields[index].value, label: fields[index].label.replace(/ >/g, ''), fieldLabel: fields[index].label.replace(/ >/g, ''), value: fields[index].value };
          addToArrayIfDoesntExist('value', item, temp);
        }
      }
    }
    this.deselectList4();
    this.deselectList5();
    this.instance.currentTemplate.masterfields = temp;
    if (changed) {
      this.generateMasterJSON();
    }
  }
  addSeperatorHandler() {
    let temp = this.instance.currentTemplate.fields;
    this.instance.currentTemplate.fields = [];
    let separatorIndex = this.separatorIndex++;
    let item = { key: '--- Separator(' + separatorIndex + ') ---', fieldLabel: '--- Separator(' + separatorIndex + ') ---', label: '--- Separator(' + separatorIndex + ') ---', value: '--- Separator(' + separatorIndex + ') ---', isSeparator: true, class: '', separatorSettings: { borderSize: '1px', borderColor: '#000000', borderPatern: 'solid' } };
    addToArrayIfDoesntExist('value', item, temp);
    this.instance.currentTemplate.fields = temp;
    this.generateJSON();
  }
  moveUpHandler() {
    if (this.selectedWantedFields.length == 0) {
      return;
    }
    let temp = this.instance.currentTemplate.fields;
    // this.instance.currentTemplate.fields = [];
    let SelectedField = this.selectedWantedFields;
    let oldIndexList = [];
    for (let k = 0; k < temp.length; k++) {
      for (let l = 0; l < SelectedField.length; l++) {
        if (temp[k].value == SelectedField[l].value) {
          oldIndexList[l] = k;
          break;
        }
      }
    }
    oldIndexList.sort(function (a, b) {
      return a - b
    });
    for (let t = 0; t < oldIndexList.length; t++) {
      temp = array_move_one_item(temp, oldIndexList[t], oldIndexList[t] - 1);
    }
    this.instance.currentTemplate.fields = temp;
    this.generateJSON();
    let self = this;
    setTimeout(() => { self.selectList3(this.selectedWantedFields); }, 100);
  }
  moveUpMasterHandler() {
    if (this.selectedMasterWantedFields.length == 0) {
      return;
    }
    let temp = this.instance.currentTemplate.masterfields;
    this.instance.currentTemplate.masterfields = [];
    let SelectedField = this.selectedMasterWantedFields;
    let oldIndexList = [];
    for (let k = 0; k < temp.length; k++) {
      for (let l = 0; l < SelectedField.length; l++) {
        if (temp[k].value == SelectedField[l].value) {
          oldIndexList[l] = k;
          break;
        }
      }
    }
    oldIndexList.sort(function (a, b) {
      return a - b
    });
    for (let t = 0; t < oldIndexList.length; t++) {
      temp = array_move_one_item(temp, oldIndexList[t], oldIndexList[t] - 1);
    }
    this.instance.currentTemplate.masterfields = temp;
    this.generateMasterJSON();
    let self = this;
    setTimeout(() => { self.selectList5(this.selectedMasterWantedFields); }, 100);
  }
  moveDownHandler() {
    if (this.selectedWantedFields.length == 0) {
      return;
    }
    let temp = this.instance.currentTemplate.fields;
    this.instance.currentTemplate.fields = [];
    let SelectedField = this.selectedWantedFields;
    let oldIndexList = [];
    for (let k = 0; k < temp.length; k++) {
      for (let l = 0; l < SelectedField.length; l++) {
        if (temp[k].value == SelectedField[l].value) {
          oldIndexList[l] = k;
          break;
        }
      }
    }
    oldIndexList.sort(function (a, b) {
      return b - a;
    });
    for (let t = 0; t < oldIndexList.length; t++) {
      temp = array_move_one_item(temp, oldIndexList[t], oldIndexList[t] + 1);
    }
    this.instance.currentTemplate.fields = temp;
    this.generateJSON();
    let self = this;
    setTimeout(() => { self.selectList3(this.selectedWantedFields); }, 100);
  }
  moveDownMasterHandler() {
    if (this.selectedMasterWantedFields.length == 0) {
      return;
    }
    let temp = this.instance.currentTemplate.masterfields;
    this.instance.currentTemplate.masterfields = [];
    let SelectedField = this.selectedMasterWantedFields;
    let oldIndexList = [];
    for (let k = 0; k < temp.length; k++) {
      for (let l = 0; l < SelectedField.length; l++) {
        if (temp[k].value == SelectedField[l].value) {
          oldIndexList[l] = k;
          break;
        }
      }
    }
    oldIndexList.sort(function (a, b) {
      return b - a;
    });
    for (let t = 0; t < oldIndexList.length; t++) {
      temp = array_move_one_item(temp, oldIndexList[t], oldIndexList[t] + 1);
    }
    this.instance.currentTemplate.masterfields = temp;
    this.generateMasterJSON();
    let self = this;
    setTimeout(() => { self.selectList5(this.selectedMasterWantedFields); }, 100);
  }
  removeSelectedFieldsHandler() {
    if (this.selectedWantedFields.length === 0) {
      return;
    }
    let temp = this.instance.currentTemplate.fields;
    this.instance.currentTemplate.fields = [];
    let toRemoveIndex = [];
    for (let index = 0; index < this.selectedWantedFields.length; index++) {
      let selected = this.selectedWantedFields[index];
      for (let index2 = 0; index2 < temp.length; index2++) {
        let cur = temp[index2];
        if (cur.label === selected.label && cur.value === selected.value) {
          toRemoveIndex.push(index2);
        }
      }
    }
    toRemoveIndex.sort(function (a, b) {
      return b - a;
    });
    for (let index in toRemoveIndex) {
      temp.splice(toRemoveIndex[index], 1);
    }
    this.selectedWantedFields = [];
    this.instance.currentTemplate.fields = temp;
    this.deselectList3();
    this.generateJSON();
    this.setSelectedFieldStyle();
  }
  removeSelectedMasterFieldsHandler() {
    if (this.selectedMasterWantedFields.length === 0) {
      return;
    }
    let temp = JSON.parse(JSON.stringify(this.instance.currentTemplate.masterfields));
    this.instance.currentTemplate.masterfields = [];
    let toRemoveIndex = [];
    for (let index = 0; index < this.selectedMasterWantedFields.length; index++) {
      let selected = this.selectedMasterWantedFields[index];
      for (let index2 = 0; index2 < temp.length; index2++) {
        let cur = temp[index2];
        if (cur.label === selected.label && cur.value === selected.value) {
          toRemoveIndex.push(index2);
        }
      }
    }
    toRemoveIndex.sort(function (a, b) {
      return b - a;
    });
    for (let index in toRemoveIndex) {
      temp.splice(toRemoveIndex[index], 1);
    }
    this.selectedMasterWantedFields = [];
    this.instance.currentTemplate.masterfields = temp;
    this.generateMasterJSON();
    this.deselectList5();
  }
  deselectAllSelects() {
    this.deselectList1();
    this.deselectList2();
    this.deselectList3();
    this.deselectList4();
    this.deselectList5();
  }
  deselect(list) {
    let selectedFields = list.selectedOptions;
    let count = selectedFields.length;
    for (let index = 0; selectedFields && index < count; index++) {
      if (selectedFields[0]) {
        selectedFields[0].selected = false;
      }
    }
  }
  deselectList1() {
    let list = this.template.querySelector('select[data-recordid="ObjectFields"]');
    if (list) {
      this.deselect(list);
    }
    this.instance.selection.selectedObjectFields = [];
    this.selectedObjectRefField = '';
    this.selectedObjectRefFieldLabel = '';
    this.ObjectRelatedFieldsFieldsShowStatus = false;
    this.ObjectRelatedFieldsFieldsDisableStatus = !this.ObjectRelatedFieldsFieldsShowStatus;
  }
  deselectList2() {
    let list = this.template.querySelector('select[data-recordid="ObjectRelatedFieldsFields"]');
    if (list) {
      this.deselect(list);
    }
    this.selectedObjectRefFieldFields = [];
  }
  deselectList3() {
    let list = this.template.querySelector('select[data-recordid="wantedFields"]');
    if (list) {
      this.deselect(list);
    }
    this.selectedWantedFieldsJSON = undefined;
    this.selectedWantedFields = [];
  }
  deselectList4() {
    let list = this.template.querySelector('select[data-recordid="MasterObjectFields"]');
    if (list) {
      this.deselect(list);
    }
    this.instance.selection.selectedObjectFields = [];
  }
  deselectList5() {
    let list = this.template.querySelector('select[data-recordid="wantedMasterFields"]');
    if (list) {
      this.deselect(list);
    }
    this.selectedMasterWantedFieldsJSON = undefined;
    this.selectedMasterWantedFields = [];
  }
  selectList3(selectedTab) {
    let wantedFields = this.template.querySelectorAll('select[data-recordid="wantedFields"] option');
    for (let index = 0; index < wantedFields.length; index++) {
      wantedFields[index].selected = false;
      for (let index2 = 0; index2 < selectedTab.length; index2++) {
        if (wantedFields[index].value == selectedTab[index2].value) {
          wantedFields[index].selected = true;
        }
      }
    }
  }
  selectList5(selectedTab) {
    let wantedFields = this.template.querySelectorAll('select[data-recordid="wantedMasterFields"] option');
    for (let index = 0; index < wantedFields.length; index++) {
      wantedFields[index].selected = false;
      for (let index2 = 0; index2 < selectedTab.length; index2++) {
        if (wantedFields[index].value == selectedTab[index2].value) {
          wantedFields[index].selected = true;
        }
      }
    }
  }
  get disableTemplateNameInputAndObjectSelection() {
    return this.instance.currentTemplate.value != this.instance.defaultNewTemplate.value;
  }
  get disableSaveAs() {
    if (!this.instance.currentTemplate.name) {
      return true;
    }
    if (!this.instance.currentObject.value) {
      return true;
    }
    if (this.instance.currentTemplate.value == undefined || this.instance.currentTemplate.value == 'Custom_Template') {
      return true;
    }
  }
}