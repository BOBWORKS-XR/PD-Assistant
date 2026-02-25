(function () {
  var body = document.body;
  var header = document.getElementById("docs-header");
  var sidebar = document.getElementById("docs-sidebar");
  var sidebarTitle = document.getElementById("docs-sidebar-title");
  var sidebarNav = document.getElementById("docs-sidebar-nav");
  var menuToggle = document.getElementById("docs-menu-toggle");
  var themeToggle = document.getElementById("theme-toggle");
  var content = document.getElementById("docs-content");
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".docs-subtab"));

  var docs = {
    "radio-rank": {
      title: "Radio/Rank",
      sections: [
        {
          id: "rr-scope",
          title: "Document Scope and Definitions",
          paragraphs: [
            "Source: Rank Structure and Radio Communications (Version 1.3, released 21/02/2026).",
            "The document distinguishes rank (who you are) and role (what you do). It also defines acting and temporary appointments as full-authority appointments for supported operational need."
          ],
          bullets: [
            "Rank: authority/seniority position in ECPS.",
            "Role: job/function inside ECPS.",
            "Acting: full authority where competence has already been demonstrated.",
            "Temporary: full authority during short-term placement (for example while covering LOA)."
          ]
        },
        {
          id: "rr-rank-structure",
          title: "Rank Structure Overview",
          paragraphs: [
            "All officers begin as Student Police Constables and then progress to Police Constable after training.",
            "Leadership tiers are grouped under Bronze, Silver and Gold command structures."
          ],
          bullets: [
            "Entry ranks: Student PC -> PC.",
            "Bronze Command: Sergeant, Inspector, Chief Inspector.",
            "Silver Command: Superintendent, Chief Superintendent.",
            "Gold Command: Commander, Deputy Commissioner, Commissioner."
          ]
        },
        {
          id: "rr-bronze",
          title: "Bronze Command Responsibilities",
          paragraphs: [
            "Bronze command is responsible for direct supervision, policy compliance, training quality and frontline professional standards."
          ],
          bullets: [
            "Sergeant: leads/supports PCs, takes operational command when needed, monitors subordinates, handles informal standards chats.",
            "Inspector: supervises Sergeants, expands standards/training ownership, can issue up to 3-day suspension.",
            "Chief Inspector: supervises Inspectors, supports tactical procedure updates, can issue up to 7-day suspension."
          ]
        },
        {
          id: "rr-silver-gold",
          title: "Silver and Gold Command Responsibilities",
          paragraphs: [
            "Senior command layers manage force-wide capability, standards, strategic direction and resources."
          ],
          bullets: [
            "Superintendent: command/team ownership, stage 2 disciplinaries, cross-team operational support.",
            "Chief Superintendent: standards and HR responsibilities, stage 3 disciplinaries, up to 14-day suspension.",
            "Commander/Deputy Commissioner/Commissioner: strategic/tactical command, service-wide development, integrity and budget oversight."
          ]
        },
        {
          id: "rr-collar-callsign",
          title: "Collar Numbers and Callsigns",
          paragraphs: [
            "Each officer receives a persistent 3-digit number plus a 2-letter prefix tied to assignment. Operational callsigns are transmitted phonetically with individual digits."
          ],
          bullets: [
            "Example transmission format: Sierra Whiskey One Two Three.",
            "Student PCs have unique visibility requirement and must be supported by PC+ after student radio attendance.",
            "Collar numbers are unique and not reused after retirement."
          ]
        },
        {
          id: "rr-prefixes",
          title: "Designated Prefixes",
          bullets: [
            "SW: Student Police Constable",
            "CW: Emergency Response Policing Team",
            "MT: Roads Policing Team",
            "TR: Specialist Firearms Team",
            "EC: Officers not attached to a specific command"
          ]
        },
        {
          id: "rr-operational-callsigns",
          title: "Operational Callsigns (Duty Roles)",
          paragraphs: [
            "Only one officer per shift should hold each dedicated duty callsign. Other same-rank officers retain collar callsign but not duty lead callsign.",
            "SFT uses TROJAN voice callsign in place of Tango Romeo."
          ],
          bullets: [
            "ERPT Duty Inspector: CW1 | ERPT Duty Sergeant: CW2",
            "RPT Duty Inspector: MT1 | RPT Duty Sergeant: MT2",
            "SFT Duty Inspector: TROJAN 1 | SFT Duty Sergeant: TROJAN 2",
            "Forcewide Duty Silver: EC2 | Forcewide Duty Gold: EC1"
          ]
        },
        {
          id: "rr-radio-frequencies",
          title: "Radio Frequencies",
          bullets: [
            "1: Police",
            "2: Police",
            "3: Ambulance",
            "4: Ambulance",
            "5: Police main (ambulance can join)",
            "6: Ambulance main (police can join)"
          ]
        },
        {
          id: "rr-phonetic",
          title: "Phonetic Alphabet",
          paragraphs: [
            "Use clear phonetics for all transmissions: Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Xray, Yankee, Zulu."
          ]
        },
        {
          id: "rr-status-codes",
          title: "Status Codes",
          bullets: [
            "State 0: Panic button",
            "State 1: On duty",
            "State 2: Available",
            "State 3: Unavailable (report writing/meetings)",
            "State 4: Unavailable (break/in head)",
            "State 5: En route to incident",
            "State 6: On scene",
            "State 9: En route to custody (prisoner transport)",
            "State 10: In custody",
            "State 11: Going off duty"
          ]
        },
        {
          id: "rr-ic-codes",
          title: "IC Codes",
          bullets: [
            "IC1: White skinned European",
            "IC2: Dark skinned European",
            "IC3: Black",
            "IC4: Asian (Indian subcontinent)",
            "IC5: Chinese/Japanese/Korean/other Southeast Asian",
            "IC6: Arab or North African",
            "IC9: Unknown"
          ]
        },
        {
          id: "rr-warning-markers",
          title: "Warning Markers",
          bullets: [
            "FI: Firearms risk",
            "WE: Weapons risk",
            "VI: Violent behaviour risk",
            "CO: Contagious risk",
            "ES: Escape risk",
            "AG: Allegation risk",
            "AT: Ailment/medical requirement",
            "MN: Mental disorder indicator",
            "IM/IF: Male/female impersonation marker",
            "XP: Explosives marker",
            "SU/SH: Suicide/self-harm risk",
            "DR: Drugs marker",
            "CL: Conceals (known to hide items)"
          ]
        }
      ]
    },
    legislation: {
      title: "Legislation",
      sections: [
        {
          id: "lg-disposal",
          title: "Methods of Disposal",
          paragraphs: [
            "Source: Legislation document set (release dates in the document between 08/02/2026 and 15/02/2026).",
            "Not all incidents should end in arrest; officers must justify disposal decisions using proportionality, public interest and evidential reasoning."
          ],
          bullets: [
            "Do Nothing: where enforcement is not in the public interest for very minor conduct.",
            "Verbal Warning: clear advisory warning with recorded rationale.",
            "Community Resolution: victim-focused local resolution with admission and agreement.",
            "TOR (Traffic Offence Report): roadside disposal with NOW caution and recorded comments.",
            "Formal warning for small quantity controlled substances: document cites small amount threshold as 9 or less.",
            "Arrest: requires lawful grounds and necessity."
          ]
        },
        {
          id: "lg-caution",
          title: "Police Caution",
          paragraphs: [
            "The document provides two caution variants and stresses preserving legal meaning.",
            "Arrest caution wording should include time, offence basis and a check for understanding."
          ],
          bullets: [
            "Arrest caution: \"You do not have to say anything, but it may harm your defence... WHEN QUESTIONED...\"",
            "Roadside report caution: \"...if you do not mention, NOW, something which you may later rely on in court...\"",
            "Use case framing from the OG text: \"The time is [HHMM], I am arresting/reporting you for [offence]... Do you understand?\"",
            "Record any reply made after caution."
          ]
        },
        {
          id: "lg-necessity",
          title: "Necessities of Arrest (PACE S24)",
          paragraphs: [
            "Under section 24 PACE 1984, arrest without warrant requires reasonable suspicion of offence and necessity.",
            "The document includes IDCOPPLAN as a mnemonic."
          ],
          bullets: [
            "Investigation: prompt and effective investigation",
            "Disappearance: prevent suspect disappearance",
            "Child: protect child/vulnerable person",
            "Obstruction: prevent unlawful highway obstruction",
            "Physical injury: prevent injury",
            "Public decency: prevent offence against decency",
            "Loss/damage: prevent property loss or damage",
            "Address: ascertain address if unknown/doubted",
            "Name: ascertain name if unknown/doubted"
          ]
        },
        {
          id: "lg-pace",
          title: "PACE 1984 (Key Sections in Document)",
          bullets: [
            "Section 1: Stop/search where reasonable grounds exist (GO WISELY framework shown).",
            "Section 17: Entry to arrest and to prevent harm/property damage.",
            "Section 18: Search premises/property post-arrest with PACE inspector authorisation.",
            "Section 19: Seizure where evidence may be lost/altered/destroyed.",
            "Section 24: Arrest power for offence committed/being committed/suspected.",
            "Section 32: Search after arrest.",
            "Section 54: Search at custody."
          ]
        },
        {
          id: "lg-police-reform",
          title: "Police Reform Act 2002",
          bullets: [
            "Section 50: Require name/address for anti-social behaviour in uniform.",
            "Section 59: Vehicle seizure power for anti-social/careless use (with warning process)."
          ]
        },
        {
          id: "lg-public-order",
          title: "Public Order Act 1986",
          bullets: [
            "Breach of Peace: preventative arrest/removal to prevent escalation.",
            "Section 4: fear/provocation of violence.",
            "Section 4A: intentional harassment/alarm/distress.",
            "Section 5: harassment/alarm/distress (threatening/abusive/disorderly behaviour)."
          ]
        },
        {
          id: "lg-cjpoa",
          title: "Criminal Justice and Public Order Act 1994",
          bullets: [
            "Section 60: area-authorised stop/search power where violence is reasonably anticipated (inspector+ authority)."
          ]
        },
        {
          id: "lg-drugs",
          title: "Misuse of Drugs Act 1971 (Doc Text Included)",
          bullets: [
            "Section 4: production/supply offences and related participation offences.",
            "Section 5: possession and possession with intent to supply.",
            "Section 6: cannabis cultivation offence.",
            "Section 23: power to search for drugs.",
            "Section 24: power to arrest for MDA offences.",
            "Class examples: A (heroin/cocaine/ecstasy/LSD), B (amphetamine/cannabis/ketamine/mephedrone), C (anabolic steroids/GHB)."
          ]
        },
        {
          id: "lg-rta",
          title: "Road Traffic Act 1988 (Key Sections in Document)",
          bullets: [
            "Section 4: driving/in charge while under influence.",
            "Section 5: driving while over prescribed alcohol limit.",
            "Section 6: breath/drug test power in qualifying circumstances.",
            "Section 28/29/30: dangerous/careless cycling and cycling under influence.",
            "Section 163: stop vehicle power on public road.",
            "Section 164: request driving documents.",
            "Section 165: obtain name/address for road traffic enforcement.",
            "Section 165A: seize vehicle for licence/insurance breaches."
          ]
        },
        {
          id: "lg-mental-health",
          title: "Mental Health and Capacity Act",
          bullets: [
            "Section 135: remove person from private place to place of safety.",
            "Section 136: remove person from public place to place of safety."
          ]
        }
      ]
    }
  };

  var activeDoc = "radio-rank";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSection(section) {
    var paragraphs = (section.paragraphs || [])
      .map(function (text) {
        return "<p>" + escapeHtml(text) + "</p>";
      })
      .join("");

    var bullets = (section.bullets || []).length
      ? "<ul>" +
        section.bullets
          .map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          })
          .join("") +
        "</ul>"
      : "";

    return '<article class="docs-section" id="' + escapeHtml(section.id) + '">' + "<h3>" + escapeHtml(section.title) + "</h3>" + paragraphs + bullets + "</article>";
  }

  function setSidebarOpen(open) {
    body.classList.toggle("docs-sidebar-open", open);
    if (menuToggle) {
      menuToggle.textContent = open ? "✕" : "☰";
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
    }
  }

  function getDocKeyBySectionId(sectionId) {
    var id = String(sectionId || "");
    var keys = Object.keys(docs);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var sections = docs[key].sections || [];
      for (var s = 0; s < sections.length; s += 1) {
        if (sections[s].id === id) return key;
      }
    }
    return null;
  }

  function scrollToSectionHash(hash, smooth) {
    var cleaned = String(hash || "").replace(/^#/, "");
    if (!cleaned) return;
    var target = document.getElementById(cleaned);
    if (!target) return;
    var headerHeight = header ? header.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: smooth ? "smooth" : "auto",
    });
  }

  function renderDocument(docKey) {
    var doc = docs[docKey];
    if (!doc) return;

    if (sidebarTitle) {
      sidebarTitle.textContent = doc.title + " Sections";
    }

    if (content) {
      content.innerHTML = doc.sections.map(renderSection).join("");
    }

    if (sidebarNav) {
      sidebarNav.innerHTML = doc.sections
        .map(function (section) {
          return '<a href="#' + escapeHtml(section.id) + '">' + escapeHtml(section.title) + "</a>";
        })
        .join("");
    }
  }

  function setActiveDoc(docKey) {
    if (!docs[docKey]) return;
    activeDoc = docKey;

    tabButtons.forEach(function (button) {
      var selected = button.dataset.doc === docKey;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });

    renderDocument(docKey);
    if (location.hash) {
      scrollToSectionHash(location.hash, true);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyTheme(theme) {
    body.classList.toggle("theme-dark", theme === "dark");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function initTheme() {
    var saved = localStorage.getItem("epical_pd_theme");
    var osPrefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved === "dark" || saved === "light" ? saved : osPrefersDark ? "dark" : "light";
    applyTheme(theme);
  }

  function toggleTheme() {
    var current = body.classList.contains("theme-dark") ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem("epical_pd_theme", next);
    applyTheme(next);
  }

  function syncLayoutOffsets() {
    if (!header) return;
    var headerHeight = header.offsetHeight || 100;
    document.documentElement.style.setProperty("--docs-bar-offset", headerHeight + 10 + "px");
    document.documentElement.style.setProperty("--docs-header-offset", headerHeight + 2 + "px");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setSidebarOpen(!body.classList.contains("docs-sidebar-open"));
    });
  }

  if (sidebarNav) {
    sidebarNav.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement) || target.tagName !== "A") return;
      event.preventDefault();
      var hash = target.getAttribute("href") || "";
      if (hash && hash.charAt(0) === "#") {
        if (typeof history !== "undefined" && history.replaceState) {
          history.replaceState(null, "", hash);
        } else {
          location.hash = hash;
        }
        scrollToSectionHash(hash, true);
      }
      if (window.innerWidth <= 1200) {
        setSidebarOpen(false);
      }
    });
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveDoc(button.dataset.doc);
    });
  });

  window.addEventListener("resize", syncLayoutOffsets);

  initTheme();
  var initialHash = (location.hash || "").replace(/^#/, "");
  if (initialHash) {
    var mappedDoc = getDocKeyBySectionId(initialHash);
    if (mappedDoc) {
      activeDoc = mappedDoc;
      tabButtons.forEach(function (button) {
        var selected = button.dataset.doc === mappedDoc;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
      });
    }
  }

  renderDocument(activeDoc);
  setSidebarOpen(false);
  syncLayoutOffsets();
  if (initialHash) {
    setTimeout(function () {
      scrollToSectionHash("#" + initialHash, false);
    }, 0);
  }
})();
