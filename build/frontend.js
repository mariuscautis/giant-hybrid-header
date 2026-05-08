document.addEventListener("DOMContentLoaded", function () {

    // ── Header overlay (per-page colour + scroll mode) ───────────────────────
    var siteHeader = document.querySelector(".site-header");
    if (siteHeader && window.giantHeaderOverlay) {
        var overlay = window.giantHeaderOverlay;
        var logoImg      = siteHeader.querySelector(".logo-img");
        var inlineLabels = siteHeader.querySelectorAll(".inline-nav > .inline-nav-item > .inline-nav-label");
        var menuIcon     = siteHeader.querySelector(".menu-icon");

        var tintFilters = {
            "white": "brightness(0) invert(1)",
            "black": "brightness(0)",
            "navy":  "brightness(0) invert(1) sepia(1) saturate(17.5) hue-rotate(169deg) brightness(0.190)",
            "none":  ""
        };

        function applyLogoTint(active) {
            if (!logoImg || !overlay.logoTint || overlay.logoTint === "none") return;
            logoImg.style.filter = active ? (tintFilters[overlay.logoTint] || "") : "";
        }

        function applyTextTint(active) {
            if (!overlay.textTint || overlay.textTint === "none") return;
            var f = active ? (tintFilters[overlay.textTint] || "") : "";
            inlineLabels.forEach(function(el) { el.style.filter = f; });
            if (menuIcon) menuIcon.style.filter = f;
        }

        if (overlay.mode === "always") {
            siteHeader.classList.add("overlay-always");
            applyLogoTint(true);
            applyTextTint(true);
        } else if (overlay.mode === "scroll") {
            siteHeader.classList.add("overlay-scroll");
            var ticking = false;
            window.addEventListener("scroll", function () {
                if (!ticking) {
                    requestAnimationFrame(function () {
                        var scrolled = window.scrollY > 50;
                        siteHeader.classList.toggle("scrolled", scrolled);
                        applyLogoTint(scrolled);
                        applyTextTint(scrolled);
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

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
