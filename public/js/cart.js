const remove=document.querySelector('.remove');
const add=document.querySelector('.add');
const cards=document.querySelector('.cards');
const total=document.querySelector('.total');
const qtyValue=document.querySelectorAll('.qtyValue');
const submit=document.querySelector('.submit');

var bill=0;
qtyValue.forEach(e =>{
    price=parseInt(e.parentElement.parentElement.parentElement.children[1].children[1].innerText);
    Qty=parseInt(e.value);
    bill+=price*Qty;
    console.log("bill = "+bill);
    total.innerText=bill;
});


cards.addEventListener('click',e=>{
    if(e.target.getAttribute('class')==='remove'){
       var newQty= e.target.parentElement.children[1].children[0].value;
        newQty=newQty-1;
        e.target.parentElement.children[1].children[0].value=newQty;
        newBill=e.target.parentElement.parentElement.children[1].children[1].innerText;
        total.innerText=parseInt(total.innerText)-parseInt(newBill);
        console.log("total = "+total.innerText);
        console.log(" remove new bill = "+newBill);
    }else if(e.target.getAttribute('class')==='add'){
        var newQty= e.target.parentElement.children[1].children[0].value;
        newQty++;
        e.target.parentElement.children[1].children[0].value=newQty;
        newBill=e.target.parentElement.parentElement.children[1].children[1].innerText;
        total.innerText=parseInt(total.innerText)+parseInt(newBill);
        console.log("total = "+total.innerText);
        console.log(" add new bill = "+newBill);
    }
    // e.stopPropagation();
    e.preventDefault();
});
