import { LightningElement, wire, track } from "lwc";
import LoadTodoDataNew from "@salesforce/apex/DailyReportCmpController.LoadTodoDataNew";
import SaveDailyReportDetails from "@salesforce/apex/DailyReportCmpController.SaveDailyReportDetails";
import SaveDailyReport from "@salesforce/apex/DailyReportCmpController.SaveDailyReport";
import DeleteTodo from "@salesforce/apex/DailyReportCmpController.DeleteTodo";
import TotalHoursPerDay from "@salesforce/apex/DailyReportCmpController.TotalHoursPerDay";
import loadHolidays from "@salesforce/apex/DailyReportCmpController.loadHolidays";
import loadWeekends from "@salesforce/apex/DailyReportCmpController.loadWeekends";
import DAILY_REPORT_OBJECT from "@salesforce/schema/Daily_Report__c";
import DAILY_REPORT_DETAIL_OBJECT from "@salesforce/schema/Daily_Report_Detail__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
  getObjectInfo,
  getPicklistValuesByRecordType
} from "lightning/uiObjectInfoApi";
import DailyReportNoTasks from "@salesforce/resourceUrl/DailyReportNoTasks";
import DailyReportWeekend from "@salesforce/resourceUrl/DailyReportWeekend";
import DailyReportIcon from "@salesforce/resourceUrl/DailyReportIcon";
import submitted from "@salesforce/resourceUrl/submitted";
import DailyReportHolidays from "@salesforce/resourceUrl/DailyReportHolidays";
import { getRecord } from "lightning/uiRecordApi";
import USER_NAME from "@salesforce/schema/User.Name";
import USER_ROLE_NAME from "@salesforce/schema/User.UserRole.Name";
import USER_ROLE_ID from "@salesforce/schema/User.UserRole.Id";
import USER_PARENT_ROLE from "@salesforce/schema/User.UserRole.ParentRoleId";
import UserId from "@salesforce/user/Id";
import searchUser from "@salesforce/apex/DailyReportCmpController.searchUser";
import getRoleSubordinateUsers from "@salesforce/apex/DailyReportCmpController.getRoleSubordinateUsers";
import checkUsersIfInsideGroup from "@salesforce/apex/DailyReportCmpController.checkUsersIfInsideGroup";
import getSpecificHolidays from "@salesforce/apex/DailyReportCmpController.getSpecificHolidays";
import cloneDetail from "@salesforce/apex/DailyReportCmpController.cloneDetail";
import checkIfSubmittedDate from "@salesforce/apex/DailyReportCmpController.checkIfSubmittedDate";
import LoadTotalSubmit from "@salesforce/apex/DailyReportCmpController.LoadTotalSubmit";
import DECIMALSEPARATOR from "@salesforce/i18n/number.decimalSeparator";
import TIMEZONE from "@salesforce/i18n/timeZone";
import LOCALE from "@salesforce/i18n/locale";
/*labels*/
import LBL_Add_Task from "@salesforce/label/c.LBL_Add_Task";
import LBL_Categories from "@salesforce/label/c.LBL_Categories";
import LBL_Missing_Tasks from "@salesforce/label/c.LBL_Missing_Tasks";
import LBL_Remotely from "@salesforce/label/c.LBL_Remotely";
import LBL_Off from "@salesforce/label/c.LBL_Off";
import LBL_Sick from "@salesforce/label/c.LBL_Sick";
import LBL_Weekend from "@salesforce/label/c.LBL_Weekend";
import LBL_Holiday from "@salesforce/label/c.LBL_Holiday";
import LBL_No_Tasks from "@salesforce/label/c.LBL_No_Tasks";
import LBL_Enjoy_Weekend from "@salesforce/label/c.LBL_Enjoy_Weekend";
import LBL_Table_Actions from "@salesforce/label/c.LBL_Table_Actions";
import LBL_BTN_Save_Add from "@salesforce/label/c.LBL_BTN_Save_Add";
import LBL_Save_Task from "@salesforce/label/c.LBL_Save_Task";
import LBL_User_Search from "@salesforce/label/c.LBL_User_Search";
import LBL_Add_Hours from "@salesforce/label/c.LBL_Add_Hours";
import LBL_Extra_Time from "@salesforce/label/c.LBL_Extra_Time";
import LBL_Justification_Message from "@salesforce/label/c.LBL_Justification_Message";

import LBL_1H_Break from "@salesforce/label/c.LBL_1H_Break";
import LBL_30Min_Break from "@salesforce/label/c.LBL_30Min_Break";
import LBL_45Min_Break from "@salesforce/label/c.LBL_45Min_Break";
import LBL_All_Day from "@salesforce/label/c.LBL_All_Day";
import LBL_April from "@salesforce/label/c.LBL_April";
import LBL_August from "@salesforce/label/c.LBL_August";
import LBL_Break_Justification from "@salesforce/label/c.LBL_Break_Justification";
import LBL_Cancel from "@salesforce/label/c.LBL_Cancel";
import LBL_Cancel_And_Close from "@salesforce/label/c.LBL_Cancel_And_Close";
import LBL_Cancel_Changes from "@salesforce/label/c.LBL_Cancel_Changes";
import LBL_Cannot_Submit_Day from "@salesforce/label/c.LBL_Cannot_Submit_Day";
import LBL_Clone from "@salesforce/label/c.LBL_Clone";
import LBL_Close from "@salesforce/label/c.LBL_Close";
import LBL_December from "@salesforce/label/c.LBL_December";
import LBL_Delete from "@salesforce/label/c.LBL_Delete";
import LBL_Delete_Task from "@salesforce/label/c.LBL_Delete_Task";
import LBL_End_Date from "@salesforce/label/c.LBL_End_Date";
import LBL_Error from "@salesforce/label/c.LBL_Error";
import LBL_February from "@salesforce/label/c.LBL_February";
import LBL_Friday from "@salesforce/label/c.LBL_Friday";
import LBL_January from "@salesforce/label/c.LBL_January";
import LBL_July from "@salesforce/label/c.LBL_July";
import LBL_June from "@salesforce/label/c.LBL_June";
import LBL_March from "@salesforce/label/c.LBL_March";
import LBL_May from "@salesforce/label/c.LBL_May";
import LBL_Monday from "@salesforce/label/c.LBL_Monday";
import LBL_More_Than_1H from "@salesforce/label/c.LBL_More_Than_1H";
import LBL_No_Break from "@salesforce/label/c.LBL_No_Break";
import LBL_No_Break_Justification from "@salesforce/label/c.LBL_No_Break_Justification";
import LBL_No_Keep from "@salesforce/label/c.LBL_No_Keep";
import LBL_No_Submit_Date from "@salesforce/label/c.LBL_No_Submit_Date";
import LBL_Not_All_Day from "@salesforce/label/c.LBL_Not_All_Day";
import LBL_November from "@salesforce/label/c.LBL_November";
import LBL_Numbers_Of_Days from "@salesforce/label/c.LBL_Numbers_Of_Days";
import LBL_October from "@salesforce/label/c.LBL_October";
import LBL_Reload_Confirm from "@salesforce/label/c.LBL_Reload_Confirm";
import LBL_Saturday from "@salesforce/label/c.LBL_Saturday";
import LBL_September from "@salesforce/label/c.LBL_September";
import LBL_Start_Date from "@salesforce/label/c.LBL_Start_Date";
import LBL_Status from "@salesforce/label/c.LBL_Status";
import LBL_Submit_Day from "@salesforce/label/c.LBL_Submit_Day";
import LBL_Submit_Points from "@salesforce/label/c.LBL_Submit_Points";
import LBL_Total_Submit_Points from "@salesforce/label/c.LBL_Total_Submit_Points";
import LBL_Submitted_Date from "@salesforce/label/c.LBL_Submitted_Date";
import LBL_Success from "@salesforce/label/c.LBL_Success";
import LBL_Sunday from "@salesforce/label/c.LBL_Sunday";
import LBL_Thursday from "@salesforce/label/c.LBL_Thursday";
import LBL_Title from "@salesforce/label/c.LBL_Title";
import LBL_Total from "@salesforce/label/c.LBL_Total";
import LBL_Tuesday from "@salesforce/label/c.LBL_Tuesday";
import LBL_Wednesday from "@salesforce/label/c.LBL_Wednesday";
import LBL_Yes_Cancel from "@salesforce/label/c.LBL_Yes_Cancel";
import LBL_Yes_Sure from "@salesforce/label/c.LBL_Yes_Sure";

import MSG_Cannot_Clone from "@salesforce/label/c.MSG_Cannot_Clone";
import MSG_Cannot_Clone_Submit from "@salesforce/label/c.MSG_Cannot_Clone_Submit";
import MSG_Cannot_Submit_Day from "@salesforce/label/c.MSG_Cannot_Submit_Day";
import MSG_Changes_Lost from "@salesforce/label/c.MSG_Changes_Lost";
import MSG_Changes_Submitted from "@salesforce/label/c.MSG_Changes_Submitted";
import MSG_Click_Submit from "@salesforce/label/c.MSG_Click_Submit";
import MSG_Clone_Success from "@salesforce/label/c.MSG_Clone_Success";
import MSG_Completed_Report from "@salesforce/label/c.MSG_Completed_Report";
import MSG_Contact_Administrator from "@salesforce/label/c.MSG_Contact_Administrator";
import MSG_Happy from "@salesforce/label/c.MSG_Happy";
import MSG_Notify_User_Missing from "@salesforce/label/c.MSG_Notify_User_Missing";
import MSG_Reload_Confirmation from "@salesforce/label/c.MSG_Reload_Confirmation";
import MSG_Submitted from "@salesforce/label/c.MSG_Submitted";
import MSG_Task_Deleted from "@salesforce/label/c.MSG_Task_Deleted";
import MSG_Welcome_Back from "@salesforce/label/c.MSG_Welcome_Back";

/*labels*/

export default class DailyReportCMP extends LightningElement {
  @track betaWarning = true;
  handleCloseBetaWarning() {
    this.betaWarning = false;
  }
  @track legend = {
    missingCounter: 0,
    incompleteDayCounter: 0,
    offCounter: 0,
    sickCounter: 0,
    remotelyCounter: 0
  }; //this object is where i kept every category's counter//
  @track allUsersRoleList = ""; //This variable stored user IDS or user roles IDS and was used inside search//
  @track searchResults = []; //This variable stores the results of user searches and displays them in the front end//
  @track categories = []; //i put all categories information inside this variable and i used it in the front end//
  @track holidays = {}; //This variable contains first 100 holidays//
  @track holidaysInfo = [];
  @track weekends = [];
  @track labels = {
    LBL_Add_Task,
    LBL_Categories,
    LBL_Missing_Tasks,
    LBL_Remotely,
    LBL_Off,
    LBL_Sick,
    LBL_Weekend,
    LBL_Holiday,
    LBL_No_Tasks,
    LBL_Enjoy_Weekend,
    LBL_Table_Actions,
    LBL_BTN_Save_Add,
    LBL_Save_Task,
    LBL_User_Search,
    LBL_Add_Hours,
    LBL_Extra_Time,
    LBL_Justification_Message,
    LBL_Close,
    MSG_Welcome_Back,
    MSG_Happy,
    LBL_Submit_Day,
    LBL_Monday,
    LBL_Tuesday,
    LBL_Wednesday,
    LBL_Thursday,
    LBL_Friday,
    LBL_Saturday,
    LBL_Sunday,
    LBL_Total,
    LBL_Title,
    LBL_Start_Date,
    LBL_End_Date,
    LBL_Numbers_Of_Days,
    LBL_Status,
    LBL_Total_Submit_Points,
    LBL_Submit_Points,
    LBL_Submitted_Date,
    LBL_No_Submit_Date,
    LBL_Cancel_And_Close,
    LBL_Cancel_Changes,
    MSG_Changes_Lost,
    LBL_No_Keep,
    LBL_Yes_Cancel,
    LBL_Delete_Task,
    MSG_Task_Deleted,
    LBL_Cancel,
    LBL_Delete,
    LBL_Clone,
    MSG_Cannot_Clone,
    MSG_Cannot_Clone_Submit,
    MSG_Changes_Submitted,
    LBL_Cannot_Submit_Day,
    MSG_Cannot_Submit_Day,
    LBL_Reload_Confirm,
    MSG_Reload_Confirmation,
    LBL_Yes_Sure
  };
  @track isWeekend = false; //this variable controls whether the front end "enjow weekend" section is visible or hidden//
  @track isHoliday = false;
  @track notAdmin = true; //this variable is used to remove daily report buttons if the user is not the admin//
  @track currentUserId = UserId; //This variable contains the current user ID, which changes if the current user chooses a different user.//
  @track weekendObject = {
    title: this.labels.LBL_Weekend,
    color: "width:20px;height:20px;border-radius:5px;background: #F5D242",
    total: 0
  }; //This object is how the weekend pins will appear inside the calendar and categories//
  @track holidayObject = {
    title: this.labels.LBL_Holiday,
    color: "width:20px;height:20px;border-radius:5px;background: #0176D3",
    total: 0
  }; //This object is how the weekend pins will appear inside the calendar and categories//
  @track calenderDates = []; //i put the calendar dates in this variable and i used it in the front end//
  date = new Date(); //gets the current date//
  year = this.date.getFullYear(); //gets the current year//
  month = this.date.getMonth(); //gets the current month (index based, 0-11)//
  selectedDay = ""; //This variable contains the selected date inside calendar (not the current date)//
  currentDate = ""; //This variable contains the current (date + month) and is used in the calendar header//
  months = [
    LBL_January,
    LBL_February,
    LBL_March,
    LBL_April,
    LBL_May,
    LBL_June,
    LBL_July,
    LBL_August,
    LBL_September,
    LBL_October,
    LBL_November,
    LBL_December
  ]; // array of month names//
  showSearch = false; //You can see the input search if user=(admin or team leader) else the input search will not be visible//
  selectedSearchValue = ""; //this variable where the (user selected inside search) is stored//
  noTasks = false; //this variable controls whether the front end "no tasks" section is visible or hidden//
  imageUrlNoTasks = `background-image:url('${DailyReportNoTasks}')`; //no tasks image//
  imageUrlWeekend = `background-image:url('${DailyReportWeekend}')`; //enjow weekend image//
  imageUrlIcon = `max-width: 42px; height:42px; background-image:url('${DailyReportIcon}'); background-position: center center;`; //app header icon//
  imageUrlHolodays = `max-width: 50px; height:50px; background-image:url('${DailyReportHolidays}'); background-position: center center;`; //app header icon//
  userName; //this variable where the current user name is stored//
  adminId = UserId; //when i choose a different user,this variable keeps the current user ID(logged in user)//
  ParentRoleId; //this variable where the parentRoleId (current user) is stored//
  isMember = false; //variable to hide input search if current user Role=(Member)//
  isAdmin = true; //this flag used to determine whether the current user is the admin or not to used it inside search (apex)//
  nextArrowDisabled = false; //this flag used to show or hide right arrow (inside calendar) if the month is above current month==>false or if the month is under current month ==>true//
  weekendCounter = 0; //this variable held the number of weekends in a given month//
  holidayCounter = 0; //this variable held the number of holidays//
  numberOfHolidays; //this variable held the number of holidays in specific date//
  holidayDate; //this variable contains the selected day(if holiday date)//
  // the current selected tab , it should be by default Today's date
  @track dateSelected = null;
  // map of all the data of that retrieved from the data base
  //Key = Todo_date__c
  //value = Daily_Report__c
  @track allDailyReport = [];
  // the tab in the html will show only the days of the current month (the data retrieved from the db exactly with this conditions)
  @track allDatesofCurrentMonth = [];
  //all the Daily_Report__c records of the current date select (dateSelected)
  @track currentDateReports = [];
  @track currentDateReportHead = [];
  @track currentDateReportHeadCopy = [];
  //label of the field the should be shown in the html
  @track fieldsLabels = {};
  // loading of the page till the save finish
  @track isLoading = false;
  //the new record the should be tracked to be saved in the database
  recordToAdd = {};
  //a deep clone for the record that is inserted or edited, it will be used in case of the cancel
  recordCopy = null;
  recordIndex = null;
  //default recordtype for Daily_Report__c to retrieve the available picklist value
  defaultRecordTypeId = "";
  //aggregation of each date what is the hour sum
  allTotalHours = [];
  //current total hour to show
  @track currentTotalHours = 0;
  //checking for NewTask button if should be hidden or no
  @track disableNewTask = false;
  @track moreThanOneHourBreak = false;
  @track headChanged = false;
  @track headHasdata = false;
  //disable edit when editing or adding new task
  @track disableEdit = false;
  @track readOnly = false;
  @track clientPicklistValues = [];
  editOnly = false; //If I clicked add or edit, this variable would stop me from editing an already created task.//
  //live calculation of detail end time
  @track calculatedEndTime = "-";
  //modals visibility
  @track showDetailDeleteConfirmModal = false;
  @track showDetailCancelConfirmModal = false;
  @track showDetailCloneModal = false;
  @track showSubmitConfirmModal = false
  @track showSubmitProblemModel = false;
  @track showReloadConfirmModel = false;
  // Clone variables
  recordToClone = {};
  @track showCloneDatePicker = false;
  selectedCloneDate = null;
  @track modalRecord = null;
  @track minCloneDate = "";
  @track maxCloneDate = "";
  @track cloneToPtoOrSundayError = false;
  @track recordTypeName = "";
  @track userNote = MSG_Notify_User_Missing;
  @track formattedHeadDate = "";
  @track formattedSubmmittedDate = "";

  @track totalSubmitPoints = 0;
  @track cloneToSubmittedDate = false;
  //get current user info(userName,Role,parentRole)//
  @wire(getRecord, {
    recordId: UserId,
    fields: [USER_ROLE_NAME, USER_ROLE_ID, USER_NAME, USER_PARENT_ROLE]
  })
  currentUserInfo({ error, data }) {
    if (data) {
      this.ParentRoleId = data.fields.UserRole.value.fields.ParentRoleId.value;
      let roleName = data.fields.UserRole.displayValue;
      this.userName = data.fields.Name.value;
      if (this.ParentRoleId == null) {
        this.handleGetSubUsers(data.fields.UserRole.value.id);
      } else {
        if (roleName == "Team Leader") {
          this.isAdmin = false;
          this.handlecheckUsersIfInsideGroup();
        } else if (roleName == "Member") {
          this.isMember = true;
        }
      }
    } else if (error) {
      this.error = error;
    }
  }
  @wire(getObjectInfo, { objectApiName: DAILY_REPORT_DETAIL_OBJECT })
  ToDoInfo({ data, error }) {
    if (data) {
      //Review
      // what is the difference between this and the old code
      this.fieldsLabels["Name"] = data.fields.Name.label;
      this.fieldsLabels["Time"] = data.fields.Time__c.label;
      this.fieldsLabels["Status"] = data.fields.Status__c.label;
      this.fieldsLabels["Type"] = data.fields.Task_Type__c.label;
      this.fieldsLabels["Client"] = data.fields.Client__c.label;
      this.fieldsLabels["Ticket"] = data.fields.ticketId__c.label;
      this.fieldsLabels["Description"] = data.fields.Description__c.label;
      this.fieldsLabels["StartTime"] = data.fields.Start_Time__c.label;
      this.fieldsLabels["EndTime"] = data.fields.End_Time__c.label;
      this.defaultRecordTypeId = data.defaultRecordTypeId;
    }
  }
  @wire(getPicklistValuesByRecordType, {
    objectApiName: DAILY_REPORT_DETAIL_OBJECT,
    recordTypeId: "$defaultRecordTypeId"
  })
  allDailyReportDetailPicklistValues;

  @wire(getObjectInfo, { objectApiName: DAILY_REPORT_OBJECT })
  getHeaderLabels({ data, error }) {
    if (data) {
      this.fieldsLabels["DailyReport"] = data.label;
      this.fieldsLabels["CheckIn"] = data.fields.Check_In__c.label;
      this.fieldsLabels["CheckOut"] = data.fields.Check_Out__c.label;
      this.fieldsLabels["Off"] = data.fields.IsOff__c.label;
      this.fieldsLabels["Sick"] = data.fields.IsSick__c.label;
      this.fieldsLabels["Remotely"] = data.fields.Remotely__c.label;
      this.fieldsLabels["TotalHours"] = data.fields.Total_Hours__c.label;
      this.fieldsLabels["Break"] = data.fields.Break__c.label;
      this.fieldsLabels["ExtraTime"] = data.fields.Extra_Time__c.label;
      this.fieldsLabels["BreakJustification"] = LBL_No_Break_Justification;
    }
  }
  connectedCallback() {
    try {
      addEventListener("resize", this.handlePageChange);
      this.loadAllHoldaysFromDB();
      this.loadWeekendsFromDB();
      this.LoadDailyReportDataFromDB();
    } catch (error) {
      console.error(error);
    }
  }
  //(if user Role='team leader') If the current user is a member of a group if yes ==>get all team members (from the same group)//
  handlecheckUsersIfInsideGroup() {
    checkUsersIfInsideGroup({ userId: this.currentUserId })
      .then((result) => {
        this.allUsersRoleList = JSON.parse(result);
      })
      .catch((error) => {
        console.log(
          `Filter user error`,
          error?.body?.message || error?.message || error
        );
      });
  }
  //get all subroles under the current user//
  handleGetSubUsers(roleId) {
    getRoleSubordinateUsers({ roleId: roleId })
      .then((result) => {
        this.allUsersRoleList = JSON.parse(result);
      })
      .catch((error) => {
        console.log(
          `Filter user error`,
          error?.body?.message || error?.message || error
        );
      });
  }
  //change the size of each section inside the front end ,If the window resizes//
  handlePageChange() {
    try {
      // let headerOne = this.template.querySelector(".header-one");
      let headerTwo = this.template?.querySelector(".header-two");
      let tasksBody = this.template?.querySelector(".tasks-body");
      let calendarSection = this.template?.querySelector(".calendar-section");
      let categoriesSection = this.template?.querySelector(
        ".categories-section"
      );
      if (
        calendarSection != null &&
        headerTwo != null &&
        tasksBody != null &&
        categoriesSection != null
      ) {
        tasksBody.style.height =
          calendarSection.offsetHeight +
          categoriesSection.offsetHeight +
          10.6 -
          (headerTwo.offsetHeight + 10) +
          "px";
      }
    } catch (error) {
      console.log(
        `handlePageChange`,
        error?.body?.message || error?.message || error
      );
    }
  }
  //search for users if the user is team leader or admin//
  handleFilterSearchUser(event) {
    let eventType = event.type;
    let val = event.target.value;
    if(eventType != "click" || !this.showSearch) {
        searchUser({
          searchValue: val,
          allUsersIds: JSON.stringify(this.allUsersRoleList),
          isAdmin: this.isAdmin
        })
          .then((result) => {
            this.showSearch = true;
            this.searchResults = JSON.parse(result);
          })
          .catch((error) => {
            let errors = this.populateErrorMessage(error);
            const evt = new ShowToastEvent({
              title: errors.statusCode,
              message: errors.message,
              variant: "Error"
            });
            this.dispatchEvent(evt);
          });
    } 
    if(val.trim() === "") {
      if (this.currentUserId !== UserId) {
        this.currentUserId = UserId;
        this.handleCheckUsers(UserId);
        this.LoadDailyReportDataFromDB();
      }
    }
  }
  //after selecting a user, a window with the selected user's information appears//
  handleSelectUserAfterSearch(event) {
    let name = event.target.dataset.name;
    let id = event.target.dataset.id;
    this.handleCheckUsers(id);
    this.currentUserId = id;
    this.selectedDay = "";
    this.selectedSearchValue = name;
    this.showSearch = false;
    this.showReloadConfirmModel = false;
    this.LoadDailyReportDataFromDB();
  }
  //If I click outside the search, the search result will be closed//
  handleCheckIfIclickedOutsideSearch(event) {
    if (event.target != this.template.querySelector(".search-users")) {
      this.showSearch = false;
    }
  }
  //check if the current user is the same as the logged-in user//
  handleCheckUsers(userId) {
    if (this.ParentRoleId == null || userId == UserId) {
      this.notAdmin = true;
      this.readOnly = false;
    } else {
      this.notAdmin = false;
      this.readOnly = true;
    }
  }
  openReloadConfirmModel() {
    this.showReloadConfirmModel = true;
  }
  cancelReload(){
    this.showReloadConfirmModel = false;
  }
  renderedCallback() {
    setTimeout(() => {
      this.handlePageChange();
    }, 200);
  }
  //load all holidays//
  loadAllHoldaysFromDB() {
    loadHolidays().then((result) => {
      let res = JSON.parse(result);
      this.holidays = {};
      for (let i = 0; i < res.length; i++) {
        if (!this.holidays.hasOwnProperty(res[i].Off_Day__c))
          this.holidays[res[i].Off_Day__c] = [];
        this.holidays[res[i].Off_Day__c].push(res[i]);
      }
    });
  }
  loadWeekendsFromDB() {
    loadWeekends().then((result) => {
      let res = JSON.parse(result);
      this.weekends = [];
      for (let i = 0; i < res.length; i++) {
        this.weekends.push(res[i].Off_Day__c);
      }
    });
  }
  //load all of the current user's daily reports//
  LoadDailyReportDataFromDB(saveAndNew) {
    this.legend.missingCounter = 0;
    this.legend.incompleteDayCounter = 0;
    this.legend.offCounter = 0;
    this.legend.sickCounter = 0;
    this.legend.remotelyCounter = 0;
    this.calenderDates = [];
    this.isLoading = true;
    LoadTodoDataNew({
      userId: this.currentUserId,
      month: parseInt(this.month + 1),
      year: this.year
    })
      .then((result) => {
        this.allDailyReport = JSON.parse(result);
        //formatting values to user locale
        try {
          for (let date in this.allDailyReport) {
            if (this.allDailyReport.hasOwnProperty(date)) {
              let report = this.allDailyReport[date];
              if (report.hasOwnProperty("Daily_Report_Details__r")) {
                let details = report.Daily_Report_Details__r.records;
                {
                  for (let i = 0; i < details.length; i++) {
                    //locale time
                    if (details[i].hasOwnProperty("Time__c")) {
                      this.allDailyReport[date].Daily_Report_Details__r.records[
                        i
                      ].Locale_Time__c = this.formatNumberToUserLocale(
                        details[i].Time__c
                      );
                    }
                    //locale start time
                    if (details[i].hasOwnProperty("Start_Time__c")) {
                      this.allDailyReport[date].Daily_Report_Details__r.records[
                        i
                      ].Locale_Start_Time__c = this.formatTimeToUserLocale(
                        details[i].Start_Time__c
                      );
                    }
                    //locale end time
                    if (details[i].hasOwnProperty("End_Time__c")) {
                      this.allDailyReport[date].Daily_Report_Details__r.records[
                        i
                      ].Locale_End_Time__c = this.formatTimeToUserLocale(
                        details[i].End_Time__c
                      );
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(error.message);
        }
        if (Object.keys(this.allDailyReport).length != 0) {
          this.handleCheckUsers(this.currentUserId);
          //by default select the first date//
          this.dateSelected =
            this.selectedDay != ""
              ? this.selectedDay
              : Object.keys(this.allDailyReport)[0];
          //check if (dateSelected) is weekend//
          let weekendDay = new Date(`${this.dateSelected}`).getDay();
          this.currentDateReports =
            this.allDailyReport[
              this.dateSelected
            ]?.Daily_Report_Details__r?.records;
          //check (current date) if it is a weekend or holiday or  whether you have any tasks or not//
          if(this.weekends.includes(this.dateSelected)) {
            this.isHoliday = false;
            this.isWeekend = true;
            this.handleAddSectionHolidaysOrWeekendInHtml("body-weekend");
          } else if (this.holidays[this.dateSelected] != undefined) {
            this.isHoliday = true;
            this.handleAddSectionHolidaysOrWeekendInHtml("body-holiday");
            this.handleShowSpecificHolidays(this.dateSelected);
          } else if (
            this.currentDateReports == undefined ||
            this.currentDateReports.length == 0
          ) {
            this.noTasks = true;
            this.isWeekend = false;
            this.isHoliday = false;
          } else {
            this.noTasks = false;
            this.isWeekend = false;
            this.isHoliday = false;
          }
          //get the current report head and details
          this.currentDateReportHead = this.allDailyReport[this.dateSelected];
          this.currentDateReportHeadCopy = JSON.parse(
            JSON.stringify(this.currentDateReportHead)
          );
          this.fillBreakJustificationLabel(this.currentDateReportHead?.Break__c);
          //when head have data to rerender the data in the html
          this.headHasdata = true;
          //to remove "attribute" variable from the head to be able to save it later
          this.removeAttribute(this.currentDateReportHead);
          this.updateDailyReportHeadStyle();
          //if the save and new is pressed, it is required to add new task
          if (saveAndNew == true) {
            this.addNewTask();
          } else {
            this.disableNewTask = false;
          }
          //calculate total hours of each date
          this.totalHoursPerDay();
          //handle changes for break combobox
          this.populateBreakCombobox();
          this.disableSubmittedDay();
        } else {
          this.readOnly = true;
          this.notAdmin = false;
        }
        //create calendar  with designated pins for every task//
        this.handleCalender();
        this.handleTotalSubmit();
        this.selectedSearchValue = this.template?.querySelector(".searchInput")?.value;
      })
      .catch((error) => {
        console.log(
          `LoadDailyReportDataFromDB error`,
          error?.body?.message || error?.message || error
        );
      })
  }
  handleTotalSubmit() {
    LoadTotalSubmit({
      userId: this.currentUserId,
      month: parseInt(this.month + 1),
      year: this.year
    }).then((result) => {
      this.totalSubmitPoints = result;
    }).catch((error) => {
      console.log(
        `LoadTotalSubmit Error`,
        error?.body?.message || error?.message || error
      );
    });
  }
  //get the total number of hours for each daily report//
  totalHoursPerDay() {
    TotalHoursPerDay({
      userId: this.currentUserId,
      month: parseInt(this.month + 1),
      year: this.year
    })
      .then((result) => {
        this.allTotalHours = JSON.parse(result);
        this.currentTotalHours =
          this.allTotalHours[this.dateSelected] === undefined
            ? 0
            : this.allTotalHours[this.dateSelected];
      })
      .catch((error) => {});
  }
  addNewTask() {
    this.editOnly = true;
    this.noTasks = false;
    try {
      this.recordToAdd = { sobjectType: "Daily_Report_Detail__c" };
      this.recordCopy = null;
      this.recordToAdd.Date__c = this.dateSelected;
      this.recordToAdd.Daily_Report__c = this.currentDateReportHead?.Id;
      this.recordToAdd.inline = true;
      //in case it is a new day and he list is empty
      if (this.currentDateReports === undefined) {
        this.currentDateReports = [];
      }
      this.currentDateReports.push(this.recordToAdd);
      this.recordIndex = this.currentDateReports.length - 1;
      this.disableNewTask = true;
      this.disableEdit = true;
    } catch (error) {
      console.log(
        `addNewTask error`,
        error?.body?.message || error?.message || error
      );
    }
  }
  //changes of the daily report detail are handled here
  inputValueChanged(event) {
    const fieldName = event.target.dataset.field;
    let inputValue = event.target.value;
    this.recordToAdd[fieldName] = inputValue;
    if (fieldName === "Task_Type__c") {
      this.template.querySelector(".inp-client").value = "";
      this.updateClientPicklistValue(inputValue);
    } else if (fieldName === "Start_Time__c") {
      this.calculatedEndTime = this.updateTime(
        inputValue,
        this.recordToAdd.Time__c
      );
    } else if (fieldName === "Time__c") {
      this.calculatedEndTime = this.updateTime(
        this.recordToAdd.Start_Time__c,
        inputValue
      );
    }
  }
  //changes of the daily report head are handled here
  inputValueChangedHead(event) {
    const fieldName = event.target.dataset.field;
    const inputname = event.target.name;
    const inputtype = event.target.type;
    try {
      //check if the value is checkbox or another input value
      let inputValue =
        inputtype == "checkbox" ? event.target.checked : event.target.value;
      // this.handleChangeCheckBoxBehaviorToRadioButton(event)

      //handle changes of Break combobox to match the data in the database
      if (
        fieldName == "Break__c" &&
        inputValue == "more" &&
        inputname != "BreakInput"
      ) {
        this.moreThanOneHourBreak = true;
        this.fieldsLabels["BreakJustification"] = LBL_Break_Justification;
        return;
      } else if (
        fieldName == "Break__c" &&
        inputValue != "more" &&
        inputname != "BreakInput"
      ) {
        this.fillBreakJustificationLabel(inputValue);
        this.moreThanOneHourBreak = false;
        inputValue = +inputValue;
      }
      if (inputtype == "checkbox") {
        //prevent the extra time toggle/checkbox from unchecking other checkboxes
        if (fieldName !== "Extra_Time__c") {
          //uncheck isSick__c and isRemotely when isOff__c is checked
          if (fieldName === "IsOff__c") {
            this.currentDateReportHead.IsOff__c =
              !this.currentDateReportHead["IsOff__c"];
            this.currentDateReportHead.IsSick__c = false;
            this.currentDateReportHead.Remotely__c = false;
          }
          //uncheck isOff__c if isSick__c or isRemotely__c are checked
          else {
            this.currentDateReportHead[fieldName] =
              !this.currentDateReportHead[fieldName];
            this.currentDateReportHead.IsOff__c = false;
          }
        }
      }
      this.currentDateReportHead[fieldName] = inputValue;
      this.headChanged = true;
    } catch (error) {
      console.log(
        `inputValueChangedHead error`,
        error?.body?.message || error?.message || error
      );
    }
  }
  //function that transforms a check box behavior into a radio button//
  // handleChangeCheckBoxBehaviorToRadioButton(event){
  //     let allCheck=this.template.querySelectorAll('.cust-check')
  //     //uncheck isSick__c and isRemotely when isOff__c is checked
  //     if(event.target.dataset.field === 'IsOff__c'){
  //         for (const el of allCheck) {
  //             if(el.field !== 'IsOff__c')
  //             {el.checked=false}
  //         }
  //     }
  //     //uncheck isOff__c if isSick__c or isRemotely__c are checked
  //     else{
  //         for (const el of allCheck) {
  //             if(el.field === 'IsOff__c')
  //             {el.checked=false}
  //         }
  //     }
  //     event.target.checked = !event.target.checked;
  //     // if(el.checked){
  //     //     el.checked=false
  //     // }else{
  //     //     el.checked=true
  //     // }
  // }
  saveTask(saveAndNew) {
    if (!this.checkInputValidity()){
      if(this.currentDateReportHead["Submitted__c"])
        this.currentDateReportHead["SubmitDate__c"] = undefined;
      this.currentDateReportHead["Submitted__c"] = false;
      this.headChanged = false;
      return
    } ;
    this.editOnly = false;
    //cases
    //1- changes in the head (saveDailyReport)
    //2- changesin the details (saveDailyReportDetail)
    //3- both (saveDailyReport)
    try {
      // this.isLoading = true;
      if (this.headChanged == true || !this.currentDateReportHead.Id) {
        this.saveDailyReport(saveAndNew);
      } else {
        this.saveDailyReportDetail(saveAndNew);
      }
      this.disableEdit = false;
    } catch (error) {
      // Review
      // use populateErrorMessage (it is an old code but it is ok to review and change it)
      let errors = this.populateErrorMessage(error);
      const evt = new ShowToastEvent({
        title: errors.statusCode,
        message: errors.message,
        variant: "Error"
      });
      this.dispatchEvent(evt);
    }
    this.calculatedEndTime = "-";
  }

  saveDailyReport(saveAndNew) {
    //we need to save only the head, the list of daily report detail not needed in the head before saving,
    // also contains "attributes" variable that stoop the save, it is better to remove it
    if (this.currentDateReportHead?.hasOwnProperty("Daily_Report_Details__r")) {
      delete this.currentDateReportHead["Daily_Report_Details__r"];
    }
    this.currentDateReportHead.Break__c = +this.currentDateReportHead.Break__c;
    this.currentDateReportHead["UserId__c"] = this.currentUserId;
    SaveDailyReport({ dailyReport: this.currentDateReportHead })
      .then((result) => {
        //rerender
        this.headChanged = false;
        //in case of head changes only, no need to update details
        if (Object.keys(this.recordToAdd).length === 0) {
          this.LoadDailyReportDataFromDB(saveAndNew);
          // this.isLoading = false;
        } else {
          //if the head is newely inserted the details need the assignment of its id
          if (!this.recordToAdd.Daily_Report__c) {
            this.recordToAdd.Daily_Report__c = result;
          }
          //in case both head and details changed
          this.saveDailyReportDetail(saveAndNew);
        }
      })
      .catch((error) => {
        console.log(
          `SaveDailyReport error 0 > `,
          error?.body?.message || error?.message || error
        );
        let errors = this.populateErrorMessage(error);
        const evt = new ShowToastEvent({
          title: errors.statusCode,
          message: errors.message,
          variant: "Error"
        });
        this.dispatchEvent(evt);
        // this.isLoading = false;
      });
  }

  saveDailyReportDetail(saveAndNew) {
    this.recordToAdd.Time__c = +this.recordToAdd.Time__c;
    delete this.recordToAdd.Locale_Time__c;
    delete this.recordToAdd.Locale_Start_Time__c;
    delete this.recordToAdd.Locale_End_Time__c;
    SaveDailyReportDetails({ dailyReportDetail: this.recordToAdd })
      .then((result) => {
        //rerender
        //Review
        // no need to isModelOpen anymore
        this.recordToAdd = {};
        this.allDailyReport = [];
        this.currentDateReports = [];
        this.currentDateReportHead = [];
        this.LoadDailyReportDataFromDB(saveAndNew);
        // this.isLoading = false;
      })
      .catch((error) => {
        console.log(
          `SaveDailyReportDetails > `,
          error?.body?.message || error?.message || error
        );
        let errors = this.populateErrorMessage(error);
        const evt = new ShowToastEvent({
          title: errors.statusCode,
          message: errors.message,
          variant: "Error"
        });
        this.dispatchEvent(evt);
        // this.isLoading = false;
      });
  }
  saveAndAddNewTask() {
    let saveAndNew = true;
    this.saveTask(saveAndNew);
  }
  submitDay(){
    console.log("Day submmitted !!!", JSON.stringify(this.currentDateReportHead));
    if(this.currentDateReportHead["SubmitDate__c"] == null || this.currentDateReportHead["SubmitDate__c"] == ""){
      this.currentDateReportHead["SubmitDate__c"] = new Date();
    }
    this.currentDateReportHead["Submitted__c"] = true;
    this.headChanged = true;
    this.showSubmitConfirmModal = false;
    this.showSubmitProblemModel = false;
    this.saveTask();
  }
  openSubmitDayModel(){
    if(!this.currentDateReportHead.IsOff__c && !this.currentDateReportHead.IsSick__c && this.currentTotalHours == 0) {
      this.showSubmitProblemModel = true;
      this.showSubmitConfirmModal = false;
    }
    else {
      this.showSubmitConfirmModal = true;
      this.showSubmitProblemModel = false;
    }
  }
  cancelSubmit(){
    this.showSubmitConfirmModal = false;
    this.showSubmitProblemModel = false;
  }
  disableSubmittedDay(){
    if (this.allDailyReport[this.dateSelected].Submitted__c !== false && this.allDailyReport[this.dateSelected].Submitted__c !== undefined) {
      this.readOnly = true;
      this.notAdmin = false;
    }
  }
  updateDailyReportHeadStyle(){
    this.currentDateReportHead.classStyle = "header-one slds-grid slds-p-horizontal_small slds-p-vertical_x-small slds-grid_vertical-align-center slds-wrap round2x";
    if (this.currentDateReportHead.Submitted__c && !this.isHoliday && !this.isWeekend) {
      this.currentDateReportHead.classStyle += ' submitBackground';
    } else {
      this.currentDateReportHead.classStyle+= ' noSubmitBackground';
    }
    this.updateUserNote();
    // this.formatDates();
  }
  updateUserNote(){
    if(!this.isHoliday && !this.isWeekend) {
      if(this.currentDateReportHead.Submitted__c){
        this.userNote = MSG_Submitted;
      } else if(this.currentDateReportHead.Total_Hours__c >= 8){
        this.userNote = MSG_Completed_Report;
        this.showUserNoteNotification(this.userNote, this.currentDateReportHead.Date__c);
      } else {
        this.userNote = MSG_Click_Submit;
      }
    }
  }
  showUserNoteNotification(userNote, dailyReportDate) {
    const evt = new ShowToastEvent({
      title: "Note",
      message: userNote + ' Day: '+ dailyReportDate,
      variant: "warning",
    });
    this.dispatchEvent(evt);
  }
  // formatDates(){
  //   this.formattedHeadDate = this.formatDateToYYYYMMDD(this.currentDateReportHead.Date__c)
  //   this.formattedSubmmittedDate = this.formatDateToYYYYMMDD(this.currentDateReportHead.SubmitDate__c)
  // }
  editDailyReportDetail(event) {
    this.editOnly = true;
    //disable edit
    this.disableEdit = true;
    this.recordIndex = event.target.dataset.index;
    //reassign the record that should be edited
    this.recordToAdd = { sobjectType: "Daily_Report_Detail__c" };
    this.recordToAdd = this.currentDateReports[this.recordIndex];
    this.recordToAdd.Time__c = "" + this.recordToAdd.Time__c;
    this.updateClientPicklistValue(this.recordToAdd.Task_Type__c);
    //deep copy, no reference, in case of cancel to bring back the original record
    this.recordCopy = JSON.parse(JSON.stringify(this.recordToAdd));
    //to be able to save it later
    this.removeAttribute(this.recordToAdd);
    this.recordToAdd.inline = true;
    this.disableNewTask = true;
    if (this.recordToAdd.Start_Time__c && this.recordToAdd.Time__c) {
      this.calculatedEndTime = this.updateTime(
        this.recordToAdd.Start_Time__c,
        this.recordToAdd.Time__c
      );
    }
  }
  deleteDailyReportDetail() {
    let recordToDelete = this.currentDateReports[this.recordIndex];
    this.isLoading = true;
    this.removeAttribute(recordToDelete);
    DeleteTodo({ dailyReportDetail: recordToDelete })
      .then((result) => {
        this.LoadDailyReportDataFromDB();
        this.totalHoursPerDay();
        this.disableEdit = false;
        this.isLoading = false;
      })
      .catch((error) => {
        this.isLoading = false;
        console.log(
          `deleteDailyReportDetail error`,
          error?.body?.message || error?.message || error
        );
        let errors = this.populateErrorMessage(error);
        const evt = new ShowToastEvent({
          title: errors.statusCode,
          message: errors.message,
          variant: "Error"
        });
        this.dispatchEvent(evt);
      });
    this.showDetailDeleteConfirmModal = false;
  }
  cancelTask() {
    this.editOnly = false;
    this.disableEdit = false;
    this.disableNewTask = false;
    this.recordToAdd = {};
    if (this.recordCopy == null) {
      this.currentDateReports.pop();
    } else {
      this.currentDateReports[this.recordIndex] = this.recordCopy;
    }
    if (
      this.currentDateReports == undefined ||
      this.currentDateReports.length == 0
    ) {
      this.noTasks = true;
    } else {
      this.noTasks = false;
    }
    this.showDetailCancelConfirmModal = false;
    this.calculatedEndTime = "-";
  }
  cancelheadChanges() {
    if (this.headChanged) {
      this.currentDateReportHead.Check_In__c = 
        this.currentDateReportHeadCopy.Check_In__c;
      this.currentDateReportHead.Check_Out__c = 
        this.currentDateReportHeadCopy.Check_Out__c;
      this.currentDateReportHead.Remotely__c =
        this.currentDateReportHeadCopy.Remotely__c;
      this.currentDateReportHead.IsOff__c =
        this.currentDateReportHeadCopy.IsOff__c;
      this.currentDateReportHead.IsSick__c =
        this.currentDateReportHeadCopy.IsSick__c;
      this.currentDateReportHead.Break__c =
        this.currentDateReportHeadCopy.Break__c;
      this.currentDateReportHead.Extra_Time__c = 
        this.currentDateReportHeadCopy.Extra_Time__c;
      this.currentDateReportHeadCopy = [];
      this.headChanged = false;
    }
  }
  removeAttribute(record) {
    if (record?.hasOwnProperty("attributes")) {
      delete record["attributes"];
    }
  }
  populateBreakCombobox() {
    if (this.currentDateReportHead === undefined) {
      return;
    }
    if (this.currentDateReportHead?.Break__c === undefined) {
      this.fieldsLabels["BreakJustification"] = LBL_No_Break_Justification;
    }
    if (this.currentDateReportHead?.Break__c > 1) {
      this.moreThanOneHourBreak = true;
      this.currentDateReportHead.BreakPicklistValue = "more";
    } else if (this.currentDateReportHead?.Break__c <= 1) {
      this.moreThanOneHourBreak = false;
      this.currentDateReportHead.BreakPicklistValue =
        "" + this.currentDateReportHead.Break__c;
      this.fillBreakJustificationLabel(this.currentDateReportHead?.Break__c);
    } else {
      this.moreThanOneHourBreak = false;
      this.currentDateReportHead.BreakPicklistValue = "0";
    }
    if(this.template.querySelector(".resetBreak")) {
      this.template.querySelector(".resetBreak").value = this.currentDateReportHead.BreakPicklistValue;
      this.fillBreakJustificationLabel(this.template.querySelector(".resetBreak").value);
    }
  }
  fillBreakJustificationLabel(value) {
    if(value != 0 || value != "0") {
      this.fieldsLabels["BreakJustification"] = LBL_Break_Justification;
    } else {
      this.fieldsLabels["BreakJustification"] = LBL_No_Break_Justification;
    }
  }
  checkInputValidity() {
    let inputValid = true;
    this.template
      .querySelectorAll('[data-inputgroup="dailyReportDetailGroup"]')
      .forEach((element) => {
        if (!element.reportValidity()) {
          inputValid = false;
        }
      });
    return inputValid;
  }
  updateClientPicklistValue(tasktypeValue) {
    try {
      const controllerValues =
        this.allDailyReportDetailPicklistValues.data.picklistFieldValues
          .Client__c.controllerValues[tasktypeValue];
      this.clientPicklistValues =
        this.allDailyReportDetailPicklistValues.data.picklistFieldValues.Client__c.values.filter(
          (opt) => opt.validFor.includes(controllerValues)
        );
    } catch (error) {
      console.log(
        `updateClientPicklistValue error`,
        error?.body?.message || error?.message || error
      );
    }
  }
  populateErrorMessage(error) {
    let errors = {};
    if (error?.body?.pageErrors?.length > 0) {
      errors.statusCode = error.body.pageErrors[0].statusCode;
      errors.message = error.body.pageErrors[0].message;
    } else if (error?.body?.fieldErrors?.Name?.length > 0) {
      errors.statusCode = error?.body?.fieldErrors?.Name[0].statusCode;
      errors.message = error.body.fieldErrors.Name[0].message;
    } else {
      errors.statusCode = LBL_Error;
      errors.message = MSG_Contact_Administrator;
    }
    return errors;
  }

  formatNumberToUserLocale = (number) => {
    let parts = number.toString().split(".");
    return (
      parts[0] + DECIMALSEPARATOR + (parts[1] ? parts[1].padEnd(2, "0") : "00")
    );
  };

  formatTimeToUserLocale(timeString) {
    try {
      // Remove the 'Z' from the time string if it is in UTC
      const normalizedTimeString = timeString.replace("Z", "");

      // Append a dummy date to the time string to create a valid Date object
      const dateStr = `1970-01-01T${normalizedTimeString}`;
      const time = new Date(dateStr);

      // Check if the time is valid
      if (isNaN(time.getTime())) {
        throw new Error("Invalid time string");
      }

      // Format time according to the user's Salesforce locale and specified timezone
      return new Intl.DateTimeFormat(LOCALE, {
        hour: "numeric",
        minute: "numeric"
      }).format(time);
    } catch (error) {
      console.error(error);
      return "Invalid time";
    }
  }

  get timeOptions() {
    let timeValues = [];
    for (let i = 0.25; i <= 12; i = i + 0.25) {
      timeValues.push({
        label: this.formatNumberToUserLocale(i),
        value: "" + i
      });
    }
    return timeValues;
  }

  get breakOptions() {
    return [
      { label: LBL_No_Break, value: "0" },
      { label: LBL_30Min_Break, value: "0.5" },
      { label: LBL_45Min_Break, value: "0.75" },
      { label: LBL_1H_Break, value: "1" },
      { label: LBL_More_Than_1H, value: "more" }
    ];
  }  
  get enableSave() {
    return this.headChanged || this.disableNewTask;
  }
  capitalize(word) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
  }
  /*calendar functions*/
  // function to generate the calendar//
  handleCalender() {
    this.weekendCounter = 0;
    this.holidayCounter = 0;
    // get the first day of the month//
    let dayone = new Date(this.year, this.month, 1).getDay();
    // get the last date of the month//
    let lastdate = new Date(this.year, this.month + 1, 0).getDate();
    // get the day of the last date of the month//
    let dayend = new Date(this.year, this.month, lastdate).getDay();
    // get the last date of the previous month //
    let monthlastdate = new Date(this.year, this.month, 0).getDate();
    let firstLineIndex = 6;
    if(dayone != 0) {
      firstLineIndex = dayone - 1;
    }
    // loop to add the last dates of the previous month//
    for (let i = firstLineIndex; i > 0; i--) {
      let weekEndDay = new Date(
        `${this.year}-${parseInt(this.month)}-${monthlastdate - i + 1}`
      ).getDay();
      let fullDay =
        monthlastdate - i + 1 < 10
          ? `${this.year}-${
              parseInt(this.month) < 10
            ? "0" + parseInt(this.month)
            : parseInt(this.month)
          }-0${monthlastdate - i + 1}`
          : `${this.year}-${
              parseInt(this.month) < 10
            ? "0" + parseInt(this.month)
            : parseInt(this.month)
          }-${monthlastdate - i + 1}`;
      this.handleBuildDynamicCalender(
        monthlastdate - i + 1,
        weekEndDay,
        this.month,
        fullDay,
        "previous"
      );
    }
    // loop to add the dates of the current month//
    for (let i = 1; i <= lastdate; i++) {
      let weekEndDay = new Date(
        `${this.year}-${parseInt(this.month + 1)}-${i}`
      ).getDay();
      let fullDay =
        i < 10
          ? `${this.year}-${
              parseInt(this.month + 1) < 10
            ? "0" + parseInt(this.month + 1)
            : parseInt(this.month + 1)
          }-0${i}`
          : `${this.year}-${
              parseInt(this.month + 1) < 10
            ? "0" + parseInt(this.month + 1)
            : parseInt(this.month + 1)
          }-${i}`;
      this.handleBuildDynamicCalender(
        i,
        weekEndDay,
        this.month + 1,
        fullDay,
        "current"
      );
    }
    if(dayend != 0) {
      // loop to add the first dates of the next month//
      for (let i = dayend; i < 7; i++) {
        let weekEndDay = new Date(
          `${this.year}-${parseInt(this.month + 2)}-${i - dayend + 1}`
        ).getDay();
        let fullDay =
          i - dayend + 1 < 10
            ? `${this.year}-${
                parseInt(this.month + 2) < 10
              ? "0" + parseInt(this.month + 2)
              : parseInt(this.month + 2)
            }-0${i - dayend + 1}`
            : `${this.year}-${
                parseInt(this.month + 2) < 10
              ? "0" + parseInt(this.month + 2)
              : parseInt(this.month + 2)
            }-${i - dayend + 1}`;
        this.handleBuildDynamicCalender(
          i - dayend + 1,
          weekEndDay,
          this.month + 2,
          fullDay,
          "next"
        );
      }
    }
    //If the current user is not an administrator, limit the number of days that can be edited, added, or deleted in the previews month//
    if (this.ParentRoleId != null) {
      this.handleOpenSpecificDates();
    }
    setTimeout(() => {
      let selectCurentDateFromDom = this.template.querySelectorAll(
        `[data-full="${this.dateSelected}"]`
      );
      selectCurentDateFromDom[0].parentElement.firstElementChild.classList.add(
        "active-day"
      );
    }, 40);
    this.currentDate = `${this.months[this.month]} ${this.year}`;
  }
  //function to create a calendar with every pin//
  handleBuildDynamicCalender(day, dayOff, month, date, monthStatus) {
    let miss = "";
    let incompleteDay = "";
    let off = "";
    let sick = "";
    let remote = "";
    let weekend = "";
    let inactive = "";
    let holidayClass = "";
    let holidayLine = [];
    //Verify if it is a weekend date//
    if (dayOff == 0) {
      this.weekends.push(date);
    }
    if(this.weekends.includes(date)) {
      weekend = "weekend";
      this.weekendCounter++;
      this.weekendObject["total"] = this.weekendCounter;
    }
    //this code later for holidays
    if (this.holidays[date] == undefined) {
      //Adding a class if the key already exists in the array For all types of daily reports//
      if (
        this.allDailyReport[date] != undefined &&
        !this.allDailyReport[date].hasOwnProperty("Half_Day__c")
      ) {
        if (!this.weekends.includes(date)) {
          this.handleAddCategories(date);
          //   miss = this.allDailyReport[date].hasOwnProperty(
          //     "Daily_Report_Details__r"
          //   )
          //     ? ""
          //     : "missing";
          miss = "";
          if (
            !this.allDailyReport[date].hasOwnProperty("Daily_Report_Details__r")
          ) {
            if (!this.allDailyReport[date].IsOff__c && !(this.allDailyReport[date].IsSick__c && !this.allDailyReport[date].Remotely__c)) {
              miss = "missing";
            }
          }
          if(this.allDailyReport[date].hasOwnProperty("Daily_Report_Details__r")){
            if(!this.allDailyReport[date].Submitted__c){
              incompleteDay = "incompleteDay";
            }
          }
          //  else {
          //   if (
          //     this.allDailyReport[date].Daily_Report_Details__r.totalSize === 0
          //   ) {
          //     miss = "missing";
          //   }
          // }
          off = this.allDailyReport[date].hasOwnProperty("IsOff__c")
            ? this.allDailyReport[date].IsOff__c
              ? "off"
              : ""
            : "";
          sick = this.allDailyReport[date].hasOwnProperty("IsSick__c")
            ? this.allDailyReport[date].IsSick__c
              ? "sick"
              : ""
            : "";
          remote = this.allDailyReport[date].hasOwnProperty("Remotely__c")
            ? this.allDailyReport[date].Remotely__c
              ? "remote"
              : ""
            : "";
        }
      } else {
        //If a key is missing, add the class as inactive//
        inactive = "inactive";
      }
    } else if (!this.weekends.includes(date)) {
      //create holidays inside calendar//
      holidayClass = "holiday";
      for (let i = 0; i < this.holidays[date].length; i++) {
        let holidayLineTop = i == 1 ? 17 - 9 : i == 2 ? 17 + 9 : 17;
        holidayLine.push({
          class: "ov " + holidayClass,
          style:
            "width: 6px; height: 6px;border-radius:50px;top:29px;left:" +
            holidayLineTop +
            "px"
        });
        this.holidayCounter++;
      }
    }
    this.holidayObject["total"] = this.holidayCounter;
    if (monthStatus == "previous" || monthStatus == "next")
      inactive = "inactive";
    //Adding a class if the key already exists in the array For all types of daily reports//
    // if(this.allDailyReport[date]!=undefined && !this.allDailyReport[date].hasOwnProperty('Half_Day__c')){
    //     if(dayOff!=0){
    //         this.handleAddCategories(date)
    //         miss=this.allDailyReport[date].hasOwnProperty('Daily_Report_Details__r') ? '' : 'missing';
    //         off=this.allDailyReport[date].hasOwnProperty('IsOff__c') ? this.allDailyReport[date].IsOff__c ? 'off' : '':''
    //         sick=this.allDailyReport[date].hasOwnProperty('IsSick__c') ? this.allDailyReport[date].IsSick__c ? 'sick' : '':''
    //         remote=this.allDailyReport[date].hasOwnProperty('Remotely__c') ? this.allDailyReport[date].Remotely__c ? 'remote' : '':''
    //     }
    //     if(monthStatus=='previous' || monthStatus=='next')inactive='inactive'
    // }else{
    //     //If a key is missing, add the class as inactive//
    //     inactive='inactive'
    // }

    //this variable holds the date of today//
    let isToday =
      day === this.date.getDate() &&
        month === new Date().getMonth() + 1 &&
        this.year === new Date().getFullYear()
        ? "active"
        : "";
    //this variable holds full date year-month-day//
    let fullDate =
      day < 10
        ? `${this.year}-${
            parseInt(month) < 10 ? "0" + parseInt(month) : parseInt(month)
        }-0${day}`
        : `${this.year}-${
            parseInt(month) < 10 ? "0" + parseInt(month) : parseInt(month)
        }-${day}`;
    let saveselectedDate = this.selectedDay == fullDate ? "active-day" : "";
    //check to see if today is a weekend==> if yes add "enjow weekend" section//
    if (isToday == "active" && this.weekends.includes(date)) {
      this.handleAddSectionHolidaysOrWeekendInHtml("body-weekend");
      this.isWeekend = true;
    }
    this.calenderDates.push({
      nb: day,
      parentClasses:
        isToday +
        " ov circle-cal parent-circle " +
        inactive +
        " " +
        saveselectedDate +
        " " +
        miss +
        " " +
        incompleteDay,
      dotsClasses: "ov " + off + " " + sick + " " + remote + " " + weekend,
      holidays: holidayLine,
      full: fullDate,
      weekend: this.weekends.includes(date) ? true : false,
      holiday: holidayClass != "" ? true : false
    });
    setTimeout(() => {
      this.isLoading = false;
    }, 100);
  }

  //function to open specific days for previews month to updates, delete, and add daily reports//
  handleOpenSpecificDates() {
    console.log("<<<<<< handleOpenSpecificDates >>>>>>");
    let currentFullDate = new Date(new Date().setHours(0, 0, 0, 0));
    let currentSelectedDate = new Date(
      this.year,
      parseInt(this.month + 1),
      this.date.getDate()
    );
    let totalDays = new Date(this.year, this.month + 1, 0).getDate() - 1;
    let arrLength = this.calenderDates.length;
    if (currentSelectedDate.getTime() === currentFullDate.getTime()) {
    } else if (currentSelectedDate < currentFullDate) {
      this.notAdmin = false;
      this.readOnly = true;
    }
  }

  //function that modifies the calendar months//
  handleChangeMonth(event) {
    let id = event.target.dataset.id;
    // Check if the icon is "calendar-prev" or "calendar-next"
    this.month = id === "calendar-prev" ? this.month - 1 : this.month + 1;
    // Check if the month is out of range
    if (this.month < 0 || this.month > 11) {
      // Set the date to the first day of the month with the new year
      this.date = new Date(this.year, this.month, new Date().getDate());
      // Set the year to the new year
      this.year = this.date.getFullYear();
      // Set the month to the new month
      this.month = this.date.getMonth();
    } else {
      // Set the date to the current date
      this.date = new Date();
    }
    //if month not equal current month show right arrow(button)//
    this.nextArrowDisabled = true;
    //if month equal current month disable right arrow(button)//
    if (
      this.month == new Date().getMonth() &&
      this.year == new Date().getFullYear()
    ) {
      this.nextArrowDisabled = false;
    }
    this.selectedDay = "";
    this.LoadDailyReportDataFromDB(undefined);
  }

  //function to get all daily reports for a specific date in a calendar//
  handleChangeDay(event) {
    if (new Date(event.target.dataset.full) <= new Date() && new Date(event.target.dataset.full).getMonth() == this.month) {
      let currentDate = new Date();
      let weekDate = event.target.dataset.weekend;
      let holiday = event.target.dataset.holiday;
      this.selectedDay = event.target.dataset.full;
      this.dateSelected = event.target.dataset.full;
      if (holiday == "true") {
        this.handleAddActiveCircleOnDate(event);
        this.handleShowSpecificHolidays(this.dateSelected);
        this.updateDailyReportHeadStyle();
        return;
      }

      //if the selected date <= current date==>On the selected date, add a blue circle with opacity//
      if (new Date(this.dateSelected) <= currentDate) {
        this.handleAddActiveCircleOnDate(event);
        //Verify if it is a weekend date//
        if (weekDate == "true") {
          this.handleAddSectionHolidaysOrWeekendInHtml("body-weekend");
          this.isWeekend = true;
          this.isHoliday = false;
          this.updateDailyReportHeadStyle();
        }
      }
      try {
        //If the selected date is not a weekend and exists in the array, the daily reports will be displayed.//
        if (
          this.allDailyReport.hasOwnProperty(this.dateSelected) &&
          weekDate == "false"
        ) {
          //Check to see if the current user has any open days//
          if (this.currentUserId == UserId) {
            this.readOnly = false;
            this.notAdmin = true;
            this.disableSubmittedDay();
          }
          this.isWeekend = false;
          this.isHoliday = false;
          //cancel all changes when selecting another tab
          if (Object.keys(this.recordToAdd).length != 0) {
            this.cancelTask();
          }
          //in case of head changes
          this.cancelheadChanges();
          this.recordToAdd = {};
          this.currentDateReports =
            this.allDailyReport[
              this.dateSelected
            ]?.Daily_Report_Details__r?.records;
          this.currentDateReportHead = this.allDailyReport[this.dateSelected];
          this.currentDateReportHeadCopy = this.currentDateReportHead
            ? JSON.parse(JSON.stringify(this.currentDateReportHead))
            : null;
          this.removeAttribute(this.currentDateReportHead);
          this.currentTotalHours =
            this.allTotalHours[this.dateSelected] === undefined
              ? 0
              : this.allTotalHours[this.dateSelected];
          this.populateBreakCombobox();
          this.updateDailyReportHeadStyle();
          //check to see if the selected day has a daily report or not//
          if (
            this.currentDateReports == undefined ||
            this.currentDateReports.length == 0
          ) {
            this.noTasks = true;
          } else {
            this.noTasks = false;
          }
        }
      } catch (error) {
        console.log(
          `selectTab error`,
          error?.body?.message || error?.message || error
        );
      }
    }
  }
  handleAddSectionHolidaysOrWeekendInHtml(className) {
    setTimeout(() => {
      let headerOne = this.template.querySelector(".calendar-section");
      let bodySection = this.template.querySelector("." + className);
      let mainContainer = this.template.querySelector(".categories-section");
      bodySection.style.height =
        mainContainer.offsetHeight + headerOne.offsetHeight + 10.6 + "px";
    }, 40);
  }

  handleAddActiveCircleOnDate(event) {
    const activeEl = this.template.querySelectorAll(".active-day");
    if (activeEl.length != 0) activeEl[0].classList.remove("active-day");
    event.target.parentElement.firstElementChild.classList.add("active-day");
  }

  //function to create categories section with the quantity of each kind of task//
  handleAddCategories(key) {
    const dailyReport = this.allDailyReport[key];
    let miss = {
      title: this.labels.LBL_Missing_Tasks,
      color: "width:20px;height:20px;border-radius:5px;background:#FF6693",
      total: this.legend.missingCounter
    };
    let incompleteDay = {
      title: "Incomplete Day",
      color: "width:20px;height:20px;border-radius:5px;background:#6e6c67",
      total: this.legend.incompleteDayCounter
    };
    let off = {
      title: this.labels.LBL_Off,
      color: "width:20px;height:20px;border-radius:5px;background:#F58948",
      total: this.legend.offCounter
    };
    let sick = {
      title: this.labels.LBL_Sick,
      color: "width:20px;height:20px;border-radius:5px;background:#AE39F4",
      total: this.legend.sickCounter
    };
    let remote = {
      title: this.labels.LBL_Remotely,
      color: "width:20px;height:20px;border-radius:5px;background: #2EDC7F",
      total: this.legend.remotelyCounter
    };
    if (!dailyReport.hasOwnProperty("Daily_Report_Details__r")) {
      const currentDate = new Date(key);
      const today = new Date();
      if(currentDate.toDateString() !== today.toDateString()){
        if (!dailyReport.IsOff__c && !(dailyReport.IsSick__c && !dailyReport.Remotely__c)){
          this.legend.missingCounter++;
          miss.total = this.legend.missingCounter;
        }
      }
    }
    if(dailyReport.hasOwnProperty("Daily_Report_Details__r")){
      if(!dailyReport.Submitted__c){
        this.legend.incompleteDayCounter++;
        incompleteDay.total = this.legend.incompleteDayCounter;
      }
    }
    if (dailyReport.hasOwnProperty("IsOff__c")) {
      if (dailyReport.IsOff__c) this.legend.offCounter++;
      off.total = this.legend.offCounter;
    }
    if (dailyReport.hasOwnProperty("IsSick__c")) {
      if (dailyReport.IsSick__c) this.legend.sickCounter++;
      sick.total = this.legend.sickCounter;
    }
    if (dailyReport.hasOwnProperty("Remotely__c")) {
      if (dailyReport.Remotely__c) this.legend.remotelyCounter++;
      remote.total = this.legend.remotelyCounter;
    }
    this.categories = [
      miss,
      incompleteDay,
      remote,
      off,
      sick,
      this.weekendObject,
      this.holidayObject
    ];
  }
  /*calendar function*/

  /*holidays Code*/
  //get holidays for specofic date//
  handleShowSpecificHolidays(date) {
    this.isHoliday = true;
    this.handleAddSectionHolidaysOrWeekendInHtml("body-holiday");
    this.isLoading = true;
    getSpecificHolidays({ holidayDate: date })
      .then((result) => {
        this.holidaysInfo = this.groupData(JSON.parse(result));
        this.numberOfHolidays = this.holidaysInfo.length;
        this.holidayDate =
          new Date(date).getDate() +
          " " +
          new Date(date).toLocaleString("default", { month: "long" }) +
          " " +
          new Date(date).getFullYear();
        this.isLoading = false;
      })
      .catch((error) => {
        console.log("error ", error);
        // this.openSpinner = false;
      });
  }
  groupData(dataArray) {
    let groupedObject = dataArray.reduce((acc, curr) => {
      let name = curr.Name;
      if (!acc[name]) {
        acc[name] = {
          ids: [curr.Id],
          title: curr.Name,
          start: curr.Off_Day__c,
          end: curr.Off_Day__c,
          status: !curr.Half_Day__c ? LBL_All_Day : LBL_Not_All_Day,
          nb: 1
        };
      } else {
        if (curr.Off_Day__c < acc[name].start) {
          acc[name].start = curr.Off_Day__c;
        }
        if (curr.Off_Day__c > acc[name].end) {
          acc[name].end = curr.Off_Day__c;
        }
        acc[name].ids.push(curr.Id);
      }
      let howMuchDays =
        (new Date(acc[name].end) - new Date(acc[name].start)) /
        (1000 * 60 * 60 * 24) +
        1;
      acc[name].nb =
        howMuchDays > 1 ? howMuchDays + " Days" : howMuchDays + " Day";
      return acc;
    }, {});
    let groupedArray = Object.values(groupedObject);
    return groupedArray;
  }
  /*holidays Code*/

  /*responsive Code*/
  // showCalendar=false
  // handleShowCalendar(){
  //     this.showCalendar=true
  // }

  // handleCloseCalendar(){
  //     this.showCalendar=false
  // }
  /*responsive Code*/

  get showJustificationField() {
    return (
      this.currentDateReportHead.Break__c != "1" || this.moreThanOneHourBreak
    );
  }

  get showCloneBtn() {
    return this.dateSelected <= this.formatDateToYYYYMMDD(new Date());
  }

  //returns an updated time by adding the incrementValue to the given time

  updateTime = (timeInput, incrementValue) => {
    try {
      if (timeInput && incrementValue) {
        const time = timeInput.split(":");
        let hours = parseInt(time[0], 10);
        let minutes = parseInt(time[1], 10);

        // Calculate new minutes
        minutes += Math.floor(incrementValue * 60);

        // Adjust hours and minutes if minutes exceed 60
        if (minutes >= 60) {
          hours += Math.floor(minutes / 60);
          minutes = minutes % 60;
        }

        // Handle hours overflow (24-hour format)
        if (hours >= 24) {
          hours = hours % 24;
        }

        // Create a new Date object with the provided time
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);

        // Format time according to the user's Salesforce locale and specified timezone
        return new Intl.DateTimeFormat(LOCALE, {
          hour: "numeric",
          minute: "numeric"
        }).format(date);
      }
      return "-";
    } catch (error) {
      console.error(error);
      return "Invalid time";
    }
  };

  //convert time format to hh:mm
  convertTimeFormat = (timeString) => {
    // Split the time string to extract the time part
    let timePart = timeString.split("T")[1];

    // Split the time part to get hours and minutes
    let [hours, minutes] = timePart.split(":");

    // Return the formatted string
    return `${hours}:${minutes}`;
  };

  //format date to dd-mm-yyyy
  formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  //show the detail cancel confirmation modal
  handleDetailCancelBtn = () => {
    this.showDetailCancelConfirmModal = true;
  };

  //clone task handler
  handleDetailCloneBtn = () => {
    if (this.validateCloneDate()) {
      const detailId = this.currentDateReports[this.recordIndex].Id;
      this.isLoading = true;
      cloneDetail({
        detailToCloneId: detailId,
        userId: UserId,
        cloneDate: this.selectedCloneDate
      })
        .then((result) => {
          this.isLoading = false;
          const evt = new ShowToastEvent({
            title: LBL_Success,
            message: MSG_Clone_Success,
            variant: "success"
          });
          this.dispatchEvent(evt);
          this.LoadDailyReportDataFromDB();
        })
        .catch((error) => {
          this.isLoading = false;
          let errors = this.populateErrorMessage(error);
          const evt = new ShowToastEvent({
            title: errors.statusCode,
            message: errors.message,
            variant: "error"
          });
          this.dispatchEvent(evt);
        });
      this.showDetailCloneModal = false;
    }
  };

  //show the detail delete confirmation modal
  handleDetailDeleteBtn = (event) => {
    this.showDetailDeleteConfirmModal = true;
    this.recordIndex = event.target.dataset.index;
    this.modalRecord = this.currentDateReports[this.recordIndex];
  };

  //hide all modals
  handleModalCancelBtn = () => {
    this.recordToDeleteIndex = null;
    this.showDetailCancelConfirmModal = false;
    this.showDetailDeleteConfirmModal = false;
    this.showDetailCloneModal = false;
  };
  //close all toasts
  handleToastDismissBtn = () => {
    this.cloneSuccess = false;
    this.cloneFailed = false;
  };

  //show hide clone date picker (note: code is repeated)
  toggleCloneDatePicker = (event) => {
    this.showDetailCloneModal = true;
    this.cloneToPtoOrSundayError = false;
    this.cloneToSubmittedDate = false;
    this.selectedCloneDate = null;
    this.recordIndex = event.target.dataset.index;
    this.modalRecord = this.currentDateReports[this.recordIndex];
    //note: code below could be moved to the calender handler
    let date = new Date(this.dateSelected);
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + (date.getDate())).slice(-2);
    this.minCloneDate = `${year}-${month}-${day}`;
    const today = new Date();
    year = today.getFullYear();
    month = String(today.getMonth() + 1).padStart(2, "0");
    day = String(today.getDate()).padStart(2, "0");
    this.maxCloneDate = `${year}-${month}-${day}`;
  };

  //clone date input handler
  handleCloneDateChange = (event) => {
    this.cloneToPtoOrSundayError = false;
    this.cloneToSubmittedDate = false;
    const value = event.target.value;
    this.selectedCloneDate = value;
    if(this.allDailyReport[this.selectedCloneDate]) {
      this.cloneToSubmittedDate = this.allDailyReport[this.selectedCloneDate].Submitted__c;
    } else {
      this.handleCheckIfSubmittedDate();
    }
    this.validateCloneDate(value, this.minCloneDate, this.maxCloneDate);
  };
  handleCheckIfSubmittedDate() {
    checkIfSubmittedDate({
      userId: this.currentUserId,
      cloneDate: this.selectedCloneDate
    }).then((result) => {
      this.cloneToSubmittedDate = result;
    }).catch((error) => {
      console.log(
        `checkIfSubmittedDate Error`,
        error?.body?.message || error?.message || error
      );
    });
  }
  //check if clone date is valid
  validateCloneDate = () => {
    // Convert the input strings to Date objects
    let date = new Date(this.selectedCloneDate);
    let min = new Date(this.minCloneDate);
    let max = new Date(this.maxCloneDate);

    if(this.holidays.hasOwnProperty(this.selectedCloneDate) || this.weekends.includes(this.selectedCloneDate)) {
      this.cloneToPtoOrSundayError = true;
      if(this.holidays.hasOwnProperty(this.selectedCloneDate)) {
        this.recordTypeName = 'Holiday';
      } else if(this.weekends.includes(this.selectedCloneDate)) {
        this.recordTypeName = 'Weekend';
      }
      return false;
    }
    if (date > max) {
      return false; // The date is greater than the maximum date
    }
    if (date < min) {
      return false; // The date is less than or equal to the minimum date plus one day
    }
    if(this.cloneToSubmittedDate) {
      return false;
    }
    return true; // The date is valid
  };
}