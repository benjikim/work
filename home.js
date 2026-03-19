(() => {
  const mount = document.querySelector("[data-quote-form]");

  if (!mount) {
    return;
  }

  const countries = [
    "Argentina",
    "Australia",
    "Austria",
    "Bahamas",
    "Belgium",
    "Belize",
    "Brazil",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Costa Rica",
    "Croatia",
    "Czech Republic",
    "Denmark",
    "Dominican Republic",
    "Egypt",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Iceland",
    "India",
    "Indonesia",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Mexico",
    "Morocco",
    "Netherlands",
    "New Zealand",
    "Norway",
    "Peru",
    "Philippines",
    "Portugal",
    "Singapore",
    "South Africa",
    "South Korea",
    "Spain",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Turkey",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Vietnam",
  ];

  const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const state = {
    step: 1,
    expandedQuoteForm: false,
    destinationMenuOpen: false,
    destinationActiveIndex: 0,
    datePickerOpen: false,
    tripCostInfoOpen: false,
    calendarMonth: { year: 2026, month: 2 },
    tripDetails: {
      destination: "",
      departureDate: "",
      returnDate: "",
    },
    travelerInfo: {
      travelers: "1",
      age: "",
      citizenship: "United States",
      legalResidence: "United States",
      stateTerritory: "Rhode Island",
    },
    tripCost: {
      coverTripCost: true,
      totalTripCost: "",
      firstDepositDate: "",
    },
  };

  const fieldIsComplete = (value) => String(value || "").trim().length > 0;
  const comparePlansHref = () =>
    state.tripCost.coverTripCost
      ? "./compare-plans.html?tripCancellation=1"
      : "./compare-plans.html";

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromIsoDate = (value) => {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  };

  const formatDateForDisplay = (value) => {
    const date = fromIsoDate(value);
    if (!date) {
      return "";
    }

    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const travelDatesDisplay = () => {
    const { departureDate, returnDate } = state.tripDetails;
    if (!departureDate && !returnDate) {
      return "";
    }
    if (!departureDate || !returnDate) {
      return [formatDateForDisplay(departureDate), formatDateForDisplay(returnDate)]
        .filter(Boolean)
        .join(" - ");
    }
    return `${formatDateForDisplay(departureDate)} - ${formatDateForDisplay(returnDate)}`;
  };

  const inputRow = (label, value, name) => `
    <label class="imt-quote-form__label">
      <span>${label}</span>
      <input class="imt-text-input" name="${name}" value="${escapeHtml(value)}" />
    </label>
  `;

  const completeField = (label, value, name) => `
    <label class="imt-quote-form__label">
      <span>${label}</span>
      <div class="imt-input ${fieldIsComplete(value) ? "imt-input--complete" : ""}">
        ${fieldIsComplete(value) ? '<span class="imt-input__check" aria-hidden="true"></span>' : ""}
        <input class="imt-inline-input" name="${name}" value="${escapeHtml(value)}" />
        <button class="imt-input__clear" type="button" data-clear="${name}" aria-label="Clear ${label}"></button>
      </div>
    </label>
  `;

  const getCountryMatches = () => {
    const query = state.tripDetails.destination.trim().toLowerCase();
    const sortedCountries = [...countries].sort((left, right) => left.localeCompare(right));

    if (!query) {
      return sortedCountries.slice(0, 10);
    }

    const startsWithMatches = sortedCountries.filter((country) => country.toLowerCase().startsWith(query));
    const includesMatches = sortedCountries.filter(
      (country) => !country.toLowerCase().startsWith(query) && country.toLowerCase().includes(query),
    );

    return [...startsWithMatches, ...includesMatches].slice(0, 10);
  };

  const selectDestination = (destination) => {
    state.tripDetails.destination = destination;
    state.destinationMenuOpen = false;
    state.destinationActiveIndex = 0;
  };

  const destinationField = () => {
    const filteredDestinations = getCountryMatches();
    const activeIndex = Math.min(state.destinationActiveIndex, Math.max(filteredDestinations.length - 1, 0));

    return `
      <label class="imt-quote-form__label imt-quote-form__label--stacked">
        <span>Main Destination</span>
        <div class="imt-combobox ${state.destinationMenuOpen ? "is-open" : ""}">
          <div class="imt-input ${fieldIsComplete(state.tripDetails.destination) ? "imt-input--complete" : ""}">
            ${fieldIsComplete(state.tripDetails.destination) ? '<span class="imt-input__check" aria-hidden="true"></span>' : ""}
            <input
              class="imt-inline-input"
              name="destination"
              autocomplete="off"
              placeholder="Choose a country"
              value="${escapeHtml(state.tripDetails.destination)}"
              role="combobox"
              aria-expanded="${state.destinationMenuOpen}"
              aria-autocomplete="list"
              aria-controls="imt-destination-menu"
            />
            <button class="imt-input__clear" type="button" data-clear="destination" aria-label="Clear Main Destination"></button>
          </div>
          <div class="imt-combobox__menu ${state.destinationMenuOpen ? "is-visible" : ""}" id="imt-destination-menu" role="listbox">
            ${filteredDestinations.length
              ? filteredDestinations
              .map(
                (destination, index) =>
                  `<button class="imt-combobox__option ${index === activeIndex ? "is-active" : ""}" type="button" role="option" aria-selected="${index === activeIndex}" data-destination-option="${escapeHtml(destination)}">${destination}</button>`,
              )
              .join("")
              : '<div class="imt-combobox__option" aria-disabled="true">No matching countries</div>'}
          </div>
        </div>
      </label>
    `;
  };

  const destinationIsUnitedStates = () =>
    state.tripDetails.destination.trim().toLowerCase() === "united states";

  const compareIsoDates = (a, b) => {
    if (!a || !b) {
      return 0;
    }
    return a.localeCompare(b);
  };

  const buildMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const gridStart = new Date(year, month, 1 - startDay);
    const days = [];

    for (let index = 0; index < 35; index += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      days.push({
        iso: toIsoDate(date),
        day: date.getDate(),
        outsideMonth: date.getMonth() !== month,
      });
    }

    return days;
  };

  const nextMonth = ({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  const prevMonth = ({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });

  const calendarMonthMarkup = (year, month, side) => {
    const days = buildMonthDays(year, month);
    const departure = state.tripDetails.departureDate;
    const returnDate = state.tripDetails.returnDate;

    return `
      <div class="imt-calendar__month ${side === "right" ? "imt-calendar__month--right" : ""}">
        <div class="imt-calendar__month-header">
          ${side === "left" ? '<button class="imt-calendar__nav" type="button" data-calendar-nav="prev" aria-label="Previous month">&#8249;</button>' : '<span class="imt-calendar__nav-spacer"></span>'}
          <div class="imt-calendar__title">${monthLabels[month]} <span>${year}</span></div>
          ${side === "right" ? '<button class="imt-calendar__nav" type="button" data-calendar-nav="next" aria-label="Next month">&#8250;</button>' : '<span class="imt-calendar__nav-spacer"></span>'}
        </div>
        <div class="imt-calendar__weekdays">
          ${weekdayLabels.map((label) => `<span>${label}</span>`).join("")}
        </div>
        <div class="imt-calendar__days">
          ${days
            .map((day) => {
              const isDeparture = departure === day.iso;
              const isReturn = returnDate === day.iso;
              const inRange =
                departure &&
                returnDate &&
                compareIsoDates(day.iso, departure) >= 0 &&
                compareIsoDates(day.iso, returnDate) <= 0;
              const classNames = [
                "imt-calendar__day",
                day.outsideMonth ? "is-outside" : "",
                inRange ? "is-in-range" : "",
                isDeparture ? "is-start" : "",
                isReturn ? "is-end" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return `<button class="${classNames}" type="button" data-calendar-date="${day.iso}">${day.day}</button>`;
            })
            .join("")}
        </div>
      </div>
    `;
  };

  const travelDatesField = () => {
    const leftMonth = state.calendarMonth;
    const rightMonth = nextMonth(leftMonth);

    return `
      <label class="imt-quote-form__label imt-quote-form__label--stacked">
        <span>Travel Dates</span>
        <div class="imt-date-field ${state.datePickerOpen ? "is-open" : ""}">
          <button class="imt-input imt-date-field__trigger ${fieldIsComplete(travelDatesDisplay()) ? "imt-input--complete" : ""}" type="button" data-date-trigger="true">
            ${fieldIsComplete(travelDatesDisplay()) ? '<span class="imt-input__check" aria-hidden="true"></span>' : ""}
            <span class="imt-date-field__value ${fieldIsComplete(travelDatesDisplay()) ? "" : "is-placeholder"}">
              ${travelDatesDisplay() || "Select departure and return dates"}
            </span>
            <span class="imt-date-field__icon" aria-hidden="true"></span>
          </button>
          <div class="imt-date-field__panel ${state.datePickerOpen ? "is-visible" : ""}">
            <div class="imt-calendar">
              ${calendarMonthMarkup(leftMonth.year, leftMonth.month, "left")}
              ${calendarMonthMarkup(rightMonth.year, rightMonth.month, "right")}
            </div>
          </div>
        </div>
      </label>
    `;
  };

  const stepHeader = () => {
    const labels = [
      "Step 1: Trip Details",
      "Step 2: Traveler Information",
      "Step 3: Trip Cost Coverage",
    ];

    return `
      <div class="imt-quote-card__header">
        ${labels
          .map((label, index) => {
            const stepNumber = index + 1;
            const status =
              state.step === stepNumber
                ? "is-current"
                : state.step > stepNumber
                  ? "is-complete"
                  : "is-upcoming";
            const text = state.step === stepNumber ? label : `Step ${stepNumber}`;
            const marker =
              state.step > stepNumber
                ? '<span class="imt-step__check" aria-hidden="true"></span>'
                : "";

            return `<button class="imt-step ${status}" type="button" data-step="${stepNumber}">${marker}<span>${text}</span></button>`;
          })
          .join("")}
      </div>
    `;
  };

  const citizenshipFields = () => `
    <div class="imt-full-quote__section">
      ${completeField("Country of Citizenship:", state.travelerInfo.citizenship, "citizenship")}
      <div class="imt-quote-form__row">
        ${completeField("Country of legal residence:", state.travelerInfo.legalResidence, "legalResidence")}
        ${completeField("State of legal residence:", state.travelerInfo.stateTerritory, "stateTerritory")}
      </div>
    </div>
  `;

  const stepOne = () => `
    <div class="imt-quote-form">
      ${destinationField()}
      ${travelDatesField()}
      <button class="imt-next-button" type="button" data-next-step="2">Next Step</button>
    </div>
  `;

  const expandedQuoteForm = () => `
    <div class="imt-full-quote">
      <div class="imt-full-quote__section">
        ${destinationField()}
        ${destinationIsUnitedStates() ? `
          <div class="imt-quote-form__row">
            <div></div>
            ${inputRow("Visiting U.S. State", "", "visitingUsState")}
          </div>
        ` : ""}
      </div>
      <div class="imt-full-quote__section">
        ${travelDatesField()}
      </div>
      <div class="imt-full-quote__section">
        <div class="imt-quote-form__row imt-quote-form__row--compact">
          <label class="imt-quote-form__label imt-quote-form__label--short">
            <span>How many travelers?</span>
            <select class="imt-select-input" name="travelers">
              ${["1", "2", "3", "4", "5+"]
                .map((value) => `<option value="${value}" ${state.travelerInfo.travelers === value ? "selected" : ""}>${value}</option>`)
                .join("")}
            </select>
          </label>
          ${inputRow("Age", state.travelerInfo.age, "age")}
        </div>
      </div>
      ${citizenshipFields()}
      <div class="imt-full-quote__section imt-full-quote__section--trip-cost">
        <label class="imt-check-row imt-check-row--inline">
          <input type="checkbox" name="coverTripCost" ${state.tripCost.coverTripCost ? "checked" : ""} />
          <span class="imt-checkmark"></span>
          <span>
            <strong>Include Trip Cancellation Coverage</strong>; reimburses trip costs if you cancel for a covered reason.
            <button class="imt-inline-link" type="button" data-open-trip-cost-info="true">Learn More</button>
          </span>
        </label>
        ${state.tripCost.coverTripCost ? `
          <div class="imt-quote-form__row">
            ${completeField("Total Trip Cost", state.tripCost.totalTripCost, "totalTripCost")}
            ${completeField("First Deposit Date", state.tripCost.firstDepositDate, "firstDepositDate")}
          </div>
        ` : ""}
      </div>
      <a class="imt-submit-button imt-submit-button--wide" href="${comparePlansHref()}">See Plans & Prices</a>
      ${state.tripCostInfoOpen ? `
        <div class="imt-info-modal" role="dialog" aria-modal="true" aria-labelledby="imt-trip-cost-info-title">
          <div class="imt-info-modal__backdrop" data-close-trip-cost-info="true"></div>
          <div class="imt-info-modal__panel">
            <button class="imt-info-modal__close" type="button" data-close-trip-cost-info="true" aria-label="Close">Close</button>
            <h3 id="imt-trip-cost-info-title">Trip Cost and First Deposit Date</h3>
            <p><strong>Total Trip Cost:</strong> Add up any prepaid, non-refundable trip expenses such as flights, hotels, cruises, rental cars, tickets, and excursions.</p>
            <p><strong>First Deposit Date:</strong> Enter the date of your first trip-related payment. This could be when you paid for a flight, hotel, or activity. If you have not yet made a trip payment, just enter today’s date.</p>
          </div>
        </div>
      ` : ""}
    </div>
  `;

  const stepTwo = () => `
    <div class="imt-quote-form">
      <div class="imt-quote-form__row imt-quote-form__row--compact">
        <label class="imt-quote-form__label imt-quote-form__label--short">
          <span>Number of Travelers</span>
          <select class="imt-select-input" name="travelers">
            ${["1", "2", "3", "4", "5+"]
              .map((value) => `<option value="${value}" ${state.travelerInfo.travelers === value ? "selected" : ""}>${value}</option>`)
              .join("")}
          </select>
        </label>
        ${inputRow("Age", state.travelerInfo.age, "age")}
      </div>
      ${completeField("Citizenship", state.travelerInfo.citizenship, "citizenship")}
      <div class="imt-quote-form__row">
        ${completeField("Legal Residence", state.travelerInfo.legalResidence, "legalResidence")}
        ${completeField("State or Territory", state.travelerInfo.stateTerritory, "stateTerritory")}
      </div>
      <button class="imt-next-button" type="button" data-next-step="3">Next Step</button>
    </div>
  `;

  const stepThree = () => `
    <div class="imt-quote-form">
      <label class="imt-check-row imt-check-row--inline">
        <input type="checkbox" name="coverTripCost" ${state.tripCost.coverTripCost ? "checked" : ""} />
        <span class="imt-checkmark"></span>
        <span>
          <strong>Include Trip Cancellation Coverage</strong>; reimburses trip costs if you cancel for a covered
          reason. <button class="imt-inline-link" type="button" data-open-trip-cost-info="true">Learn More</button>
        </span>
      </label>
      ${state.tripCost.coverTripCost ? `
        <div class="imt-quote-form__row">
          ${completeField("Total Trip Cost", state.tripCost.totalTripCost, "totalTripCost")}
          ${completeField("First Deposit Date", state.tripCost.firstDepositDate, "firstDepositDate")}
        </div>
      ` : ""}
      <a class="imt-submit-button" href="${comparePlansHref()}">See Plans And Prices</a>
      ${state.tripCostInfoOpen ? `
        <div class="imt-info-modal" role="dialog" aria-modal="true" aria-labelledby="imt-trip-cost-info-title">
          <div class="imt-info-modal__backdrop" data-close-trip-cost-info="true"></div>
          <div class="imt-info-modal__panel">
            <button class="imt-info-modal__close" type="button" data-close-trip-cost-info="true" aria-label="Close">Close</button>
            <h3 id="imt-trip-cost-info-title">Trip Cost and First Deposit Date</h3>
            <p><strong>Total Trip Cost:</strong> Add up any prepaid, non-refundable trip expenses such as flights, hotels, cruises, rental cars, tickets, and excursions.</p>
            <p><strong>First Deposit Date:</strong> Enter the date of your first trip-related payment. This could be when you paid for a flight, hotel, or activity. If you have not yet made a trip payment, just enter today’s date.</p>
          </div>
        </div>
      ` : ""}
    </div>
  `;

  const render = () => {
    mount.innerHTML = `
      <button class="imt-quote-card__title" type="button" data-toggle-quote-form="true">
        ${state.expandedQuoteForm ? "Let's Find The Right Plan For You" : "Get Your Travel Insurance Quote"}
      </button>
      ${state.expandedQuoteForm ? expandedQuoteForm() : `
        ${stepHeader()}
        ${state.step === 1 ? stepOne() : ""}
        ${state.step === 2 ? stepTwo() : ""}
        ${state.step === 3 ? stepThree() : ""}
      `}
    `;

    bindEvents();
  };

  const updateField = (name, value) => {
    if (name in state.tripDetails) {
      state.tripDetails[name] = value;
    } else if (name in state.travelerInfo) {
      state.travelerInfo[name] = value;
    } else if (name in state.tripCost) {
      state.tripCost[name] = value;
    }
  };

  const selectCalendarDate = (iso) => {
    const { departureDate, returnDate } = state.tripDetails;

    if (!departureDate || (departureDate && returnDate)) {
      state.tripDetails.departureDate = iso;
      state.tripDetails.returnDate = "";
      return;
    }

    if (compareIsoDates(iso, departureDate) < 0) {
      state.tripDetails.departureDate = iso;
      state.tripDetails.returnDate = "";
      return;
    }

    state.tripDetails.returnDate = iso;
    state.datePickerOpen = false;
  };

  const bindEvents = () => {
    mount.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    mount.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextStep = Number(button.getAttribute("data-step"));
        if (nextStep <= state.step) {
          state.step = nextStep;
          state.destinationMenuOpen = false;
          state.datePickerOpen = false;
          render();
        }
      });
    });

    mount.querySelectorAll("[data-toggle-quote-form]").forEach((button) => {
      button.addEventListener("click", () => {
        state.expandedQuoteForm = !state.expandedQuoteForm;
        state.destinationMenuOpen = false;
        state.datePickerOpen = false;
        state.tripCostInfoOpen = false;
        render();
      });
    });

    mount.querySelectorAll("[data-next-step]").forEach((button) => {
      button.addEventListener("click", () => {
        state.step = Number(button.getAttribute("data-next-step"));
        state.destinationMenuOpen = false;
        state.datePickerOpen = false;
        state.tripCostInfoOpen = false;
        render();
      });
    });

    mount.querySelectorAll(".imt-inline-input, .imt-text-input, .imt-select-input").forEach((input) => {
      input.addEventListener("input", () => {
        updateField(input.name, input.value);
        if (input.name === "destination") {
          state.destinationMenuOpen = true;
          state.destinationActiveIndex = 0;
        }
        render();
      });

      input.addEventListener("change", () => {
        updateField(input.name, input.value);
        render();
      });

      if (input.name === "destination") {
        input.addEventListener("focus", () => {
          state.destinationMenuOpen = true;
          state.destinationActiveIndex = 0;
          render();
        });

        input.addEventListener("keydown", (event) => {
          const matches = getCountryMatches();
          if (!matches.length) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            state.destinationMenuOpen = true;
            state.destinationActiveIndex = (state.destinationActiveIndex + 1) % matches.length;
            render();
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            state.destinationMenuOpen = true;
            state.destinationActiveIndex = (state.destinationActiveIndex - 1 + matches.length) % matches.length;
            render();
            return;
          }

          if (event.key === "Enter" && state.destinationMenuOpen) {
            event.preventDefault();
            selectDestination(matches[Math.min(state.destinationActiveIndex, matches.length - 1)]);
            render();
            return;
          }

          if (event.key === "Escape") {
            state.destinationMenuOpen = false;
            render();
          }
        });

        input.addEventListener("blur", () => {
          state.destinationActiveIndex = 0;
          render();
        });
      }
    });

    mount.querySelectorAll("[data-clear]").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.getAttribute("data-clear");
        updateField(name, "");
        if (name === "destination") {
          state.destinationMenuOpen = true;
          state.destinationActiveIndex = 0;
        }
        render();
      });
    });

    mount.querySelectorAll("[data-destination-option]").forEach((button) => {
      button.addEventListener("click", () => {
        selectDestination(button.getAttribute("data-destination-option") || "");
        render();
      });
    });

    const dateTrigger = mount.querySelector("[data-date-trigger]");
    if (dateTrigger) {
      dateTrigger.addEventListener("click", () => {
        state.datePickerOpen = !state.datePickerOpen;
        state.destinationMenuOpen = false;
        render();
      });
    }

    mount.querySelectorAll("[data-calendar-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        state.calendarMonth =
          button.getAttribute("data-calendar-nav") === "prev"
            ? prevMonth(state.calendarMonth)
            : nextMonth(state.calendarMonth);
        render();
      });
    });

    mount.querySelectorAll("[data-calendar-date]").forEach((button) => {
      button.addEventListener("click", () => {
        selectCalendarDate(button.getAttribute("data-calendar-date") || "");
        render();
      });
    });

    const checkbox = mount.querySelector('input[name="coverTripCost"]');
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        state.tripCost.coverTripCost = checkbox.checked;
        render();
      });
    }

    mount.querySelectorAll("[data-open-trip-cost-info]").forEach((button) => {
      button.addEventListener("click", () => {
        state.tripCostInfoOpen = true;
        render();
      });
    });

    mount.querySelectorAll("[data-close-trip-cost-info]").forEach((button) => {
      button.addEventListener("click", () => {
        state.tripCostInfoOpen = false;
        render();
      });
    });
  };

  document.addEventListener("click", (event) => {
    if (!mount.contains(event.target)) {
      if (state.destinationMenuOpen || state.datePickerOpen) {
        state.destinationMenuOpen = false;
        state.datePickerOpen = false;
        render();
      }
    }
  });

  render();
})();
