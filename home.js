(() => {
  const mount = document.querySelector("[data-quote-form]");

  if (!mount) {
    return;
  }

  const state = {
    step: 1,
    tripDetails: {
      destination: "Italy",
      travelDates: "01/12/2026 - 02/12/2026",
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
      totalTripCost: "$12,000",
      firstDepositDate: "Users entered text",
    },
  };

  const fieldIsComplete = (value) => String(value || "").trim().length > 0;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

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
        <span class="imt-input__check" aria-hidden="true"></span>
        <input class="imt-inline-input" name="${name}" value="${escapeHtml(value)}" />
        <button class="imt-input__clear" type="button" data-clear="${name}" aria-label="Clear ${label}"></button>
      </div>
    </label>
  `;

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
            const text =
              state.step === stepNumber
                ? label
                : `Step ${stepNumber}`;
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

  const stepOne = () => `
    <div class="imt-quote-form">
      ${completeField("Main Destination", state.tripDetails.destination, "destination")}
      ${completeField("Travel Dates", state.tripDetails.travelDates, "travelDates")}
      <button class="imt-next-button" type="button" data-next-step="2">Next Step</button>
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
      <label class="imt-checkbox-row">
        <input type="checkbox" name="coverTripCost" ${state.tripCost.coverTripCost ? "checked" : ""} />
        <span>Yes, cover the cost of my trip</span>
      </label>
      <p class="imt-quote-form__help">
        Trip cancellation coverage reimburses trip costs if you cancel for a covered reason.
        <a href="./compare-plans.html">Learn More</a>
      </p>
      <div class="imt-quote-form__row">
        ${completeField("Total Trip Cost", state.tripCost.totalTripCost, "totalTripCost")}
        ${completeField("First Deposit Date", state.tripCost.firstDepositDate, "firstDepositDate")}
      </div>
      <a class="imt-submit-button" href="./compare-plans.html">See Plans And Prices</a>
    </div>
  `;

  const render = () => {
    mount.innerHTML = `
      <h2>Get Your Travel Insurance Quote</h2>
      ${stepHeader()}
      ${state.step === 1 ? stepOne() : ""}
      ${state.step === 2 ? stepTwo() : ""}
      ${state.step === 3 ? stepThree() : ""}
    `;

    bindEvents();
  };

  const bindEvents = () => {
    mount.querySelectorAll("[data-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextStep = Number(button.getAttribute("data-step"));
        if (nextStep <= state.step) {
          state.step = nextStep;
          render();
        }
      });
    });

    mount.querySelectorAll("[data-next-step]").forEach((button) => {
      button.addEventListener("click", () => {
        state.step = Number(button.getAttribute("data-next-step"));
        render();
      });
    });

    mount.querySelectorAll(".imt-inline-input, .imt-text-input, .imt-select-input").forEach((input) => {
      input.addEventListener("input", () => {
        const { name, value } = input;
        if (name in state.tripDetails) {
          state.tripDetails[name] = value;
        } else if (name in state.travelerInfo) {
          state.travelerInfo[name] = value;
        } else if (name in state.tripCost) {
          state.tripCost[name] = value;
        }
        render();
      });

      input.addEventListener("change", () => {
        const { name, value } = input;
        if (name in state.tripDetails) {
          state.tripDetails[name] = value;
        } else if (name in state.travelerInfo) {
          state.travelerInfo[name] = value;
        } else if (name in state.tripCost) {
          state.tripCost[name] = value;
        }
        render();
      });
    });

    mount.querySelectorAll("[data-clear]").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.getAttribute("data-clear");
        if (name in state.tripDetails) {
          state.tripDetails[name] = "";
        } else if (name in state.travelerInfo) {
          state.travelerInfo[name] = "";
        } else if (name in state.tripCost) {
          state.tripCost[name] = "";
        }
        render();
      });
    });

    const checkbox = mount.querySelector('input[name="coverTripCost"]');
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        state.tripCost.coverTripCost = checkbox.checked;
      });
    }
  };

  render();
})();
