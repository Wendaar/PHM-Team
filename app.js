const TEAM = [

  {
    id: "petr-urban",
    group: "core",
    firstName: "Petr",
    fullName: "Petr Urban",
    jobTitle: "Founder",
    photo1:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Petr_2.jpg",
    photo2:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Petr_2.jpg",
    detail:
      "Petr stojí u vzniku PHM a společně s Lukášem celý projekt dlouhodobě rozvíjí. Řeší směřování organizace, projekty, zápasy i další rozvoj PHM.",
    email: "info@phmcup.cz",
    since: "2016",
    order: 1
  },

  {
    id: "lukas-baca",
    group: "core",
    firstName: "Lukáš",
    fullName: "Lukáš Báča",
    jobTitle: "Founder",
    photo1:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Lukas_1.jpg",
    photo2:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Lukas_2.jpg",
    detail:
      "Lukáš je spolu s Petrem jedním ze zakladatelů PHM a dlouhodobě se podílí na jeho fungování, organizaci soutěží a dalším rozvoji.",
    email: "info@phmcup.cz",
    since: "2016",
    order: 2
  },

  {
    id: "nikola-sonkova",
    group: "core",
    firstName: "Nikita",
    fullName: "Nikola Šonková",
    jobTitle: "Manažer administrativy",
    photo1:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Nikita_1.jpg",
    photo2:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Nikita_1.jpg",
    detail:
      "Nikola se stará o administrativu PHM, komunikaci, podklady a každodenní organizační agendu.",
    email: "nikola@phmcup.cz",
    since: "2023",
    order: 3
  },

  {
    id: "jonas-prager",
    group: "core",
    firstName: "Jonáš",
    fullName: "Jonáš Prager",
    jobTitle: "Social media & web",
    photo1:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Jon%C3%A1%C5%A1_1.jpg",
    photo2:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Jon%C3%A1%C5%A1_2.jpg",
    detail:
      "Jonáš se věnuje obsahu PHM, sociálním sítím, videím, webu a prezentaci celé soutěže směrem ven.",
    email: "jonas@phmcup.cz",
    since: "2021",
    order: 4
  },

  {
    id: "david-sokol",
    group: "core",
    firstName: "Sokolík",
    fullName: "David Sokol",
    jobTitle: "Rules expert",
    photo1:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/David_2.jpg",
    photo2:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/David_2.jpg",
    detail:
      "David má v PHM na starosti pravidla, metodiku a situace, které vyžadují detailní znalost soutěžních pravidel.",
    email: "david@phmcup.cz",
    since: "2021",
    order: 5
  },

  {
    id: "zara",
    group: "core",
    firstName: "Zarinka",
    fullName: "Zara Pepíček",
    jobTitle: "Mascot",
    photo1:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Zara_3.jpg",
    photo2:
      "https://raw.githubusercontent.com/Wendaar/PHM-Team/refs/heads/main/Zara_3.jpg",
    detail:
      "Bez Zary se nedějou ty nejlepší věci.",
    email: "",
    since: "2020",
    order: 6
  }

];



/* =========================
   GROUP PARAMETER
========================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const group =
  params.get("group") || "core";



/* =========================
   ELEMENTS
========================= */

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



/* =========================
   FILTER + SORT
========================= */

const visibleMembers =
  TEAM
    .filter(
      person =>
        person.group === group
    )
    .sort(
      (a, b) =>
        a.order - b.order
    );



/* =========================
   CREATE CARDS
========================= */

visibleMembers.forEach(
  (person, index) => {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "member-card";

    card.innerHTML = `

      <img
        src="${person.photo1}"
        alt="${person.fullName}"
      >

      <div class="card-number">
        ${String(index + 1)
          .padStart(2, "0")}
      </div>

      <div class="card-info">

        <div class="card-firstname">
          ${person.firstName}
        </div>

        <div class="card-fullname">
          ${person.fullName}
        </div>

        <div class="card-job">
          ${person.jobTitle}
        </div>

      </div>
    `;

    card.addEventListener(
      "click",
      () =>
        openMember(
          person
        )
    );

    carousel.appendChild(
      card
    );
  }
);



/* =========================
   MODAL
========================= */

function openMember(person) {

  document.getElementById(
    "modalPhoto"
  ).src =
    person.photo2 ||
    person.photo1;

  document.getElementById(
    "modalName"
  ).textContent =
    person.fullName;

  document.getElementById(
    "modalJob"
  ).textContent =
    person.jobTitle;

  document.getElementById(
    "modalSince"
  ).textContent =
    `PHM SINCE ${person.since}`;

  document.getElementById(
    "modalDetail"
  ).textContent =
    person.detail;

  const email =
    document.getElementById(
      "modalEmail"
    );

  if (person.email) {

    email.style.display =
      "inline-block";

    email.href =
      `mailto:${person.email}`;

    email.textContent =
      person.email;

  } else {

    email.style.display =
      "none";

  }

  modal.classList.add(
    "open"
  );

  document.body.style.overflow =
    "hidden";
}



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
      event.key === "Escape"
    ) {

      closeModal();

    }

  }
);



/* =========================
   CAROUSEL ARROWS
========================= */

document
  .getElementById(
    "nextBtn"
  )
  .addEventListener(
    "click",
    () => {

      carousel.scrollBy({
        left: 520,
        behavior: "smooth"
      });

    }
  );


document
  .getElementById(
    "prevBtn"
  )
  .addEventListener(
    "click",
    () => {

      carousel.scrollBy({
        left: -520,
        behavior: "smooth"
      });

    }
  );
