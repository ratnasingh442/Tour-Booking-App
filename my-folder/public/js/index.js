/* eslint-disable */
import { login, logout } from './login'
import { showAlert } from './alert';
import { updateSetting } from './updateSettings';
import { bookTour } from './stripe';

const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');
 if(loginForm && ! userDataForm && !userPasswordForm){
loginForm.addEventListener('submit', e =>{
    e.preventDefault();
    const email = document.getElementById('email').value ;
    const password = document.getElementById('password').value;
    login(email,password);


});
 }

if(logOutBtn){
    logOutBtn.addEventListener('click',logout);
}
if(userDataForm){
    userDataForm.addEventListener('submit',async e=>{
        e.preventDefault();

        const form = new FormData();
        form.append('name',document.getElementById('name').value);
        form.append('email',document.getElementById('email').value);
        form.append('photo',document.getElementById('photo').files[0]);
        console.log(form);


    // const email = document.getElementById('email').value ;
    // const name = document.getElementById('name').value;
    await updateSetting('data',form);

    });
}

if(userPasswordForm){
    userPasswordForm.addEventListener('submit', async e=>{
        e.preventDefault();
        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        await updateSetting('password',{password,newPassword,confirmPassword});
    })
}

if(bookTourBtn){
    bookTourBtn.addEventListener('click', e=>{
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset;
        bookTour(tourId);


    })
}