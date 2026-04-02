import dayjs from 'dayjs';

/**
 * Formats given date to YYY-MM-DD format, as required by V1 endpoint.
 *
 * @param date
 * @returns string
 */
export const formatDate = (date: any): string =>
  dayjs(date).format('YYYY-MM-DD');

/**
 *  Gets birthday of traveler given their age, and subtracts 45 days from given birthday.
 *
 * @param age - age of traveler
 * @returns string
 */
export const getBirthDateFromAge = (age: number): string => {
  // Get the current date
  const today = dayjs();

  // Calculate the birth year by subtracting the age from the current year
  const birthYear = today.year() - age;

  // Calculate the birthdate by setting the year to the birth year
  const birthDate = today.set('year', birthYear);

  // If the birthdate hasn't occurred yet this year, adjust it to last year
  if (birthDate.isAfter(today)) {
    return formatDate(birthDate.subtract(1, 'year'));
  }

  return formatDate(birthDate.subtract(45, 'day'));
};

/**
 * Redirects user to Quote Results Page.
 *
 * @param {ReturnType<typeof import('@/store/theme').useThemeStore>} themeStore - theme store to get current theme mode
 * @param {String | null} quoteId - new quote id that will be used on wordpress site
 * @return {void}
 */
export const redirectToQuoteResults = async (mode: string, quoteId: string) => {
  const url = new URL(window.location.origin);
  let isQidSet = false;

  // redirect to new quote results page
  // Example: /travel-insurance/quote/results?_qid=[NEW_QUOTE_ID]
  url.pathname = import.meta.env.VITE_IMT_NEW_QUOTE_RESULTS;

  // if quoteId is not null or empty, add to search params
  if (quoteId) {
    url.searchParams.set('_qid', quoteId);
    isQidSet = true;
  }

  // Add query parameter of the mode our app is in if not default (this may be edu or annual)
  if (mode && mode !== 'default') {
    url.searchParams.set('mode', mode);
  }

  if (isQidSet) {
    (window as Window).location = url.toString();
  } else {
    throw Error('_qid search url param has not been set.');
  }
};

/**
 * Calculates age from a YYYY-MM-DD date string
 * @param dateString - ISO date string (e.g. "1999-12-09")
 * @returns Age in years, or empty string if invalid
 */
export function getAgeFromDateString(dateString: string): number | string {
  if (!dateString) return '';

  const birthDate = new Date(dateString);
  if (Number.isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Birthday hasn't happened yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown non-serializable error';
  }
}

/**
 * Validates ITP Date so it's within range of 5 years. If greater than 5 years, show error.
 * 
 * @return boolean
 */
export const validateITPDate = (date: Date): boolean => {
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const minITPDate = new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate());

  if (!date) return true;

  const selectedDate = date;
  if (date) {
    selectedDate?.setHours(0,0,0,0);
  }
  const isWithinRange = selectedDate === null || selectedDate >= minITPDate && selectedDate <= today;
  return isWithinRange;
};


export function getAgeFromDOB(dateString: string): number {
  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);

  // Guard against invalid input
  if (!year || !month || !day) {
    throw new Error(`Invalid date string: "${dateStr}"`);
  }

  // Month is 0-based in JS Date
  return new Date(year, month - 1, day);
}
