/* =========================================================
   PHM TEAM
   Data source: Google Sheet
========================================================= */

const SHEET_ID = "12lxrxxyCUwbbFqv93NMNqyhpOUoXbyml00mnNSKGjQ0";
const SHEET_GID = "1340186546";

const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&gid=${SHEET_GID}`;


/* =========================================================
   GROUP FROM URL
   default: core

   Example:
   ?group=core
   ?group=referees
========================================================= */

const params = new URLSearchParams(window.location.search);

const selectedGroup =
  (params.get("group") || "core")
    .trim()
    .toLowerCase();


/* =========================================================
   ELEMENTS
========================================================= */

const carousel =
  document.getElementById("teamCarousel");

const modal =
  document.getElementById("memberModal");

const modalClose =
  document.getElementById("modalClose");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");


/* =========================================================
   LOAD DATA
========================================================= */

async function loadTeam() {

  try {

    carousel.innerHTML = `
      <div class="team-loading">
        Načítám PHM Team...
      </div>
    `;

    const response =
      await fetch(SHEET_URL);

    if (!response.ok) {
      throw new Error(
        "Google Sheet se nepodařilo načíst."
      );
    }

    const text =
      await response.text();


    /*
      Google neposílá čistý JSON.
      Vrací něco ve stylu:

      google.visualization.Query.setResponse({...});

      Proto vytáhneme pouze JSON část.
    */

    const jsonStart =
      text.indexOf("{");

    const jsonEnd =
      text.lastIndexOf("}");

    if (
      jsonStart === -1 ||
      jsonEnd === -1
    ) {
      throw new Error(
        "Neplatná odpověď Google Sheetu."
      );
    }

    const json =
      JSON.parse(
        text.substring(
          jsonStart,
          jsonEnd + 1
        )
      );


    const rows =
      json.table.rows || [];


    /* =====================================================
       MAP SHEET COLUMNS

       A = ID
       B = Group
       C = First name/Nick
       D = Full name
       E = Job title
       F = Photo 1 URL
       G = Photo 2 URL
       H = Detail
       I = Email
       J = PHM Since
       K = Order
       L = Active
    ===================================================== */

    const team =
      rows.map((row, index) => {

        const cells =
          row.c || [];

        return {

          id:
            getCell(cells, 0) ||
            `member-${index + 1}`,

          group:
            getCell(cells, 1)
              .trim()
              .toLowerCase(),

          firstName:
            getCell(cells, 2),

          fullName:
            getCell(cells, 3),

          jobTitle:
            getCell(cells, 4),

          photo1:
            getCell(cells, 5),

          photo2:
            getCell(cells, 6),

          detail:
            getCell(cells, 7),

          email:
            getCell(cells, 8),

          since:
            getCell(cells, 9),

          order:
            Number(
              getCell(cells, 10)
            ) || 999,

          active:
            parseBoolean(
              getCell(cells, 11)
            )

        };

      });


    /* =====================================================
       FILTER
    ===================================================== */

    const visibleMembers =
      team
        .filter(person =>
          person.active === true &&
          person.group === selectedGroup &&
          person.fullName
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );


    renderTeam(
      visibleMembers
    );


  } catch (error) {

    console.error(
      "PHM Team error:",
      error
    );

    carousel.innerHTML = `
      <div class="team-error">
        Nepodařilo se načíst PHM Team.
      </div>
    `;

  }

}


/* =========================================================
   GET CELL VALUE

   Google někdy vrací:
   v = skutečnou hodnotu
   f = formátovanou hodnotu

   Pro naše data je nejlepší použít f, pokud existuje,
   jinak v.
========================================================= */

function getCell(
  cells,
  index
) {

  const cell =
    cells[index];

  if (!cell) {
    return "";
  }

  if (
    cell.f !== undefined &&
    cell.f !== null
  ) {
    return String(
      cell.f
    );
  }

  if (
    cell.v !== undefined &&
    cell.v !== null
  ) {
    return String(
      cell.v
    );
  }

  return "";

}


/* =========================================================
   TRUE / FALSE
========================================================= */

function parseBoolean(value) {

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "ano"
  );

}


/* =========================================================
   RENDER TEAM
========================================================= */

function renderTeam(team) {

  carousel.innerHTML = "";


  if (!team.length) {

    carousel.innerHTML = `
      <div class="team-error">
        Pro skupinu "${selectedGroup}"
        nejsou žádní aktivní členové.
      </div>
    `;

    hideArrows();

    return;

  }


  team.forEach(
    (person, index) => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "member-card";

      card.setAttribute(
        "tabindex",
        "0"
      );


      /* ===================================================
         IMAGE

         F = Photo 1 URL
      =================================================== */

      const photo =
        person.photo1 || "";


      card.innerHTML = `

        <img
          src="${escapeHTML(photo)}"
          alt="${escapeHTML(person.fullName)}"
          loading="lazy"
        >

        <div class="card-number">

          ${String(index + 1)
            .padStart(2, "0")}

        </div>

        <div class="card-info">

          <div class="card-firstname">

            ${escapeHTML(
              person.firstName
            )}

          </div>

          <div class="card-fullname">

            ${escapeHTML(
              person.fullName
            )}

          </div>

          <div class="card-job">

            ${escapeHTML(
              person.jobTitle
            )}

          </div>

        </div>

      `;


      /* Broken image fallback */

      const img =
        card.querySelector("img");

      img.addEventListener(
        "error",
        () => {

          console.warn(
            "Nepodařilo se načíst fotku:",
            photo
          );

          img.style.opacity =
            "0";

        }
      );


      /* CLICK */

      card.addEventListener(
        "click",
        () =>
          openMember(
            person
          )
      );


      /* ENTER / SPACE */

      card.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            openMember(
              person
            );

          }

        }
      );


      carousel.appendChild(
        card
      );

    }
  );


  showArrowsIfNeeded();

}


/* =========================================================
   OPEN MEMBER DETAIL
========================================================= */

function openMember(person) {

  const modalPhoto =
    document.getElementById(
      "modalPhoto"
    );

  const modalName =
    document.getElementById(
      "modalName"
    );

  const modalJob =
    document.getElementById(
      "modalJob"
    );

  const modalSince =
    document.getElementById(
      "modalSince"
    );

  const modalDetail =
    document.getElementById(
      "modalDetail"
    );

  const modalEmail =
    document.getElementById(
      "modalEmail"
    );


  /*
    Detail používá Photo 2.

    Pokud G není vyplněné,
    použije se Photo 1.
  */

  modalPhoto.src =
    person.photo2 ||
    person.photo1 ||
    "";

  modalPhoto.alt =
    person.fullName;


  modalName.textContent =
    person.fullName;

  modalJob.textContent =
    person.jobTitle;


  /* PHM SINCE */

  if (person.since) {

    modalSince.style.display =
      "inline-block";

    modalSince.textContent =
      `PHM SINCE ${person.since}`;

  } else {

    modalSince.style.display =
      "none";

  }


  /* DETAIL */

  modalDetail.textContent =
    person.detail || "";


  /* EMAIL */

  if (person.email) {

    modalEmail.style.display =
      "inline-block";

    modalEmail.href =
      `mailto:${person.email}`;

    modalEmail.textContent =
      person.email;

  } else {

    modalEmail.style.display =
      "none";

  }


  modal.classList.add(
    "open"
  );

  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

  modal.classList.remove(
    "open"
  );

  document.body.style.overflow =
    "";

}


modalClose.addEventListener(
  "click",
  closeModal
);


modal
  .querySelector(
    ".modal-backdrop"
  )
  .addEventListener(
    "click",
    closeModal
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      modal.classList.contains(
        "open"
      )
    ) {

      closeModal();

    }

  }
);


/* =========================================================
   CAROUSEL
========================================================= */

nextBtn.addEventListener(
  "click",
  () => {

    carousel.scrollBy({

      left:
        Math.min(
          carousel.clientWidth * 0.8,
          600
        ),

      behavior:
        "smooth"

    });

  }
);


prevBtn.addEventListener(
  "click",
  () => {

    carousel.scrollBy({

      left:
        -Math.min(
          carousel.clientWidth * 0.8,
          600
        ),

      behavior:
        "smooth"

    });

  }
);


/* =========================================================
   ARROWS
========================================================= */

function hideArrows() {

  prevBtn.style.display =
    "none";

  nextBtn.style.display =
    "none";

}


function showArrowsIfNeeded() {

  /*
    Na desktopu necháváme šipky.
    CSS je samo schová na mobilu.
  */

  prevBtn.style.display =
    "";

  nextBtn.style.display =
    "";

}


/* =========================================================
   BASIC HTML SAFETY
========================================================= */

function escapeHTML(value) {

  return String(value || "")
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   START
========================================================= */

loadTeam();
