const remove=document.querySelector('.remove');
const add=document.querySelector('.add');
const cards=document.querySelector('.cards');
const total=document.querySelector('.total');
const estTotal=document.querySelector('.estTotal');
const qtyValue=document.querySelectorAll('.qtyValue');
const submit=document.querySelector('.submit');

var bill=0;
qtyValue.forEach(e =>{
    price=parseInt(e.parentElement.parentElement.parentElement.children[1].children[1].innerText);
    Qty=parseInt(e.value);
    bill+=price*Qty;
    console.log("bill = "+bill);
    total.innerText=bill;
    estTotal.innerText=bill+50;
    console.log('estimated total: '+estTotal.innerText);
});


cards.addEventListener('click',e=>{
    console.log('quantity change');
    console.log('target: '+e.target.getAttribute('class'));
    if(e.target.getAttribute('class')==='remove'){
       var newQty= e.target.parentElement.children[1].children[0].value;
        newQty=newQty-1;
        if(newQty<1){
            newQty=0;
        }
        e.target.parentElement.children[1].children[0].value=newQty;
        newBill=e.target.parentElement.parentElement.children[1].children[1].innerText;
        let endValue=parseInt(total.innerText)-parseInt(newBill);
        total.innerText=endValue;
        console.log("total = "+total.innerText);
        estTotal.innerText=endValue+50;
        if(newQty<1){
            total.innerText=0;
            estTotal.innerText=50;
        }
        console.log(" remove new bill = "+newBill);
        e.preventDefault();
    }else if(e.target.getAttribute('class')==='add'){
        var newQty= e.target.parentElement.children[1].children[0].value;
        newQty++;
        e.target.parentElement.children[1].children[0].value=newQty;
        newBill=e.target.parentElement.parentElement.children[1].children[1].innerText;
        let endValue=parseInt(total.innerText)+parseInt(newBill)
        total.innerText=endValue;
        console.log("total = "+total.innerText);
        estTotal.innerText=endValue+50;
        console.log(" add new bill = "+newBill);
        e.preventDefault();
    }
    // else if(e.target.classList.containes('deleteProduct'){
        
    });
    // e.stopPropagation();

