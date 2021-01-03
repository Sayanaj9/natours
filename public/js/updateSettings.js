import axios from 'axios';
import {showAlert} from './alert';
export const updateData=async(data,type)=>{
    
    try{
        const url=type==='password'? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword':'http://127.0.0.1:3000/api/v1/users/updateMe';
        const res=await axios({
            method:'PATCH',
            url,
            data
        }); 
    //api/v1/users/updateMyPassword
           
        if(res.data.status==='success')
        { 
            showAlert('success',`${type.toUpperCase()} updated successfully`);
        }
    }
    catch(err)
    {
        console.log("err",err);
        // showAlert('error',err.data.message);
        showAlert('error','error');
    }

}