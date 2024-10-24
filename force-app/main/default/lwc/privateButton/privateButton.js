import { LightningElement, api, track } from 'lwc';

export default class privateButton extends LightningElement {
  @api btnfirstlabel;
  @api btnsecondlabel;
  @api btnurl;
  @api btncolorhex = '0000FF';
  @api btntextcolorhex = 'FFFFFF';
  @api isnewtab = false;
  @api minheight;
  @api buttonicon;
  @api iconclassname;
  @api borderradius;
  @track showbtnfirstlabel = false;
  @track showbtnsecondlabel = false;
  //attribute for button icon:
  @track showButtonIcon = false;
  @track showTextWithoutIcon = false;
  @track showIconWithoutText = false;
  connectedCallback() {
    if (this.btnfirstlabel) {
      this.showbtnfirstlabel = true;
    }
    if (this.btnsecondlabel) {
      this.showbtnsecondlabel = true;
    }
    if (this.btnfirstlabel && this.buttonicon) {
      this.showButtonIcon = true;
    } else
      if (this.btnfirstlabel && !this.buttonicon) {
        this.showTextWithoutIcon = true;
      } else
        if (!this.btnfirstlabel && this.buttonicon) {
          this.showIconWithoutText = true;
        }
  }

  renderedCallback() {

  }

  get targetTab() {
    if (this.isnewtab) {
      return '_blank';
    }
    return '';
  }
  get btnInlineStyle() {
    var style = "";
    if (this.btncolorhex) {
      style = style + "background: #" + this.btncolorhex + ";";
    }
    if (this.btntextcolorhex) {
      style = style + "color: #" + this.btntextcolorhex + ";";
    }
    if (this.minheight) {
      style = style + "min-height: " + this.minheight + "px;";
    }
    if (this.borderradius) {
      style = style + "border-radius: " + this.borderradius + "px;";
    }
    return style;
  }
  get btnClassCSS() {
    return "link-button";
  }

  get iconHref() {
    return this.buttonicon ? "/_slds/icons/" + this.buttonicon.split(':')[0] + "-sprite/svg/symbols.svg#" + this.buttonicon.split(':')[1] : undefined;
  }

  get iconInlineStyle() {
    return this.btntextcolorhex? 'fill: #' + this.btntextcolorhex + ';' : undefined;
  }
}