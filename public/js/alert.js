export const hideAlert=()=>{
    const el=document.querySelector('.alert');
    if(el)
    {
        el.parentElement.removeChild(el);
    }


}
export const showAlert=(type,msg)=>{
    hideAlert();
    let ms=msg;
    let ty=type;
    const markup = `<div class="alert alert--${ty}">${ms}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert,5000);

}