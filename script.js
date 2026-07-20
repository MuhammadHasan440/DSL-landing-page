const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector("button");

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    const formData = {
        name: contactForm.name.value.trim(),
        email: contactForm.email.value.trim(),
        message: contactForm.message.value.trim()
    };

    try {

        const response = await fetch("http://localhost:5000/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {

            alert("✅ Thank you! Your message has been sent.");

            contactForm.reset();

        } else {

            alert(data.message || "Something went wrong.");

        }

    } catch (error) {

        console.error(error);

        alert("Server connection failed.");

    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
});
const testimonials = [
{
    service: "Mobile App",
    initials: "MT",
    name: "Marcus T.",
    role: "Founder & CEO",
    tag: "Speed + Quality",
    review: `"We had a tight investor deadline and needed a working product, not just a prototype. Shift delivered our cross-platform app in 11 weeks without cutting corners on quality. Every sprint demo gave us something real to show stakeholders. That kind of pace with that level of polish is genuinely rare."`
},

{
    service: "Web Platform",
    initials: "AS",
    name: "Amanda S.",
    role: "Product Manager",
    tag: "Communication",
    review: `"Excellent communication throughout the project. Every milestone was delivered on time, and the final product exceeded our expectations."`
},

{
    service: "UI/UX Design",
    initials: "JR",
    name: "James R.",
    role: "Startup Founder",
    tag: "Amazing Design",
    review: `"Their designers completely transformed our product. The interface is beautiful, intuitive, and users love the experience."`
}

];

let current = 0;

const service = document.querySelector(".service-tag");
const initials = document.querySelector(".client-avatar");
const clientName = document.querySelector(".client-info h4");
const role = document.querySelector(".client-info p");
const reviewTag = document.querySelector(".review-tag");
const reviewText = document.querySelector(".review-text");

function updateTestimonial(){

    const item = testimonials[current];

    service.textContent = item.service;
    initials.textContent = item.initials;
    clientName.textContent = item.name;
    role.textContent = item.role;
    reviewTag.textContent = item.tag;
    reviewText.textContent = item.review;

}

document.querySelector(".next-btn").addEventListener("click",()=>{

    current++;

    if(current >= testimonials.length){
        current = 0;
    }

    updateTestimonial();

});

document.querySelector(".prev-btn").addEventListener("click",()=>{

    current--;

    if(current < 0){
        current = testimonials.length - 1;
    }

    updateTestimonial();

});

updateTestimonial();
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        const isActive = item.classList.contains("active");

        // Close all items
        faqItems.forEach(faq => {
            faq.classList.remove("active");

            const answer = faq.querySelector(".faq-answer");
            const icon = faq.querySelector(".faq-icon");

            answer.style.maxHeight = null;
            icon.textContent = "+";
        });

        // Open clicked item
        if (!isActive) {

            item.classList.add("active");

            const answer = item.querySelector(".faq-answer");
            const icon = item.querySelector(".faq-icon");

            answer.style.maxHeight = answer.scrollHeight + "px";
            icon.textContent = "−";
        }

    });

});

/*-------------------------------
    Open First FAQ By Default
--------------------------------*/

window.addEventListener("load", () => {

    const firstItem = document.querySelector(".faq-item");

    if(firstItem){

        firstItem.classList.add("active");

        const answer = firstItem.querySelector(".faq-answer");
        const icon = firstItem.querySelector(".faq-icon");

        answer.style.maxHeight = answer.scrollHeight + "px";
        icon.textContent = "−";
    }

});/*==============================
        NAVBAR
==============================*/

const header = document.querySelector(".header");
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

/*==============================
    MOBILE MENU
==============================*/

menuBtn.addEventListener("click", () => {

    menuBtn.classList.toggle("active");
    navLinks.classList.toggle("active");

    document.body.classList.toggle("menu-open");

});

/*==============================
    CLOSE MENU
==============================*/

navItems.forEach(link => {

    link.addEventListener("click", () => {

        menuBtn.classList.remove("active");
        navLinks.classList.remove("active");

        document.body.classList.remove("menu-open");

    });

});

/*==============================
    STICKY NAVBAR
==============================*/

window.addEventListener("scroll", () => {

    if(window.scrollY > 40){

        header.classList.add("scrolled");

    }else{

        header.classList.remove("scrolled");

    }

});

/*==============================
    ACTIVE SECTION
==============================*/

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;

        if(window.scrollY >= sectionTop &&
           window.scrollY < sectionTop + sectionHeight){

            current = section.getAttribute("id");

        }

    });

    navItems.forEach(link => {

        link.classList.remove("active");

        if(link.getAttribute("href") === "#" + current){

            link.classList.add("active");

        }

    });

});

/*==============================
    OUTSIDE CLICK CLOSE
==============================*/

document.addEventListener("click",(e)=>{

    if(
        !navLinks.contains(e.target) &&
        !menuBtn.contains(e.target)
    ){

        menuBtn.classList.remove("active");
        navLinks.classList.remove("active");

        document.body.classList.remove("menu-open");

    }

});

/*==============================
    ESC KEY
==============================*/

document.addEventListener("keydown",(e)=>{

    if(e.key === "Escape"){

        menuBtn.classList.remove("active");
        navLinks.classList.remove("active");

        document.body.classList.remove("menu-open");

    }

});