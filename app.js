/* =========================================================
   PHM TEAM
   Google Sheet driven
========================================================= */

const SHEET_ID =
  "12lxrxxyCUwbbFqv93NMNqyhpOUoXbyml00mnNSKGjQ0";

const PEOPLE_GID =
  "1340186546";

/*
  Databáze týmů
*/
const TEAMS_SHEET_NAME =
  "Teams";

/*
  Teams sheet:
  A = Full team name
  R = Logo URL

  R je 18. sloupec => index 17
*/
const TEAM_NAME_COLUMN = 0;
const TEAM_LOGO_COLUMN = 17;


/* =========================================================
   URLs
========================================================= */

const PEOPLE_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&gid=${PEOPLE_GID}`;

const TEAMS_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:json&sheet=${encodeURIComponent(TEAMS_SHEET_NAME)}`;


/* =========================================================
   GROUP FROM URL
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const selectedGroup =
  (params.get("group") || "core")
    .trim()
    .toLowerCase();


/* =========================================================
   ELEMENTS
========================================================= */

const carousel =
  document.getElementById(
    "teamCarousel"
  );

const modal =
  document.getElementById(
    "memberModal"
  );

const modalClose =
  document.getElementById(
    "modalClose"
  );

const prevBtn =
  document.getElementById(
    "prevBtn"
  );

const nextBtn =
  document.getElementById(
    "nextBtn"
  );


/* =========================================================
   TEAM LOGOS CONTAINER
   Vytvoří se automaticky v detailu
========================================================= */

const modalContent =
  document.querySelector(
    ".modal-content"
  );

const modalTeams =
  document.createElement(
    "div"
  );

modalTeams.id =
  "modalTeams";

modalTeams.className =
  "modal-teams";

modalContent.appendChild(
  modalTeams
);


/* =========================================================
   GOOGLE SHEET LOADER
========================================================= */

async function loadGoogleSheet(url) {

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Google Sheet se nepodařilo načíst."
    );
  }

  const text =
    await response.text();

  const start =
    text.indexOf("{");

  const end =
    text.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1
  ) {
    throw new Error(
      "Neplatná odpověď Google Sheetu."
    );
  }

  return JSON.parse(
    text.substring(
      start,
      end + 1
    )
  );
}


/* =========================================================
   START
========================================================= */

async function loadTeam() {

  try {

    carousel.innerHTML = `
      <div class="team-loading">
        Načítám PHM Team...
      </div>
    `;


    /*
      Načteme současně:
      1) PHM team
      2) Teams
    */

    const [
      peopleData,
      teamsData
    ] = await Promise.all([

      loadGoogleSheet(
        PEOPLE_URL
      ),

      loadGoogleSheet(
        TEAMS_URL
      )

    ]);


    /* =====================================================
       TEAM LOOKUP
    ===================================================== */

    const teamLookup =
      buildTeamLookup(
        teamsData
      );


    /* =====================================================
       PEOPLE SHEET

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
       M = Teams
    ===================================================== */

    const rows =
      peopleData.table.rows || [];

    const team =
      rows.map(
        (row, index) => {

          const cells =
            row.c || [];

          return {

            id:
              getCell(
                cells,
                0
              ) ||
              `member-${index + 1}`,

            group:
              getCell(
                cells,
                1
              )
                .trim()
                .toLowerCase(),

            firstName:
              getCell(
                cells,
                2
              ),

            fullName:
              getCell(
                cells,
                3
              ),

            jobTitle:
              getCell(
                cells,
                4
              ),

            photo1:
              getCell(
                cells,
                5
              ),

            photo2:
              getCell(
                cells,
                6
              ),

            detail:
              getCell(
                cells,
                7
              ),

            email:
              getCell(
                cells,
                8
              ),

            since:
              getCell(
                cells,
                9
              ),

            order:
              Number(
                getCell(
                  cells,
                  10
                )
              ) || 999,

            active:
              parseBoolean(
                getCell(
                  cells,
                  11
                )
              ),

            /*
              M = Teams

              podporuje:
              Fanklub Lev Praha, Platidlo.com

              i:
              Fanklub Lev Praha; Platidlo.com
            */

            teams:
              splitTeams(
                getCell(
                  cells,
                  12
                )
              )

          };

        }
      );


    /* =====================================================
       FILTER + SORT
    ===================================================== */

    const visibleMembers =
      team
        .filter(
          person =>
            person.active &&
            person.group === selectedGroup &&
            person.fullName
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );


    renderTeam(
      visibleMembers,
      teamLookup
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
   TEAM DATABASE LOOKUP

   Teams:
   A = Full team name
   R = Logo URL
========================================================= */

function buildTeamLookup(data) {

  const lookup =
    new Map();

  const rows =
    data.table.rows || [];


  rows.forEach(row => {

    const cells =
      row.c || [];

    const name =
      getCell(
        cells,
        TEAM_NAME_COLUMN
      ).trim();

    const logo =
      getCell(
        cells,
        TEAM_LOGO_COLUMN
      ).trim();


    if (
      !name ||
      !logo
    ) {
      return;
    }


    lookup.set(
      normalizeText(name),
      {
        name,
        logo
      }
    );

  });


  console.log(
    "PHM teams loaded:",
    lookup
  );

  return lookup;
}


/* =========================================================
   SPLIT TEAMS
========================================================= */

function splitTeams(value) {

  if (!value) {
    return [];
  }

  return String(value)
    .split(/[;,]/)
    .map(
      team =>
        team.trim()
    )
    .filter(Boolean);
}


/* =========================================================
   NORMALIZE TEXT

   Odstraníme rozdíly v:
   - velikosti písmen
   - mezerách
   - diakritice
========================================================= */

function normalizeText(value) {

  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    );
}


/* =========================================================
   GET CELL
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
   BOOLEAN
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

let currentTeamLookup =
  new Map();


function renderTeam(
  team,
  teamLookup
) {

  currentTeamLookup =
    teamLookup;

  carousel.innerHTML =
    "";


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


      card.innerHTML = `

        <img
          src="${escapeHTML(
            person.photo1
          )}"
          alt="${escapeHTML(
            person.fullName
          )}"
          loading="lazy"
        >

        <div class="card-number">
          ${String(
            index + 1
          ).padStart(
            2,
            "0"
          )}
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


      /* klik */

      card.addEventListener(
        "click",
        () =>
          openMember(
            person
          )
      );


      /* keyboard */

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
   OPEN DETAIL
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


  /* DETAIL PHOTO */

  modalPhoto.src =
    person.photo2 ||
    person.photo1 ||
    "";

  modalPhoto.alt =
    person.fullName;


  /* TEXT */

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


  /* TEAM LOGOS */

  renderMemberTeams(
    person.teams
  );


  /* SHOW */

  modal.classList.add(
    "open"
  );

  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   MEMBER TEAM LOGOS
========================================================= */

function renderMemberTeams(teams) {

  modalTeams.innerHTML =
    "";


  /*
    Prázdné M?
    Nic nezobrazujeme.
  */

  if (
    !teams ||
    teams.length === 0
  ) {

    modalTeams.style.display =
      "none";

    return;
  }


  let foundLogos =
    0;


  teams.forEach(teamName => {

    const team =
      currentTeamLookup.get(
        normalizeText(
          teamName
        )
      );


    /*
      Pokud tým není nalezen
      v Teams!A, jen ho přeskočíme.
    */

    if (!team) {

      console.warn(
        `Team "${teamName}" nebyl nalezen v Teams sheetu.`
      );

      return;
    }


    const item =
      document.createElement(
        "div"
      );

    item.className =
      "modal-team-logo";


    /*
      Native browser tooltip
      po najetí myší
    */

    item.title =
      team.name;


    const img =
      document.createElement(
        "img"
      );

    img.src =
      team.logo;

    img.alt =
      team.name;

    img.loading =
      "lazy";


    /*
      Pokud jedno logo nefunguje,
      neshodí to celý detail.
    */

    img.addEventListener(
      "error",
      () => {

        item.remove();

      }
    );


    item.appendChild(
      img
    );

    modalTeams.appendChild(
      item
    );

    foundLogos++;

  });


  if (foundLogos === 0) {

    modalTeams.style.display =
      "none";

    return;
  }


  modalTeams.style.display =
    "flex";
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

function getCardStep() {

  const card =
    carousel.querySelector(
      ".member-card"
    );

  if (!card) {
    return 280;
  }

  const styles =
    window.getComputedStyle(
      carousel
    );

  const gap =
    parseFloat(
      styles.gap
    ) || 18;

  return (
    card.offsetWidth +
    gap
  );
}


nextBtn.addEventListener(
  "click",
  () => {

    carousel.scrollBy({
      left:
        getCardStep(),
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
        -getCardStep(),
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

  prevBtn.style.display =
    "";

  nextBtn.style.display =
    "";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(
    value || ""
  )
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
   GO
========================================================= */

loadTeam();
