const themeBtn = document.getElementById("theme-btn");
themeBtn.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    if(document.body.classList.contains("dark"))
    {
        themeBtn.innerHTML="&#9728;";
    }
    else
    {
        themeBtn.innerHTML="&#9790;";
    }
});