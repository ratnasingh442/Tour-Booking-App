import axios from 'axios';
import { showAlert } from './alert';


export const updateSetting = async (type , data) => {
    try {
        const url = type === 'password'?'http://localhost:3000/app/v1/users/updatePassword':'http://localhost:3000/app/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })
        if(res.data.status === 'success'){
            showAlert('success',`${type.toUpperCase()} Updated Successfully!`);
        }
    }
    catch(err){
         showAlert('error',err.message);
    }
}