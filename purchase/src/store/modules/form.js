import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { defineStore } from 'pinia';
import { event } from 'vue-gtag';
import { useApiStore } from './api';
import { DATE_FORMAT } from 'src/config/index.js';
import { SESSION_STORAGE_KEYS } from '../../config';

dayjs.extend(customParseFormat);

export const useFormStore = defineStore('form-store', {
  state: () => {
    return {
      travelers: [
        {
          primary: true,
          firstName: null,
          lastName: null,
          middleInitial: null,
          suffix: null,
          age: null,
          DOB: null,
          passportNumber: null,
          passportCountry: null,
          passportInfoKnown: false,
          ageChanged: false,
        },
      ],
      residence: {
        address: null,
        addressSecondary: null,
        city: null,
        country: null,
        state: null,
        zip: null,
        citizenship: null,
      },
      contact: {
        email: null,
        phoneNumber: null,
      },
      requirePassportInfo: false,
      termsOfServiceAgreed: false,
      userAgreementSelection: false,
      marketingOptIn: false,
      payment: {
        name: null,
        number: null,
        expiry: null,
        cvv: null,
      },
      isPaymentEntered: false,
      billing: {
        address: null,
        addressSecondary: null,
        city: null,
        state: null,
        country: null,
        zip: null,
      },
      travelSupplier: {
        airline: null,
        cruiseLine: null,
        tourOperator: null,
      },
      clickthroughs: [],
      trip: {
        tripCost: null,
        initialTripPayment: null,
        finalTripPayment: null,
        tripDetailsChanged: false,
        schoolName: null,
        destination: null,
      },
      requiredInputsState: {},
      formIsValid: false,
      acceptedPaymentMethods: {
        creditCard: [],
      },
      formSectionCompleted: {
        travelers: false,
        passport: false,
        payment: false,
        billing: false,
        termsOfService: false,
        tripDetails: false,
      },
      captchaIsValid: false,
      showCaptcha: true,
      captchaToken: '',
      resetCaptchaFlag: false,
    };
  },

  getters: {
    getTravelerFirstName() {
      return (index) => this.travelers[index].firstName ?? null;
    },
    getTravelerLastName() {
      return (index) => this.travelers[index].lastName ?? null;
    },
    getAgeChangedStatus() {
      return (index) => this.travelers[index].ageChanged;
    },
    getTravelerAge() {
      return (index) => this.travelers[index].age ?? null;
    },
    getTravelerDob() {
      return (index) => this.travelers[index].DOB ?? null;
    },
    getTravelerMiddleInitial() {
      return (index) => this.travelers[index].middleInitial ?? null;
    },
    getTravelers() {
      return this.travelers;
    },
    getResidenceAddress() {
      return this.residence.address;
    },
    getResidenceAddressSecondary() {
      return this.residence.addressSecondary;
    },
    getResidenceCity() {
      return this.residence.city;
    },
    getResidenceState() {
      return this.residence.state;
    },
    getResidenceZip() {
      return this.residence.zip;
    },
    getResidenceCountry() {
      return this.residence.country;
    },
    getResidenceCitizenship() {
      return this.residence.citizenship;
    },

    /**
     * Utility getter to grab the state for
     * any parent that has state as a property
     *
     * @returns {String|null}
     */
    getState() {
      return (type) => this[type].state ?? null;
    },

    /**
     * Utility getter to grab the country for
     * any parent that has state as a property
     *
     * @returns {String|null}
     */
    getCountry() {
      return (type) => this[type].country ?? null;
    },

    getEmailAddress() {
      return this.contact.email;
    },
    getPhoneNumber() {
      return this.contact.phoneNumber;
    },
    getPassportCountry() {
      return (index) => this.travelers[index].passportCountry;
    },
    getPassportNumber() {
      return (index) => this.travelers[index].passportNumber;
    },
    getPassportCheckbox() {
      return (index) => this.travelers[index].passportInfoKnown;
    },
    getIfPassportInfoRequired() {
      return this.requirePassportInfo;
    },
    getNumberOfTravelers() {
      return this.travelers.length;
    },
    getTermsOfServiceAgreed() {
      return this.termsOfServiceAgreed;
    },
    getUserAgreementSelection() {
      return this.userAgreementSelection;
    },
    getMarketingOptIn() {
      return this.marketingOptIn;
    },
    getAirline() {
      return this.travelSupplier.airline;
    },
    getCruiseLine() {
      return this.travelSupplier.cruiseLine;
    },
    getTourOperator() {
      return this.travelSupplier.tourOperator;
    },
    getTripCost() {
      return this.trip.tripCost;
    },
    getSchoolName() {
      return this.trip.schoolName;
    },
    getInitialTripPaymentDate() {
      return this.trip.initialTripPayment;
    },
    getPaymentName() {
      return this.payment.name;
    },
    checkIfPaymentEntered() {
      return Object.values(this.payment).every((value) => value != null);
    },
    getAddress() {
      return (type) => this[type].address ?? '';
    },
    getAddressSecondary() {
      return (type) => this[type].addressSecondary ?? '';
    },
    getCity() {
      return (type) => this[type].city ?? '';
    },
    getZip() {
      return (type) => this[type].zip ?? '';
    },
    getClickthroughValue() {
      return (id) => {
        const index = this.clickthroughs.findIndex((ele) => ele.id === id);
        if (index !== -1) {
          return this.clickthroughs[index].value;
        } else {
          return null;
        }
      };
    },

    /**
     * Return list of allowed CC payment types
     *
     * @see contentStore.payment.creditCard
     * @returns {Array}
     */
    getAcceptedCreditCards() {
      return this.acceptedPaymentMethods.creditCard;
    },

    /**
     * Get the form validation status
     *
     * @returns {Boolean}
     */
    getFormValidationStatus() {
      return (
        this.formIsValid &&
        this.termsOfServiceAgreed &&
        this.userAgreementSelection
      );
    },

    /**
     * Gets the status of a form section.
     *
     * @param {String} key
     * @returns Boolean
     */
    getFormSectionCompleted() {
      return (key) => this.formSectionCompleted[key] ?? false;
    },

    /**
     * Get captcha display status
     *
     * @returns {Boolean}
     */
    getShowCaptcha() {
      return this.showCaptcha;
    },
    getCaptchaToken() {
      return this.captchaToken;
    },
    getResetCaptchaFlag() {
      return this.resetCaptchaFlag;
    },
  },

  actions: {
    hasNullProperties(section, propertiesToIgnore = [], key = null) {
      const properties = key !== null ? this[section][key] : this[section];

      for (const property in properties) {
        if (
          properties[property] === null &&
          !propertiesToIgnore.includes(property)
        ) {
          return true;
        }
      }

      return false;
    },

    /**
     * Create state object to track required fields status
     *
     * @param {Array} inputs
     */
    initRequiredInputsState(inputs) {
      inputs.forEach((key) => {
        // Check if the input has already been set.
        // This action is triggered every time the app
        // calls a `GET` on the order. We don't want to
        // invalidate already captured data.
        if (!(key in this.requiredInputsState)) {
          this.requiredInputsState[key] = false;
        }
      });
    },

    /**
     * Remove entries from required inputs state
     *
     * @param {Array} inputs
     */
    removeRequiredInputs(inputs) {
      inputs.forEach((key) => {
        delete this.requiredInputsState[key];
      });
    },

    /**
     * Track the state of required inputs
     *
     * @param {String} key Key of required input
     * @param {Mixed} value Value being saved to state
     */
    setRequiredInputItemStatus(key, value) {
      // Check if this field is required by the API.
      // If not, hard pass.
      if (!(key in this.requiredInputsState)) {
        return;
      }

      this.requiredInputsState[key] = value !== null;
      this.formIsValid = !Object.values(this.requiredInputsState).some(
        (value) => value === false
      );
    },

    isSectionComplete(section) {
      let sectionCompleted = true;
      const apiStore = useApiStore();
      const requiredFields = apiStore.getOrderDisplayFields;

      switch (section) {
        case 'travelers':
          for (const key in this.travelers) {
            if (
              this.hasNullProperties('residence', ['addressSecondary']) ||
              this.hasNullProperties(
                'travelers',
                [
                  'middleInitial',
                  'suffix',
                  'passportNumber',
                  'passportCountry',
                ],
                key
              ) ||
              this.contact.email === null ||
              this.contact.phoneNumber === null
            ) {
              sectionCompleted = false;
            }
          }
          return sectionCompleted;
        case 'passport':
          for (const key in this.travelers) {
            if (
              (this.travelers[key].passportNumber === null ||
                this.travelers[key].passportCountry === null) &&
              this.travelers[key].passportInfoKnown === false
            ) {
              sectionCompleted = false;
            }
          }
          return sectionCompleted;
        case 'termsOfService':
          if (this.termsOfServiceAgreed === true) {
            return true;
          }
          return false;
        case 'billing':
          return !this.hasNullProperties('billing', ['addressSecondary']);
        case 'tripDetails':
          if (
            (!requiredFields['trip.firstTripPayment'] ||
              this.trip.initialTripPayment !== null) &&
            (!requiredFields['trip.finalTripPayment'] ||
              this.trip.finalTripPayment !== null) &&
            (!requiredFields['trip.school'] || this.trip.schoolName !== null)
          ) {
            return true;
          }
          return false;
        default:
          return !this.hasNullProperties(section);
      }
    },
    /**
     * Add an additional traveler by age
     *
     * @param {Number} age Traveler age
     * @param {Number} index Traveler position in travelers
     */
    addAdditionalTraveler(age, index = null) {
      if (index && !this.travelers[index]) {
        this.travelers.push({
          primary: false,
          firstName: null,
          lastName: null,
          middleInitial: null,
          suffix: null,
          age: age,
          DOB: null,
          passportNumber: null,
          passportCountry: null,
          passportInfoKnown: false,
          ageChanged: false,
        });
      }
    },

    /**
     * Set the traveler name to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any firstname-like input
     *
     * @param {String} value Entered value
     * @param {Integer} index Traveler position
     */
    setTravelerFirstName(value, index) {
      const apiStore = useApiStore();
      this.travelers[index].firstName = value;
      this.setRequiredInputItemStatus(`travelers.${index}.name.first`, value);
      apiStore.requestPayloads.inputs.travelers[index].name.first = value;
    },

    /**
     * Set the traveler last name to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any lastname-like input
     *
     * @param {String} value Entered value
     * @param {Integer} index Traveler position
     */
    setTravelerLastName(value, index) {
      const apiStore = useApiStore();
      this.travelers[index].lastName = value;
      this.setRequiredInputItemStatus(`travelers.${index}.name.last`, value);
      apiStore.requestPayloads.inputs.travelers[index].name.last = value;
    },

    /**
     * Set the traveler middle name to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any middle initial-like input
     *
     * @param {String} value Entered value
     * @param {Integer} index Traveler position
     */
    setTravelerMiddleInitial(value, index) {
      const apiStore = useApiStore();
      this.travelers[index].middleInitial = value;
      this.setRequiredInputItemStatus(`travelers.${index}.name.middle`, value);
      apiStore.requestPayloads.inputs.travelers[index].name.middle = value;
    },

    /**
     * Set the traveler suffix to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any suffix-like input
     *
     * @param {String} value Entered value
     * @param {Integer} index Traveler position
     */
    setTravelerSuffix(value, index) {
      const apiStore = useApiStore();
      this.travelers[index].suffix = value;
      this.setRequiredInputItemStatus(`travelers.${index}.name.suffix`, value);
      apiStore.requestPayloads.inputs.travelers[index].name.suffix = value;
    },

    setTravelerAge(age, index) {
      this.travelers[index].age = age;
    },
    setAgeChanged(val, index) {
      this.travelers[index].ageChanged = val;
    },
    setTripDetailsChanged(value) {
      this.trip.tripDetailsChanged = value;
    },
    /**
     * Set the traveler DOB to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any dob-like input
     *
     * @param {String} value DOB in MM/DD/YYYY format
     * @param {Integer} index Traveler position
     */
    setTravelerDOB(value, index) {
      const apiStore = useApiStore();
      this.travelers[index].DOB = value;
      this.setRequiredInputItemStatus(`travelers.${index}.dob`, value);
      apiStore.requestPayloads.inputs.travelers[index].dob = dayjs(
        value
      ).format(DATE_FORMAT.API);

      const DOBAge = dayjs().diff(value, 'year');

      if (
        value &&
        (this.travelers[index].age !== DOBAge ||
          this.travelers[index].age === 0)
      ) {
        this.setTravelerAge(DOBAge, index);
        this.setAgeChanged(true, index);
      } else if (value) {
        // Rerun our apis here. We need to see if LTC get triggered or not.
        apiStore.addProductInputsToProduct();
      }
    },

    /**
     * Set the address to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any address-like input
     *
     * @param {String} key Data key
     * @param {String} address Entered address
     */
    setAddress(key, address) {
      const apiStore = useApiStore();
      this[key].address = address;
      this.setRequiredInputItemStatus(`${key}.street`, address);

      if (key === 'billing') {
        apiStore.requestPayloads.payment.details.billingAddress.street1 =
          address;
      } else if (key === 'residence') {
        apiStore.requestPayloads.inputs.residence.street = address;
      }
    },

    /**
     * Set the secondary address to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any address-like input
     *
     * @param {String} key Data key
     * @param {String} address Entered address
     */
    setAddressSecondary(key, address) {
      const apiStore = useApiStore();
      this[key].addressSecondary = address;
      this.setRequiredInputItemStatus(`${key}.street2`, address);

      if (key === 'billing') {
        apiStore.requestPayloads.payment.details.billingAddress.street2 =
          address;
      } else if (key === 'residence') {
        apiStore.requestPayloads.inputs.residence.street2 = address;
      }
    },

    /**
     * Set the city code to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any city-like input
     *
     * @param {String} key Data key
     * @param {String} code Two-letter state/province code
     */
    setCity(key, city) {
      const apiStore = useApiStore();
      this[key].city = city;
      this.setRequiredInputItemStatus(`${key}.city`, city);

      if (key === 'billing') {
        apiStore.requestPayloads.payment.details.billingAddress.city = city;
      } else if (key === 'residence') {
        apiStore.requestPayloads.inputs.residence.city = city;
      }
    },

    /**
     * Set the state/province code to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any state-like input
     *
     * @param {String} key Data key
     * @param {String} code Two-letter state/province code
     */
    setState(key, code) {
      const apiStore = useApiStore();
      const initialState = this[key].state;
      this[key].state = code;
      this.setRequiredInputItemStatus(`${key}.stateProvince`, code);

      if (key === 'billing') {
        apiStore.requestPayloads.payment.details.billingAddress.stateProvince =
          code;
        if (initialState && initialState !== '' && initialState !== code) {
          this[key].city = '';
          this[key].zip = '';
        }
      } else if (key === 'residence') {
        apiStore.requestPayloads.inputs.residence.stateProvince = code;
      }
    },

    /**
     * Set the zip/postal to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any zip-like input
     *
     * @param {String} key Data key
     * @param {String} code Zip/postal code
     */
    setZip(key, code) {
      const apiStore = useApiStore();
      this[key].zip = code;
      this.setRequiredInputItemStatus(`${key}.postalCode`, code);

      if (key === 'billing') {
        apiStore.requestPayloads.payment.details.billingAddress.postalCode =
          code;
      } else if (key === 'residence') {
        apiStore.requestPayloads.inputs.residence.postalCode = code;
      }
    },

    /**
     * Set the country to provided property form data and
     * API request payload data. This is a multi-use action
     * that can be used for any country-like input
     *
     * @param {String} key Data key
     * @param {String} code Three-letter country code
     */
    setCountry(key, code) {
      const apiStore = useApiStore();
      this[key].country = code;
      this.setRequiredInputItemStatus(`${key}.country`, code);

      if (key === 'billing') {
        apiStore.requestPayloads.payment.details.billingAddress.country = code;
      } else if (key === 'residence') {
        apiStore.requestPayloads.inputs.residence.country = code;
      }
    },

    /**
     * Set the contact email to form data and
     * API request payload data
     *
     * @param {String} email Entered email
     */
    setEmailAddress(email) {
      const apiStore = useApiStore();
      this.contact.email = email;
      this.setRequiredInputItemStatus('contact.email', email);
      apiStore.requestPayloads.inputs.contact.email = email;
    },

    /**
     * Set the residence citizenship country
     *
     * @param {String} citizenship
     */
    setResidenceCitizenship(citizenship) {
      const apiStore = useApiStore();
      this.setRequiredInputItemStatus('residence.citizenship', citizenship);
      apiStore.requestPayloads.inputs.residence.citizenship = citizenship;
      this.residence.citizenship = citizenship;
    },

    /**
     * Set the contact phone number to form data and
     * API request payload data
     *
     * @param {String} number Entered passport number
     */
    setPhoneNumber(number) {
      const apiStore = useApiStore();
      this.contact.phoneNumber = number;
      this.setRequiredInputItemStatus('contact.phone', number);
      apiStore.requestPayloads.inputs.contact.phone = number;
    },

    /**
     * Set the passport number to form data and
     * API request payload data
     *
     * @param {String} value Entered passport number
     * @param {Integer} index Position of entry to set
     */
    setPassportNumber(value, index) {
      const apiStore = useApiStore();
      this.travelers[index].passportNumber = value;
      this.setRequiredInputItemStatus(`passports.${index}.number`, value);
      apiStore.requestPayloads.inputs.passport[index].number = value;
    },

    /**
     * Set the passport country to form data and
     * API request payload data
     *
     * @param {String} code Three-letter country code
     * @param {Integer} index Position of entry to set
     */
    setPassportCountry(code, index) {
      const apiStore = useApiStore();
      this.travelers[index].passportCountry = code;
      this.setRequiredInputItemStatus(
        `passports.${index}.issuingCountry`,
        code
      );
      apiStore.requestPayloads.inputs.passport[index].issuingCountry = code;
    },

    setPassportCheckbox(passportInfoKnown, index) {
      this.travelers[index].passportInfoKnown = passportInfoKnown;
    },
    setIfPassportInfoRequired(requirePassportInfo) {
      this.requirePassportInfo = requirePassportInfo;
    },
    setTermsOfServiceAgreed(termsAgreed) {
      this.termsOfServiceAgreed = termsAgreed;
    },
    setUserAgreementSelection(selection) {
      this.userAgreementSelection = selection;
    },
    setMarketingOptIn(optIn) {
      this.marketingOptIn = optIn;
    },
    setFormValidationStatus(bool) {
      this.formIsValid = bool;
    },

    /**
     * Set the CC name to form data and
     * API request payload data
     *
     * @param {String} name Billing name
     */
    setCreditCardName(name) {
      const apiStore = useApiStore();
      this.payment.name = name;
      this.setRequiredInputItemStatus('creditCard.name', name);
      apiStore.requestPayloads.payment.details.name = name;
    },

    /**
     * Set the CC number to form data and
     * API request payload data
     *
     * @param {String} number CC number
     */
    setCreditCardNumber(number) {
      const apiStore = useApiStore();
      this.payment.number = number;
      this.setRequiredInputItemStatus('creditCard.number', number);
      apiStore.requestPayloads.payment.details.number = number?.replace(
        /\s/g,
        ''
      );
    },

    /**
     * Set the CC expiration to form data and
     * API request payload data
     *
     * @param {String} expiry Entered expiration value in MM/YY format
     */
    setCreditCardExpiry(expiry) {
      const apiStore = useApiStore();

      const date = dayjs(expiry, 'MM/YYYY');
      const month = date.format('MM');
      const year = date.format('YYYY');

      this.payment.expiry = expiry;
      this.setRequiredInputItemStatus('creditCard.expiry', expiry);

      apiStore.requestPayloads.payment.details.expirationYear = year;
      apiStore.requestPayloads.payment.details.expirationMonth = month;
    },

    /**
     * Set the CVV to form data and
     * API request payload data
     *
     * @param {String} cvv Entered CVV value
     */
    setCreditCardCVV(cvv) {
      const apiStore = useApiStore();
      this.payment.cvv = cvv;
      this.setRequiredInputItemStatus('creditCard.CVV', cvv);
      apiStore.requestPayloads.payment.details.cvv2 = cvv;
    },

    /**
     * Set the airline to form data and
     * API request payload data
     *
     * @param {String} value ID of selected option
     */
    setAirline(value) {
      const apiStore = useApiStore();
      this.travelSupplier.airline = value;
      this.setRequiredInputItemStatus('travelSupplier.airline', value);
      apiStore.requestPayloads.inputs.travelSupplier.airline = value;
    },

    /**
     * Set the cruiseline to form data and
     * API request payload data
     *
     * @param {String} value ID of selected option
     */
    setCruiseLine(value) {
      const apiStore = useApiStore();
      this.travelSupplier.cruiseLine = value;
      this.setRequiredInputItemStatus('travelSupplier.cruiseline', value);
      apiStore.requestPayloads.inputs.travelSupplier.cruiseline = value;
    },

    /**
     * Set the tour operator to form data and
     * API request payload data
     *
     * @param {String} value ID of selected option
     */
    setTourOperator(value) {
      const apiStore = useApiStore();
      this.travelSupplier.tourOperator = value;
      this.setRequiredInputItemStatus('travelSupplier.tourOperator', value);
      apiStore.requestPayloads.inputs.travelSupplier.tourOperator = value;
    },

    /**
     * Set the trip cost to form data and
     * API request payload data
     *
     * @param {String} cost String value of trip cost
     */
    setTripCost(cost) {
      const apiStore = useApiStore();
      this.trip.tripCost = cost;
      this.setRequiredInputItemStatus('trip.cost', cost);
      apiStore.requestPayloads.inputs.trip.cost = Number(cost);
    },

    /**
     * Set the ITP to form data and
     * API request payload data
     *
     * @param {String} date MM/DD/YYYY date format
     */
    setInitialTripPaymentDate(date) {
      const apiStore = useApiStore();
      this.trip.initialTripPayment = date;
      this.setRequiredInputItemStatus('trip.firstTripPayment', date);
      apiStore.requestPayloads.inputs.trip.firstTripPayment = dayjs(
        date
      ).format(DATE_FORMAT.API);
    },

    /**
     * Set the FTP to form data and
     * API request payload data
     *
     * @param {String} date MM/DD/YYYY date format
     */
    setFinalTripPaymentDate(date) {
      const apiStore = useApiStore();
      this.trip.finalTripPayment = date;
      this.setRequiredInputItemStatus('trip.finalTripPayment', date);
      apiStore.requestPayloads.inputs.trip.finalTripPayment = dayjs(
        date
      ).format(DATE_FORMAT.API);
    },

    /**
     * Set the school name to form data and
     * API request payload data
     *
     * @param {String} name School name
     */
    setSchoolName(name) {
      const apiStore = useApiStore();
      this.trip.schoolName = name;
      this.setRequiredInputItemStatus('trip.school', name);
      apiStore.requestPayloads.inputs.trip.school = name;
    },

    /**
     * Set the trip destination to form data and
     * API request payload data
     *
     * @param {String} code Three-letter country code
     */
    setDestination(code) {
      const apiStore = useApiStore();
      this.trip.destination = code;
      this.setRequiredInputItemStatus('trip.destination', code);
      apiStore.requestPayloads.inputs.trip.destination = code;
    },

    trackError(field, error) {
      event('buy-page_error', {
        hierarchical_layer_1: field,
        hierarchical_layer_2: error,
      });
    },
    trackSectionCompletion(section, completed, omitTracking = false) {
      if (completed && !omitTracking) {
        event('buy-page_completed-section', {
          hierarchical_layer_1: `Buy Page Competed Section ${completed}`,
          hierarchical_layer_2: section,
        });
      }
      this.formSectionCompleted[section] = completed;
    },
    /**
     * Adds a Clickthrough to our form store.
     *
     * @param {Object} clickthrough
     */
    addClickthrough(clickthrough) {
      this.clickthroughs.push({
        id: clickthrough.id,
        value: null,
      });

      this.setRequiredInputItemStatus(`clickthrough.${clickthrough.id}`, false);
    },

    /**
     * Sets a Clickthrough's value via id.
     *
     * @param {String} clickthroughName
     * @param {String|Number|Boolean} value
     */
    setClickthrough(noteId, value) {
      const apiStore = useApiStore();
      this.setRequiredInputItemStatus(`clickthrough.${noteId}`, value);
      apiStore.requestPayloads.inputs.clickthrough[noteId] = value;
      apiStore.setOption(noteId, value);

      const index = this.clickthroughs.findIndex((ele) => ele.id === noteId);
      if (index !== -1) {
        this.clickthroughs[index].value = value;
      }
    },

    /**
     * Remove clickthrough
     *
     * @param {String} id ClickthroughId
     */
    removeClickthrough(id) {
      const apiStore = useApiStore();

      delete apiStore.requestPayloads.inputs.clickthrough[id];
      apiStore.deleteOption(id);

      const index = this.clickthroughs.findIndex((ele) => ele.id === id);

      if (index !== -1) {
        this.clickthroughs.splice(index, 1);
      }
    },

    /**
     * Set allowed CC payment providers
     *
     * @param {Array} providers List of providers by name
     * @returns {Boolean} Whether the operation completed
     */
    setAcceptedCreditCardTypes(types) {
      this.acceptedPaymentMethods.creditCard = types;
    },

    /**
     * Sync saved form data from browser to stores
     *
     * @returns {Boolean}
     */
    syncBrowserStorage() {
      const apiStore = useApiStore();

      // Sync form data in session storage
      let savedFormData = sessionStorage.getItem(
        SESSION_STORAGE_KEYS.USER_FORM_DATA
      );

      let savedHttpRequestData = sessionStorage.getItem(
        SESSION_STORAGE_KEYS.HTTP_REQUEST_PAYLOAD_DATA
      );

      // No form data :( Nothing more to do
      if (!savedFormData || !savedHttpRequestData) {
        return false;
      }

      try {
        savedFormData = JSON.parse(savedFormData);
      } catch (e) {
        console.error(
          'Could not parse saved from data from session storage.',
          e
        );
        return false;
      }

      try {
        savedHttpRequestData = JSON.parse(savedHttpRequestData);
      } catch (e) {
        console.error(
          'Could not parse saved HTTP request data from session storage.',
          e
        );
        return false;
      }

      const storedRequiredInputs = Object.keys(
        savedFormData.requiredInputsState
      );
      const knownRequiredInputs = Object.keys(this.requiredInputsState);

      // Quick initial check to see if we have differernt required
      // fields. If so, do not sync.
      if (storedRequiredInputs.length !== knownRequiredInputs.length) {
        return false;
      }

      // Check that the required inputs are equal. If not, don't sync.
      storedRequiredInputs.sort();
      knownRequiredInputs.sort();

      for (let i = 0; i < storedRequiredInputs.length; i++) {
        if (storedRequiredInputs[i] !== knownRequiredInputs[i]) {
          return false;
        }
      }

      // Looks like a match. We can sync user stored data to initial form values
      this.$state = savedFormData;
      apiStore.$patch({ requestPayloads: savedHttpRequestData });

      // We need to then update the product with said inputs
      // (incase a user refresh when product is unavailable)
      apiStore.addProductInputsToProduct();

      return true;
    },

    /**
     * Clear user payment infomration (CC data)
     *
     * @return {Void}
     */
    clearPaymentDetails() {
      this.setCreditCardCVV(null);
      this.setCreditCardExpiry(null);
      this.setCreditCardNumber(null);
    },

    /**
     * Clear acknowledgment fields (clickthroughs, T&C, etc.)
     *
     * @return {Void}
     */
    clearUserAcknowlegments() {
      this.setTermsOfServiceAgreed(false);
    },

    /**
     * Set status of captcha based on challenge
     *
     * @param {Boolean} status
     */
    setCaptchaStatus(status) {
      this.captchaIsValid = status;
    },

    /**
     * Control the display of captcha
     *
     * @param {Boolean} show
     */
    setShowCaptcha(show) {
      this.showCaptcha = show;
    },

    /**
     * Set captcha token on successful callback
     *
     * @param {String} token
     */
    setCaptchaToken(token) {
      this.captchaToken = token;
    },

    /**
     * Sets a flag to trigger a captcha reset. Used to reset the captcha after an order is placed.
     * @param {Boolean} val
     * @return {Void}
     */
    triggerCaptchaReset(val) {
      this.resetCaptchaFlag = val;
    },
  },
});
