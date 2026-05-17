// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  defaultauth: 'fakebackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },

  GET_MasterData: 'https://localhost:44379/DataCenter/GET_MasterData',
  //emonitor Api
  CON_API: "https://localhost:44379/",
  DownloadExamUrl: "https://localhost:44379/DownLoad_File/Download_File_TEMPLATE",
  PreviewExamUrl: "https://localhost:44379/DownLoad_File/Preview_File_Template",
  GET_AUTHEN: 'https://localhost:44379/GET_DATA/GET_AUTHEN',
  // เพิ่ม endpoint สำหรับ menu
  GET_MENU: 'https://localhost:44379/GET_DATA/GetMenu',
  SEND_EMAIL: 'https://localhost:44379/DataCenter/Send_Email',
// ----------------------------------------------------------------------

 
  // -----------------------------------------------------------------------------------------------------------------

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
