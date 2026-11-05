
const SPREADSHEET_NAME = 'Teja Sun Tech Leads';
const TAB_NAME = 'Enquiries';

function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('LEADS_SHEET_ID');

  let ss = id
    ? SpreadsheetApp.openById(id)
    : SpreadsheetApp.create(SPREADSHEET_NAME);

  if (!id) {
    props.setProperty('LEADS_SHEET_ID', ss.getId());
  }

  let sh = ss.getSheetByName(TAB_NAME) || ss.insertSheet(TAB_NAME);

  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'Timestamp',
      'Name',
      'Mobile',
      'District',
      'Mandal/Town',
      'Monthly Bill',
      'House Type',
      'Roof Space',
      'Timeline',
      'Address',
      'Consent'
    ]);

    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 11)
      .setFontWeight('bold')
      .setBackground('#123d32')
      .setFontColor('#ffffff');
  }

  Logger.log('LEADS_SHEET_URL=' + ss.getUrl());
  return ss.getUrl();
}


function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;

  try {
    const p = e && e.parameter ? e.parameter : {};

    // Spam protection
    if (String(p.website || '').trim()) {
      return response_('error');
    }

    const name = clean_(p.name, 80);
    const phone = String(p.phone || '').replace(/\D/g, '');
    const district = clean_(p.district, 60);
    const mandal = clean_(p.mandal, 80);
    const bill = clean_(p.monthly_bill, 40);
    const house = clean_(p.house_type, 50);
    const roof = clean_(p.roof_space, 30);
    const timeline = clean_(p.timeline, 50);
    const address = clean_(p.address, 250);

    // Required field validation
    if (
      !name ||
      !/^[6-9]\d{9}$/.test(phone) ||
      !district ||
      !mandal ||
      !bill ||
      !house ||
      !timeline ||
      p.consent !== 'Yes'
    ) {
      return response_('error');
    }

    lock.waitLock(10000);
    locked = true;

    const id = PropertiesService
      .getScriptProperties()
      .getProperty('LEADS_SHEET_ID');

    if (!id) {
      throw new Error('Run setup() first');
    }

    const ss = SpreadsheetApp.openById(id);
    const sh = ss.getSheetByName(TAB_NAME);

    if (!sh) {
      throw new Error('Enquiries sheet not found');
    }

    const last = sh.getLastRow();

    // Check duplicate mobile numbers in all previous leads
    if (last > 1) {
      const oldNumbers = sh
        .getRange(2, 3, last - 1, 1)
        .getDisplayValues();

      const exists = oldNumbers.some(row =>
        String(row[0]).replace(/\D/g, '') === phone
      );

      if (exists) {
        return response_('duplicate');
      }
    }

    // Save new lead
    sh.appendRow([
      new Date(),
      name,
      phone,
      district,
      mandal,
      bill,
      house,
      roof,
      timeline,
      address,
      'Yes'
    ]);

    SpreadsheetApp.flush();

    return response_('success');

  } catch (err) {
    console.error(err);
    return response_('error');

  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}


function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}


// Send result to website popup through hidden iframe
function response_(status) {
  const message = JSON.stringify({
    type: 'tejaSolarLeadResult',
    status: status
  });

  const html =
    '<!doctype html><html><body><script>' +
    'const result=' + message + ';' +
    'function sendResult(){' +
    'try{window.parent.postMessage(result,"*");}catch(e){}' +
    'try{window.top.postMessage(result,"*");}catch(e){}' +
    '}' +
    'sendResult();' +
    'setTimeout(sendResult,300);' +
    'setTimeout(sendResult,1000);' +
    '</script></body></html>';

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}


// Backend status check
function doGet(e) {
  return HtmlService.createHtmlOutput(
    'Teja Sun Tech Solar Enquiry Backend is Active!'
  );
}
