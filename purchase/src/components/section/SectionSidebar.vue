<script setup>
  import SectionPurchaseSummaryFull from './SectionPurchaseSummaryFull.vue';
  import SectionPurchaseSummaryMobile from './SectionPurchaseSummaryMobile.vue';
  import { useContentStore } from 'src/store/modules/content.js';
  import { computed, onMounted, ref } from 'vue';
  import { useApiStore } from 'src/store/modules/api.js';
  import { replaceContentVariables } from 'src/utility/index.js';
  import * as configcat from 'configcat-js';

  /**
   * @var {Object} contentStore
   */
  const contentStore = useContentStore();

  /**
   * @var {Object} apiStore
   */
  const apiStore = useApiStore();

  /**
   * @var {Object} privacyPolicyData
   */
  const privacyPolicyData = contentStore.getPrivacyPolicyLink;

  /**
   * @var {String} legalText
   */
  const legalText = contentStore.getLegalText;

  const planLogo = computed(() => contentStore.getPlanLogo);

  const isModeAnnual = computed(() => contentStore.isModeAnnual);

  const hideLinksInSummary = ref(false);

  const configCatClient = configcat.getClient(
    import.meta.env.VITE_CONFIG_CAT_SDK_KEY
  );

  /**
   * Helper function to Format Currency
   */
  function formatCurrency(value, maximumFractionDigits) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maximumFractionDigits,
    }).format(value);
  }

  const loadLinksFF = async () => {
    try {
      hideLinksInSummary.value = await configCatClient?.getValueAsync(
        'imt_20260203_hide_buy_summary_display_links',
        false
      );

    } catch (error) {
      console.error('Error fetching address lookup feature flag:', error);
      hideLinksInSummary.value = false;
    }
  };



  /**
   * Return a list of data to be rendered
   * for quote details
   *
   * @var {Object} quoteDetailsList
   */
  const quoteDetailsDesktopList = computed(() => {
    const quoteDetails = contentStore.getQuoteDetails;

    var displayData = [
      {
        title: 'Destination',
        value: quoteDetails.destination,
        loadingWidth: 'w-1/4',
      },
      {
        title: 'Departure Date',
        value: quoteDetails.departureDate,
        loadingWidth: 'w-1/3',
      },
      {
        title: 'Return Date',
        value: quoteDetails.returnDate,
        loadingWidth: 'w-1/3',
      },
      {
        title: 'Total Trip Cost',
        value: quoteDetails.tripCost,
        loadingWidth: 'w-1/5',
      },
    ];

    // Check if the app mode is type annual remove destination and override date labels
    if (isModeAnnual.value) {
      displayData = displayData.slice(1, -1); // This removes Destination and Total Trip Cost
      displayData[0].title = 'Effective Date'; // Changes Departure Date label to Effective Date
      displayData[1].title = 'Expiration Date'; // Changes Return Date label to Expiration Date
    }

    return displayData;
  });

  /**
   * Return a list of data to be rendered
   * for quote details
   *
   * @var {Object} quoteDetailsList
   */
  const quoteDetailsMobileList = computed(() => {
    const quoteDetails = contentStore.getQuoteDetails;
    const { destination, departureDate, returnDate, tripCost } = quoteDetails;
    var destinationDepartureReturnLabel =
      destination && departureDate && returnDate
        ? `${destination}, ${departureDate} - ${returnDate}`
        : null;
    const tripCostLabel = tripCost
      ? `Total Trip Cost: ${quoteDetails.tripCost}`
      : null;

    // Check if the app mode is type annual remove destination
    if (isModeAnnual.value) {
      destinationDepartureReturnLabel =
        departureDate && returnDate ? `${departureDate} - ${returnDate}` : null;
    }

    var displayData = [
      {
        value: destinationDepartureReturnLabel,
        loadingWidth: 'w-1/3',
      },
      {
        value: tripCostLabel,
        loadingWidth: 'w-1/2',
      },
    ];

    // Check if the app mode is type annual remove label
    if (isModeAnnual.value) {
      displayData = displayData.slice(0, -1); // This removes Total Trip Cost
    }

    return displayData;
  });

  /**
   * Return a list of data to be rendered
   * for quote details
   *
   * @var {Object} priceBreakdownList
   */
  const priceBreakdownList = computed(() => {
    const productDetails = contentStore.getProductDetails;
    const productCode = productDetails?.product?.code;

    const displayData = [
      {
        title: 'Plan Cost',
        value: productDetails?.product?.premium,
        loadingWidth: 'w-1/4',
      },
    ];

    // ISOS considers duration an option... so, code will not run if the productCode is ISOSGTIMT
    if (productDetails?.product?.options && productCode !== 'ISOSGTIMT') {
      // We need to gather the selected options and the cost for those options
      const selectedOptions = productDetails?.product?.options
        ?.filter((option) => {
          return option?.selected && (isModeAnnual.value || option?.cost > 0); // omit the cost check if isModeAnnual is true
        })
        .sort((a, b) => b.cost - a.cost);

      selectedOptions.forEach((option) => {
        if (typeof option.cost !== 'number') {
          console.error(`'${option.cost}' is not a valid integer/float.`);
          return;
        }

        if (
          option.id === 'adventureSportsRider' &&
          contentStore.isThemeSoventure
        ) {
          return;
        }

        if (option.id === 'cancelForAnyReason') {
          displayData.push({
            title: isNaN(option.value)
              ? option.displayName
              : `${option.value}% ${option.displayName}`,
            value: formatCurrency(option.cost),
          });
        } else if (
          option.id === 'yearsUpgrade' ||
          option.id === 'daysUpgrade'
        ) {
          displayData.push({
            title: isNaN(option.value)
              ? option.displayName
              : `${option.value} ${option.displayName}`,
            value: formatCurrency(option.cost),
          });
        } else if (option.id === 'membershipLength') {
          displayData.push({
            title: isNaN(option.value)
              ? option.displayName
              : `${option.value} Day ${option.displayName}`,
            value: formatCurrency(option.cost),
          });
        } else if (option.id === 'interruptionForAnyReason') {
          displayData.push({
            title: isNaN(option.value)
              ? option.displayName
              : `${option.value}% ${option.displayName}`,
            value: formatCurrency(option.cost),
          });
          // Trip Cancellation maintains relative price values and is absorbed into the plan price.
          // Give this, we can determine the actual cost by inspecting the option with zero value. (the value currently selected)
        } else if (isModeAnnual.value && option.id === 'tripCancellation') {
          const options = contentStore.getProductDetails?.product?.options;
          const optionWithValueZero = options?.find((option) => {
            return option?.id === 'tripCancellation' && option?.value === '0';
          });

          displayData.push({
            title: isNaN(option.value)
              ? option.displayName
              : `$${option.value} ${option.displayName}`,
            value: formatCurrency(Math.abs(optionWithValueZero?.cost ?? 0)),
          });
        } else {
          displayData.push({
            title: isNaN(option.value)
              ? option.displayName
              : `${formatCurrency(option.value, 0)} ${option.displayName}`,
            value: formatCurrency(option.cost),
          });
        }
      });
    }

    if (productDetails?.product?.policyFee) {
      displayData.push({
        title: 'Policy Fee',
        value: formatCurrency(productDetails?.product?.policyFee),
        loadingWidth: 'w-1/4',
      });
    }

    if (productDetails?.product?.tax) {
      displayData.push({
        title: 'Plan Taxes',
        value: formatCurrency(productDetails?.product?.tax),
        loadingWidth: 'w-1/4',
      });
    }

    return displayData;
  });

  /**
   * @var {Object} productDetails Product details display data
   */
  const productDetails = computed(() => contentStore.getProductDetails);

  const hideForm = computed(
    () =>
      contentStore.getPageLoaderData?.id === 'initial-load' &&
      contentStore.getIsPageLoaderDisplayed
  );

  const refundWindow = computed(() => {
    const coverages = apiStore.getProduct?.quoteResult?.coverages;
    if (!Array.isArray(coverages)) {
      return false;
    }

    const selectedCoverage = coverages.find(
      (row) => row?.id === 'refundWindow'
    );
    if (
      !selectedCoverage ||
      !Array.isArray(selectedCoverage.limits) ||
      !selectedCoverage.limits[0]
    ) {
      return false;
    }

    const firstLimit = selectedCoverage.limits[0];
    const coverage = firstLimit?.coverageValue;
    const value = firstLimit?.valueType;

    if (
      coverage === null ||
      coverage === undefined ||
      String(coverage).trim() === '' ||
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    ) {
      return false;
    }

    return {
      coverageValue: coverage,
      valueType: value,
    };
  });

  /**
   * Return look period back messaging
   *
   * @var {Object} reviewPeriodMessaging
   */
  const reviewPeriodMessaging = computed(() => {
    const displayData = {
      title: '',
      message: '',
    };

    if (refundWindow.value === false) {
      return displayData;
    }

    const reviewPeriod = JSON.parse(
      JSON.stringify(contentStore.getSideBarReviewPeriod)
    );

    displayData.title = reviewPeriod?.title;
    displayData.message = replaceContentVariables({
      '{{coverageValue}}': refundWindow.value.coverageValue,
      '{{valueType}}': refundWindow.value.valueType,
      
    }, reviewPeriod.message);
    
    return displayData;
  });

  onMounted(() => {
    loadLinksFF();
  });
</script>

<template>
  <aside class="purchase-sidebar">
    <SectionPurchaseSummaryFull
      class="display-none lg:block"
      :privacy-policy-data="privacyPolicyData"
      :product-details="productDetails"
      :price-breakdown-list="priceBreakdownList"
      :quote-details-list="quoteDetailsDesktopList"
      :legal-text="legalText"
      :hide-form="hideForm"
      :plan-logo="planLogo"
      :review-period-messaging="reviewPeriodMessaging"
      :hide-links="hideLinksInSummary"
    ></SectionPurchaseSummaryFull>
    <SectionPurchaseSummaryMobile
      class="lg:hidden"
      :product-details="productDetails"
      :price-breakdown-list="priceBreakdownList"
      :quote-details-list="quoteDetailsMobileList"
      :hide-form="hideForm"
      :plan-logo="planLogo"
      :review-period-messaging="reviewPeriodMessaging"
      :hide-links="hideLinksInSummary"
    ></SectionPurchaseSummaryMobile>
  </aside>
  <!-- ./purchase-sidebar -->
</template>

<style lang="scss" scoped>
  .purchase-sidebar {
    margin-right: 14px;
  }
</style>
