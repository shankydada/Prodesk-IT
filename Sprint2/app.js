
// Cash Flow Tracker
let totalSalary = Number(localStorage.getItem("salary")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let conversionRate = 1;
let currencySymbol = "$";
let chart = null;

const $ = id => document.getElementById(id);

const form = $("expense-form");
const salaryInput = $("salary-input");
const expenseName = $("expense-name");
const expenseAmount = $("expense-amount");
const list = $("expense-list");
const emptyState = $("empty-state");
const count = $("expense-count");
const toast = $("toast");
const warning = $("warning-banner");

const displaySalary = $("display-salary");
const displayExpenses = $("display-expenses");
const displayBalance = $("display-balance");

const currencySelector = $("currency-selector");
const downloadBtn = $("download-btn");

function showToast(msg,type="success"){
  toast.textContent=msg;
  toast.className=`toast show ${type}`;
  setTimeout(()=>toast.className="toast hidden",2500);
}
function save(){
  localStorage.setItem("salary",totalSalary);
  localStorage.setItem("expenses",JSON.stringify(expenses));
}
function totals(){
  const totalExpenses=expenses.reduce((a,b)=>a+b.amount,0);
  return {totalExpenses,balance:totalSalary-totalExpenses};
}
function fmt(v){
  return `${currencySymbol}${(v*conversionRate).toFixed(2)}`;
}
function renderList(){
  list.innerHTML="";
  emptyState.style.display=expenses.length?"none":"block";
  count.textContent=`${expenses.length} Item${expenses.length!==1?"s":""}`;
  expenses.forEach((e,i)=>{
    const li=document.createElement("li");
    li.className="flex justify-between items-center bg-slate-50 rounded-lg p-3";
    const left=document.createElement("div");
    left.innerHTML=`<p class="font-semibold">${e.name}</p><p class="text-sm text-gray-500">${fmt(e.amount)}</p>`;
    const btn=document.createElement("button");
    btn.innerHTML="🗑️";
    btn.className="text-red-600";
    btn.onclick=()=>{expenses.splice(i,1);update();showToast("Expense deleted");};
    li.append(left,btn);
    list.appendChild(li);
  });
}
function renderChart(balance,exp){
  const ctx=document.getElementById("expenseChart");
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:"pie",
    data:{
      labels:["Balance","Expenses"],
      datasets:[{data:[Math.max(0,balance),exp]}]
    },
    options:{responsive:true}
  });
}
function update(){
  const {totalExpenses,balance}=totals();
  displaySalary.textContent=fmt(totalSalary);
  displayExpenses.textContent=fmt(totalExpenses);
  displayBalance.textContent=fmt(balance);
  renderList();
  renderChart(balance,totalExpenses);
  save();
  if(totalSalary>0 && balance<totalSalary*0.1){
    warning.classList.remove("hidden");
    displayBalance.classList.add("text-red-600");
  }else{
    warning.classList.add("hidden");
    displayBalance.classList.remove("text-red-600");
  }
}
form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const sal=Number(salaryInput.value);
  const name=expenseName.value.trim();
  const amt=Number(expenseAmount.value);

  if(salaryInput.value){
    if(sal<=0) return showToast("Salary must be positive","error");
    totalSalary=sal;
  }
  if(name || expenseAmount.value){
    if(!name) return showToast("Expense name required","error");
    if(amt<=0 || Number.isNaN(amt)) return showToast("Expense amount must be positive","error");
    expenses.push({name,amount:amt});
  }
  if(!salaryInput.value && !name && !expenseAmount.value){
    return showToast("Enter salary or expense","error");
  }
  form.reset();
  update();
  showToast("Entry added");
});

currencySelector.addEventListener("change",async(e)=>{
 const val=e.target.value;
 if(val==="USD"){conversionRate=1;currencySymbol="$";update();return;}
 try{
   const r=await fetch("https://api.frankfurter.app/latest?from=USD&to=INR");
   const d=await r.json();
   conversionRate=d.rates.INR;
   currencySymbol="₹";
   update();
 }catch{
   showToast("Currency API unavailable","error");
 }
});

downloadBtn.addEventListener("click",()=>{
 const {jsPDF}=window.jspdf;
 const doc=new jsPDF();
 const {totalExpenses,balance}=totals();
 doc.setFontSize(20);
 doc.text("Cash Flow Report",20,20);
 doc.setFontSize(12);
 doc.text(`Salary: ${fmt(totalSalary)}`,20,40);
 doc.text(`Expenses: ${fmt(totalExpenses)}`,20,50);
 doc.text(`Balance: ${fmt(balance)}`,20,60);
 let y=80;
 expenses.forEach(x=>{
   doc.text(`${x.name}: ${fmt(x.amount)}`,20,y);
   y+=10;
   if(y>280){doc.addPage();y=20;}
 });
 doc.save("CashFlow_Report.pdf");
});

update();