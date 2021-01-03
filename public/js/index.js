import {login,logout} from "./login"; 
import {updateData} from "./updateSettings"; 
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {bookTour} from './stripes';

const mapBox=document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutClass = document.querySelector('.nav__el--logout');
const userData = document.querySelector('.form-user-data');
const userPasswordform = document.querySelector('.form-user-password');
const bookBtn = document.querySelector('book-tour');

console.log("bookt",bookBtn);
const locations=[
    {
      "_id": "5c88fa8cf4afda39709c2954",
      "description": "Banff National Park",
      "type": "Point",
      "coordinates": [-116.214531, 51.417611],
      "day": 1
    },
    {
      "_id": "5c88fa8cf4afda39709c2953",
      "description": "Jasper National Park",
      "type": "Point",
      "coordinates": [-118.076152, 52.875223],
      "day": 3
    },
    {
      "_id": "5c88fa8cf4afda39709c2952",
      "description": "Glacier National Park of Canada",
      "type": "Point",
      "coordinates": [-117.490309, 51.261937],
      "day": 5
    }
  ]

  if(mapBox)
  {
    // const locations=JSON.parse(mapBox.dataset.locations);
    displayMap(locations);

  }

  

if(loginForm)
{
    loginForm.addEventListener('submit',e=>{
        e.preventDefault();
        const email=document.getElementById('email').value;
        const password=document.getElementById('password').value;
        login(email,password);
    
    })

}
if(logOutClass) logOutClass.addEventListener('click',logout);

if(userData) {
  userData.addEventListener('click',e=>{
  e.preventDefault();
  const form=new FormData();
  form.append('email',document.getElementById('email').value);
  form.append('name',document.getElementById('name').value);
  form.append('photo',document.getElementById('photo').files[0]);
  console.log(form);

  // const email=document.getElementById('email').value;
  // const name=document.getElementById('name').value;
  updateData(form,'data');

});
}
if(userPasswordform) {
    userPasswordform.addEventListener('click',async e=>{
    e.preventDefault();
    // document.getElementById('btn--save-password').textContent='updating..';
    //btn--save-password
    const currentPassword=document.getElementById('password-current').value;
    const password=document.getElementById('password').value;
    const passwordConfirm=document.getElementById('password-confirm').value;
    await updateData({currentPassword,password,passwordConfirm},'password');
    // document.getElementById('btn--save-password').textContent='Save passwords';
    // document.getElementById('password-current').value='';
    // document.getElementById('password').value='';
    // document.getElementById('password-confirm').value='';

  });
}

if(bookBtn)
{
  bookBtn.addEventListener('click',e=>{
    e.target.textContent='processing..';
    const {tourId}=e.target.dataset;
    console.log(tourId);
    bookTour(tourId)
  })
}