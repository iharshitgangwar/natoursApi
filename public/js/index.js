import '@babel/polyfill';
import { login, logout } from './login';
import { UpdateUser } from './updateUser';
import { bookTour } from './stripe';
const loginForm = document.querySelector('.form--login');
const logOutbtn = document.querySelector('.nav__el--logout');
const updateuserData = document.querySelector('.form-user-data');
const updateuserPass = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

document.addEventListener('DOMContentLoaded', () => {
     if (bookBtn) {
          bookBtn.addEventListener('click', (e) => {
               e.target.textContent = 'Processing ...';
               const { tourId } = e.target.dataset;
               bookTour(tourId);
          });
     }
     if (loginForm) {
          loginForm.addEventListener('submit', (e) => {
               const email = document.getElementById('email').value;
               const password = document.getElementById('password').value;
               e.preventDefault();
               login(email, password);
          });
     }

     if (updateuserData) {
          console.log(updateuserData);
          updateuserData.addEventListener('submit', (e) => {
               e.preventDefault();
               const form = new FormData();
               form.append('name', document.getElementById('name').value);
               form.append('email', document.getElementById('email').value);
               form.append('photo', document.getElementById('photo').files[0]);
               // form here becouse be need to upload photo
               UpdateUser(form, 'data');
          });
     }
     if (updateuserPass) {
          updateuserPass.addEventListener('submit', async (e) => {
               const currentPassword =
                    document.getElementById('password-current').value;
               document.querySelector('.btn--save-password').innerHTML =
                    'Updating...';
               const password = document.getElementById('password').value;
               const conPassword =
                    document.getElementById('password-confirm').value;
               e.preventDefault();
               await UpdateUser(
                    { currentPassword, password, conPassword },
                    'password',
               );
               document.querySelector('.btn--save-password').innerHTML =
                    'Save password';
               currentPassword.value = '';
               password.value = '';
               conPassword.value = '';
          });
     }

     if (logOutbtn) logOutbtn.addEventListener('click', logout);
});
