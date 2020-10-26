const editPersonalInfo=document.querySelector('.editBtn');
const personalInfo=document.querySelectorAll('.personalEdit');

editPersonalInfo.addEventListener('click', e=>{
    console.log('edit of personal info clicked');
    personalInfo.forEach(element=>{
        element.removeAttribute('disabled');
    });
    e.preventDefault();
})