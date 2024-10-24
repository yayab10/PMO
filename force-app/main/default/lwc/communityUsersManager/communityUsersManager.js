/**
 * @author ULIT
 * @date 8/12/2020
 * @description javascript controller related to communityUsersManager Html
 * */
import { LightningElement, wire, track, api } from 'lwc';
import isAdminUser from '@salesforce/apex/CommunityAccountController.isAdminUser';
import getUsersForSupplier from '@salesforce/apex/CommunityAccountController.getUsersForSupplier';
import getSalutationPickList from '@salesforce/apex/CommunityAccountController.getSalutationPickList';
import CreateContact from '@salesforce/apex/CommunityAccountController.CreateContact';
import createCommunityUser from '@salesforce/apex/CommunityAccountController.createCommunityUser';
import getProfileId from '@salesforce/apex/CommunityAccountController.getProfileId';
import updateContact from '@salesforce/apex/CommunityAccountController.updateContact';
import updateUser from '@salesforce/apex/CommunityAccountController.updateUser';
import resetUserPassword from '@salesforce/apex/CommunityAccountController.resetUserPassword';
import DeleteContact from '@salesforce/apex/CommunityAccountController.DeleteContact';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { updateRecord } from 'lightning/uiRecordApi';

// Label
import Cancel from '@salesforce/label/c.Cancel';
import Save from '@salesforce/label/c.Save';
import Edit from '@salesforce/label/c.LBL_Edit';
import LBL_No_Record_To_Display from '@salesforce/label/c.LBL_No_Record_To_Display';
import MSG_Error_Occurred from '@salesforce/label/c.MSG_Error_Occurred';
import LBL_Information from '@salesforce/label/c.LBL_Information';
import Success from '@salesforce/label/c.Success';
import LBL_Add_New_User from '@salesforce/label/c.LBL_Add_New_User';
import LBL_No_Account_for_this_Supplier from '@salesforce/label/c.LBL_No_Account_for_this_Supplier';
import LBL_No_User_Community from '@salesforce/label/c.LBL_No_User_Community';
import LBL_Profile from '@salesforce/label/c.Profile';
import LBL_UserLicense from '@salesforce/label/c.User_License';
import LBL_Activate from '@salesforce/label/c.LBL_Activate';
import LBL_Deactivate from '@salesforce/label/c.LBL_Deactivate';
import LBL_Reset_Password from '@salesforce/label/c.LBL_Reset_Password';
import LBL_Access_To_Supplier_Portal from '@salesforce/label/c.LBL_Access_To_Supplier_Portal';
import LBL_Please_Select_A_User from '@salesforce/label/c.LBL_Please_Select_A_User';
import LBL_Warning from '@salesforce/label/c.LBL_Warning';
import LBL_Save_And_New from '@salesforce/label/c.LBL_Save_And_New';
import Status from '@salesforce/label/c.Status';
import LBL_Active from '@salesforce/label/c.LBL_Active';
import LBL_Deactive from '@salesforce/label/c.LBL_Deactive';
import MSG_Community_User_Profile_Not_Selected from '@salesforce/label/c.MSG_Community_User_Profile_Not_Selected';
import LBL_Online from '@salesforce/label/c.LBL_Online';
import LBL_Offline from '@salesforce/label/c.LBL_Offline';
import MSG_Successfully_Saved from '@salesforce/label/c.MSG_Successfully_Saved';
import MSG_User_Successfully_Added from '@salesforce/label/c.MSG_User_Successfully_Added';
import MSG_Contact_Successfully_Added from '@salesforce/label/c.MSG_Contact_Successfully_Added';
import MSG_Invalid_Username from '@salesforce/label/c.MSG_Invalid_Username';
import MSG_Invalid_Firstname from '@salesforce/label/c.MSG_Invalid_Firstname';
import MSG_Invalid_Lastname from '@salesforce/label/c.MSG_Invalid_Lastname';
import MSG_Invalid_Title from '@salesforce/label/c.MSG_Invalid_Title';
import MSG_Invalid_Email from '@salesforce/label/c.MSG_Invalid_Email';
import MSG_Invalid_Phone_Number from '@salesforce/label/c.MSG_Invalid_Phone_Number';
import MSG_Email_Sent_Successfully from '@salesforce/label/c.MSG_Email_Sent_Successfully';
import MSG_Please_Correct_The_Error_And_Try_Again from '@salesforce/label/c.MSG_Please_Correct_The_Error_And_Try_Again';
import MSG_Can_t_Assign_This_License from '@salesforce/label/c.MSG_Can_t_Assign_This_License';
import MSG_License_Limit_Exceeded from '@salesforce/label/c.MSG_License_Limit_Exceeded';
import MSG_Please_Add_Role from '@salesforce/label/c.MSG_Please_Add_Role';
import MSG_Error_Deleting_Contact from '@salesforce/label/c.MSG_Error_Deleting_Contact';
import LBL_Refresh from '@salesforce/label/c.LBL_Refresh';
import LBL_Delete from '@salesforce/label/c.LBL_Delete';
import LBL_Upload_File from '@salesforce/label/c.LBL_Upload_File';

// Objects
import CONTACT from '@salesforce/schema/Contact';
import USER from '@salesforce/schema/User';

// fields
// user fields
import NAME from '@salesforce/schema/User.Name';
import USERNAME from '@salesforce/schema/User.Username';
import EMAIL from '@salesforce/schema/User.Email';
import FIRSTNAME from '@salesforce/schema/User.FirstName';
import LASTNAME from '@salesforce/schema/User.LastName';
import PHONE from '@salesforce/schema/User.Phone';
import TITLE from '@salesforce/schema/User.Title';
import SALUTATION from '@salesforce/schema/Contact.Salutation';
import ISACTIVE from '@salesforce/schema/User.IsActive';
import LastLoginDate from '@salesforce/schema/User.LastLoginDate';

// Supplier fields
import SupplierAccount from '@salesforce/schema/Sup_Supplier__c.Account__c';
import SupplierName from '@salesforce/schema/Sup_Supplier__c.Name';
import SupplierId from '@salesforce/schema/Sup_Supplier__c.Id';
import SupplierStatus from '@salesforce/schema/Sup_Supplier__c.Status__c';

// contact fields
import ISMAIN from "@salesforce/schema/Contact.Is_Main__c";
import IS_COMMUNITY_USER from "@salesforce/schema/Contact.Is_Community_User__c";
import IS_USER_ACTIVE from "@salesforce/schema/Contact.Is_User_Active__c";
import DEFAULT_USERNAME from "@salesforce/schema/Contact.Default_Username__c";

export default class communityUsersManager extends LightningElement {

    @track isAdmin = false;
    // Component setting to Show/Hide Edit Button
    @api showEditButton;
    // Component setting to Show/Hide Add New Button Button
    @api showAddNewUserButton;
    // Component setting to Show/Hide active/Desactive Button
    @api showActiveDesactiveButton;
    // Component setting to Show/Hide Reset Password Button
    @api showResetPassword;
    // Component setting Max show
    @api totalNumberOfRows;
    // Extra fields on Contact objectfor Dynamic View
    @api extraContactFields;
    // List of contact fields to display
    @track extraContactFieldsList = [];
    @track extraContactFieldsCol1 = [];
    @track extraContactFieldsCol2 = [];
    @track urlFields = [];
    // Supplier record Id
    @api recordId;
    // Account Id
    @track accId = '';
    // not used
    @track users;
    // not used
    @track accounts;
    // All Data
    @track data;
    // All Errors
    @track error;
    // Show new User Modal
    @track addNewUserModal = false;
    // Show edit User Modal
    @track editUserModal = false;
    // Show Modal
    @track openModal = false;
    // status options (Active, Deactive)
    @track statusOptions;
    // user salutation
    @track salutation = '';
    // user username
    @track username = '';
    // user firstName
    @track firstName = '';
    // user phone
    @track phone = '';
    // user lastName
    @track lastName = '';
    // user email
    @track email = '';
    // user profile
    @track profile = '';
    // user IsMain
    @track IsMain = false;
    // to show error message no profile
    @track noProfile = false;
    // is Supplier deactivated to disable Add New User button
    @track deactivatedSupplier = false;
    // is All User Deactivated
    @track isAllUserDeactivated = false;
    // is All User Activated
    @track isAllUserActivated = false;
    // default Status
    @track defaultStatus = 'true';
    // user title
    @track title = '';
    // data table is loading
    @track tableIsLoading = false;
    // page is loading
    @track isLoading = false;
    // Modal is Loading
    @track isLoadingModal = false;
    // search User Term
    @track searchUserTerm = '';
    // query Limit
    queryLimit = this.totalNumberOfRows;
    // number of row visible for (Load on scroll)
    @track currentRowVisible = 0;
    // count of data received
    receivedData = 0;
    // data table sort Direction
    @track sortDirection = 'asc';
    // data table default Sort Direction
    @track defaultSortDirection = 'asc';
    // Contact Fields
    @track contactFields = [];
    @track contactFieldsTypeMap = {};
    @track contactFieldsLabelMap = {};
    // Track setup finish
    @track isSetupFinish = false;
    // Store all users data without filters
    @track allRows = [];
    // Active filter on Active column
    @track activeFilter = 'show_active';
    // reference to the datatable
    datatable = null;
    // selected Account
    selectedAccount = {};
    // all Salutation
    allSalutation;
    // for refresh Apex
    refreshTable;
    // user Id
    userId;
    // contact Id
    contactId;
    // contact
    contactRecord = { sobjectType: "Contact" };
    // columns for data table
    columns = [];
    // wire boolean
    isFinishSetUserLabel = false;
    isFinishWireUsers = false;
    isFinishGetsupplierRecord = false;
    isFinishSetContactLabel = false;

    // normalized Api Names
    normalizedApiFields = {
        NAME: NAME.fieldApiName,
        USERNAME: USERNAME.fieldApiName,
        EMAIL: EMAIL.fieldApiName,
        FIRSTNAME: FIRSTNAME.fieldApiName,
        PHONE: PHONE.fieldApiName,
        LASTNAME: LASTNAME.fieldApiName,
        TITLE: TITLE.fieldApiName,
        SALUTATION: SALUTATION.fieldApiName,
        ISACTIVE: ISACTIVE.fieldApiName,
        LastLoginDate: LastLoginDate.fieldApiName,
        ISMAIN: ISMAIN.fieldApiName,
        IS_COMMUNITY_USER: IS_COMMUNITY_USER.fieldApiName,
        DEFAULT_USERNAME: DEFAULT_USERNAME.fieldApiName,
        IS_USER_ACTIVE: IS_USER_ACTIVE.fieldApiName
    }

    // normalized Supplier Api Names
    normalizedSupplierApiNames = {
        SupplierName: SupplierName.fieldApiName,
        SupplierId: SupplierId.fieldApiName,
        SupplierAccount: SupplierAccount.fieldApiName,
        SupplierStatus: SupplierStatus.fieldApiName
    }

    // normalized Supplier Api Names as array (for wire)
    normalizedSupplierApiNamesArray = [
        SupplierName,
        SupplierId,
        SupplierAccount,
        SupplierStatus
    ]

    // All Labels
    Label = {
        Save,
        Cancel,
        Edit,
        LBL_No_Record_To_Display,
        MSG_Error_Occurred,
        LBL_Information,
        Success,
        LBL_Add_New_User,
        LBL_No_Account_for_this_Supplier,
        LBL_No_User_Community,
        User: {},
        Profile: LBL_Profile,
        Salutation: '',
        UserLicense: LBL_UserLicense,
        LBL_Activate,
        LBL_Deactivate,
        LBL_Reset_Password,
        LBL_Access_To_Supplier_Portal,
        LBL_Warning,
        LBL_Please_Select_A_User,
        LBL_Save_And_New,
        Status,
        LBL_Active,
        LBL_Deactive,
        MSG_Community_User_Profile_Not_Selected,
        LBL_Online,
        LBL_Offline,
        MSG_Successfully_Saved,
        MSG_User_Successfully_Added,
        MSG_Contact_Successfully_Added,
        MSG_Invalid_Username,
        MSG_Invalid_Firstname,
        MSG_Invalid_Lastname,
        MSG_Invalid_Title,
        MSG_Invalid_Email,
        MSG_Invalid_Phone_Number,
        MSG_Email_Sent_Successfully,
        MSG_Please_Correct_The_Error_And_Try_Again,
        MSG_Can_t_Assign_This_License,
        MSG_License_Limit_Exceeded,
        MSG_Please_Add_Role,
        MSG_Error_Deleting_Contact,
        LBL_Refresh,
        LBL_Delete,
        LBL_Upload_File
    };

    /**
     * @description wire to get if the user have permissions to manage users
     */
    @wire(isAdminUser)
    wire({ error, data }) {
        if (data) {
            this.isAdmin = data;
        } else if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
    }

    /**
     * @description this wire to get labels of field from user object
     */
    @wire(getObjectInfo, { objectApiName: USER })
    setUserLabel({ data, error }) {
        if (data) {
            this.isFinishSetUserLabel = true;
            // all user lables
            let userLabel = {
                'Name': data.fields[this.normalizedApiFields.NAME].label,
                'Username': data.fields[this.normalizedApiFields.USERNAME].label,
                'FirstName': data.fields[this.normalizedApiFields.FIRSTNAME].label,
                'Phone': data.fields[this.normalizedApiFields.PHONE].label,
                'LastName': data.fields[this.normalizedApiFields.LASTNAME].label,
                'Email': data.fields[this.normalizedApiFields.EMAIL].label,
                'Title': data.fields[this.normalizedApiFields.TITLE].label,
                'IsActive': data.fields[this.normalizedApiFields.ISACTIVE].label,
                'LastLoginDate': data.fields[this.normalizedApiFields.LastLoginDate].label,
            };
            this.Label.User = userLabel;
        }
        if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
        if (this.isFinishWireUsers && this.isFinishGetsupplierRecord && this.isFinishSetContactLabel && this.isFinishSetUserLabel) {
            this.setupColumns();
        }
    }

    /**
     * @description this wire to get labels of contact fields object
     */
    @wire(getObjectInfo, { objectApiName: CONTACT })
    setContactLabel({ data, error }) {
        // get contact Labels
        if (data) {
            this.isFinishSetContactLabel = true;
            this.Label.Salutation = data.fields[this.normalizedApiFields.SALUTATION].label;
            this.Label.IsMain = data.fields[this.normalizedApiFields.ISMAIN].label;
            let contactfmap = {};
            let contactlabelsmap = {}
            Object.values(data.fields).forEach(field => {
                contactfmap[field.apiName] = field.dataType;
                contactlabelsmap[field.apiName] = field.label;
            });
            this.contactFieldsTypeMap = contactfmap;
            this.contactFieldsLabelMap = contactlabelsmap;
            this.urlFields = Object.values(data.fields).filter(field => (field.dataType == 'Url' && this.extraContactFieldsList.includes(field.apiName))).map(field => field.apiName);
            this.contactFields = Object.values(data.fields).map(field => field.apiName);
        }
        if (error) {
            this.handleToastMessage(MSG_Error_Occurred, error.body.message, 'error');
        }
        if (this.isFinishWireUsers && this.isFinishGetsupplierRecord && this.isFinishSetContactLabel && this.isFinishSetUserLabel) {
            this.setupColumns();
        }
    }

    /**
     * @description this wire to get the Record
     */
    @wire(getRecord, { recordId: '$recordId', fields: '$normalizedSupplierApiNamesArray' })
    getsupplierRecord({ data, error }) {
        this.data = null;
        if (data) {
            this.isFinishGetsupplierRecord = true;
            // if the supplier have account
            if (data.fields[this.normalizedSupplierApiNames.SupplierAccount].value) {
                this.isLoading = true;
                this.currentRowVisible = 0;
                this.queryLimit = this.totalNumberOfRows;
                refreshApex(this.refreshTable);
            } else {
                this.error = true;
                this.data = undefined;
                this.isLoading = false;
            }
        } else if (error) {
            this.showToast(this.Label.MSG_Error_Occurred, error, "error");
            console.error('ERROR => ', error); // handle error properly
        }
        if (this.isFinishWireUsers && this.isFinishGetsupplierRecord && this.isFinishSetContactLabel && this.isFinishSetUserLabel) {
            this.setupColumns();
        }
    }

    /**
     * @description this wire to all users
     * TODO remove getUsersForSupplier from the wire
     */
    @wire(getUsersForSupplier, { supplierId: '$recordId', searchTerm: '$searchUserTerm', offset: '$currentRowVisible', queryLimit: '$queryLimit', extraContactFieldsList: '$extraContactFieldsList' })
    wireUsers(result) {
        if (result) {
            this.refreshTable = result;
            if (result.data) {
                this.isFinishWireUsers = true;
                this.receivedData = result.data.usersWrapper.length;
                this.data = this.fillData(result.data);
                this.allRows = [...this.data.users];
                this.applyFilter();
                this.error = undefined;
                this.isLoading = false;
            } else if (result.error) {
                this.error = result.error;
                this.showToast(this.Label.MSG_Error_Occurred, this.error.body.message, "error");
                console.error('ERR=> ' + JSON.stringify(result.error));
                this.data = undefined;
                this.isLoading = false;
            }
            this.tableIsLoading = false;
            if (this.isFinishWireUsers && this.isFinishGetsupplierRecord && this.isFinishSetContactLabel && this.isFinishSetUserLabel) {
                this.setupColumns();
            }
        }
    }

    connectedCallback() {
        try {
            this.isLoading = true;
            this.getDataTable();
            this.currentRowVisible = 0;
            this.loadAllList();
            this.openModal = false;
            this.addNewUserModal = false;
            this.editUserModal = false;
            this.isSetupFinish = false;
            // add the status options (Active, Deactive)
            let options = [];
            options.push({ label: this.Label.LBL_Active, value: 'true' });
            options.push({ label: this.Label.LBL_Deactive, value: 'false' });
            this.statusOptions = options;
            if (this.extraContactFields) {
                this.extraContactFieldsList = this.extraContactFields.replace(/\s/g, '').split(",");
                this.extraContactFieldsList = [...new Set(this.extraContactFieldsList)];
                this.fillContactFieldsColumns();
            }
            // get Profile Id From setting
            getProfileId().then((result) => {
                this.profile = result;
                if (result == null) {
                    this.noProfile = true;
                }
            }).catch((error) => {
                console.error('Error => ', error);
                this.showToast(this.Label.MSG_Error_Occurred, error, "error");
            });
        } catch (error) {
            console.error('ERROR => ', error);
        }
    }
    fillContactFieldsColumns() {
        try {
            if (this.contactFields && this.contactFields.length > 0 && !this.isSetupFinish) {
                this.extraContactFieldsList = this.extraContactFieldsList.filter(field => this.contactFields.includes(field));
                this.extraContactFieldsList = [...new Set(this.extraContactFieldsList)]
                let fieldsList = this.extraContactFieldsList.map(fieldName => ({ fieldName: fieldName, isURL: this.urlFields.includes(fieldName) }));
                if (fieldsList.length > 2) {
                    for (let i = 0; i < fieldsList.length; i++) {
                        if (i < fieldsList.length / 2) {
                            this.extraContactFieldsCol1.push(fieldsList[i]);
                        } else {
                            this.extraContactFieldsCol2.push(fieldsList[i]);
                        }
                    }
                } else {
                    this.extraContactFieldsCol1 = fieldsList.splice(0,10);
                }
            }
        } catch(exception) {
            console.error(exception);
        }

    }
    get hasExtraContactFields() {
        return this.extraContactFieldsList && this.extraContactFieldsList.length > 0;
    }

    /**
     * @description this method to put datatable columns .
     */
    setupColumns() {
        this.fillContactFieldsColumns();
        this.isSetupFinish = true;
        // put the columns
        let allColumns = [
            {
                label: this.Label.Status,
                fieldName: 'status',
                type: 'icon',
                sortable: true,
                fixedWidth: 70, hideDefaultActions: true,
                typeAttributes: {
                    name: { fieldName: 'iconName' },
                    title: { fieldName: 'iconTitle' },
                    size: 'x-small',
                    variant: { fieldName: 'iconVariant' },
                    value: { fieldName: 'iconValue' },
                    alternativeText: { fieldName: 'iconAlternativeText' },
                    class: 'slds-p-horizontal_small'
                }
            },
            {
                label: this.Label.User.Name, fieldName: "recordLink",
                type: "url",
                sortable: true,
                typeAttributes: {
                    label: { fieldName: "Name" },
                    tooltip: "Name",
                    target: "_blank"
                }
            },
            { label: this.Label.User.Email, fieldName: 'Email', type: 'email' },
            {   label: this.Label.User.IsActive,
                fieldName: 'IsActive',
                type: 'boolean',
                fixedWidth: 100,
                actions: [
                    { label: 'All', checked: false, name: 'all' },
                    { label: 'Active', checked: true, name: 'show_active' },
                    { label: 'Inactive', checked: false, name: 'show_inactive' },
                ],
            },
            // { label: this.Label.IsMain, fieldName: "IsMain", type: "boolean", fixedWidth: 70 },
            { label: this.Label.User.LastLoginDate, sortable: true, fieldName: 'LastLoginDate', type: 'Date' }
        ];
        // ADD Extra fields
        if (this.extraContactFieldsList && this.extraContactFieldsList.length > 0) {
            for (let extraField of this.extraContactFieldsList) {
                let type = this.contactFieldsTypeMap[extraField].toLowerCase();
                if (type == 'number' || type == 'currency' || type == 'decimal' || type == 'integer') {
                    type = 'number';
                }
                if (type == 'picklist' || type == 'multipicklist' || type == 'phone' || type == 'fax' || type == 'address' || type == 'textarea' || type == 'richtext') {
                    type = 'text';
                }
                if (type == 'reference') {
                    let nameField = extraField.slice(0,-1) + 'Name';
                    allColumns.push({
                        label: this.contactFieldsLabelMap[extraField],
                        sortable: true,
                        fieldName: 'ContactLink' + extraField,
                        type: "url",
                        typeAttributes: {
                            label: { fieldName: 'Contact' + nameField },
                            tooltip: this.contactFieldsLabelMap[extraField],
                            target: "_blank"
                        }
                    });
                } else {
                    allColumns.push({
                        label: this.contactFieldsLabelMap[extraField],
                        sortable: true,
                        fieldName: 'Contact'+ extraField,
                        type: type
                    });
                }
            }
        }
        if (this.showEditButton || this.showAddNewUserButton || this.showActiveDesactiveButton || this.showResetPassword) {
            allColumns.push({
                type: 'action',
                fixedWidth: 70,
                typeAttributes: { rowActions: this.getRowActions.bind(this) }
            });
        }
        this.columns = allColumns;
    }

    handleHeaderAction (event) {
        try {
            // Retrieves the name of the selected filter
            const actionName = event.detail.action.name;
            // Retrieves the current column definition
            // based on the selected filter
            const colDef = event.detail.columnDefinition;
            const columns = [...this.columns];
            const activeFilter = this.activeFilter;
            if (actionName !== activeFilter) {
                var idx = columns.indexOf(colDef);
                // Update the column definition with the updated actions data
                var actions = columns[idx].actions;
                actions.forEach((action) => {
                    action.checked = action.name === actionName;
                });
                this.activeFilter = actionName;
                this.applyFilter();
                this.columns = columns;
            }
        } catch (error) {
            console.error('Error =>', error);
        }
    }

    applyFilter() {
        try {
            const activeFilter = this.activeFilter;
            const filteredRows = this.allRows.filter(function (row) {
                if (activeFilter == 'show_active') {
                    return row.IsActive;
                } else if (activeFilter == 'show_inactive') {
                    return !row.IsActive;
                } else {
                    return true;
                }
            });
            this.data.users = filteredRows;
        } catch (error) {
            console.error('Error =>', error);
        }
    }

    /**
     * @description this method to get the datatable.
     */
    getDataTable() {
        setTimeout(() => {
            this.datatable = this.template.querySelector('[data-id="usersTable"]');
            if (this.datatable == null) {
                this.getDataTable();
            }
        }, 1000);
    }

    /**
     * @description this method to get Actions for each Row.
     */
    getRowActions(row, doneCallback) {
        try {
            const actions = [];
            if (this.showEditButton) {
                actions.push({
                    label: Edit,
                    name: 'edit'
                });
            }
            // show Active/Desactive Button dependence on Component setting
            if (this.showActiveDesactiveButton) {
                // show Active or desactive button for each row
                if (row.IsActive) {
                    actions.push({
                        label: LBL_Deactivate,
                        iconName: 'utility:block_visitor',
                        name: 'deactivate'
                    });
                } else {
                    actions.push({
                        label: LBL_Activate,
                        iconName: 'utility:adduser',
                        name: 'activate',
                    });
                }
            }
            // show ResetPassword Button dependence on Component setting
            if (this.showResetPassword) {
                // disable Reset Password button if the row have deactivate status
                if (row.IsActive) {
                   actions.push({
                        label: LBL_Reset_Password,
                        name: 'resetPassword'
                    });
                } else {
                    actions.push({
                        label: LBL_Reset_Password,
                        name: 'resetPassword',
                        disabled: 'true'
                    });
                }
            }
            doneCallback(actions);
        } catch (error) {
            console.error('Error =>', error);
        }
    }

    /**
    * @description this method to fill received data
    * TODO: we should split the data
    */
    fillData(data) {
        var tempOppList = [];
        var supplier = {};
        for (var i = 0; i < data.usersWrapper.length; i++) {
            let tempRecord = Object.assign({}, data.usersWrapper[i].user);
            tempRecord.recordLink = "/" + tempRecord.Contact.Id;
            // check if the phone is undefined
            if (!tempRecord.LastLoginDate) {
                tempRecord.LastLoginDate = '';
            }
            // check if the phone is undefined
            if (!tempRecord.Phone) {
                tempRecord.Phone = '';
            }
            if (this.extraContactFieldsList && this.extraContactFieldsList.length > 0 ) {
                for (let field of this.extraContactFieldsList) {
                    let type = this.contactFieldsTypeMap[field].toLowerCase();
                    if (type == 'reference' ) {
                        let relationField = tempRecord.Contact[field.slice(0,-1) + 'r'];
                        let fieldname = relationField != undefined ? relationField.Name : '';
                        let fieldLabel = field.slice(0,-1) + 'Name';
                        tempRecord['ContactLink'+field] = tempRecord.Contact[field] != undefined ? '/' + tempRecord.Contact[field] : '';
                        tempRecord['Contact'+fieldLabel] = fieldname != undefined ? fieldname : '';
                    } else {
                        tempRecord['Contact'+field] = tempRecord.Contact[field];
                    }
                }
            }
            // set online/offline icons
            if (data.usersWrapper[i].isOnline) {
                tempRecord.status = this.Label.LBL_Online;
                tempRecord.iconName = 'utility:record';
                tempRecord.iconTitle = this.Label.LBL_Online;
                tempRecord.iconVariant = 'success';
                tempRecord.iconValue = this.Label.LBL_Online;
                tempRecord.iconAlternativeText = this.Label.LBL_Online;
                tempRecord.LastLoginDate = '';
            } else {
                tempRecord.status = this.Label.LBL_Offline;
                tempRecord.iconName = 'utility:routing_offline';
                tempRecord.iconTitle = this.Label.LBL_Offline;
                tempRecord.iconValue = this.Label.LBL_Offline;
                tempRecord.iconAlternativeText = this.Label.LBL_Offline;
            }

            // check if the Is_Main__c is undefined
            if (tempRecord.Contact[this.normalizedApiFields.ISMAIN]) {
                tempRecord.IsMain = tempRecord.Contact[this.normalizedApiFields.ISMAIN];
            } else {
                tempRecord.IsMain = false;
            }

            tempOppList.push(tempRecord);
            if (tempRecord.IsActive) {
                this.isAllUserDeactivated = false;
            } else {
                this.isAllUserActivated = false;
            }
        }
        supplier.accId = data.accId;
        supplier.accountName = data.accountName;
        supplier.users = tempOppList;
        supplier.Status = data.supplierStatus;
        if (data.supplierStatus == 'Close') {
            this.deactivatedSupplier = true;
        } else {
            this.deactivatedSupplier = false;
        }
        return supplier;
    }

    /**
    * @description this method to open New User Modal
    */
    openNewUserModal() {
        try {
            // to open modal set openModal tarck value as true
            //this.selectedAccount.Id = event.target.dataset.id;
            this.selectedAccount.Id = this.data.accId;

            //this.selectedAccount.name = event.target.dataset.name;
            this.selectedAccount.name = this.data.accountName;
            this.openModal = true;
            this.addNewUserModal = true;
        } catch (error) {
            console.error('ERROR => ', error); // handle error properly
        }
    }

    /**
    * @description this method to close the Modal
    */
    closeModal() {
        // to close modal set openModal tarck value as false
        this.selectedAccount = {};
        this.addNewUserModal = false;
        this.editUserModal = false;
        this.openModal = false;
        this.resetData();
    }

    /**
     * @description this method to add new User.
     */
    addNewUser(event) {
        let action = event.target.dataset.new;
        this.isLoadingModal = true;
        let self = this;
        let contactToInsert = { sobjectType: "Contact" };
        // set all the data
        contactToInsert.AccountId = this.selectedAccount.Id;
        contactToInsert.FirstName = this.firstName;
        contactToInsert.LastName = this.lastName;
        contactToInsert.Phone = this.phone;
        contactToInsert.Salutation = this.salutation;
        contactToInsert.Email = this.email;
        contactToInsert.Title = this.title;
        contactToInsert[this.normalizedApiFields.DEFAULT_USERNAME] = this.username;
        contactToInsert[this.normalizedApiFields.IS_USER_ACTIVE] = this.defaultStatus;
        contactToInsert[this.normalizedApiFields.IS_COMMUNITY_USER] = true;
        // set the Is_Main__c value
        contactToInsert[this.normalizedApiFields.ISMAIN] = this.data.users.length == 0 || this.IsMain;
        // set extra fields
        for (let fieldName of this.extraContactFieldsList) {
            contactToInsert[fieldName] = this.contactRecord[fieldName];
        }
        //Creating new contact
        CreateContact({ contactToInsert: contactToInsert }).then(result => {
            self.contactId = result;
            // contact added succefully now creat new user community
            // create Contact opbject for createCommunityUser method
            let contact = { sobjectType: "Contact" };
            contact.Id = self.contactId;
            contact.FirstName = this.firstName;
            contact.LastName = this.lastName;
            contact.Phone = this.phone;
            contact.Email = this.email;
            contact.Title = this.title;
            if (this.isAdmin) {
                createCommunityUser({
                    username: self.username,
                    contactInfo: contact,
                    profileId: self.profile,
                    status: self.defaultStatus
                }).then(result => {
                    self.showToast(this.Label.Success, this.Label.MSG_User_Successfully_Added, "success");
                    self.openModal = false;
                    refreshApex(self.refreshTable);
                    self.closeModal();
                    this.isLoadingModal = false;
                    if (action == 'true') {
                        this.openNewUserModal();
                    }
                }).catch(error => {
                    console.error('ERROR => ', error); // handle error properly
                    // there is an error happen while instering the new user
                    this.showValidity(error); // show the error and specify the filed that caused the error
                    // role back by delete the contact
                    DeleteContact({ contId: self.contactId })
                        .catch(error => {
                            console.error('ERROR => ', error);
                            console.log(this.Label.MSG_Error_Deleting_Contact, JSON.stringify(error, null, 3));
                        });
                    this.isLoadingModal = false;
                });
            } else {
                self.showToast(this.Label.LBL_Information, this.Label.MSG_Contact_Successfully_Added, "info");
                self.openModal = false;
                refreshApex(self.refreshTable);
                self.closeModal();
                this.isLoadingModal = false;
                if (action == 'true') {
                    this.openNewUserModal();
                }
            }
        }).catch(error => {
            console.error('ERROR => ', error);
            this.showValidity(error);
            this.isLoadingModal = false;
        });
    }

    /**
     * @description this method to show Validity.
     */
    showValidity(error) {
        var errorMessage = this.Label.MSG_Please_Correct_The_Error_And_Try_Again;
        if (error.status == "500") {
            if (error.body.fieldErrors) {
                // show the error on the fileds that caused the error
                if (error.body.fieldErrors.Username) {
                    var username = this.template.querySelector(".username");
                    username.setCustomValidity(error.body.fieldErrors.Username[0].message);
                    username.reportValidity();
                }
                if (error.body.fieldErrors.ProfileId) {
                    errorMessage = this.Label.MSG_Can_t_Assign_This_License;
                }
                if (error.body.fieldErrors.CommunityNickname) {
                    var lastName = this.template.querySelector(".lastName");
                    lastName.setCustomValidity(error.body.fieldErrors.CommunityNickname[0].message);
                    lastName.reportValidity();
                }
                if (error.body.pageErrors[0]) {
                    errorMessage = error.body.pageErrors[0].message/*  + ' ' + error.body.pageErrors[0].statusCode */;
                }
                if (error.body.pageErrors[0] && (error.body.pageErrors[0].statusCode == 'LICENSE_LIMIT_EXCEEDED')) {
                    errorMessage = this.Label.MSG_License_Limit_Exceeded;
                }
                if (error.body.pageErrors[0] && (error.body.pageErrors[0].statusCode == 'UNKNOWN_EXCEPTION')) {
                    errorMessage = error.body.pageErrors[0].message + '. ' + this.Label.MSG_Please_Add_Role + '.';
                }
            } else {
                errorMessage = error.body.message;
            }
        }
        this.showToast(this.Label.MSG_Error_Occurred, errorMessage, "error");
    }

    /**
    * @description This Mehotd to handle Row Actions
    */
    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.editUser(row);
                break;
            case 'activate':
                this.activateUser(row);
                break;
            case 'deactivate':
                this.deactivateUser(row);
                break;
            case 'resetPassword':
                this.resetUserPassword(row);
                break;
        }
    }

    /**
    * @description This Mehotd to reset User Password
    */
    resetUserPassword(row) {
        this.isLoading = true;
        resetUserPassword({ userId: row.Id }).then(() => {
            this.showToast(this.Label.Success, this.Label.MSG_Email_Sent_Successfully, "success");
            refreshApex(this.refreshTable);
            this.isLoading = false;
        }).catch(error => {
            console.error('Error =>', error);
            this.isLoading = false;
        });
    }

    /**
    * @description This Mehotd to activate an User
    */
    activateUser(row) {
        try {
            let userSObject = { sobjectType: "User" };
            userSObject.Id = row.Id;
            userSObject.IsActive = true;
            let usersList = new Array();
            usersList.push(userSObject);
            this.updateUsers(usersList);
        } catch (error) {
            console.error('Error =>', error);
        }
    }

    /**
    * @description This Mehotd to activate All Users
    */
    activateAllUsers() {
        try {
            let selectedUser = this.datatable.getSelectedRows();
            let userToUpdate = new Array();
            if (selectedUser.length === 0) {
                this.showToast(this.Label.LBL_Warning, this.Label.LBL_Please_Select_A_User, "warning");
                this.isLoading = false;
                return;
            }
            for (let i = 0; i < selectedUser.length; i++) {
                // remove activated user
                if (!selectedUser[i].IsActive) {
                    let userSObject = { sobjectType: "User" };
                    userSObject.Id = selectedUser[i].Id;
                    userSObject.IsActive = true;
                    userToUpdate.push(userSObject);
                }
            }
            if (userToUpdate.length != 0) {
                this.updateUsers(userToUpdate);
            } else {
                this.isLoading = false;
            }
        } catch (error) {
            this.isLoading = false;
            console.error('Error =>', error);
        }
    }

    /**
     * @description This Mehotd to deactivate All Users
     */
    deactivateAllUsers() {
        try {
            this.isLoading = true;
            let selectedUser = this.datatable.getSelectedRows();
            let userToUpdate = new Array();
            if (selectedUser.length === 0) {
                this.showToast(this.Label.LBL_Warning, this.Label.LBL_Please_Select_A_User, "warning");
                this.isLoading = false;
                return;
            }
            for (let i = 0; i < selectedUser.length; i++) {
                // remove deactivated user
                if (selectedUser[i].IsActive) {
                    let userSObject = { sobjectType: "User" };
                    userSObject.Id = selectedUser[i].Id;
                    userSObject.IsActive = false;
                    userToUpdate.push(userSObject);
                }
            }
            if (userToUpdate.length != 0) {
                this.updateUsers(userToUpdate);
            } else {
                this.isLoading = false;
            }
        } catch (error) {
            this.isLoading = false;
            console.error('Error =>', error);
        }
    }

    /**
     * @description This Mehotd to deactivate an user
     */
    deactivateUser(row) {
        try {
            let userSObject = { sobjectType: "User" };
            userSObject.Id = row.Id;
            userSObject.IsActive = false;
            let usersList = new Array();
            usersList.push(userSObject);
            this.updateUsers(usersList);
        } catch (error) {
            console.error('Error =>', error);
        }
    }

    /**
     * @description this method to update all user at once
     */
    updateUsers(users) {
        updateUser({
            usersToUpdate: users
        }).then(() => {
            this.showToast(this.Label.Success, this.Label.MSG_Successfully_Saved, "success");
            refreshApex(this.refreshTable);
            this.isLoading = false;
        }).catch(error => {
            console.error('ERROR => ', error);
            this.showValidity(error);
            this.isLoading = false;
        });
    }

    /**
     * @description this method to get all data to show the user in model
     */
    editUser(row) {
        this.editUserModal = true;
        this.openModal = true;
        this.contactId = row.Contact.Id;
        this.userId = row.Id;
        this.salutation = row.Contact.Salutation;
        this.username = row.Username;
        this.firstName = row.FirstName;
        this.phone = row.Phone;
        this.lastName = row.LastName;
        this.email = row.Email;
        this.defaultStatus = row.IsActive + '';
        this.title = row.Title;
        this.IsMain = row.Contact[this.normalizedApiFields.ISMAIN];
    }

    /**
     * @description this method to update the shown User
     */
    updateUser() {
        this.isLoadingModal = true;
        let self = this;
        let contactSObject = { sobjectType: "Contact" };
        contactSObject.Id = this.contactId;
        contactSObject.FirstName = this.firstName;
        contactSObject.Phone = this.phone;
        contactSObject.LastName = this.lastName;
        contactSObject.Title = this.title;
        contactSObject.Salutation = this.salutation;
        contactSObject.Email = this.email;
        contactSObject[this.normalizedApiFields.ISMAIN] = this.IsMain;
        contactSObject.AccountId = this.data.accId;
        contactSObject[this.normalizedApiFields.DEFAULT_USERNAME] = this.username;
        contactSObject[this.normalizedApiFields.IS_USER_ACTIVE] = this.defaultStatus;
        contactSObject[this.normalizedApiFields.IS_COMMUNITY_USER] = true;
        // set extra fields
        for (let fieldName of this.extraContactFieldsList) {
            contactSObject[fieldName] = this.contactRecord[fieldName];
        }
        let userSObject = { sobjectType: "User" };
        userSObject.Id = this.userId;
        userSObject.FirstName = this.firstName;
        userSObject.Phone = this.phone;
        userSObject.LastName = this.lastName;
        userSObject.Title = this.title;
        userSObject.Email = this.email;
        userSObject.Username = this.username;
        userSObject.IsActive = this.defaultStatus;

        let contactsList = new Array();
        contactsList.push(contactSObject);

        let usersList = new Array();
        usersList.push(userSObject);
        updateContact({
            contactsToUpdate: contactsList
        }).then(() => {
            updateUser({
                usersToUpdate: usersList
            }).then(() => {
                this.showToast(this.Label.Success, this.Label.MSG_Successfully_Saved, "success");
                this.openModal = false;
                refreshApex(self.refreshTable);
                updateRecord({ fields: { Id: self.contactId } })
                this.closeModal();
                this.isLoadingModal = false;
            }).catch(error => {
                console.error('ERROR => ', error);
                this.showValidity(error);
                this.isLoadingModal = false;
                this.isLoading = false;
            });
        }).catch(error => {
            console.error('ERROR => ', error);
            this.showValidity(error);
            this.isLoadingModal = false;
            this.isLoading = false;
        });
    }

    /**
     * @description this method to rest All Data
     */
    resetData() {
        this.selectedAccount = {};
        this.salutation = '';
        this.username = '';
        this.firstName = '';
        this.phone = '';
        this.lastName = '';
        this.email = '';
        this.defaultStatus = 'true';
        this.title = '';
        this.IsMain = false;
    }

    loadAllList() {
        let self = this;
        getSalutationPickList().then((result) => {
            let options = [];
            for (var j in result) {
                options.push({ label: result[j], value: result[j] });
            }
            self.allSalutation = options;
        }).catch((error) => {
            console.error('ERROR => ', error);
            this.showToast(this.Label.MSG_Error_Occurred, error, "error");
        });
    }

    /**
     * @description this method to handle salutation changes
     */
    handlesalutation(event) {
        this.salutation = event.detail.value;
    }

    /**
     * @description this method to Handle Username changes
     */
    handleusername(event) {
        this.username = event.detail.value;
        var username = this.template.querySelector(".username");
        if (!this.validateUsername(this.username)) {
            username.setCustomValidity(this.Label.MSG_Invalid_Username);
        }
        else {
            username.setCustomValidity('');
        }
        username.reportValidity();
    }

    /**
     * @description this method to Handle Firstname changes
     */
    handlefirstName(event) {
        this.firstName = event.detail.value;
        var firstName = this.template.querySelector(".firstName");
        // the firstname can be empty
        if (!this.validateText(this.firstName) && this.firstName != '') {
            firstName.setCustomValidity(this.Label.MSG_Invalid_Firstname);
        }
        else {
            firstName.setCustomValidity('');
        }
        firstName.reportValidity();
    }

    /**
     * @description this method to Handle Lastname changes
     */
    handlelastName(event) {
        this.lastName = event.detail.value;
        var lastName = this.template.querySelector(".lastName");
        if (!this.validateText(this.lastName)) {
            lastName.setCustomValidity(this.Label.MSG_Invalid_Lastname);
        }
        else {
            lastName.setCustomValidity('');
        }
        lastName.reportValidity();
    }

    /**
     * @description this method to Handle Email changes
     */
    handleemail(event) {
        this.email = event.detail.value;
        var email = this.template.querySelector(".email");
        if (!this.validateEmail(this.email)) {
            email.setCustomValidity(this.Label.MSG_Invalid_Email);
        }
        else {
            email.setCustomValidity('');
        }
        email.reportValidity();
    }

    /**
     * @description this method to Handle status changes
     */
    handleStatus(event) {
        this.defaultStatus = event.detail.value;
    }

    /**
     * @description this method to Handle Title changes
     */
    handletitle(event) {
        this.title = event.detail.value;
        var title = this.template.querySelector(".title");
        // the title can be empty
        if (!this.validateText(this.title) && this.title != '') {
            title.setCustomValidity(this.Label.MSG_Invalid_Title);
        }
        else {
            title.setCustomValidity('');
        }
        title.reportValidity();
    }

    /**
     * @description this method to Handle Phone changes
     */
    handlephone(event) {
        this.phone = event.detail.value;
        var phone = this.template.querySelector(".phone");
        // the phone can be empty
        if (!this.validatePhone(this.phone) && this.phone != '') {
            phone.setCustomValidity(this.Label.MSG_Invalid_Phone_Number);
        }
        else {
            phone.setCustomValidity('');
        }
        phone.reportValidity();
    }

    /**
     * @description this method to Handle extra contact fields changes
     */
    handleChanges(event) {
        this.contactRecord[event.target.dataset.fieldname] = event.target.value;
    }

    /**
     * @description this method to validate Email
     */
    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * @description this method to validate username
     */
    validateUsername(username) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z\-0-9]{2,}))$/;
        return re.test(String(username).toLowerCase());
    }

    /**
     * @description this method to validate a text
     */
    validateText(text) {
        const re = /^[a-zA-Z][a-zA-Z0-9]*/;
        return re.test(String(text));
    }

    /**
     * @description this method to validate a phone number
     */
    validatePhone(phone) {
        const re = /^[0-9]*$/;
        return re.test(String(phone));
    }

    /**
     * @description this method to check the Required Fields
     */
    get checkRequiredFields() {
        let disabled = true;
        if ((this.validatePhone(this.phone) || this.phone == '') && this.validateText(this.lastName) && this.validateEmail(this.email) && this.validateUsername(this.username) && (this.validateText(this.firstName) || this.firstName == '') && (this.validateText(this.title) || this.title == '')) {
            disabled = false;
        }
        return disabled;
    }

    get hasUsers() {
        return (this.data.users.length > 0 || this.searchUserTerm != '');
    }

    get hasRecord() {
        return (this.data.users.length > 0);
    }

    /**
     * @description this method to Handle Search For User changes
     */
    handleSearchForUserTermChange(event) {
        // add delay
        clearTimeout(this.delayTimeout);
        const searchUserTerm = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchUserTerm = searchUserTerm;
        }, 300);
    }

    handleToastMessage(title, message, variant) {
        if (typeof this.sforce === 'undefined') {
            this.showToast(title, message, variant);
        } else {
            confirm(message);
        }
    }

    /**
     * @description this method to Load On Scroll
     */
    loadMoreData() {
        if (this.receivedData == this.queryLimit) {
            this.tableIsLoading = true
            this.queryLimit += 10;
        }
    }

    sortBy(field, reverse, primer) {
        try {
            const key = primer
                ? function (x) {
                    return primer(x[field]);
                }
                : function (x) {
                    return x[field];
                };

            return function (a, b) {
                a = key(a);
                b = key(b);
                return reverse * ((a > b) - (b > a));
            };
        } catch (error) {
            console.error('Error => ', error);
        }
    }

    onHandleSort(event) {
        try {
            const { fieldName: sortedBy, sortDirection } = event.detail;
            const cloneData = [...this.data.users];
            cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
            this.usersData = [];
            this.data.users = cloneData;
            this.sortDirection = sortDirection;
            this.sortedBy = sortedBy;
        } catch (error) {
            console.error('Error => ', error);
        }
    }

    /**
     * @description This Method to disable/enable mass activate/deactivate buttons
     */
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.isAllUserDeactivated = true;
        this.isAllUserActivated = true;
        for (let i = 0; i < selectedRows.length; i++) {
            if (selectedRows[i].IsActive) {
                this.isAllUserDeactivated = false;
            } else {
                this.isAllUserActivated = false;
            }
        }
    }

    /**
     * @description This Method to Handle change is Main checkbox
     */
    handleIsMain() {
        this.IsMain = !this.IsMain;
    }

    /**
     * @description This Method to alert the user
     * @param {String} title message title
     * @param {String} message the message content
     * @param {String} variant the message type (success, warning, ..)
     */
    showToast(title, message, variant) {
        let errorMessage;
        // get the message
        if (message.body) {
            // from APEX
            errorMessage = message.body.message;
        } else if (message.message) {
            // from JS
            errorMessage = message.message;
        } else {
            // A normal message
            errorMessage = message;
        }
        // create and show the alert
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: errorMessage,
            variant: variant
        }));
    }

    /**
     * @description This Method to refresh The Data
     */
    refreshData() {
        refreshApex(this.refreshTable);
    }
}