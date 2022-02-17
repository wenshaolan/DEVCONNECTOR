import axios from "axios";
import { Navigate } from "react-router-dom";
import {setAlert} from './alert';

import{
    GET_PROFILE,
    PROFILE_ERROR,
    UPDATE_PROFILE,
    ACCOUNT_DELETED,
    CLEAR_PROFILE
}from './types';

//get current users profile
export const getCurrentProfile = () =>
    async dispatch => {
        try {
            const res=await axios.get('./api/profile/me');
            dispatch({
                type:GET_PROFILE,
                payload:res.data
            });
        } catch (err) {
            dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            })
        }
    }

export const createProfile = (formData, navigate, edit=false) => async dispatch =>{
    try {
        const config = {
            header:{
                'Content-Type':'application/json'
            }
        }

        const res = await axios.post('/api/profile', formData, config);
        dispatch({
            type:GET_PROFILE,
            payload:res.data
        });

        dispatch(setAlert(edit?'Profile updated':'Profile created', 'success'));
        
        
        if (!edit) {
            console.log(edit);
            navigate('/dashboard');
           
        }

    } catch (err) {
        const errors=err.response.data.errors;

        if(errors){
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            });
    }
};

//add experience
export const addExperience=(formData, navigate)=>async dispatch=>{
    try {
        const config = {
            header:{
                'Content-Type':'application/json'
            }
        }

        const res = await axios.put('/api/profile/experience', formData, config);
        dispatch({
            type:UPDATE_PROFILE,
            payload:res.data
        });

        dispatch(setAlert('Experience added', 'success'));
        
        navigate('/dashboard');
           
        

    } catch (err) {
        const errors=err.response.data.errors;

        if(errors){
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            });
    }
};

//add Education
export const addEducation=(formData, navigate)=>async dispatch=>{
    try {
        const config = {
            header:{
                'Content-Type':'application/json'
            }
        }

        const res = await axios.put('/api/profile/education', formData, config);
        dispatch({
            type:UPDATE_PROFILE,
            payload:res.data
        });

        dispatch(setAlert('Education added', 'success'));
        
        navigate('/dashboard');
           
        

    } catch (err) {
        const errors=err.response.data.errors;

        if(errors){
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            });
    }
};


//delete experience
export const deleteExperience = (id) => async (dispatch) => {
    
    try {
        console.log(`experience id: ${id}`);
      const res =await axios.delete(`/api/profile/experience/${id}`);
  
      dispatch({
        type: UPDATE_PROFILE,
        payload: res.data
      });

      dispatch(setAlert('Experience Removed', 'success'));
      //navigate('/dashboard');
      //Navigate('/dashboard') ;

    } catch (err) {
        dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            });
    }
};

//delete Education
export const deleteEducation = id => async dispatch => {
    try {
        const res=await axios.delete(`/api/profile/education/${id}`);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });

        dispatch(setAlert('Education Removed', 'success'));

    } catch (err) {
        dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            });
    }
};

//delete account & profile
export const deleteAccount = id => async dispatch => {
    if(window.confirm('Are you sure? This can not be undone!'))

    try {
        const res=await axios.delete('/api/profile');
        dispatch({type: CLEAR_PROFILE});
        dispatch({type: ACCOUNT_DELETED});

        dispatch(setAlert('Your account has been permanantly deleted'));

    } catch (err) {
        dispatch({
                type:PROFILE_ERROR,
                payload:{msg:err.response.statusText, status: err.response.status}
            });
    }
};
