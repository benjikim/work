import { z } from 'zod';
import { parseMDY } from '@/utils';

const itpSchema = z
  .union([z.date(), z.string(), z.null()])
  .transform((val) => {
    if (val === null) return null;
    if (val instanceof Date) return val;
    return parseMDY(val);
  })
  .superRefine((date, ctx) => {
    if (date === null) return;

    // 1️⃣ Invalid date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date format',
      });
      return;
    }

    // 2️⃣ Future date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (d > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date cannot be in the future',
      });
    }
  });

const CitizenshipCountrySchema = (
  validCountries: { code: string; value: string }[],
  errorMessage: string
) =>
  z.preprocess(
    (value) => {
      if (value == null) return '';
      if (
        typeof value === 'object' &&
        'value' in value &&
        typeof (value as any).value === 'string'
      ) {
        return (value as any).value;
      }
      return value;
    },
    z
      .string()
      .min(1, errorMessage)
      .refine(
        (val) => validCountries.some((c) => c.value === val || c.code === val),
        {
          message: errorMessage,
        }
      )
  );

const ResidenceCountrySchema = (
  validCountries: { code: string; value: string }[],
  errorMessage: string
) =>
  z.preprocess(
    (value) => {
      if (value == null) return '';
      if (
        typeof value === 'object' &&
        'value' in value &&
        typeof (value as any).value === 'string'
      ) {
        return (value as any).value;
      }
      return value;
    },
    z
      .string()
      .min(1, errorMessage)
      .refine(
        (val) => validCountries.some((c) => c.value === val || c.code === val),
        {
          message: errorMessage,
        }
      )
  );

// Zod schema for form validation
// @TODO: Add validation for all fields
// This validcation is incomplete and needs to be updated
export const quoteFormSchema = (
  contentStore: ReturnType<typeof import('@/store/content').useContentStore>,
  themeStore: ReturnType<typeof import('@/store/theme').useThemeStore>
) =>
  z.object({
    travelDates: z.preprocess(
      (value) => {
        const DATE_RANGE_REGEX = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4} - (0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;

        const normalizeDate = (v: unknown) => {
          if (v instanceof Date && !isNaN(v.getTime())) return v;
          return null;
        };

        if ( value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
          return [null, null];
        }

        if (Array.isArray(value)) {
          return [
            normalizeDate(value[0]),
            normalizeDate(value[1]),
          ];
        }

        if (typeof value === 'string') {
          if (!DATE_RANGE_REGEX.test(value)) {
            return [null, null];
          }
          return value.split(' - ').map(d => new Date(d));
        }

        return [null, null];
      },
      z
        .array(z.date().nullable())
        .length(2)
        .refine(([start, end]) => !!start && !!end, {
          message:
            contentStore.getQuoteFormContentByKey('travel_dates').departure_date
              .error_message,
        })
    ),

    numberOfTravelers: z.number().min(1),

    citizenshipCountry: CitizenshipCountrySchema(
      contentStore.getCitizenshipList,
      contentStore.getQuoteFormContentByKey('citizenship').error_message
    ),
    residence: z
      .object({
        residenceCountry: ResidenceCountrySchema(
          contentStore.getCitizenshipList,
          contentStore.getQuoteFormContentByKey('residence').country
            .error_message
        ),
        residenceState: z.any().optional(),
      })
      .superRefine((data, ctx) => {
        const residenceCountry = data.residenceCountry;
        const residenceState = data.residenceState;

        if (residenceCountry === 'United States' || themeStore.getCurrentThemeMode === "annual") {
          if (!residenceState) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                contentStore.getQuoteFormContentByKey('residence').state
                  .error_message,
              path: ['residenceState'],
            });
          }
        }
      }),
    itp: itpSchema,
    willProtectTripCost: z.boolean().optional(),
  });
