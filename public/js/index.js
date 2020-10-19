const toggleMenu=document.getElementsByClassName("hamburger")[0];
const toogleLinks=document.getElementsByClassName("nav-links")[0];
const status=document.querySelector('.status');
const loginOptions=document.querySelector('.loginOptions');
const logoutOptions=document.querySelectorAll('.logoutOptions');

toggleMenu.addEventListener('click',e=>{
    toogleLinks.classList.toggle('toggle-active');
});

if(status.innerText === 'LOGIN'){
    console.log('LOGIN STATUS')
    logoutOptions.forEach(element => {
        element.classList.add('show');
    });
    loginOptions.classList.remove('show');
}else if(status.innerText ==='LOGOUT'){
    console.log('LOGOUT STATUS')
    logoutOptions.forEach(element => {
        element.classList.remove('show');
    });
    loginOptions.classList.add('show');
}


// status.addEventListener('click', e=>{
//     console.log('target = '+status.parentNode.parentNode.children[0].innerText);
// })
