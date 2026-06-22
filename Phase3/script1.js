document.addEventListener("DOMContentLoaded", () => {

    // ===== Dark Mode =====
    const themeBtn = document.getElementById("theme-btn");

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            document.body.classList.remove(
                "bg-gradient-to-br",
                "from-slate-900",
                "via-indigo-900",
                "to-purple-800"
            );

            document.body.classList.add(
                "bg-black"
            );

            themeBtn.textContent = "☀";

        }

        else {

            document.body.classList.remove("bg-black");

            document.body.classList.add(
                "bg-gradient-to-br",
                "from-slate-900",
                "via-indigo-900",
                "to-purple-800"
            );

            themeBtn.textContent = "☾";
        }

    });


    // ===== Mobile Menu =====

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("hidden");

    });


    // ===== Close Mobile Menu =====

    document.querySelectorAll(".nav-links a")
        .forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.add("hidden");

            });

        });


    // ===== Active Navbar =====

    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll("nav ul li a");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 150;

            if (scrollY >= top) {

                current = section.getAttribute("id");

            }

        });

        navItems.forEach(link => {

            link.classList.remove("text-purple-300");

            if (link.getAttribute("href") === "#" + current) {

                link.classList.add("text-purple-300");

            }

        });

    });


    // ===== AOS =====

    AOS.init({

        duration: 1000,
        once: true

    });

});