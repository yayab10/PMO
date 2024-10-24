import { LightningElement, track, wire, api } from "lwc";

import getAllLightningFilesWithFolderId from "@salesforce/apex/FileExplorerCmpController.getAllLightningFilesWithFolderId";
import LBL_No_Item_To_Display from "@salesforce/label/c.LBL_No_Item_To_Display";
import LBL_Image_Explorer from "@salesforce/label/c.LBL_Image_Explorer";
import LBL_Load_More_Files from "@salesforce/label/c.LBL_Load_More_Files";

export default class NegoptimFilesExplorer extends LightningElement {
  /*Haitham
    Apis coming from the public properties set when adding the component on a page
    */
  //Select which type of files to search for (Images , Documents or both)
  @api TypeOfFilesToSearch;
  counter = 0;
  //Set whether the user want to see only the folder chosen or all it's subfolders data
  @api deepSearch = false;
  // How many image or documents to display after each request (Limit #)
  @api FilesToDisplayPerRequest;

  // Sort the result by createdate Ascending or Descending
  @api CreatedDateOrder;
  //User Record ID
  @api recordId;
  //Which Folder to search in
  @api FolderToSearchIn;
  @track FolderIdToSend
  //Decide whether to show the URL or not
  @api ShowURL = false;
  //this variable is used to track files that are of image type to display them under the Image Category
  @track ImageFilesToDisplay = [];
  //this variable is used to track files that are of Documents type(pdf,word,excel,...) to display them under the Documents Category
  @track DocumentFilesToDisplay = [];
  //the Limit which will be used in the query , it will be incremented by the amout set in FilesToDisplayPerRequest
  LimitToIncrementOnScroll;
  //The amount of files received upon each request, if the newly requested file are the same number as this then no more files
  //need to be requested;
  LastTotalFilesRequested = 0;
  TotalFiles = 0;
  //Decide Whether there are more files to fetch or not
  FetchMoreFiles = true;
  // Stop the checking for loadonscroll function 
  CanLoadOnScroll = true;
  // Variable to determine there is more data to be loaded yet no scrollbar visible to trigger the loadonscroll event
  NoScrollBarVisibleForRemainingFiles = true;
  @track Loading = true;
  @track images = [];
  @track searchTerm = "";
  Label = {
    LBL_No_Item_To_Display,
    LBL_Load_More_Files,
    LBL_Image_Explorer
  };
  FirstTime = true;

  searchTermchangeHandler(event) {
    this.searchTerm = event.detail.value;
    if(!this.searchTerm) {
      this.refreshData();
    }
  }
  submitSearchOnEnter(event) {
    if(event.which == 13){
      this.refreshData();
    }
  }

  refreshData() {
    let self = this;
    getAllLightningFilesWithFolderId({
      searchTerm: this.searchTerm,
      typeOfFiles: this.TypeOfFilesToSearch,
      limitSearchedFiles: this.FilesToDisplayPerRequest,
      orderByCreatedDate: this.CreatedDateOrder,
      FolderToSearchIn: this.FolderToSearchIn,
      deepSearch: this.deepSearch
    }).then(result => {
      if (result) {
        let ResultSet = JSON.parse(result);
        self.TotalFiles = ResultSet.total;
        self.Loading = true;
        setTimeout(() => {
          /*Haitham*/
          self.images = ResultSet.images;
          //filter image files only to display in image category
          self.ImageFilesToDisplay = ResultSet.images.filter(File => File.fileIsImage);
          //filter document to display in documents category
          self.DocumentFilesToDisplay = ResultSet.images.filter(File => !File.fileIsImage);
          if (self.FetchMoreFiles) {
            this.CanLoadOnScroll = true;
            self.LastTotalFilesRequested = self.images.length;
            if (self.LastTotalFilesRequested >= self.TotalFiles) {
              //Disable any call to this methode since all Files are loaded
              self.FetchMoreFiles = false;
              self.NoScrollBarVisibleForRemainingFiles = false;
            }
          }
          self.Loading = false;
        }, 200);
      } else {
        self.Loading = false;
      }
    }).catch(error => {
      self.Loading = false;
      console.log("error     " + (error && error.body && error.body.message ? error.body.message : error));
    });
  }

  get noData() {
    return !this.images || (this.images && this.images.length === 0);
  }
  /*Haitham */
  // this handler gets called when is a scrollbar is not visible yet more data can be loaded
  LoadMoreFiles(event) {
    if (this.FetchMoreFiles) {
      this.Loading = true;
      this.CanLoadOnScroll = false
      this.FilesToDisplayPerRequest += this.LimitToIncrementOnScroll;
      this.refreshData();
    }
  }
  //Scroll event to calculate if the user scrolled all the way to the bottom, which translate to a % of 1
  //if true then the load more data runs to fetch the rest of the files
  ScrollEventHandler(event) {
    //disable the showmore button if scroll bar is visible
    if (this.NoScrollBarVisibleForRemainingFiles) {
      this.NoScrollBarVisibleForRemainingFiles = false;
    }
    if (!this.FetchMoreFiles) {
      return;
    }
    //the pixels hidden in top due to the scroll
    let scrollhiddenPixel = event.target.scrollTop;
    //will be the maximum value for scrollTop.
    let scrollPositionMax = event.target.scrollHeight - event.target.clientHeight;
    //will be the percent of scroll [from 0 to 1].
    let scrollPercentage = scrollhiddenPixel / scrollPositionMax;
    if (this.FetchMoreFiles) {
      if (this.CanLoadOnScroll) {
        if (scrollPercentage >= 0.9) {
          this.ScrollDestination = scrollhiddenPixel;
          this.CanLoadOnScroll = false
          this.FilesToDisplayPerRequest += this.LimitToIncrementOnScroll;
          this.refreshData();
        }
      }
    }
  }
  connectedCallback() {
    this.ScrollableDivElement = this.template.querySelector(
      '[data-id="ScrollDiv"]'
    );
    this.LimitToIncrementOnScroll = this.FilesToDisplayPerRequest;
    this.refreshData();
  }
}