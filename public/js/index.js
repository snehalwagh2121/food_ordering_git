const toggleMenu=document.getElementsByClassName("hamburger")[0];
const toogleLinks=document.getElementsByClassName("nav-links")[0];
const status=document.querySelector('.status');
const loginOptions=document.querySelectorAll('.loginOptions');
const logoutOptions=document.querySelectorAll('.logoutOptions');

const checkStatus=()=>{
    if(status.innerText === 'LOGIN'){
        console.log('LOGIN STATUS')
        logoutOptions.forEach(element => {
            element.classList.add('show');
        });
        loginOptions.forEach(element=>{
            element.classList.remove('show');
        });
    }else if(status.innerText ==='LOGOUT'){
        console.log('LOGOUT STATUS')
        logoutOptions.forEach(element => {
            element.classList.remove('show');
        });
        loginOptions.forEach(element=>{
            element.classList.add('show');
        });
    }
}

toggleMenu.addEventListener('click',e=>{
    toogleLinks.classList.toggle('toggle-active');
    checkStatus();
});

checkStatus();

status.addEventListener('click', e=>{
    console.log('target = '+status.parentNode.parentNode.children[0].innerText);
})
