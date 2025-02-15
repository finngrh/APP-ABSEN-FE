import axios from 'axios';
import Cookies from 'js-cookie';

// Buat instance Axios
const Api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
});

// Counter untuk menghitung jumlah request
let requestCount = 0;

Api.interceptors.request.use(request => {
  requestCount++;
  return request;
});



Api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (401 === error.response.status) {
      Cookies.remove('token');
      Cookies.remove('user');
      Cookies.remove('permissions');
      window.location = '/';
    } else if (403 === error.response.status) {
      window.location = '/app/blank';
    } else {
      return Promise.reject(error);
    }
  }
);

export default Api;
