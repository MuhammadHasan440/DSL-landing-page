// ==================== CONTACT FORM ====================
const contactForm = document.getElementById("contactForm");

// Production API URL - StageLink
const API_URL = '/api/contact';

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector("button");

        // Disable button - Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending...";

        // Form data
        const formData = {
            name: contactForm.name.value.trim(),
            email: contactForm.email.value.trim(),
            message: contactForm.message.value.trim()
        };

        // ==================== CLIENT-SIDE VALIDATION ====================
        if (!formData.name) {
            alert("Please enter your name.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
            return;
        }

        if (!formData.email) {
            alert("Please enter your email address.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
            return;
        }

        if (!formData.message) {
            alert("Please enter your message.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
            return;
        }

        if (formData.message.length < 10) {
            alert("Message must be at least 10 characters.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Success
                alert("✅ Thank you! Your message has been sent. We'll get back to you soon.");
                contactForm.reset();
            } else if (response.status === 400) {
                // ❌ Validation Error
                alert(data.message || "Please check your input and try again.");
            } else if (response.status === 429) {
                // ⏳ Rate Limited
                alert("⏳ Too many requests. Please wait a moment before submitting again.");
            } else if (response.status === 503) {
                // ⚠️ Service Unavailable
                alert("⏳ Service is temporarily busy. Please try again in a few minutes.");
            } else {
                // ❌ Other Errors
                alert(data.message || "Something went wrong. Please try again.");
            }

        } catch (error) {
            console.error("Contact form error:", error);
            alert("Unable to connect to the server. Please check your internet connection and try again.");
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Book A Free Consultation <span>→</span>`;
        }
    });
}

// ==================== TESTIMONIALS ====================
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

function updateTestimonial() {
    const item = testimonials[current];
    
    if (service) service.textContent = item.service;
    if (initials) initials.textContent = item.initials;
    if (clientName) clientName.textContent = item.name;
    if (role) role.textContent = item.role;
    if (reviewTag) reviewTag.textContent = item.tag;
    if (reviewText) reviewText.textContent = item.review;
}

const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        current++;
        if (current >= testimonials.length) {
            current = 0;
        }
        updateTestimonial();
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        current--;
        if (current < 0) {
            current = testimonials.length - 1;
        }
        updateTestimonial();
    });
}

// Initialize first testimonial
updateTestimonial();

// ==================== FAQ ACCORDION ====================
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");

    if (question) {
        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove("active");
                const answer = faq.querySelector(".faq-answer");
                const icon = faq.querySelector(".faq-icon");
                if (answer) answer.style.maxHeight = null;
                if (icon) icon.textContent = "+";
            });

            // Open clicked item
            if (!isActive) {
                item.classList.add("active");
                const answer = item.querySelector(".faq-answer");
                const icon = item.querySelector(".faq-icon");
                if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
                if (icon) icon.textContent = "−";
            }
        });
    }
});

// Open First FAQ By Default
window.addEventListener("load", () => {
    const firstItem = document.querySelector(".faq-item");
    if (firstItem) {
        firstItem.classList.add("active");
        const answer = firstItem.querySelector(".faq-answer");
        const icon = firstItem.querySelector(".faq-icon");
        if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
        if (icon) icon.textContent = "−";
    }
});

// ==================== NAVBAR ====================
const header = document.querySelector(".header");
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

// Mobile Menu Toggle
if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        menuBtn.classList.toggle("active");
        navLinks.classList.toggle("active");
        document.body.classList.toggle("menu-open");
    });
}

// Close Menu on Link Click
navItems.forEach(link => {
    link.addEventListener("click", () => {
        if (menuBtn) menuBtn.classList.remove("active");
        if (navLinks) navLinks.classList.remove("active");
        document.body.classList.remove("menu-open");
    });
});

// Sticky Navbar
window.addEventListener("scroll", () => {
    if (header) {
        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

// Active Section Highlight
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
    let currentSection = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute("id");
        }
    });

    navItems.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + currentSection) {
            link.classList.add("active");
        }
    });
});

// Close Menu on Outside Click
document.addEventListener("click", (e) => {
    if (navLinks && menuBtn) {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            menuBtn.classList.remove("active");
            navLinks.classList.remove("active");
            document.body.classList.remove("menu-open");
        }
    }
});

// Close Menu on ESC Key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (menuBtn) menuBtn.classList.remove("active");
        if (navLinks) navLinks.classList.remove("active");
        document.body.classList.remove("menu-open");
    }
});