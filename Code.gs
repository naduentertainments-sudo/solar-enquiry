const NOTIFICATION_EMAIL = 'naduentertainments@gmail.com';
const SPREADSHEET_NAME = 'Teja Sun Tech Leads';
const TAB_NAME = 'Enquiries';

function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('LEADS_SHEET_ID');
  let ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create(SPREADSHEET_NAME);
  if (!id) props.setProperty('LEADS_SHEET_ID', ss.getId());
  let sh = ss.getSheetByName(TAB_NAME) || ss.insertSheet(TAB_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Timestamp','Name','Mobile','District','Mandal/Town','Monthly Bill','House Type','Roof Space','Timeline','Address','Consent']);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,11).setFontWeight('bold').setBackground('#123d32').setFontColor('#ffffff');
  }
  Logger.log('LEADS_SHEET_URL=' + ss.getUrl());
  return ss.getUrl();
}
function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    if (String(p.website || '').trim()) return response_('error');
    const name = clean_(p.name,80), phone = String(p.phone||'').replace(/\D/g,'');
    const district=clean_(p.district,60), mandal=clean_(p.mandal,80), bill=clean_(p.monthly_bill,40);
    const house=clean_(p.house_type,50), roof=clean_(p.roof_space,30), timeline=clean_(p.timeline,50), address=clean_(p.address,250);
    if (!name || !/^[6-9]\d{9}$/.test(phone) || !district || !mandal || !bill || !house || !roof || !timeline || p.consent!=='Yes') return response_('error');
    const lock=LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const id=PropertiesService.getScriptProperties().getProperty('LEADS_SHEET_ID');
      if(!id) throw new Error('Run setup() first');
      const ss=SpreadsheetApp.openById(id), sh=ss.getSheetByName(TAB_NAME), last=sh.getLastRow();
      if(last>1){
        const start=Math.max(2,last-499), rows=sh.getRange(start,1,last-start+1,3).getValues(), cutoff=Date.now()-86400000;
        for(let i=rows.length-1;i>=0;i--){const t=rows[i][0] instanceof Date?rows[i][0].getTime():0;if(String(rows[i][2])===phone && t>=cutoff)return response_('duplicate');}
      }
      sh.appendRow([new Date(),name,phone,district,mandal,bill,house,roof,timeline,address,'Yes']);
      MailApp.sendEmail(NOTIFICATION_EMAIL,'New Teja Sun Tech Solar Enquiry',
        'New enquiry received.\n\nName: '+name+'\nMobile: '+phone+'\nDistrict: '+district+'\nMandal/Town: '+mandal+'\nMonthly bill: '+bill+'\nHouse type: '+house+'\nRoof space: '+roof+'\nTimeline: '+timeline+'\nAddress: '+address+'\n\nGoogle Sheet: '+ss.getUrl());
    } finally { lock.releaseLock(); }
    return response_('success');
  } catch(err) { console.error(err); return response_('error'); }
}
function clean_(v,n){return String(v||'').replace(/[<>]/g,'').trim().slice(0,n);}
function response_(status){
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>window.top.postMessage({type:"tejaSolarLeadResult",status:"'+status+'"},"*");</script></body></html>');
}
