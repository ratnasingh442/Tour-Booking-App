import axios from 'axios';
import { showAlert } from './alert';


export const updateSetting = async (type , data) => {
    try {
        const url = type === 'password'?'/app/v1/users/updatePassword':'/app/v1/users/updateMe';

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