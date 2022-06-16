import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email,password) => {
    try{
    const res = await axios({
        method:'POST',
        url: '/app/v1/users/login',
        data: {email,
        password
        }
    });
    if(res.data.status === 'success'){
        showAlert('success','Logged In successfully!');
        window.setTimeout(()=>{
            location.assign('/');
        },1500);
    }
    console.log(res);

}
catch(err){
    showAlert('error',err.message);
}

    
}

export const logout = async() => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/app/v1/users/logout'
        });
        if(res.data.status === 'success')location.reload(true);
    }
    catch (err){
        console.log(err);
        showAlert('error', 'Error logging out! Try again');
    }
}

