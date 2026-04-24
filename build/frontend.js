document.addEventListener("DOMContentLoaded", function () {

    // ── Burger menu ──────────────────────────────────────────────────────────
    var menuIcon   = document.querySelector(".menu-icon");
    var mainMenu   = document.querySelector(".main-menu");
    var menuInner  = document.querySelector(".menu-inner");
    var closeIcon  = document.querySelector(".close-icon");

    if (menuIcon && mainMenu && menuInner) {
        menuIcon.addEventListener("click", function () {
            mainMenu.classList.add("open");
            menuInner.classList.add("open");
        });
    }
    if (closeIcon && mainMenu && menuInner) {
        closeIcon.addEventListener("click", function () {
            mainMenu.classList.remove("open");
            menuInner.classList.remove("open");
        });
    }
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && mainMenu && mainMenu.classList.contains("open")) {
            mainMenu.classList.remove("open");
            menuInner && menuInner.classList.remove("open");
        }
    });

    // ── Fullscreen nav submenus ──────────────────────────────────────────────
    document.querySelectorAll(".sub-menu-heading").forEach(function (heading) {
        if (heading.classList.contains("parent-with-url")) {
            var toggleBtn = heading.querySelector(".menu-toggle-btn");
            if (toggleBtn) {
                toggleBtn.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSubmenu(heading);
                });
            }
        } else {
            heading.addEventListener("click", function () {
                toggleSubmenu(heading);
            });
        }
    });

    function toggleSubmenu(heading) {
        var container = heading.closest(".faq-category") || document;
        container.querySelectorAll(".sub-menu-heading").forEach(function (other) {
            if (other !== heading) {
                other.classList.remove("active");
                var sib = other.nextElementSibling;
                if (sib && sib.classList.contains("menu-children")) {
                    var list = sib.querySelector(".menu-child-list");
                    if (list) list.classList.remove("active");
                }
            }
        });
        heading.classList.toggle("active");
        var next = heading.nextElementSibling;
        if (next && next.classList.contains("menu-children")) {
            var list = next.querySelector(".menu-child-list");
            if (list) list.classList.toggle("active");
        }
    }

    // ── Inline desktop nav dropdowns ─────────────────────────────────────────
    document.querySelectorAll(".inline-nav-item.has-dropdown").forEach(function (item) {
        var btn = item.querySelector(".inline-nav-label");
        if (!btn) return;

        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var isOpen = item.classList.contains("open");
            // Close all others
            document.querySelectorAll(".inline-nav-item.has-dropdown.open").forEach(function (other) {
                other.classList.remove("open");
            });
            if (!isOpen) item.classList.add("open");
        });
    });

    // Close inline dropdowns when clicking outside
    document.addEventListener("click", function () {
        document.querySelectorAll(".inline-nav-item.has-dropdown.open").forEach(function (item) {
            item.classList.remove("open");
        });
    });

    // Close inline dropdowns on Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            document.querySelectorAll(".inline-nav-item.has-dropdown.open").forEach(function (item) {
                item.classList.remove("open");
            });
        }
    });
});
