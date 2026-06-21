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

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click",()=>{
    navLinks.classList.toggle("active");
});

const links =document.querySelectorAll(".nav-links a");

links.forEach(link=>{
    link.addEventListener("click",()=>{
        navLinks.classList.remove("active");
    });
});