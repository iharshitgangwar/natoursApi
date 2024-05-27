import axios from 'axios';

import { showAlert } from './alert';

//babel /pollyfill will include advance js features for old broswers

export const login = async (email, password) => {
     console.log(email, password);
     try {
          const res = await axios({
               method: 'POST',
               url: 'http://localhost:3000/api/v1/users/signin',
               data: {
                    email,
                    password,
               },
          });

          if (res.data.status === 'success') {
               showAlert('sucess', 'Logged in sucessfully!');
               window.setTimeout(() => {
                    location.assign('/');
               }, 1500);
          }
     } catch (err) {
          showAlert('Failed', `${err.response.data.message}`);
     }
};

export const logout = async () => {
     try {
          const res = await axios({
               method: 'get',
               url: 'http://localhost:3000/api/v1/users/logout',
          });
          if (res.data.status === 'success') {
               location.reload('/');
          }
     } catch (err) {
          showAlert('error', 'Error Logging Out');
     }
};

export const accountProfile = async () => {
     try {
          const res = await axios({
               method: 'get',
               url: 'http://localhost:3000/api/v1/users/me',
          });
     } catch (err) {
          showAlert('error', 'Sorry For Inconviance');
     }
};
