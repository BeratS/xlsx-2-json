import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { each, has, trim } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  name = 'This is XLSX TO JSON CONVERTER';
  willDownload = false;
  willTransDownload = false;

  lngKeys = {
    "English": "EN",
    "French": "FR",
    "German": "DE",
    "Russian": "RU",
    "Spanish": "ES",
    "Italian": 'IT',
    "Turkish": 'TR',
    "Vietnamese": 'VN',
    "Filipino": 'PH',
    "Thai": 'TH',
  } as any;

  constructor() { }

  onFileChange(ev: any) {
    let workBook: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      (document.getElementById('output') as HTMLElement).innerHTML = dataString.slice(0, 300).concat("...");
      this.translationFormat(jsonData['Sheet1']);
      // this.setDownload(dataString);
    }
    reader.readAsBinaryString(file);
  }

  setDownload(data: any) {
    this.willDownload = true;    
    setTimeout(() => {
      const el = (document.querySelector("#download") as HTMLElement);
      el.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(data)}`);
      el.setAttribute("download", 'xlsxtojson.json');
    }, 1000)
  }

  translationFormat(data: any) {
    const finalObj = data.reduce((data: any, obj: any) => {
      if (!obj['KEYS'] || !obj['English']) { return data; }
      
      each(obj, (value: string, language: string) => {
        if (language === 'KEYS' || language === 'Description') { return; }
        const lng = this.lngKeys[language];
        
        if (!lng) {
          throw('MISSING Language');
        }

        const KEY = obj['KEYS'];

        if (!has(data, lng)) {
          data[lng] = {};
        }
        data[lng][trim(KEY)] = obj[language];

        console.log('obj[language]', obj[language]);
      })
      return data;
    }, {});

    console.log(data, finalObj);

    const stringifyResult = JSON.stringify(finalObj);
    (document.getElementById('output_trans') as HTMLElement).innerHTML = stringifyResult.slice(0, 300).concat("...");
    this.setDownload(stringifyResult);
  }
}
