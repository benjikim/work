import { defineStore } from 'pinia';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { useApiStore } from 'src/store/modules/api.js';
import { isMobileView, replaceContentVariables } from 'src/utility/index.js';
import {
  DATE_FORMAT,
  WEBSITE_URLS,
  VALIDATION_MESSAGES,
} from 'src/config/index.js';
import dayjs from 'dayjs';
import { event } from 'vue-gtag';

export const useContentStore = defineStore('content-store', {
  state: () => {
    return {
      form: {
        inputs: {
          travelerFirstName: {
            disabled: false,
            hint: '',
            id: 'form-traveler-first-name',
            label: 'First Name',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(1),
                valid:
                  'Please only use upper/lower case letters, spaces and the following symbols "-", "\'", "."',
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          travelerLastName: {
            disabled: false,
            hint: '',
            id: 'form-traveler-last-name',
            label: 'Last Name',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(1),
                valid:
                  'Please only use upper/lower case letters, spaces and the following symbols "-", "\'", "."',
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          travelerMiddleInitial: {
            disabled: false,
            hint: '',
            id: 'form-traveler-initial',
            label: 'Initial',
            messages: {
              notice: {},
              validation: {},
            },
            placeholder: null,
            required: false,
            mask: '@',
            type: 'text',
          },
          travelerSuffix: {
            disabled: false,
            hint: '',
            id: 'form-traveler-suffix',
            label: 'Suffix',
            messages: {
              notice: {},
              validation: {},
            },
            options: ['Jr', 'Sr'],
            placeholder: null,
            required: false,
            type: 'dropdown',
          },
          travelerDOB: {
            disabled: false,
            hint: '',
            id: 'form-traveler-date-of-birth',
            label: 'Date of Birth',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('date'),
                minValue: 'Traveler age cannot be less than 0',
                maxValue: 'Traveler age cannot be over 99',
              },
            },
            placeholder: DATE_FORMAT.INPUT_FIELD,
            mask: DATE_FORMAT.INPUT_FIELD_MASK,
            required: true,
            type: 'tel',
          },
          travelerAge: {
            disabled: true,
            hint: '',
            id: 'form-traveler-age',
            label: 'Age',
            messages: {
              notice: {},
              validation: {},
            },
            placeholder: null,
            required: false,
            type: 'text',
          },
          residenceAddress: {
            disabled: false,
            hint: '',
            id: 'form-residence-address',
            label: 'Street Address',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
                adjacentNumsAddress: VALIDATION_MESSAGES.adjacentNumsAddress,
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          residenceAddressSecondary: {
            disabled: false,
            hint: '',
            id: 'form-residence-address-secondary',
            label: 'Apartment, Suite, Unit, etc.',
            messages: {
              notice: {},
              validation: {},
            },
            placeholder: null,
            required: false,
            type: 'text',
          },
          residenceCity: {
            disabled: false,
            hint: '',
            id: 'form-residence-city',
            label: 'City',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
                threeAdjacentNums: VALIDATION_MESSAGES.adjacentNumsCity,
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          residenceState: {
            disabled: true,
            readOnly: true,
            hint: '',
            id: 'form-residence-state',
            label: 'State',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          residenceZip: {
            disabled: false,
            hint: '',
            id: 'form-residence-zip',
            label: 'Postal Code',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: (v) => VALIDATION_MESSAGES.minLength(v),
                maxLength: (v) => VALIDATION_MESSAGES.maxLength(v),
                zipFormat: (v) => VALIDATION_MESSAGES.zipFormat(v),
              },
            },
            maskUSA: '#####-####',
            maskCAN: '*** ***',
            placeholder: null,
            required: true,
            type: 'text',
          },
          residenceCitizenship: {
            disabled: true,
            readOnly: true,
            hint: '',
            id: 'form-residence-citizenship',
            label: 'Citizenship',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          residenceCountry: {
            disabled: true,
            readOnly: true,
            hint: '',
            id: 'form-residence-country',
            label: 'Country',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          email: {
            disabled: false,
            hint: '',
            id: 'form-traveler-email',
            label: 'Email Address',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
                format:
                  'Enter a complete email address, such as "jdoe@insuremytrip.com"',
              },
            },
            placeholder: null,
            required: true,
            type: 'email',
          },
          phoneNumber: {
            disabled: false,
            hint: '',
            id: 'form-traveler-phoneNumber',
            label: 'Phone Number',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('phone number'),
              },
            },
            internationalMask: '###############',
            domesticMask: '(###) ###-####',
            placeholder: null,
            required: true,
            type: 'tel',
          },
          passportNumber: {
            disabled: false,
            hint: '',
            id: 'form-passport-number',
            label: 'Passport Number',
            messages: {
              notice: {},
              validation: {
                required: 'Enter the passport number for each traveler',
                minLength: VALIDATION_MESSAGES.minLength(3),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          passportCountry: {
            disabled: true,
            hint: '',
            id: 'form-passport-country',
            label: 'Passport Issuing Country',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          passportCheckbox: {
            disabled: false,
            id: 'form-passport-checkbox',
            label:
              "I don't know or don't have this information with me right now.",
            required: false,
          },
          termsOfServiceSoventureCheckbox: {
            disabled: false,
            id: 'form-tos-checkbox',
            label: '',
            required: false,
            displayRequired: false,
            htmlLabel: `<label>By checking this agreement box I am providing my electronic signature and consent to <a id="terms-of-service__open-modal" class="terms-of-service__open-modal-text">SOVENTURE's Terms and Conditions</a></label>`,
            mobileLabel: 'Tap here to agree',
          },
          termsOfServiceCheckbox: {
            disabled: false,
            id: 'form-tos-checkbox',
            label: '',
            required: false,
            displayRequired: false,
            htmlLabel: `<label>By checking this agreement box I am providing my electronic signature and consent to <a id="terms-of-service__open-modal" class="terms-of-service__open-modal-text">InsureMyTrip's Terms and Conditions</a></label>`,
            mobileLabel: 'Tap here to agree',
          },
          userAgreementCheckbox: {
            disabled: false,
            id: 'form-user-agreement-checkbox',
            label: '',
            htmlLabel:
              'I confirm that I have read, understand, and agree to the ',
            required: false,
            displayRequired: false,
          },
          marketingOptInCheckbox: {
            disabled: false,
            id: 'form-marketing-opt-in-checkbox',
            label:
              'By selecting this I agree to receive promotional emails from InsureMyTrip. I will have the option to discontinue this agreement at any time by unsubscribing to the list. Please note: Promotional emails do not include any transactional emails directly related to this purchase',
            mobileLabel: 'Tap here to agree',
            required: false,
          },
          marketingOptInSoventureCheckbox: {
            disabled: false,
            id: 'form-marketing-opt-in-checkbox',
            label:
              'By selecting this I agree to receive promotional emails from SOVENTURE. I will have the option to discontinue this agreement at any time by unsubscribing to the list. Please note: Promotional emails do not include any transactional emails directly related to this purchase',
            mobileLabel: 'Tap here to agree',
            required: false,
          },
          creditCardName: {
            disabled: false,
            hint: '',
            id: 'form-payment-name',
            label: 'Name on Card',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('name'),
                threeAdjacentNums: VALIDATION_MESSAGES.validType('name'),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          creditCardNumber: {
            disabled: false,
            hint: '',
            id: 'form-payment-card',
            label: 'Card Number',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('credit card number'),
                validCardNumber:
                  VALIDATION_MESSAGES.validType('credit card number'),
                validCardType: (types) =>
                  VALIDATION_MESSAGES.creditCardType(types),
              },
            },
            placeholder: null,
            mask: '#### #### #### ####',
            required: true,
            type: 'tel',
          },
          creditCardExpiry: {
            disabled: false,
            hint: '',
            id: 'form-payment-expiry',
            label: 'Expires',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('expire date'),
                cardExpired: 'Your card has expired',
                validExpiry: VALIDATION_MESSAGES.validType('expire date'),
              },
            },
            placeholder: 'MM/YYYY',
            mask: '##/####',
            required: true,
            type: 'tel',
          },
          creditCardCVV: {
            disabled: false,
            hint: '',
            id: 'form-payment-cvv',
            label: 'CVV',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('CVV'),
              },
            },
            placeholder: null,
            mask: '####',
            required: true,
            type: 'tel',
          },
          paymentCheckbox: {
            disabled: false,
            id: 'form-payment-checkbox',
            label: 'Use the above as your billing address',
            required: false,
          },
          billingAddress: {
            disabled: false,
            hint: '',
            id: 'form-billing-address',
            label: 'Street Address',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
                format: 'Please enter a valid address',
                adjacentNumsAddress: VALIDATION_MESSAGES.adjacentNumsAddress,
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          billingAddressSecondary: {
            disabled: false,
            hint: '',
            id: 'form-billing-address-secondary',
            label: 'Apartment, Suite, Unit, etc.',
            messages: {
              notice: {},
              validation: {},
            },
            placeholder: null,
            required: false,
            type: 'text',
          },
          billingCity: {
            disabled: false,
            hint: '',
            id: 'form-billing-city',
            label: 'City',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
                threeAdjacentNums: VALIDATION_MESSAGES.adjacentNumsCity,
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          billingState: {
            disabled: false,
            readOnly: false,
            hint: '',
            id: 'form-billing-state',
            label: 'State',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          billingZip: {
            disabled: false,
            hint: '',
            id: 'form-billing-zip',
            label: 'Postal Code',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: (v) => VALIDATION_MESSAGES.minLength(v),
                maxLength: (v) => VALIDATION_MESSAGES.maxLength(v),
                zipFormat: (v) => VALIDATION_MESSAGES.zipFormat(v),
              },
            },
            maskUSA: '#####-####',
            maskCAN: '*** ***',
            placeholder: null,
            required: true,
            type: 'text',
          },
          billingCountry: {
            disabled: false,
            readOnly: false,
            hint: '',
            id: 'form-billing-country',
            label: 'Country',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(3),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
          airline: {
            disabled: false,
            hint: '',
            id: 'form-travel-supplier-airline',
            label: 'Select Your Airline',
            placeholder: null,
            required: false,
            type: 'text',
          },
          cruiseLine: {
            disabled: false,
            hint: '',
            id: 'form-travel-supplier-cruise',
            label: 'Select Your Cruise Line',
            placeholder: null,
            required: false,
            type: 'text',
          },
          tourOperator: {
            disabled: false,
            hint: '',
            id: 'form-travel-supplier-tour-operator',
            label: 'Select Your Tour Operator',
            placeholder: null,
            required: false,
            type: 'text',
          },
          travelSupplierHelpText: {
            helpTextFirstRow:
              'If you are using more than one supplier, please select the one you will be with the longest.',
            helpTextSecondRow:
              'If your Airline, Cruise Line or Tour Operator is not listed, select "Other”',
            NWCText:
              "Nationwide is currently only accepting enrollments if traveling on one of the listed cruise lines. If your cruise line isn't listed please call 800-487-4722.",
          },
          tripDetailsHelpText: {
            helpTextFirstRow:
              'Please indicate the first date you made a payment towards this trip.',
            helpTextSecondRow:
              'The Final Trip Payment must be on or after the first trip payment date.',
            helpTextThirdRow: 'Please enter the school or program name.',
          },
          DOBChangeMessages: {
            success:
              "The date of birth and age did not match. We've updated the age to match the date of birth.",
          },
          textClickThrough: {
            disabled: false,
            hint: '',
            placeholder: '',
            required: false,
            label: 'Signature',
            header: '',
            type: 'text',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
              },
            },
          },
          booleanClickThrough: {
            disabled: false,
            required: false,
            hint: '',
            placeholder: '',
            header: 'Please Check',
            messages: {
              notice: {},
              validation: {},
            },
          },
          multiClickThrough: {
            disabled: false,
            required: false,
            hint: '',
            placeholder: '',
            header: 'Please Select',
            messages: {
              notice: {},
              validation: {},
            },
          },
          destination: {
            disabled: true,
            hint: '',
            id: 'form-trip-details-destination',
            label: 'Destination',
            placeholder: null,
            required: true,
            readOnly: true,
            type: 'text',
            messages: {
              notice: {},
              validation: {},
            },
          },
          tripCost: {
            limit: 150000,
            disabled: true,
            hint: '',
            id: 'form-trip-details-trip-cost',
            label: 'Total Trip Cost',
            placeholder: null,
            required: true,
            readOnly: false,
            type: 'text',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                limit: 'Maximum cannot exceed $150,000 per traveler.',
              },
            },
          },
          firstTripPaymentDate: {
            disabled: false,
            hint: '',
            id: 'form-trip-details-itp',
            label: 'Initial Trip Payment Date',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('date'),
                minDate:
                  'The Initial Trip Payment cannot be more than 5 years ago.',
                maxDate: 'The Initial Trip Payment must be on or before today.',
                validDate: VALIDATION_MESSAGES.validType('date'),
              },
            },
            placeholder: DATE_FORMAT.INPUT_FIELD,
            mask: DATE_FORMAT.INPUT_FIELD_MASK,
            required: true,
            type: 'tel',
          },
          finalTripPaymentDate: {
            disabled: false,
            hint: '',
            id: 'form-trip-details-ftp',
            label: 'Final Trip Payment Date',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.validType('date'),
                afterFirstPayment:
                  'The Final Trip Payment must be on or after the first trip payment date.',
                minDate:
                  'The Final Trip Payment cannot be more than 5 years ago.',
                maxDate:
                  'The Final Trip Payment cannot be more than 10 years in the future.',
                validDate: VALIDATION_MESSAGES.validType('date'),
              },
            },
            placeholder: DATE_FORMAT.INPUT_FIELD,
            mask: DATE_FORMAT.INPUT_FIELD_MASK,
            required: true,
            type: 'tel',
          },
          schoolName: {
            disabled: false,
            hint: '',
            id: 'form-trip-details-school-name',
            label: 'School or Program',
            messages: {
              notice: {},
              validation: {
                required: VALIDATION_MESSAGES.required,
                minLength: VALIDATION_MESSAGES.minLength(2),
              },
            },
            placeholder: null,
            required: true,
            type: 'text',
          },
        },
        fieldsets: {
          'form-loader': {
            title: '',
            hint: '',
          },
          'form-travelers': {
            title: 'Travelers',
            hint: '',
          },
          'form-passports': {
            title: 'Passport Information',
            hint: '',
          },
          'form-terms-of-service': {
            title: 'Review/Acknowledge',
            hint: '',
            mobileBackgroundColor: 'white',
            hideMobileTitle: false,
          },
          'form-marketing-opt-in': {
            title: 'Connect With Us',
            hint: '',
            mobileBackgroundColor: 'white',
            hideMobileTitle: false,
          },
          'form-payment': {
            title: 'Payment Information',
            hint: '',
          },
          'form-travel-suppliers': {
            title: 'Additional Trip Information',
            hint: '',
            optional: true,
          },
          'form-trip-details': {
            title: 'Trip Information',
            hint: '',
          },
        },
      },
      modal: {
        show: false,
        data: null,
        // Types of defined modals
        termsOfServiceModal: {
          id: 'terms-of-service-modal',
          header: 'Electronic Delivery Terms',
          body: {
            type: 'html',
            content: `
            <p class="terms-of-service__body-text terms-of-service__agreement-terms pb-2">I understand that an electronic signature is a legal and enforceable form of agreement and holds the same value as a handwritten signature.</p>
            <h2 class="terms-of-service__body-header">Electronic Delivery Agreement</h2>
            <p class="terms-of-service__body-text">I agree to allow InsureMyTrip to deliver any insurance related communications or documents via the email address I have provided in the checkout process.</p>
            <p class="terms-of-service__body-text">I understand that I have the right to withdraw InsureMyTrip's permission to contact me via my provided email address and I may request a paper copy of any insurance related communications and documents.</p>
            <p class="terms-of-service__body-text pb-2">I may withdraw my consent or change my provided email address by contacting InsureMyTrip by email at customercare@insuremytrip.com.</p>
            <h2 class="terms-of-service__body-header">Premium Refund Policy Agreement</h2>
            <p class="terms-of-service__body-text">I understand that the travel insurance policy I am purchasing has a specific refund policy that is listed in the coverage documentation.* I agree to that refund policy as listed in the coverage documentation.</p>
            <p class="terms-of-service__body-text">I understand that I cannot cancel this policy for a refund outside of the review period outlined in the coverage documentation.</p>
            <p class="terms-of-service__body-text pb-0"><i>* Please note that some travel insurance plans may not include a refund policy and may be non-refundable after purchase based on the state that you reside in. It is important to fully review the plan documentation before purchasing.</i></p>
            `,
          },
          width: '90%',
          actionButton: false,
          showCloseButton: true,
        },
        termsOfServiceSoventureModal: {
          id: 'terms-of-service-modal',
          header: 'Electronic Delivery Terms',
          body: {
            type: 'html',
            content: `
            <p class="terms-of-service__body-text terms-of-service__agreement-terms pb-2">I understand that an electronic signature is a legal and enforceable form of agreement and holds the same value as a handwritten signature.</p>
            <h2 class="terms-of-service__body-header">Electronic Delivery Agreement</h2>
            <p class="terms-of-service__body-text">I agree to allow SOVENTURE to deliver any insurance related communications or documents via the email address I have provided in the checkout process.</p>
            <p class="terms-of-service__body-text">I understand that I have the right to withdraw SOVENTURE's permission to contact me via my provided email address and I may request a paper copy of any insurance related communications and documents.</p>
            <p class="terms-of-service__body-text pb-2">I may withdraw my consent or change my provided email address by contacting InsureMyTrip by email at customercare@insuremytrip.com.</p>
            <h2 class="terms-of-service__body-header">Premium Refund Policy Agreement</h2>
            <p class="terms-of-service__body-text">I understand that the travel insurance policy I am purchasing has a specific refund policy that is listed in the coverage documentation.* I agree to that refund policy as listed in the coverage documentation.</p>
            <p class="terms-of-service__body-text">I understand that I cannot cancel this policy for a refund outside of the review period outlined in the coverage documentation.</p>
            <p class="terms-of-service__body-text pb-0"><i>* Please note that some travel insurance plans may not include a refund policy and may be non-refundable after purchase based on the state that you reside in. It is important to fully review the plan documentation before purchasing.</i></p>
            `,
          },
          width: '90%',
          actionButton: false,
          showCloseButton: true,
        },
        mobileQuoteInfoClick: {
          id: 'mobile-quote-info-click',
          header: '',
          body: {
            type: 'component',
            componentName: 'MobilePurchaseSummaryOptions',
          },
          width: '90%',
          actionButton: false,
          showCloseButton: true,
          compressCloseButton: true,
          outlinedCloseButton: true,
        },
        ageZeroPlanNotAvailable: {
          id: 'age-zero-not-available',
          header: 'Plan No Longer Available ',
          body: {
            type: 'text',
            content:
              'This plan is not available for travelers under {{ageZeroDaysAllowed}} days old.',
            setContent(objectOfValues) {
              this.content = replaceContentVariables(
                objectOfValues,
                this.content
              );
            },
          },
          showCloseIcon: false,
          showCloseButton: false,
          actionButton: true,
          buttonActionText: 'Select Another Plan',
          width: '400px',
          actionMethod: () => {
            window.history.go(-1);
          },
        },
        DOBPremiumNotAvailable: {
          id: 'dob-premium-not-available',
          header: 'Plan No Longer Available ',
          body: {
            type: 'text',
            content:
              'You have changed the traveler age from {{previousAge}} to {{newAge}}. Unfortunately, this plan is not available for travelers over the age of 75.',
            setContent(objectOfValues) {
              this.content = replaceContentVariables(
                objectOfValues,
                this.content
              );
            },
          },
          showCloseIcon: false,
          showCloseButton: false,
          actionButton: true,
          buttonActionText: 'Select Another Plan',
          width: '400px',
          actionMethod: () => {
            useContentStore().setShowModal(false);
          },
        },
        DOBPremiumChange: {
          id: 'dob-premium-change',
          header: 'Plan Cost Change',
          body: {
            type: 'html',
            content:
              '<p>The cost of this plan has {{priceChangeType}} as a result of the changes you have made.  The updated cost is now {{newValue}}.</p>',
            setContent(objectOfValues) {
              this.content = replaceContentVariables(
                objectOfValues,
                this.content
              );
            },
          },
          showCloseIcon: false,
          showCloseButton: false,
          actionButton: true,
          buttonActionText: 'Continue',
          width: '400px',
          actionMethod: () => {
            useContentStore().setShowModal(false);
          },
        },
        userAgreement: {
          id: 'user-agreement',
          header: 'User Agreement',
          body: {
            type: 'html',
            content: '',
          },
          width: '90%',
          actionButton: false,
        },
        apiResponseMessages: {
          id: 'modal-api-validation-errors',
          header: 'Please review the information below',
          body: {
            type: 'component',
            componentName: 'ModalAPIValidationMessages',
          },
          width: '600px',
          actionButton: false,
          buttonActionText: 'Continue',
          showCloseButton: false,
          compressCloseButton: true,
          outlinedCloseButton: true,
          actionMethod: () => {
            useApiStore().clearApiResponseMessages();
            useContentStore().setShowModal(false);
          },
        },
        reviewPolicyChanges: {
          id: 'modal-review-policy-changes',
          header: 'Please review the information below',
          body: {
            type: 'component',
            componentName: 'ModalAPIValidationMessages',
          },
          width: '60%',
          actionButton: true,
          buttonActionText: 'Accept Changes',
          showCloseButton: false,
          actionMethod: () => {
            useApiStore().clearApiResponseMessages();
            useContentStore().setShowModal(false);
          },
          outlinedSecondaryActionButton: true,
          secondaryActionButton: true,
          secondaryButtonActionText: 'Go Back To Results',
          secondaryActionMethod: () => {
            window.history.go(-1);
          },
        },
        policyChangePurchaseInterruption: {
          id: 'modal-policy-change-purchase-inturruption',
          header: 'Please review the information below',
          body: {
            type: 'component',
            componentName: 'ModalAPIValidationMessages',
          },
          width: '60%',
          actionButton: true,
          buttonActionText: 'Close',
          showCloseButton: false,
          outlinedActionButton: true,
          actionMethod: () => {
            useApiStore().clearApiResponseMessages();
            useContentStore().setShowModal(false);
          },
          showSubmitFormButton: true,
        },
        paymentNotProcessed: {
          id: 'modal-process-payment-error',
          header: "We're Sorry",
          body: {
            type: 'html',
            content: `<p>We are unable to process your payment at this time.
              Please try again later.</p>`,
          },
          showCloseButton: true,
        },
        paymentMethodDeclined: {
          id: 'modal-payment-method-declined',
          header: 'Payment Method Declined',
          body: {
            type: 'html',
            content: `<p>We are unable to process your payment at this time.
              The provided payment method has been declined.</p>`,
          },
          showCloseButton: true,
        },
        paymentProviderFailed: {
          id: 'modal-payment-provider-failure',
          header: 'Payment Provider Error',
          body: {
            type: 'html',
            content: `<p>We are unable to process your payment at this time.
              This could be an issue with the payment provider. Please try again or contact customer service.</p>`,
          },
          showCloseButton: true,
        },
        httpServerError: {
          id: 'modal-server-error',
          header: 'Something Went Wrong',
          body: {
            type: 'html',
            content: `<p>An unexpected error has occured. Please try again later.</p>`,
          },
          showCloseButton: true,
        },
        quoteNotFound: {
          id: 'modal-quote-not-found-error',
          header: 'Quote not found',
          body: {
            type: 'html',
            content: `<p>We're sorry, but we could not quote your plan for purchase.
              Please get a new quote and try again.</p>`,
          },
          actionButton: true,
          showCloseButton: false,
          showCloseIcon: false,
          buttonActionText: 'Get a new Quote',
          actionMethod: () => {
            window.location = WEBSITE_URLS.quoteForm;
          },
        },
        tokenNotFound: {
          id: 'modal-token-not-found-error',
          header: 'Quote has expired',
          body: {
            type: 'html',
            content: `<p>We're sorry, but your current quote has expired.
              Please get a new quote and try again.</p>`,
          },
          actionButton: true,
          showCloseButton: false,
          showCloseIcon: false,
          buttonActionText: 'Get a new Quote',
          actionMethod: () => {
            window.location = WEBSITE_URLS.quoteForm;
          },
        },
        captchaError: {
          id: 'modal-captcha-token-verification-error',
          header: `We're sorry, something went wrong.`,
          body: {
            type: 'html',
            content: `
            <p>We couldn't place your order.</p>

            <br />

            <ul style="list-style: disc !important; margin-left: 21px;">
              <li>Refresh the page</li>
              <li>Connect to another network</li>
              <li>Use incognito mode</li>
              <li>Disconnect from any VPNs</li>
              <li class="hide-on-mobile">Enable JavaScript in browser settings</li>
              <li class="hide-on-mobile">Disable browser extensions</li>
            </ul>

            <br />

            <div><strong>If you are still unable to purchase, we're here to help!</strong></div>
            <button onclick="logContactUsEventForCaptcha('Phone')">
              Call <a href="tel:8004874722">800-487-4722</a>
            </button>
            <div>
              (M-F: 8am–7pm EST, Sat: 9am–5pm EST, Sun: Closed)
            </div>
            <button onclick="logContactUsEventForCaptcha('Website')">
              <a href="https://www.insuremytrip.com/contact/">Or send us a message here</a>
            </button>
            <div id="errorCode">${window.getFormattedDate(
              'Use this reference code: VFYCA-'
            )}</div>
          `,
          },
          width: isMobileView ? '90%' : '60%',
          headerStyleOverride:
            'margin-left: auto; margin-right: auto; display: table; font-size:1.8rem;',
          footerStyleOverride: 'border-top: 0px; padding-top: 0px;',
          actionButton: true,
          showCloseButton: false,
          showCloseIcon: false,
          buttonActionText: 'Try Again',
          actionMethod: () => {
            window.logContactUsEventForCaptcha('Refreshed Page');
            window.location.reload();
          },
        },
        emailBlockedError: {
          id: 'modal-email-verification-error',
          header: `We're sorry, something went wrong.`,
          body: {
            type: 'html',
            content: `
            <div><strong>We’ve temporarily paused activity to ensure the security of your purchase.</strong></div>

            <br />

            <div>Our team is happy to help!</div>
            <button>
              Call <a href="tel:8004874722">800-487-4722</a>
            </button>
            <div>
              (M-F: 8am–7pm EST, Sat: 9am–5pm EST, Sun: Closed)
            </div>
            <a href="https://www.insuremytrip.com/contact/">Or message us directly below</a>
            <div id="errorCode">${window.getFormattedDate(
              'Use this reference code: VFYEM-'
            )}</div>
          `,
          },
          width: isMobileView ? '90%' : '60%',
          headerStyleOverride:
            'margin-left: auto; margin-right: auto; display: table; font-size:1.8rem;',
          footerStyleOverride: 'border-top: 0px; padding-top: 0px;',
          actionButton: true,
          showCloseButton: false,
          showCloseIcon: false,
          buttonActionText: 'Contact Us',
          actionMethod: () => {
            window.location.href = 'https://www.insuremytrip.com/contact/';
          },
        },
        repeatedSubmissionError: {
          id: 'modal-submission-verification-error',
          header: `We're sorry, something went wrong.`,
          body: {
            type: 'html',
            content: `
            <div><strong>We’ve temporarily paused activity to ensure the security of your purchase.</strong></div>

            <br />

            <div>Our team is happy to help!</div>
            <button>
              Call <a href="tel:8004874722">800-487-4722</a>
            </button>
            <div>
              (M-F: 8am–7pm EST, Sat: 9am–5pm EST, Sun: Closed)
            </div>
            <a href="https://www.insuremytrip.com/contact/">Or message us directly below</a>
            <div id="errorCode">${window.getFormattedDate(
              'Use this reference code: VFYRP-'
            )}</div>
          `,
          },
          width: isMobileView ? '90%' : '60%',
          headerStyleOverride:
            'margin-left: auto; margin-right: auto; display: table; font-size:1.8rem;',
          footerStyleOverride: 'border-top: 0px; padding-top: 0px;',
          actionButton: true,
          showCloseButton: false,
          showCloseIcon: false,
          buttonActionText: 'Contact Us',
          actionMethod: () => {
            window.location.href = 'https://www.insuremytrip.com/contact/';
          },
        },
        orderNotFound: {
          id: 'modal-order-not-found-error',
          header: 'Order not found',
          body: {
            type: 'html',
            content: `<p>We're sorry, but your order could not be found.
              Please get a new quote and try again.</p>`,
          },
          showCloseButton: false,
          showCloseIcon: false,
          actionButton: true,
          buttonActionText: 'Go Back',
          actionMethod: () => {
            window.history.go(-1);
          },
        },
        productNoLongerAvailable: {
          id: 'modal-product-no-longer-available',
          header: 'Product is no longer available',
          body: {
            type: 'component',
            componentName: 'ModalAPIValidationMessages',
          },
          actionButton: true,
          buttonActionText: 'Go Back',
          showCloseButton: false,
          outlinedActionButton: true,
          showSubmitFormButton: false,
          actionMethod: () => {
            useApiStore().clearApiResponseMessages();
            window.history.go(-1);
            useContentStore().setShowModal(false);
          },
        },
        noProductToPurchase: {
          id: 'modal-no-product-on-order',
          header: 'Product not found',
          body: {
            type: 'html',
            content: `<p>We're sorry. Please go back and select a product to purchase.</p>`,
          },
          showCloseButton: false,
          showCloseIcon: false,
          actionButton: true,
          buttonActionText: 'Go Back',
          actionMethod: () => {
            window.history.go(-1);
          },
        },
        notAuthorized: {
          id: 'modal-not-authorized',
          header: 'Not Authorized',
          body: {
            type: 'html',
            content: `<p>We're sorry. You are not authorized to complete this purchase. Please try again.</p>`,
          },
          showCloseButton: false,
          showCloseIcon: false,
          actionButton: true,
          buttonActionText: 'Go Back',
          actionMethod: () => {
            window.history.go(-1);
          },
        },
        orderAlreadyPurchased: {
          id: 'modal-order-purchased',
          header: 'Order Completed',
          body: {
            type: 'html',
            content: `<p>You have completed your order. Please close your browser window or
              <a href="/" title="InsureMyTrip.com Home Page"/>return to our home page.</a></p>`,
          },
          showCloseButton: false,
          showCloseIcon: false,
          actionButton: true,
          buttonActionText: 'Go to Home Page',
          actionMethod: () => {
            useApiStore().clearSessionStorage();
            window.location = '/';
          },
        },
      },
      pageLoader: {
        show: true,
        data: {
          id: 'initial-load',
          text: 'Getting your order ready...',
        },
        initialLoad: {
          id: 'initial-load',
          text: 'Getting your order ready...',
        },
        processForm: {
          id: 'loader-submit-form',
          text: 'Processing your order details...',
        },
        processPayment: {
          id: 'loader-submit-payment',
          text: 'Processing your payment information...',
        },
        orderComplete: {
          id: 'loader-complete',
          text: 'Completing your order...',
        },
        itpRequote: {
          id: 'loader-requote-itp',
          text: 'Verify time sensitive coverages...',
        },
        ageChangeRequote: {
          id: 'loader-requote-itp',
          text: 'Verifying traveler ages...',
        },
        clickthroughRequote: {
          if: 'loader-requote-clickthrough',
          text: 'Adjusting plan premium...',
        },
      },
      quoteDetails: {
        destination: null,
        departureDate: null,
        returnDate: null,
        tripCost: null,
      },
      productDetails: {
        provider: {
          name: null,
          code: null,
          logo: null,
        },
        product: {
          name: null,
          code: null,
          certificateUrl: null,
          premium: null,
          totalCost: null,
          policyFee: null,
          tax: null,
          clickthroughs: [],
          options: [],
          ltc: [],
        },
      },
      links: {
        privacyPolicy: {
          text: "Read InsureMyTrip's Customer Privacy Policy",
          url: 'https://www.insuremytrip.com/about/privacy-policy/',
          target: '_blank',
        },
      },
      legal: {
        content: {
          text: `© 2000-${new Date().getFullYear()} IMT Services, LLC.`,
        },
      },
      payment: {
        creditCard: {
          'American Express': {
            displayName: 'American Express',
            logoUrl: 'https://cdn.insuremytrip.com/resources/45391/amex.svg',
          },
          MasterCard: {
            displayName: 'MasterCard',
            logoUrl:
              'https://cdn.insuremytrip.com/resources/45391/mastercard.svg',
          },
          Visa: {
            displayName: 'Visa',
            logoUrl: 'https://cdn.insuremytrip.com/resources/45391/visa.svg',
          },
          Discover: {
            displayName: 'Discover',
            logoUrl:
              'https://cdn.insuremytrip.com/resources/45391/discover.svg',
          },
          'Diners Club': {
            displayName: "Diner's Club",
            logoUrl:
              'https://cdn.insuremytrip.com/resources/45391/dinersclub.svg',
          },
        },
      },
      confirmation: {
        data: null,
        orderNumber: null,
        success: {
          header: 'Order Complete!',
          body: {
            content: `
              <p>Thank you for purchasing your travel insurance from InsureMyTrip. We appreciate your business.</p>
              <p>Your credit card has been charged {{totalCost}} for the {{productName}} plan. This charge may appear on your credit card statement as {{providerName}}</p>
              <p>Order number: <strong>{{orderNumber}}</strong></p>
              <p>A confirmation email, including your order number and coverage details has been sent to <strong>{{email}}</strong>. If your confirmation email does not arrive in the next half hour, please check your spam or junk mail folder. If you still can’t find it, give us a call.</p>`,
            setContent(objectOfValues) {
              this.content = replaceContentVariables(
                objectOfValues,
                this.content
              );
            },
          },
        },
        success_static: {
          header: 'Thank you for your order!',
          body: {
            content: `
              <p>We appreciate your business.</p>
              <p>To view the details from your purchase, please see your confirmation email.</p>
              <p>Your confirmation email, which includes your order number and coverage details, was sent to the email you provided at checkout.</p>
              <p>If you have further questions or need assistance, please contact our Customer Care team.</p>
              <p>Thank you!</p>
            `,
          },
        },
        eduSuccess_static: {
          header: 'Thank you for your order!',
          body: {
            content: `
              <p>We appreciate your business.</p>
              <p>To view the details from your purchase, please see your confirmation email.</p>
              <p>Your confirmation email, which includes your order number and coverage details, was sent to the email you provided at checkout.</p>
              <p>If you have further questions or need assistance, please contact our Customer Care team.</p>
              <p>Thank you!</p>
            `,
          },
        },
        eduSuccess: {
          header: 'Order Complete!',
          body: {
            content: `
              <p>Thank you for purchasing your travel insurance from InsureMyTrip. We appreciate your business.</p>
              <p>Your credit card has been charged {{totalCost}} for the {{productName}} plan. This charge may appear on your credit card statement as Education Trust</p>
              <p>Order number: <strong>{{orderNumber}}</strong></p>
              <p>A confirmation email, including your order number and coverage details has been sent to <strong>{{email}}</strong>. If your confirmation email does not arrive in the next half hour, please check your spam or junk mail folder. If you still can’t find it, give us a call.</p>`,
            setContent(objectOfValues) {
              this.content = replaceContentVariables(
                objectOfValues,
                this.content
              );
            },
          },
        },
        delay: {
          header: 'Order Submitted',
          body: {
            content: `<p class='text--h4' >Thank you for purchasing your travel insurance from InsureMyTrip. We have received your order.</p>
              <p> However, there is a delay in completing your purchase. Our customer care team needs to manually review the information you provided before your order can be completed.</p>
              <p>You do not need to take any action. Please do not start over or purchase another policy as this may result in the purchase of multiple plans.</p>
              <p> If you receive this message during our normal hours of operation, this review should be completed shortly. If it is currently outside of our normal business hours, this may take a few hours.</p>
              <p> Upon a successful review your credit card will be charged {{totalCost}} for the {{productName}} plan. Your pending order number is <strong>{{orderNumber}}</strong>.</p>
              <p> A confirmation email, including your order number and coverage details, will be sent to <strong>{{email}}</strong>.<br/>Please note that your insurance purchase is not complete until you receive this confirmation email.</p>
              <p> If we are unable to complete this transaction, your order will be canceled, and your credit card will not be charged. A cancellation email will be sent to {{email}}.</p>
              <p> We appreciate your patience.</p>
              <p class='font-bold'>If you have any questions, or do not receive an email shortly, please call us at 800-487-4722. Thank you.</p>`,
            setContent(objectOfValues) {
              this.content = replaceContentVariables(
                objectOfValues,
                this.content
              );
            },
          },
        },
        delay_static: {
          header: 'Order Submitted',
          body: {
            content: `
              <p class='text--h4' >Thank you for purchasing your travel insurance from InsureMyTrip. We have received your order.</p>
              <p> However, there is a delay in completing your purchase. Our customer care team needs to manually review the information you provided before your order can be completed.</p>
              <p>You do not need to take any action. Please do not start over or purchase another policy as this may result in the purchase of multiple plans.</p>
              <p> If you receive this message during our normal hours of operation, this review should be completed shortly. If it is currently outside of our normal business hours, this may take a few hours.</p>
              <p> A confirmation email, including your order number and coverage details, will be sent.<br/>Please note that your insurance purchase is not complete until you receive this confirmation email.</p>
              <p> If we are unable to complete this transaction, your order will be canceled, and your credit card will not be charged. A cancellation email will be sent.</p>
              <p> We appreciate your patience.</p>
              <p class='font-bold'>If you have any questions, or do not receive an email shortly, please call us at 800-487-4722. Thank you.</p>`,
          }
        },
        sanction: {},
        error: {},
      },
      sideBar: {
        reviewPeriod: {
          title: '',
          message: '',
        },
      },
      useResidenceAddress: true,
      allowResidenceChange: false,
      theme: 'imt',
      mode: 'default',
      planLogo: null,
    };
  },

  getters: {
    /**
     * Get main page data
     *
     * @param {Object} state
     * @returns {Object}
     */
    getPageContent(state) {
      return state.page;
    },

    getFieldSet: (state) => (identifier) => {
      return state.form.fieldsets[identifier];
    },

    getInput: (state) => (key) => {
      return state.form.inputs[key];
    },

    getInputValidation: (state) => (key) => {
      return state.form.inputs[key].messages.validation;
    },

    getModal: (state) => (modal) => {
      return state.modal[modal];
    },

    getConfirmationPage: (state) => (type) => {
      return state.confirmation[type];
    },

    getIsModalDisplayed() {
      return this.modal.show;
    },

    getConfirmationData() {
      return this.confirmation.data;
    },

    getModalData() {
      return this.modal.data;
    },

    getPageLoader: (state) => (loader) => {
      return state.pageLoader[loader];
    },

    getIsPageLoaderDisplayed() {
      return this.pageLoader.show;
    },

    getPageLoaderData() {
      return this.pageLoader.data;
    },

    getUseResidenceAddress() {
      return this.useResidenceAddress;
    },

    /**
     * This bool determines if residence can be changed.
     *
     * @returns {Boolean}
     */
    getAllowResidenceChange() {
      return this.allowResidenceChange;
    },
    /**
     * Returns true if quote details is empty
     *
     * @param {Object} state
     * @returns {Boolean}
     */
    getIsQuoteDetailsEmpty(state) {
      return (
        state.quoteDetails.destination == null &&
        state.quoteDetails.departureDate == null &&
        state.quoteDetails.returnDate == null &&
        state.quoteDetails.tripCost == null
      );
    },
    /**
     * Get all quote details display content
     *
     * @param {Object} state
     * @returns {Object}
     */
    getQuoteDetails(state) {
      return state.quoteDetails;
    },

    /**
     * Get all plan details display content
     *
     * @param {Object} state
     * @returns {Object}
     */
    getProductDetails(state) {
      return state.productDetails;
    },

    /**
     * Get privacy policy link
     *
     * @param {Object} state
     * @returns {Object}
     */
    getPrivacyPolicyLink(state) {
      return state.links.privacyPolicy;
    },

    /**
     * Get Legal Text
     *
     * @param {Object} state
     * @returns {String}
     */
    getLegalText(state) {
      return state.legal.content.text;
    },

    /**
     * Get Order Number
     *
     * @param {Object} state
     * @returns {String}
     */
    getOrderNumber(state) {
      return state.confirmation.orderNumber;
    },

    /**
     * Get a product's Click-Through(s).
     *
     * @param {Object} state
     * @returns {Array}
     */
    getClickThroughs(state) {
      return state.productDetails.product.clickthroughs;
    },

    /**
     * Given an array of accepted card types, return
     * CC display data
     *
     * @param {Array} types List of entries to return
     *
     * @returns {Object}
     */
    getCreditCardDisplayData() {
      return (types) =>
        Object.fromEntries(
          Object.entries(this.payment.creditCard).filter(([key]) =>
            types.includes(key)
          )
        );
    },

    getProductLTCMessagesForTripPaymentDates() {
      return this.productDetails?.product?.ltc
        .filter((messageObj) => messageObj?.id.includes('tpInvalidLTC'))
        .map((messageObj) => messageObj?.message);
    },

    /**
     * Gets if we are currently showing our modal
     *
     * @returns {Boolean}
     */
    getShowModal() {
      return this.modal.show;
    },

    /**
     * Gets the theme
     * @returns {string}
     */
    getTheme() {
      return this.theme;
    },

    /**
     * @returns {boolean}
     */
    isThemeIMT() {
      return this.theme === 'imt';
    },
    /**
     * @returns {boolean}
     */
    isThemeSoventure() {
      return this.theme === 'soventure';
    },

    /**
     * @returns {boolean}
     */
    isModeAnnual() {
      return this.mode === 'annual';
    },

    /**
     * @returns {boolean}
     */
    isModeEdu() {
      return this.mode === 'edu';
    },

    getPlanLogo() {
      return this.planLogo;
    },
    isFieldOptional: (state) => (fieldName) =>
      state.form.fieldsets[fieldName]?.optional,
    getSideBarReviewPeriod() {
      return this.sideBar.reviewPeriod;
    },
  },

  actions: {
    setShowModal(show) {
      this.modal.show = show;

      // Ensure that we don't have competing loaders/dialogs
      if (show) {
        this.pageLoader.show = false;
      }
    },

    setModalData(data) {
      this.modal.data = data;
    },

    /**
     * Set order number confirmation.
     *
     * @param {String} data
     */
    setOrderNumber(data) {
      this.confirmation.orderNumber = data;
    },

    /**
     * Set product details.
     * @param {Object} data
     */
    setProductDetails(data) {
      this.productDetails = data;
    },

    /**
     * Sets confirmation data.
     * @param {Object} data
     */
    setConfirmationData(data) {
      this.confirmation.data = data;
    },

    setShowPageLoader(show) {
      this.pageLoader.show = show;

      // Ensure that we don't have competing loaders/dialogs
      if (show) {
        this.modal.show = false;
      }
    },

    setPageLoaderData(data) {
      this.pageLoader.data = data;
    },

    setUseResidenceAddress(data) {
      this.useResidenceAddress = data;
    },

    /**
     * Sets the ability for residence country or state to be changed.
     *
     * @param {Boolean} data
     */
    setAllowResidenceChange(data) {
      this.allowResidenceChange = data;
    },

    /**
     * Set quote destination country
     *
     * @param {String} data Three letter country code
     */
    setQuoteDestination(code) {
      const appDataStore = useAppDataStore();
      const displayname = appDataStore.getCountryNameFromCode(code);

      if (!displayname) {
        console.error(`Could not get country display name from '${code}'.`);
      }
      this.quoteDetails.destination = displayname;
    },

    /**
     * Sets Click-Through(s) for product.
     *
     * @param {Object} clickthroughs
     */
    setClickthroughs(clickthroughs) {
      this.productDetails.product.clickthroughs = clickthroughs;
    },

    /**
     * Set quote departure date
     *
     * @param {String} date Date in YYYY-DD-MM format
     */
    setQuoteDepartureDate(date) {
      if (!dayjs(date).isValid()) {
        console.error(`'${date}' is invalid departure date format.`);
        return;
      }

      this.quoteDetails.departureDate = dayjs(date).format(DATE_FORMAT.QUOTE);
    },

    /**
     * Set quote return date
     *
     * @param {String} date Date in YYYY-DD-MM format
     */
    setQuoteReturnDate(date) {
      if (!dayjs(date).isValid()) {
        console.error(`'${date}' is invalid return date format.`);
        return;
      }

      this.quoteDetails.returnDate = dayjs(date).format(DATE_FORMAT.QUOTE);
    },

    /**
     * Set quote trip cost
     *
     * @param {Float|Integer} cost Trip cost
     */
    setQuoteTripCost(cost) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      if (!Number.isInteger(cost)) {
        console.error(`'${cost}' is not a valid integer/float.`);
        return;
      }

      this.quoteDetails.tripCost = formatter.format(cost);
    },

    setPremium(premium) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      if (typeof premium !== 'number') {
        console.error(`'${premium}' is not a valid integer/float.`);
        return;
      }

      this.productDetails.product.premium = formatter.format(premium);
    },

    setTotalCost(totalCost) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      if (typeof totalCost !== 'number') {
        console.error(`'${totalCost}' is not a valid integer/float.`);
        return;
      }

      this.productDetails.product.totalCost = formatter.format(totalCost);
    },

    /**
     * Set fieldset optional value
     *
     * @param {String} name Fieldset name
     * @param {Boolean} optional If optional or not
     */
    setFieldsetOptional(name, optional) {
      this.form.fieldsets[name].optional = optional;
    },

    setFieldsetData(key, data) {
      if (Object.hasOwn(this.form.fieldsets, key)) {
        this.form.fieldsets[key] = {
          ...this.form.fieldsets[key],
          ...data,
        };
      }
    },

    setModalContent(key, data) {
      if (Object.hasOwn(this.modal, key)) {
        this.modal[key] = {
          ...this.modal[key],
          ...data,
        };
      }
    },

    setPageLoaderContent(key, data) {
      if (Object.hasOwn(this.pageLoader, key)) {
        this.pageLoader[key] = {
          ...this.pageLoader[key],
          ...data,
        };
      }
    },

    setPageConfirmationContent(key, data) {
      if (
        Object.hasOwn(this.confirmation, key) &&
        Object.hasOwn(this.confirmation[key], 'body') &&
        Object.hasOwn(this.confirmation[key], 'header')
      ) {
        this.confirmation[key].body.content = data.body.content;
        this.confirmation[key].header = data.header;
      }
    },

    /**
     * Updates values of a form's input.
     *
     * @param {String} key
     * @param {String} values
     */
    setFormInput(key, values) {
      const current = this.form.inputs[key];
      this.form.inputs[key] = {
        ...current,
        ...values,
      };
    },

    setFormValidation(fieldKey, validations) {
      Object.keys(validations).forEach((validationKey) => {
        if (Object.hasOwn(this.form.inputs[fieldKey], 'messages')) {
          this.form.inputs[fieldKey].messages.validation[validationKey] =
            validations[validationKey];
        }
      });
    },

    setTheme(themeName) {
      this.theme = themeName;
      document.documentElement.classList.add(themeName);

      if (themeName === 'soventure') {
        this.setSoventureContent();
      }
    },

    setSoventureContent() {
      this.links.privacyPolicy.text =
        "Read SOVENTURE's Customer Privacy Policy";
    },

    setMode(theMode) {
      this.mode = theMode;
    },

    setPlanLogo(planLogo) {
      this.planLogo = planLogo;
    },

    setSideBarReviewPeriod(data) {
      this.sideBar.reviewPeriod = data;
    },
    setWPContent(content) {
      const {
        purchase_form_inputs,
        purchase_form_field_sets,
        purchase_modals,
        purchase_page_loaders,
        purchase_confirmations,
        purchase_section_side_bar,
      } = content;
      if (Array.isArray(purchase_form_inputs)) {
        purchase_form_inputs.forEach((inputData) => {
          const { messages } = inputData;
          delete inputData.messages;
          this.setFormInput(inputData.key, inputData);
          if (messages && Object.hasOwn(messages, 'validation')) {
            this.setFormValidation(inputData.key, messages.validation);
          }
        });
      }

      if (Array.isArray(purchase_form_field_sets)) {
        purchase_form_field_sets.forEach((fieldSetData) => {
          this.setFieldsetData(fieldSetData.key, fieldSetData);
        });
      }

      if (Array.isArray(purchase_modals)) {
        purchase_modals.forEach((modalData) => {
          this.setModalContent(modalData.key, modalData);
        });
      }

      if (Array.isArray(purchase_page_loaders)) {
        purchase_page_loaders.forEach((modalData) => {
          this.setPageLoaderContent(modalData.key, modalData);
        });
      }

      if (Array.isArray(purchase_confirmations)) {
        purchase_confirmations.forEach((confirmationData) => {
          this.setPageConfirmationContent(
            confirmationData.key,
            confirmationData
          );
        });
      }

      if (purchase_section_side_bar?.review_period) {
        this.setSideBarReviewPeriod(purchase_section_side_bar.review_period);
      }
    },
  },
});

/**
 * Logs a Google Analytics event when a user clicks any link
 * from the Cloudflare block user modal.
 *
 * @param {String} type - What type of link was clicked, "Phone" "Website" or "Refresh Page"
 */
window.logContactUsEventForCaptcha = function (type) {
  const contentStore = useContentStore();
  event('buy-page_cloudflare_block_user_contact_us_clicked', {
    hierarchical_layer_1: contentStore.getTheme.toUpperCase(),
    hierarchial_layer_2: type,
  });
};

window.getFormattedDate = function (helpText) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${helpText}${year}${month}${day}`;
};
