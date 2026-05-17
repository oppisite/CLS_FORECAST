// เมื่อ deploy ที่ https://nrfappnew.fda.moph.go.th/FDA_FORECAST
// location.origin จะเป็น 'https://nrfappnew.fda.moph.go.th' (ไม่มี path)
// ถ้าต้องการยึดติดเซิร์ฟเวอร์นี้เสมอ ให้ใช้: const API_BASE = 'https://nrfappnew.fda.moph.go.th';
const API_BASE = 'https://nrfappnew.fda.moph.go.th';

export const environment = {
  production: true,
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

  // Base API อยู่ที่ /FDA_FORECAST/ (โฮสต์เดียวกับแอป)
  CON_API: API_BASE + '/FDA_FORECAST/',
  GET_MasterData: API_BASE + '/FDA_FORECAST/DataCenter/GET_MasterData',
  GET_AUTHEN: API_BASE + '/FDA_FORECAST/GET_DATA/GET_AUTHEN',
  DownloadExamUrl: API_BASE + '/FDA_FORECAST/DownLoad_File/Download_File_TEMPLATE',
  GET_MENU: API_BASE + '/FDA_FORECAST/GET_DATA/GetMenu',
  SEND_EMAIL: API_BASE + '/FDA_FORECAST/DataCenter/Send_Email',
};
