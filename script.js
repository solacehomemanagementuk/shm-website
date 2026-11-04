const BUSINESS_EMAIL = "solacehomemanagement.uk@gmail.com";
const BUSINESS_PHONE = "02034324680";

const publicPages = [
  { label: "Home", href: "index.html" },
  { label: "Overview", href: "overview.html" },
  { label: "Our Services", href: "services.html" },
  { label: "Browse Properties", href: "browse-properties.html" },
  { label: "List Your Property", href: "list-your-property.html" },
  { label: "Register Account", href: "register-account.html" },
  { label: "SHM Login", href: "shm-portal.html" },
  { label: "Contact Us", href: "contact.html" }
];

const siteHeader = document.querySelector(".site-header");
const isDashboardPage = document.body.hasAttribute("data-dashboard-page");

if (siteHeader) {
  const brand = siteHeader.querySelector(".brand-header");
  let headerMain = siteHeader.querySelector(".header-main");
  let nav = siteHeader.querySelector(".nav");

  if (!headerMain) {
    headerMain = document.createElement("div");
    headerMain.className = "header-main";
    siteHeader.insertBefore(headerMain, siteHeader.firstChild);
    if (brand) {
      headerMain.appendChild(brand);
    }
    if (nav) {
      headerMain.appendChild(nav);
    }
  }

  if (brand) {
    brand.classList.add("brand-header-home");
    let wording = brand.querySelector(".brand-wording");
    if (!wording) {
      wording = document.createElement("span");
      wording.className = "brand-wording";
      wording.innerHTML = '<span class="brand-title"></span><span class="brand-tagline"></span>';
      brand.appendChild(wording);
    }
  }

  if (nav && !nav.id) {
    nav.id = "mainNav";
  }

  if (nav && !headerMain.querySelector(".menu-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "menu-toggle";
    toggle.id = "menuToggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", nav.id);
    toggle.setAttribute("aria-label", "Open navigation menu");
    nav.parentNode.insertBefore(toggle, nav);
  }
}

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const isCompactNavigation = () => menuToggle && window.getComputedStyle(menuToggle).display !== "none";

if (menuToggle) {
  menuToggle.replaceChildren();
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (mainNav && !mainNav.querySelector(":scope > a.nav-cta")) {
  const contactLink = document.createElement("a");
  contactLink.href = "contact.html";
  contactLink.className = "nav-cta";
  contactLink.textContent = "Contact Us";
  mainNav.appendChild(contactLink);
}

const dropdownMenus = {
  Overview: [
    { label: "About Us", href: "about.html" },
    { label: "Why Choose SHM", href: "why-choose.html" }
  ],
  "Our Services": [
    { label: "Property Letting Support", href: "services.html#property-letting-support" },
    { label: "Tenant Finding", href: "services.html#tenant-finding" },
    { label: "Tenant Referencing Support", href: "services.html#tenant-referencing-support" },
    { label: "Letting Administration", href: "services.html#letting-administration" },
    { label: "Property Management", href: "services.html#property-management-support" },
    { label: "Repairs and Maintenance", href: "services.html#repairs-maintenance-coordination" },
    { label: "Property Compliance", href: "services.html#property-compliance-support" },
    { label: "Residential Property Sales", href: "services.html#residential-property-sales" },
    { label: "Property Purchase Support", href: "services.html#property-purchase-support" }
  ],
  "Register Account": [
    { label: "Landlord Registration", href: "landlord-registration.html" },
    { label: "Tenant Registration", href: "tenant-registration.html" },
    { label: "SHM Staff Registration", href: "shm-staff-registration.html" }
  ],
  "SHM Login": [
    { label: "Landlord Login", href: "landlord-login.html" },
    { label: "Tenant Login", href: "tenant-login.html" },
    { label: "SHM Staff Login", href: "shm-staff-login.html" }
  ]
};

const contactIcons = {
  email: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/>',
  whatsapp: '<path d="M20.2 11.5a8.3 8.3 0 0 1-12.3 7.2L4 20l1.3-3.8a8.3 8.3 0 1 1 14.9-4.7Z"/><path d="M8.2 7.8c-.3.4-.5.9-.4 1.4.4 2.3 2.7 4.6 5 5 .5.1 1-.1 1.4-.4l.7-.7-1.8-1-1 .8a6 6 0 0 1-2.2-2.2l.8-1-1-1.8z"/>',
  phone: '<path d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5.5 5.5L15 14l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/>'
};

const createContactIcon = (name) => `<svg class="contact-icon contact-icon-${name}" viewBox="0 0 24 24" aria-hidden="true">${contactIcons[name]}</svg>`;
const whatsappNumber = BUSINESS_PHONE.replace(/\D/g, "").replace(/^0/, "44");

if (mainNav && !isDashboardPage) {
  const existingLinks = Array.from(mainNav.querySelectorAll(":scope > a"));
  const linksByLabel = new Map(existingLinks.map((link) => {
    const label = link.textContent.trim();
    return [label, link];
  }));
  const orderedLinks = publicPages.map(({ label, href }) => {
    const link = existingLinks.find((item) => item.getAttribute("href") === href) || linksByLabel.get(label) || document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (label === "Contact Us") {
      link.classList.add("nav-cta");
    } else {
      link.classList.remove("nav-cta");
    }
    return link;
  });
  mainNav.replaceChildren(...orderedLinks);

  const overviewLink = Array.from(mainNav.querySelectorAll(":scope > a")).find((link) =>
    ["about.html", "overview.html"].includes(link.getAttribute("href"))
  );
  if (overviewLink) {
    overviewLink.textContent = "Overview";
    overviewLink.href = "overview.html";
  }

  Object.entries(dropdownMenus).forEach(([menuLabel, items]) => {
    const parentLink = Array.from(mainNav.querySelectorAll(":scope > a")).find((link) => link.textContent.trim() === menuLabel);
    if (!parentLink) {
      return;
    }

    const menuItem = document.createElement("div");
    menuItem.className = "nav-item";
    const menuHead = document.createElement("div");
    menuHead.className = "nav-item-head";
    const toggle = document.createElement("button");
    const menuId = `submenu-${menuLabel.toLowerCase().replace(/\s+/g, "-")}`;
    toggle.className = "nav-dropdown-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", menuId);
    toggle.setAttribute("aria-label", `Show ${menuLabel} submenu`);
    toggle.innerHTML = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1.5 5 5 5-5"/></svg>';

    const dropdown = document.createElement("div");
    dropdown.className = "nav-dropdown";
    dropdown.id = menuId;
    dropdown.setAttribute("aria-label", `${menuLabel} submenu`);
    items.forEach(({ label, href, description, activeMatch }) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (activeMatch === false) {
        link.dataset.activeMatch = "false";
      }
      if (description) {
        link.classList.add("nav-dropdown-link-described");
        const descriptionNode = document.createElement("span");
        descriptionNode.className = "nav-dropdown-description";
        descriptionNode.textContent = description;
        link.appendChild(descriptionNode);
      }
      dropdown.appendChild(link);
    });

    parentLink.classList.add("nav-item-link");
    parentLink.parentNode.insertBefore(menuItem, parentLink);
    menuItem.append(menuHead, dropdown);
    menuHead.append(parentLink, toggle);

    const setExpanded = (expanded) => {
      menuItem.classList.toggle("is-open", expanded);
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute("aria-label", `${expanded ? "Hide" : "Show"} ${menuLabel} submenu`);
    };

    toggle.addEventListener("click", () => {
      const compactNavigation = isCompactNavigation();
      const expanded = compactNavigation ? !menuItem.classList.contains("is-open") : true;
      mainNav.querySelectorAll(".nav-item.is-open").forEach((openItem) => {
        openItem.classList.remove("is-open");
        const openToggle = openItem.querySelector(".nav-dropdown-toggle");
        openToggle?.setAttribute("aria-expanded", "false");
        openToggle?.setAttribute("aria-label", `Show ${openItem.querySelector(".nav-item-link").textContent.trim()} submenu`);
        delete openItem.dataset.clickOpen;
      });
      const contactMenu = mainNav.querySelector(".contact-menu");
      contactMenu?.classList.remove("is-open");
      if (contactMenu) {
        delete contactMenu.dataset.clickOpen;
      }
      const contactToggle = mainNav.querySelector(".contact-menu-toggle");
      contactToggle?.setAttribute("aria-expanded", "false");
      contactToggle?.setAttribute("aria-label", "Show Contact Us options");
      if (compactNavigation) {
        menuItem.dataset.clickOpen = String(expanded);
      } else {
        delete menuItem.dataset.clickOpen;
      }
      setExpanded(expanded);
    });
    menuItem.addEventListener("mouseenter", () => {
      if (!isCompactNavigation()) {
        delete menuItem.dataset.clickOpen;
        mainNav.querySelectorAll(".nav-item.is-open").forEach((openItem) => {
          if (openItem !== menuItem) {
            openItem.classList.remove("is-open");
            delete openItem.dataset.clickOpen;
            const openToggle = openItem.querySelector(".nav-dropdown-toggle");
            openToggle?.setAttribute("aria-expanded", "false");
            openToggle?.setAttribute("aria-label", `Show ${openItem.querySelector(".nav-item-link")?.textContent.trim() || "navigation"} submenu`);
          }
        });
        const contactMenu = mainNav.querySelector(".contact-menu");
        contactMenu?.classList.remove("is-open");
        if (contactMenu) {
          delete contactMenu.dataset.clickOpen;
          contactMenu.querySelector(".contact-menu-toggle")?.setAttribute("aria-expanded", "false");
        }
        setExpanded(true);
      }
    });
    menuItem.addEventListener("pointerleave", () => {
      if (!isCompactNavigation() && !menuItem.querySelector(":focus-visible")) {
        setExpanded(false);
        delete menuItem.dataset.clickOpen;
      }
    });
    menuItem.addEventListener("focusin", (event) => {
      if (!toggle.contains(event.target)) {
        setExpanded(true);
      }
    });
    menuItem.addEventListener("focusout", (event) => {
      if (!menuItem.contains(event.relatedTarget)) {
        setExpanded(false);
      }
    });
    menuItem.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        delete menuItem.dataset.clickOpen;
        setExpanded(false);
        toggle.focus();
      }
    });
  });
}

if (mainNav) {
  const closeDropdowns = () => {
    mainNav.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("is-open");
      delete item.dataset.clickOpen;
      const toggle = item.querySelector(".nav-dropdown-toggle");
      toggle?.setAttribute("aria-expanded", "false");
      if (toggle) {
        const label = item.querySelector(".nav-item-link")?.textContent.trim() || "navigation";
        toggle.setAttribute("aria-label", `Show ${label} submenu`);
      }
    });
  };

  document.addEventListener("pointerdown", (event) => {
    if (!mainNav.contains(event.target)) closeDropdowns();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdowns();
      const contactMenu = mainNav.querySelector(".contact-menu");
      contactMenu?.classList.remove("is-open");
      if (contactMenu) {
        delete contactMenu.dataset.clickOpen;
        const toggle = contactMenu.querySelector(".contact-menu-toggle");
        toggle?.setAttribute("aria-expanded", "false");
        toggle?.setAttribute("aria-label", "Show Contact Us options");
      }
    }
  });
}

if (mainNav) {
  const contactLink = Array.from(mainNav.querySelectorAll(":scope > a.nav-cta"))[0];
  if (contactLink) {
    const contactMenu = document.createElement("div");
    contactMenu.className = "contact-menu";

    const contactToggle = document.createElement("button");
    contactToggle.className = "contact-menu-toggle";
    contactToggle.type = "button";
    contactToggle.setAttribute("aria-expanded", "false");
    contactToggle.setAttribute("aria-controls", "contact-options");
    contactToggle.innerHTML = 'Contact Us <svg viewBox="0 0 12 8" aria-hidden="true"><path d="m1 1.5 5 5 5-5"/></svg>';

    const contactDropdown = document.createElement("div");
    contactDropdown.className = "contact-dropdown";
    contactDropdown.id = "contact-options";
    contactDropdown.setAttribute("aria-label", "Contact Us options");

    const contactOptions = [
      { label: "Contact Us", href: contactLink.href },
      { label: "Call", href: `tel:${BUSINESS_PHONE}`, icon: "phone" },
      { label: "WhatsApp", href: `https://wa.me/${whatsappNumber}`, icon: "whatsapp", external: true },
      { label: "Email", href: `mailto:${BUSINESS_EMAIL}`, icon: "email" }
    ];

    contactOptions.forEach(({ label, href, icon, external }) => {
      const link = document.createElement("a");
      link.href = href;
      if (icon) {
        link.innerHTML = `${createContactIcon(icon)}<span>${label}</span>`;
      } else {
        link.textContent = label;
      }
      if (external) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      contactDropdown.appendChild(link);
    });

    contactLink.replaceWith(contactMenu);
    contactMenu.append(contactToggle, contactDropdown);

    const setContactMenuOpen = (open) => {
      contactMenu.classList.toggle("is-open", open);
      contactToggle.setAttribute("aria-expanded", String(open));
      contactToggle.setAttribute("aria-label", `${open ? "Hide" : "Show"} Contact Us options`);
    };

    const closeContactMenu = () => {
      setContactMenuOpen(false);
    };

    const canHoverContactMenu = () => !isCompactNavigation() && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    contactMenu.addEventListener("mouseenter", () => {
      if (canHoverContactMenu()) {
        delete contactMenu.dataset.clickOpen;
        mainNav.querySelectorAll(".nav-item.is-open").forEach((item) => {
          item.classList.remove("is-open");
          delete item.dataset.clickOpen;
          const itemToggle = item.querySelector(".nav-dropdown-toggle");
          itemToggle?.setAttribute("aria-expanded", "false");
          itemToggle?.setAttribute("aria-label", `Show ${item.querySelector(".nav-item-link")?.textContent.trim() || "navigation"} submenu`);
        });
        setContactMenuOpen(true);
      }
    });

    contactMenu.addEventListener("pointerleave", () => {
      if (canHoverContactMenu() && !contactMenu.querySelector(":focus-visible")) {
        delete contactMenu.dataset.clickOpen;
        closeContactMenu();
      }
    });

    contactToggle.addEventListener("click", () => {
      const open = canHoverContactMenu() || contactMenu.dataset.clickOpen !== "true";
      mainNav.querySelectorAll(".nav-item.is-open").forEach((item) => {
        item.classList.remove("is-open");
        delete item.dataset.clickOpen;
        const itemToggle = item.querySelector(".nav-dropdown-toggle");
        itemToggle?.setAttribute("aria-expanded", "false");
        itemToggle?.setAttribute("aria-label", `Show ${item.querySelector(".nav-item-link")?.textContent.trim() || "navigation"} submenu`);
      });
      if (canHoverContactMenu()) {
        delete contactMenu.dataset.clickOpen;
      } else {
        contactMenu.dataset.clickOpen = String(open);
      }
      setContactMenuOpen(open);
    });

    contactDropdown.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        delete contactMenu.dataset.clickOpen;
        closeContactMenu();
      }
    });

    contactMenu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        delete contactMenu.dataset.clickOpen;
        closeContactMenu();
        contactToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!contactMenu.contains(event.target)) {
        delete contactMenu.dataset.clickOpen;
        closeContactMenu();
      }
    });
  }
}

const revealCards = document.querySelectorAll(".home-page .value-item");
if (revealCards.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealCards.forEach((card) => {
      card.classList.add("reveal-card");
      revealObserver.observe(card);
    });
  } else {
    revealCards.forEach((card) => card.classList.add("is-visible"));
  }
}

document.querySelectorAll(".brand-header-home .brand-wording").forEach((wording) => {
  const title = wording.querySelector(".brand-title");
  const tagline = wording.querySelector(".brand-tagline");
  if (title) {
    title.textContent = "SOLACE HOME MANAGEMENT";
  }
  wording.querySelector(".brand-subtitle")?.remove();
  if (tagline) {
    tagline.textContent = "Your Comfort, Our Responsibility";
  }
});

const currentFile = decodeURIComponent(window.location.pathname.split("/").pop() || "index.html");
const navigationFile = {
  "": "index.html",
  "index copy.html": "index.html",
  "auctions.html": "browse-properties.html",
  "portal-login.html": "shm-portal.html"
}[currentFile] || currentFile;

if (mainNav) {
  mainNav.querySelectorAll("a").forEach((link) => {
    if (link.closest(".nav-dropdown")) {
      return;
    }

    const targetUrl = new URL(link.href, window.location.href);
    const linkFile = targetUrl.pathname.split("/").pop();
    const sameDestination = linkFile === navigationFile && (!targetUrl.hash || targetUrl.hash === window.location.hash);
    if (sameDestination) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  mainNav.querySelector(".contact-menu")?.classList.toggle("is-current-page", currentFile === "contact.html");

  const updateActiveDropdownItems = () => {
    const currentUrl = new URL(window.location.href);
    mainNav.querySelectorAll(".nav-item").forEach((menuItem) => {
      const activeLink = Array.from(menuItem.querySelectorAll(".nav-dropdown a")).find((link) => {
        if (link.dataset.activeMatch === "false") {
          return false;
        }
        const target = new URL(link.href, currentUrl);
        const samePage = target.pathname === currentUrl.pathname;
        const sameHash = !target.hash || target.hash === currentUrl.hash;
        const sameQuery = Array.from(target.searchParams).every(([key, value]) => currentUrl.searchParams.get(key) === value);
        return samePage && sameHash && sameQuery;
      });
      menuItem.querySelectorAll(".nav-dropdown a").forEach((link) => {
        if (link === activeLink) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
      menuItem.classList.toggle("has-current-item", Boolean(activeLink));
    });
  };

  const overviewPages = new Set(["overview.html", "about.html", "why-choose.html"]);
  mainNav.querySelectorAll("#submenu-overview a").forEach((link) => {
    const linkFile = new URL(link.href, window.location.href).pathname.split("/").pop();
    if (overviewPages.has(currentFile) && linkFile === currentFile) {
      link.setAttribute("aria-current", "page");
    }
  });

  const updateSelectedService = () => {
    document.querySelectorAll(".service-card[id].is-selected").forEach((card) => {
      card.classList.remove("is-selected");
    });

    if (currentFile === "services.html" || currentFile === "index.html") {
      const selectedServiceId = window.location.hash.slice(1);
      const selectedCard = document.getElementById(selectedServiceId);
      if (selectedCard?.matches(".service-card[id]")) {
        void selectedCard.offsetWidth;
        selectedCard.classList.add("is-selected");
      }
    }

    updateActiveDropdownItems();
  };

  updateSelectedService();
  window.addEventListener("hashchange", updateSelectedService);
  window.addEventListener("popstate", updateSelectedService);
}

const synchronizeBlinkAnimations = () => {
  const blinkButtons = document.querySelectorAll(
    ".home-page .hero-actions > .button-dark, .home-page .hero-actions > .button-outline, .cta-section .cta-actions .button-light, .footer-contact-button"
  );
  const blinkAnimations = Array.from(blinkButtons)
    .flatMap((button) => button.getAnimations())
    .filter((animation) => ["hero-alternating-blink", "hero-alternating-blink-reverse", "footer-synchronized-blink"].includes(animation.animationName));
  const sharedStartTime = document.timeline.currentTime;
  if (sharedStartTime !== null) {
    blinkAnimations.forEach((animation) => {
      animation.startTime = sharedStartTime;
    });
  }
};

if (menuToggle && mainNav) {
  const closeNavigation = (restoreFocus = false) => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    mainNav.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("is-open");
      delete item.dataset.clickOpen;
      const itemToggle = item.querySelector(".nav-dropdown-toggle");
      itemToggle?.setAttribute("aria-expanded", "false");
      if (itemToggle) {
        itemToggle.setAttribute("aria-label", `Show ${item.querySelector(".nav-item-link")?.textContent.trim() || "navigation"} submenu`);
      }
    });
    mainNav.querySelectorAll(".contact-menu.is-open").forEach((item) => {
      item.classList.remove("is-open");
      delete item.dataset.clickOpen;
      const contactToggle = item.querySelector(".contact-menu-toggle");
      contactToggle?.setAttribute("aria-expanded", "false");
      contactToggle?.setAttribute("aria-label", "Show Contact Us options");
    });
    if (restoreFocus) {
      menuToggle.focus();
    }
  };

  let compactNavigation = window.getComputedStyle(menuToggle).display !== "none";
  const syncNavigationMode = () => {
    const isCompactNavigation = window.getComputedStyle(menuToggle).display !== "none";
    if (isCompactNavigation === compactNavigation) {
      return;
    }
    compactNavigation = isCompactNavigation;
    if (!isCompactNavigation) {
      closeNavigation();
    }
    synchronizeBlinkAnimations();
  };

  window.addEventListener("resize", syncNavigationMode);

  menuToggle.addEventListener("click", () => {
    const open = !mainNav.classList.contains("open");
    if (open) {
      mainNav.classList.add("open");
      synchronizeBlinkAnimations();
    } else {
      closeNavigation();
    }
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });

  document.addEventListener("pointerdown", (event) => {
    if (mainNav.classList.contains("open") && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("open")) {
      event.preventDefault();
      closeNavigation(true);
    }
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigation();
    });
  });
}

const siteFooter = document.querySelector("footer.footer");
const mainContent = document.querySelector("main");
const talkPages = new Set([
  "about.html",
  "overview.html",
  "why-choose.html",
  "services.html",
  "faq.html"
]);

if (mainNav && mainContent && !isDashboardPage && talkPages.has(navigationFile) && !mainContent.querySelector(".cta-section")) {
  const talkSection = document.createElement("section");
  talkSection.className = "cta-section";
  talkSection.innerHTML = `
    <div class="cta-box">
      <h2>Let's Talk About Your Inquiry</h2>
      <p>Contact Solace Home Management to discuss your property enquiry and tell us what support you are looking for. Share the relevant details, and we will review your enquiry and explain the appropriate next steps.</p>
      <div class="hero-actions cta-actions">
        <a class="button button-light" href="contact.html">Contact Us</a>
      </div>
    </div>
  `;
  mainContent.appendChild(talkSection);
}

if (mainNav && siteFooter) {
  const footerServices = [
    { label: "Property Letting Support", href: "services.html#property-letting-support" },
    { label: "Tenant Finding", href: "services.html#tenant-finding" },
    { label: "Tenant Referencing Support", href: "services.html#tenant-referencing-support" },
    { label: "Letting Administration", href: "services.html#letting-administration" },
    { label: "Property Management", href: "services.html#property-management-support" },
    { label: "Repairs and Maintenance", href: "services.html#repairs-maintenance-coordination" },
    { label: "Property Compliance", href: "services.html#property-compliance-support" },
    { label: "Residential Property Sales", href: "services.html#residential-property-sales" },
    { label: "Property Purchase Support", href: "services.html#property-purchase-support" }
  ];
  siteFooter.innerHTML = `
    <div class="footer-grid">
      <section class="footer-brand-area footer-decoration-area">
        <img class="footer-decoration-image" src="assets/footer-decoration.png" alt="Solace Home Management — Your Comfort, Our Responsibility">
      </section>
      <nav class="footer-column" aria-label="Quick links">
        <h2>Quick Links</h2>
        <ul class="footer-link-list">${publicPages.map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul>
      </nav>
      <section class="footer-column footer-services">
        <h2>Our Services</h2>
        <ul class="footer-service-list">${footerServices.map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul>
      </section>
      <section class="footer-column footer-contact">
        <h2>Contact Us</h2>
        <p><span class="footer-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4h3l2 5-2 1.5a15 15 0 0 0 5.5 5.5L15 14l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/></svg></span><a href="tel:${BUSINESS_PHONE}">0203-432-4680</a></p>
        <p><span class="footer-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg></span><a href="mailto:${BUSINESS_EMAIL}">${BUSINESS_EMAIL}</a></p>
      </section>
      <section class="footer-column footer-connect">
        <h2>Stay Connected</h2>
        <p>Contact us for property updates and information about our services.</p>
        <a class="footer-contact-button" href="contact.html">Get in touch <span aria-hidden="true">→</span></a>
      </section>
    </div>
    <div class="footer-bottom">
      <small>© 2026 Solace Home Management. All rights reserved.</small>
      <a href="privacy.html">Privacy notice</a>
    </div>
  `;
}

synchronizeBlinkAnimations();

document.querySelectorAll("[data-question-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = form.querySelector("textarea[name='question']");
    const message = form.querySelector("[data-question-message]");
    if (!question || !message) {
      console.error("Question form is missing its textarea or status message.");
      return;
    }

    message.classList.remove("error");
    question.removeAttribute("aria-invalid");
    if (!question.value.trim()) {
      message.textContent = "Please enter your question.";
      message.classList.add("error");
      question.setAttribute("aria-invalid", "true");
      question.focus();
      return;
    }

    const contactUrl = new URL("contact.html", window.location.href);
    contactUrl.searchParams.set("type", "General enquiry");
    contactUrl.searchParams.set("message", question.value.trim());
    window.location.href = contactUrl.href;
  });
});

const faqClosers = new Map();
document.querySelectorAll(".faq-list details").forEach((details) => {
  const summary = details.querySelector("summary");
  if (!summary) {
    return;
  }
  let closeAttempt = 0;
  let closeTimer;

  const openDetails = () => {
    closeAttempt += 1;
    window.clearTimeout(closeTimer);
    details.classList.remove("is-closing");
    details.open = true;
  };

  const closeDetails = () => {
    if (!details.open) {
      return;
    }

    closeAttempt += 1;
    const thisAttempt = closeAttempt;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = false;
      details.classList.remove("is-closing");
      return;
    }

    details.classList.add("is-closing");
    details.open = false;
    const finishClosing = () => {
      if (thisAttempt !== closeAttempt) {
        return;
      }
      details.classList.remove("is-closing");
    };
    closeTimer = window.setTimeout(finishClosing, 320);
  };

  faqClosers.set(details, closeDetails);

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    const shouldOpen = details.classList.contains("is-closing") || !details.open;
    if (shouldOpen) {
      document.querySelectorAll(".faq-list details[open]").forEach((openDetails) => {
        if (openDetails !== details) {
          faqClosers.get(openDetails)?.();
        }
      });
      openDetails();
    } else {
      closeDetails();
    }
  });
});

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

document.querySelectorAll("[data-email-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const statusNode = form.querySelector(".form-message");
    if (!statusNode) {
      return;
    }

    statusNode.classList.remove("error");
    if (!form.checkValidity()) {
      form.reportValidity();
      statusNode.textContent = "Please complete the required fields and check your entries.";
      statusNode.classList.add("error");
      return;
    }

    const formData = new FormData(form);
    const subjectPrefix = form.dataset.subjectPrefix || "Website enquiry";
    const specificSubject = String(formData.get("Subject") || "").trim();
    const subject = encodeURIComponent(specificSubject ? `${subjectPrefix}: ${specificSubject}` : subjectPrefix);
    const details = Array.from(formData.entries())
      .filter(([name]) => !name.toLowerCase().includes("privacy"))
      .map(([name, value]) => `${name}: ${String(value).trim()}`)
      .join("\n");
    const body = encodeURIComponent(details);

    statusNode.textContent = "Your email application should open with the enquiry prepared. Please send it from there. This website does not store or submit your information.";
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  });
});

const joinFormSection = document.getElementById("joinFormSection");
const joinRole = document.getElementById("joinRole");
const joinFormTitle = document.getElementById("joinFormTitle");

if (joinFormSection && joinRole) {
  const openJoinForm = (card) => {
    const role = card.dataset.joinRole || "";
    if (!role) return;
    joinRole.value = role;
    joinFormSection.hidden = false;
    if (joinFormTitle) {
      joinFormTitle.textContent = `Join as a ${role}`;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    joinFormSection.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    joinRole.focus({ preventScroll: true });
  };
  document.querySelectorAll(".join-card[data-join-role]").forEach((card) => {
    card.addEventListener("click", () => openJoinForm(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openJoinForm(card);
      }
    });
  });

  const requestedRole = new URLSearchParams(window.location.search).get("role");
  const matchingRole = Array.from(joinRole.options).find((option) => option.value.toLowerCase() === (requestedRole || "").toLowerCase());
  if (matchingRole) {
    const roleButton = document.querySelector(`[data-join-role="${matchingRole.value}"]`);
    if (roleButton) openJoinForm(roleButton);
  }
}

const contactParams = new URLSearchParams(window.location.search);
const requestedType = contactParams.get("type");
const contactReference = contactParams.get("reference");
const contactMessage = document.getElementById("contactMessage");
const requestedMessage = contactParams.get("message");
if (contactMessage && !contactMessage.value) {
  const enquiryContext = [
    requestedType && `Enquiry about: ${requestedType}`,
    contactReference && `Property reference: ${contactReference}`,
    requestedMessage
  ].filter(Boolean);
  if (enquiryContext.length) {
    contactMessage.value = enquiryContext.join("\n\n");
  }
}

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const statusNode = form.querySelector(".form-message");
    if (!statusNode) {
      console.error("Contact form is missing its status message.");
      return;
    }

    statusNode.classList.remove("error");
    if (!form.checkValidity()) {
      form.querySelectorAll("input, textarea").forEach((field) => {
        if (!field.checkValidity()) {
          field.setAttribute("aria-invalid", "true");
        }
      });
      statusNode.classList.add("error");
      statusNode.textContent = "Please complete the required fields and enter a valid email address.";
      form.reportValidity();
      return;
    }

    form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
    statusNode.textContent = "Your enquiry is ready, but it has not been sent because this website is not connected to a submission service yet. Please email solacehomemanagement.uk@gmail.com to send your enquiry.";
  });

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (field.matches("input, textarea") && field.checkValidity()) {
      field.removeAttribute("aria-invalid");
    }
  });
});

const listingPurpose = new URLSearchParams(window.location.search).get("purpose");
const listingPurposeSelect = document.getElementById("listingPurpose");
if (listingPurposeSelect && ["let", "management", "sale"].includes((listingPurpose || "").toLowerCase())) {
  listingPurposeSelect.value = listingPurpose.toLowerCase();
}

const preferredService = document.getElementById("preferredService");
const serviceByPurpose = {
  let: "Tenant finding",
  management: "Property management",
  sale: "Property sale support"
};
if (preferredService && listingPurpose) {
  const requestedService = serviceByPurpose[listingPurpose.toLowerCase()];
  if (requestedService) {
    const matchingService = Array.from(preferredService.options).find(
      (option) => option.text.trim().toLowerCase() === requestedService.toLowerCase()
    );
    if (matchingService) {
      preferredService.value = matchingService.value;
    }
  }
}
if (listingPurposeSelect && preferredService) {
  listingPurposeSelect.addEventListener("change", () => {
    const requestedService = serviceByPurpose[listingPurposeSelect.value];
    const matchingService = Array.from(preferredService.options).find(
      (option) => option.text.trim().toLowerCase() === (requestedService || "").toLowerCase()
    );
    preferredService.value = matchingService?.value || "";
  });
}

const portalRoleNames = ["Agent", "Landlord", "Tenant", "Manager", "Admin"];
const portalLoginTitle = document.getElementById("portalLoginTitle");
const portalRoleDescription = document.getElementById("portalRoleDescription");
const requestedPortalRole = new URLSearchParams(window.location.search).get("role");
const selectedPortalRole = portalRoleNames.find((role) => role.toLowerCase() === (requestedPortalRole || "").toLowerCase());

if (portalLoginTitle && portalRoleDescription) {
  if (selectedPortalRole) {
    portalLoginTitle.textContent = `${selectedPortalRole} sign in`;
    portalRoleDescription.textContent = `Sign in to your authorised ${selectedPortalRole.toLowerCase()} account.`;
  } else {
    portalLoginTitle.textContent = "Portal sign in";
    portalRoleDescription.textContent = "Select your role from the role-selection page before continuing.";
  }
}

const portalLoginForm = document.getElementById("portalLoginForm");
const portalLoginMessage = document.getElementById("portalLoginMessage");
if (portalLoginForm && portalLoginMessage) {
  portalLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedPortalRole) {
      portalLoginMessage.textContent = "Choose a role from the role-selection page before continuing.";
      portalLoginMessage.classList.add("error");
      return;
    }
    if (!portalLoginForm.checkValidity()) {
      portalLoginForm.reportValidity();
      portalLoginMessage.textContent = "Enter your email address or username and password.";
      portalLoginMessage.classList.add("error");
      return;
    }
    portalLoginMessage.classList.remove("error");
    portalLoginMessage.textContent = "Portal authentication is not configured. Your credentials were not sent or stored; do not enter real credentials.";
  });
}

const togglePortalPassword = document.getElementById("togglePortalPassword");
const portalPassword = document.getElementById("portalPassword");
if (togglePortalPassword && portalPassword) {
  togglePortalPassword.addEventListener("click", () => {
    const show = portalPassword.type === "password";
    portalPassword.type = show ? "text" : "password";
    togglePortalPassword.textContent = show ? "Hide" : "Show";
    togglePortalPassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
}

const forgotPortalPassword = document.getElementById("forgotPortalPassword");
if (forgotPortalPassword && portalLoginMessage) {
  forgotPortalPassword.addEventListener("click", () => {
    portalLoginMessage.classList.add("error");
    portalLoginMessage.textContent = "Password recovery is not available until a secure portal authentication service is configured.";
  });
}

const browsePage = document.querySelector("[data-browse-properties]");
if (browsePage) {
  const filtersForm = browsePage.querySelector("[data-property-filters]");
  const results = browsePage.querySelector("[data-property-results]");
  const emptyState = browsePage.querySelector("[data-property-empty]");
  const noResults = browsePage.querySelector("[data-property-no-results]");
  const filterStatus = browsePage.querySelector("[data-active-filters]");
  const normalize = (value) => String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const normalizeTransaction = (value) => {
    const text = normalize(value);
    if (["let", "to let", "letting", "rent", "rental"].includes(text)) return "let";
    if (["sale", "for sale", "sell"].includes(text)) return "sale";
    return text;
  };
  const normalizeCategory = (value, type) => {
    const text = normalize(value || type);
    if (text.includes("room") || text.includes("shared")) return "room";
    if (text.includes("house") || text.includes("bungalow")) return "house";
    if (text.includes("flat") || text.includes("apartment")) return "flat";
    if (text.includes("studio")) return "studio";
    return text;
  };
  const normalizedStatus = (value) => {
    const text = normalize(value);
    if (text === "available") return "available";
    if (text === "rented") return "rented";
    if (["not available", "unavailable"].includes(text)) return "not available";
    return "unknown";
  };
  const selectedValue = (name) => filtersForm?.elements.namedItem(name)?.value ?? "";
  const setDependentFilters = () => {
    const selected = selectedValue("category");
    filtersForm?.querySelectorAll("[data-dependent-filter]").forEach((label) => {
      const applicable = selected === "all"
        || (selected === "houses-flats" && label.dataset.dependentFilter.split(" ").some((category) => ["house", "flat"].includes(category)))
        || label.dataset.dependentFilter.split(" ").includes(selected);
      label.hidden = !applicable || label.dataset.dataSupported === "false";
      const control = label.querySelector("select");
      if (control) {
        control.disabled = !applicable;
        if (!applicable) control.value = "all";
      }
    });
  };
  const formatPrice = (record) => {
    if (record.price === undefined || record.price === null || record.price === "" || !Number.isFinite(Number(record.price))) return "";
    const currency = String(record.currency || "").toUpperCase();
    const amount = Number(record.price);
    if (!/^[A-Z]{3}$/.test(currency)) return "";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
    } catch (error) {
      console.error("A property record contains an unsupported currency code.", error);
      return "";
    }
  };
  const createText = (tagName, className, value) => {
    if (value === undefined || value === null || String(value).trim() === "") return null;
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = String(value);
    return element;
  };
  const safeSameOriginUrl = (value) => {
    if (!value) return null;
    try {
      const url = new URL(String(value), window.location.href);
      return url.origin === window.location.origin ? url.href : null;
    } catch {
      return null;
    }
  };
  const safeImageUrl = (value) => {
    if (!value) return null;
    try {
      const url = new URL(String(value), window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };
  const renderRecord = (record) => {
    const card = document.createElement("article");
    card.className = "property-card";
    const imageUrl = safeImageUrl(record.images?.[0]);
    if (imageUrl) {
      const image = document.createElement("img");
      image.className = "property-card-image";
      image.src = imageUrl;
      image.alt = record.title ? `${record.title} property` : "Property listing image";
      image.loading = "lazy";
      card.appendChild(image);
    }
    const content = document.createElement("div");
    content.className = "property-card-content";
    const heading = createText("h2", "", record.title);
    if (heading) content.appendChild(heading);
    const location = createText("p", "property-card-location", record.location);
    if (location) content.appendChild(location);
    const details = [
      [record.category || record.type, "property-card-type"],
      [record.bedrooms !== null && record.bedrooms !== undefined ? `${record.bedrooms} bedrooms` : "", ""],
      [record.bathrooms !== null && record.bathrooms !== undefined ? `${record.bathrooms} bathrooms` : "", ""],
      [record.furnishing, ""],
      [record.reference ? `Reference: ${record.reference}` : "", ""],
      [record.availability, "property-card-status"]
    ];
    const detailsList = document.createElement("ul");
    detailsList.className = "property-card-details";
    details.forEach(([value, className]) => {
      const detail = createText("li", className, value);
      if (detail) detailsList.appendChild(detail);
    });
    if (detailsList.childElementCount) content.appendChild(detailsList);
    const price = createText("p", "property-card-price", formatPrice(record));
    if (price) content.appendChild(price);
    const actions = document.createElement("div");
    actions.className = "property-card-actions";
    const detailsUrl = safeSameOriginUrl(record.detailUrl);
    if (detailsUrl) {
      const detailsLink = document.createElement("a");
      detailsLink.className = "button button-outline";
      detailsLink.href = detailsUrl;
      detailsLink.textContent = "View Details";
      actions.appendChild(detailsLink);
    }
    const enquiry = document.createElement("a");
    enquiry.className = "button button-dark";
    enquiry.href = `contact.html?type=Property%20enquiry${record.reference ? `&reference=${encodeURIComponent(record.reference)}` : ""}`;
    enquiry.textContent = "Enquire";
    actions.appendChild(enquiry);
    content.appendChild(actions);
    card.appendChild(content);
    return card;
  };
  const readFilters = () => ({
    transactionType: selectedValue("transactionType"),
    category: selectedValue("category"),
    roomType: selectedValue("roomType"),
    houseType: selectedValue("houseType"),
    flatType: selectedValue("flatType"),
    studioType: selectedValue("studioType"),
    bedrooms: selectedValue("bedrooms"),
    sharedRooms: selectedValue("sharedRooms"),
    minPrice: selectedValue("minPrice"),
    maxPrice: selectedValue("maxPrice"),
    location: selectedValue("location").trim().toLowerCase(),
    furnishing: selectedValue("furnishing"),
    availability: selectedValue("availability"),
    bathrooms: selectedValue("bathrooms"),
    parking: selectedValue("parking"),
    garden: selectedValue("garden"),
    billsIncluded: selectedValue("billsIncluded"),
    ensuite: selectedValue("ensuite"),
    accessible: selectedValue("accessible"),
    addedSince: selectedValue("addedSince"),
    reference: selectedValue("reference").trim().toLowerCase(),
    currency: selectedValue("currency")
  });
  const records = [];
  let recordCurrencies = new Set();
  const filterMatches = (record, filters) => {
    const category = normalizeCategory(record.category, record.type);
    const typeText = normalize(record.type);
    const transaction = normalizeTransaction(record.transactionType);
    const status = normalizedStatus(record.availability);
    const recordPrice = Number(record.price);
    const textLocation = normalize(`${record.location || ""} ${record.postcode || ""}`);
    const recordBedrooms = Number.parseInt(record.bedrooms, 10);
    const recordBathrooms = Number(record.bathrooms);
    const houseType = normalize(record.houseType || record.type);
    const flatType = normalize(record.flatType || record.type);
    const knownHouseTypes = new Set(["detached house", "semi detached house", "terraced house", "end of terrace house", "bungalow"]);
    const knownFlatTypes = new Set(["studio flat", "one bedroom flat", "two bedroom flat", "three bedroom flat", "four or more bedroom flat"]);
    const matchesFeature = (key, selected) => {
      if (selected === "all") return true;
      const value = record[key] ?? record.features?.[key];
      if (value === undefined || value === null) return false;
      const normalizedValue = typeof value === "boolean"
        ? value
        : ["yes", "true", "1"].includes(normalize(value));
      return normalizedValue === (selected === "yes");
    };
    if (filters.transactionType !== "all" && transaction !== filters.transactionType) return false;
    if (filters.category !== "all" && (filters.category === "houses-flats"
      ? !["house", "flat"].includes(category)
      : category !== filters.category)) return false;
    if (filters.roomType !== "all" && normalize(record.roomType || record.type) !== normalize(filters.roomType)) return false;
    if (filters.houseType !== "all") {
      const requestedHouseType = normalize(filters.houseType);
      if (requestedHouseType === "other house types") {
        if (category !== "house" || knownHouseTypes.has(houseType)) return false;
      } else if (houseType !== requestedHouseType) {
        return false;
      }
    }
    if (filters.flatType !== "all") {
      const requestedFlatType = normalize(filters.flatType);
      if (requestedFlatType === "other flat types") {
        if (category !== "flat" || knownFlatTypes.has(flatType) || (Number.isFinite(recordBedrooms) && recordBedrooms >= 4)) return false;
      } else if (requestedFlatType === "studio flat") {
        if (category !== "flat" || (!flatType.includes("studio") && recordBedrooms !== 0)) return false;
      } else if (requestedFlatType === "four or more bedroom flat") {
        if (category !== "flat" || !(flatType === requestedFlatType || recordBedrooms >= 4)) return false;
      } else {
        const bedroomCount = {
          "one bedroom flat": 1,
          "two bedroom flat": 2,
          "three bedroom flat": 3
        }[requestedFlatType];
        if (category !== "flat" || (flatType !== requestedFlatType && recordBedrooms !== bedroomCount)) return false;
      }
    }
    if (filters.studioType !== "all" && category !== "studio") return false;
    if (filters.bedrooms !== "all" && !(filters.bedrooms === "5+" ? recordBedrooms >= 5 : recordBedrooms === Number(filters.bedrooms))) return false;
    if (filters.sharedRooms !== "all" && !(filters.sharedRooms === "5+" ? Number(record.sharedRoomCount) >= 5 : Number(record.sharedRoomCount) === Number(filters.sharedRooms))) return false;
    if (filters.minPrice && (!Number.isFinite(recordPrice) || recordPrice < Number(filters.minPrice))) return false;
    if (filters.maxPrice && (!Number.isFinite(recordPrice) || recordPrice > Number(filters.maxPrice))) return false;
    if ((filters.minPrice || filters.maxPrice) && !/^[A-Z]{3}$/.test(String(record.currency || "").toUpperCase())) return false;
    if ((filters.minPrice || filters.maxPrice) && recordCurrencies.size > 1 && !filters.currency) return false;
    if (filters.location && !textLocation.includes(filters.location)) return false;
    if (filters.furnishing !== "all" && normalize(record.furnishing) !== normalize(filters.furnishing)) return false;
    if (filters.availability !== "all" && status !== normalize(filters.availability)) return false;
    if (filters.bathrooms !== "all" && (!Number.isFinite(recordBathrooms) || recordBathrooms < Number(filters.bathrooms))) return false;
    if (!matchesFeature("parking", filters.parking)) return false;
    if (!matchesFeature("garden", filters.garden)) return false;
    if (!matchesFeature("billsIncluded", filters.billsIncluded)) return false;
    if (!matchesFeature("ensuite", filters.ensuite)) return false;
    if (!matchesFeature("accessible", filters.accessible)) return false;
    if (filters.addedSince && (!record.addedDate || record.addedDate < filters.addedSince)) return false;
    if (filters.reference && !normalize(record.reference).includes(filters.reference)) return false;
    if ((filters.minPrice || filters.maxPrice) && filters.currency && normalize(record.currency) !== normalize(filters.currency)) return false;
    return true;
  };
  const sortRecords = (a, b) => {
    const statusPriority = { available: 0, rented: 1, "not available": 2, unknown: 3 };
    const statusDifference = statusPriority[normalizedStatus(a.availability)] - statusPriority[normalizedStatus(b.availability)];
    if (statusDifference) return statusDifference;
    const dateA = Date.parse(a.addedDate || "");
    const dateB = Date.parse(b.addedDate || "");
    const hasDateA = Number.isFinite(dateA);
    const hasDateB = Number.isFinite(dateB);
    if (hasDateA && hasDateB && dateA !== dateB) return dateB - dateA;
    if (hasDateA !== hasDateB) return hasDateA ? -1 : 1;
    return normalize(a.title || a.reference || a.id).localeCompare(normalize(b.title || b.reference || b.id));
  };
  const populateCurrencies = (sourceRecords) => {
    const priceField = filtersForm?.elements.namedItem("minPrice")?.closest("label");
    if (!filtersForm || !priceField) return;
    const currencies = [...new Set(sourceRecords
      .filter((record) => record.price !== null && record.price !== "" && Number.isFinite(Number(record.price)))
      .map((record) => String(record.currency || "").toUpperCase())
      .filter((value) => /^[A-Z]{3}$/.test(value)))]
      .sort();
    if (!currencies.length) return;
    const currencySelect = document.createElement("select");
    currencySelect.name = "currency";
    currencySelect.dataset.filter = "currency";
    currencySelect.setAttribute("aria-label", "Price currency");
    currencySelect.innerHTML = '<option value="">All currencies</option>';
    currencies.forEach((currency) => {
      const option = document.createElement("option");
      option.value = currency;
      option.textContent = currency;
      currencySelect.appendChild(option);
    });
    if (currencies.length === 1) currencySelect.value = currencies[0];
    const currencyLabel = document.createElement("label");
    currencyLabel.textContent = "Price currency";
    currencyLabel.appendChild(currencySelect);
    priceField.parentNode.insertBefore(currencyLabel, priceField);
  };
  const setDataSupportedFilters = (sourceRecords) => {
    filtersForm?.querySelectorAll("[data-record-field]").forEach((label) => {
      const fields = label.dataset.recordField.split("|");
      const categories = label.dataset.dependentFilter?.split(" ") || [];
      const supported = sourceRecords.some((record) => {
        const category = normalizeCategory(record.category, record.type);
        const categorySupported = !categories.length || categories.some((required) => (
          required === "houses-flats" ? ["house", "flat"].includes(category) : required === category
        ));
        return categorySupported && fields.some((field) => {
          if (field === "price") {
            return Number.isFinite(Number(record.price))
              && record.price !== null
              && record.price !== ""
              && /^[A-Z]{3}$/.test(String(record.currency || "").toUpperCase());
          }
          if (["parking", "garden", "billsIncluded", "ensuite", "accessible"].includes(field)) {
            return record[field] !== undefined || record.features?.[field] !== undefined;
          }
          return record[field] !== undefined && record[field] !== null && String(record[field]).trim() !== "";
        });
      });
      label.dataset.dataSupported = String(supported);
      if (!supported) label.hidden = true;
    });
  };
  const updateResults = () => {
    const filters = readFilters();
    const activeCount = Object.entries(filters).filter(([key, value]) => {
      if (key === "currency") return Boolean(value && (filters.minPrice || filters.maxPrice));
      if (key === "minPrice" || key === "maxPrice" || key === "addedSince" || key === "location" || key === "reference") return Boolean(value);
      return value !== "all" && value !== "";
    }).length;
    const hasPriceRange = Boolean(filters.minPrice || filters.maxPrice);
    const availableCurrencies = new Set(records.map((record) => String(record.currency || "").toUpperCase()).filter((value) => /^[A-Z]{3}$/.test(value)));
    if (filterStatus) {
      filterStatus.textContent = hasPriceRange && availableCurrencies.size > 1 && !filters.currency
        ? "Select a price currency before applying price limits."
        : `${activeCount} active ${activeCount === 1 ? "filter" : "filters"}`;
    }
    const matched = records.filter((record) => filterMatches(record, filters)).sort(sortRecords);
    if (results) results.replaceChildren(...matched.map(renderRecord));
    const databaseEmpty = records.length === 0;
    if (emptyState) emptyState.hidden = !databaseEmpty;
    if (noResults) noResults.hidden = databaseEmpty || matched.length > 0;
  };
  const setEmptyStateCopy = (heading, message) => {
    const headingNode = emptyState?.querySelector("[data-empty-heading]");
    const messageNode = emptyState?.querySelector("[data-empty-message]");
    if (headingNode) headingNode.textContent = heading;
    if (messageNode) messageNode.textContent = message;
  };
  const requestedCategory = (new URLSearchParams(window.location.search).get("category") || "all").toLowerCase();
  const categoryControl = filtersForm?.elements.namedItem("category");
  const transactionControl = filtersForm?.elements.namedItem("transactionType");
  if (requestedCategory === "let" || requestedCategory === "rooms" || requestedCategory === "houses-flats") {
    if (transactionControl) transactionControl.value = "let";
  } else if (requestedCategory === "sale" && transactionControl) {
    transactionControl.value = "sale";
  }
  if (categoryControl) {
    if (requestedCategory === "rooms") categoryControl.value = "room";
    else if (requestedCategory === "houses-flats") categoryControl.value = "houses-flats";
    else if (["room", "house", "flat", "studio"].includes(requestedCategory)) categoryControl.value = requestedCategory;
  }
  if (filtersForm) {
    filtersForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateResults();
    });
    filtersForm.addEventListener("reset", () => {
      window.setTimeout(() => {
        setDependentFilters();
        updateResults();
      });
    });
    filtersForm.querySelector('[data-filter="category"]')?.addEventListener("change", setDependentFilters);
  }
  setDependentFilters();
  if (!window.SHMPropertyData || typeof window.SHMPropertyData.getProperties !== "function") {
    console.error("The property data adapter is not available on the Browse Properties page.");
    if (emptyState) emptyState.hidden = false;
    setEmptyStateCopy("Property listings could not be loaded", "The property data connection is unavailable. Please try again later.");
  } else {
    window.SHMPropertyData.getProperties().then((sourceRecords) => {
      if (!Array.isArray(sourceRecords)) {
        throw new TypeError("The property data adapter must return an array of property records.");
      }
      records.push(...sourceRecords);
      recordCurrencies = new Set(records
        .filter((record) => record.price !== null && record.price !== "" && Number.isFinite(Number(record.price)))
        .map((record) => String(record.currency || "").toUpperCase())
        .filter((value) => /^[A-Z]{3}$/.test(value)));
      setDataSupportedFilters(records);
      populateCurrencies(records);
      if (records.length === 0 && !window.SHMPropertyData.isConfigured()) {
        setEmptyStateCopy("Property listings are not connected yet", "Public listings will appear here when the SHM Portal or a property API is connected.");
      } else if (records.length === 0) {
        setEmptyStateCopy("No properties are currently listed", "Available properties will appear here once genuine listing details have been supplied and approved.");
      }
      setDependentFilters();
      updateResults();
    }).catch((error) => {
      console.error("Unable to load public property records.", error);
      if (emptyState) emptyState.hidden = false;
      if (noResults) noResults.hidden = true;
      if (filterStatus) filterStatus.textContent = "Property records could not be loaded.";
      setEmptyStateCopy("Property listings could not be loaded", "The property data connection is unavailable. Please try again later.");
    });
  }
}
