import { LightningElement, api, track } from "lwc";
//import Logo_Panzani from "@salesforce/resourceUrl/Logo_Panzani";
export default class LandingPage extends LightningElement {
  @api text1;
  @api text2;
  @api text3;
  @api showtext1;
  @api showtext2;
  @api showtext3;
  @api link1;
  @api link2;
  @api link3;
  @api color1;
  @api color2;
  @api color3;
  @api textcolor1;
  @api textcolor2;
  @api textcolor3;
  @api icon1;
  @api icon2;
  @api icon3;
  @api text4;
  @api text5;
  @api text6;
  @api text7;
  @api showtext4;
  @api showtext5;
  @api showtext6;
  @api showtext7;
  @api link4;
  @api link5;
  @api link6;
  @api link7;
  @api color4;
  @api color5;
  @api color6;
  @api color7;
  @api textcolor4;
  @api textcolor5;
  @api textcolor6;
  @api textcolor7;
  @api icon4;
  @api icon5;
  @api icon6;
  @api icon7;

  @api textsize;
  @api minimumtilesheight;
  @api title;
  @api logo;
  @api showlogo;
  @api url;
  @api backgroundcolor;
  @track firsttileClass = '';
  @track listTilesrow = [];
  @track coverStyle;
  @track cardStyle;
  @track imageResource;
  @track error;
  connectedCallback() {
    console.log('conencted call back');
    var count = this.showlogo ? 1 : 0;
    var rowcount = 4;
    var numberOfTiles = 7;
    this.imageResource = this.logo;
    this.coverStyle = "background: " + this.backgroundcolor + ";";
    this.cardStyle = "background: " + this.backgroundcolor + ";";
    for (let index = 1; index < numberOfTiles + 1; index++) {
      if (this["showtext" + index]) {
        count++;
      }
    }
    if (count > rowcount) {
      count = rowcount;
    }
    this.firsttileClass += "slds-size_1-of-" + count+' slds-align_absolute-center';
    for (let index = 1; index < numberOfTiles + 1; index++) {
        let item = {
          text: this["text" + index] ? this["text" + index] : '-',
          textstyle: (this["text" + index] ? 'text-align: center;' : 'text-align: center;visibility: hidden;') + (this["textcolor" + index] ? 'color:' + this["textcolor" + index] + ';' : '') + (this.textsize ? 'font-size:' + this.textsize + ';' : ''),
          link: this["link" + index],
          tilestyle: (this["color" + index] ? "background: " + this["color" + index] + ";" : '') + (this.minimumtilesheight ? 'min-height:'+this.minimumtilesheight+';' : '') ,
          class: "slds-size_1-of-" + count,
          show: this["showtext" + index],
          iconlink: this["icon" + index] !== undefined ? ( "/_slds/icons/" + this["icon" + index].split(":")[0] + "-sprite/svg/symbols.svg#" + this["icon" + index].split(":")[1]) : ''
        };
        this.listTilesrow.push(item);
    }
  }
}