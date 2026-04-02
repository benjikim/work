export const MOCK_CLICKTHROUGH_DATA = [
  {
    id: 'note5e7b874124c3c',
    type: 'checkbox',
    values: [
      {
        label: 'Can you check this for me?',
        value: 'yes',
      }
    ],
    validationRegex: 'yes',
    content: {
      messages: ['Can you check this for me?'],
      notes: ['Note: I am a bit unsure....'],
    },
  },
  {
    id: 'note5e7b874124c3d',
    type: 'radio',
    values: [
      {
        label: 'Not Selected (+$0)',
        value: 0,
      },
      {
        label: '$300/day $4,000 max. (+$12)',
        value: 12,
      }
    ],
    validationRegex: 'yes',
    content: {
      messages: ['I need to be pressed'],
      notes: ['Note: This site requires pressing'],
    },
  },
  {
    id: 'note5e7b874124c3e',
    type: 'input',
    values: '*',
    validationRegex: 'yes',
    content: {
      messages: ['Due to the World Health Organization (WHO)...'],
      notes: ['Note: This site requires an e-signature'],
    },
  }
];

export const MOCK_ORDER_REQUIRED_FIELDS = [
  'traveler.0.name',
  'traveler.0.dob',
  'traveler.0.age',
  'residence.address',
  'residence.city',
  'residence.state',
  'residence.zip',
  'residence.country',
  'emailAddress.required',
  'phoneNumber.required',
  'passport.0.number',
  'passport.0.issuingCountry',
  'creditCard.name',
  'creditCard.number',
  'creditCard.expiry',
  'creditCard.CVV',
  'billing.address',
  'billing.address2',
  'billing.city',
  'billing.state',
  'billing.zip',
  'billing.country',
  'travelSupplier.tourOperator',
  'travelSupplier.airline',
  'travelSupplier.cruiseline',
  'clickthrough.note5e7b874124c3e.value',
  'trip.cost',
  'trip.firstTripPayment',
  'trip.finalTripPayment',
  'school.name'
];
