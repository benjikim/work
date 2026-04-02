import { useFormStore } from 'src/store/modules/form.js';
import { useApiStore } from 'src/store/modules/api.js';
import { useContentStore } from 'src/store/modules/content.js';
import { deepCopy } from '../../utility';

export function apiPlugin({ store, }) {
  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const formStore = useFormStore();

  store.$onAction(async (action) => {
    // Fires whenever setAgeChanged gets invoked.
    if (
      action.name === 'setAgeChanged'
      && action.store.$id === 'form-store'
    ) {
      const productCode = apiStore.getProductCode;

      action.after(async () => {
        const travelers = formStore.getTravelers;
        const missingDobs = travelers.some(traveler => traveler.DOB === null);
        const isTravelerAgeZero = travelers.some(traveler => traveler.age === 0);
        // These are the products that currently restrict travelers with age 0
        // The values of this obj are the number of days old a traveler can be
        // If it is under, this will PNS and we need to give some messaging to the user
        const productsWithAgeZeroRestriction = {
          ISOSGTIMT: 45,
          IMGPA: 14,
          IMGPI: 14,
        };

        // When we have all the DOBs, update product
        // inputs. Depending on how the user interacts with
        // the form, this can be a partial update of inputs.
        // The main purpose of doing this is to ensure we have
        // an accurate premium and communicate any changes to user.
        if (!missingDobs) {
          contentStore.setPageLoaderData(contentStore.getPageLoader('ageChangeRequote'));
          contentStore.setShowPageLoader(true);

          await apiStore.addProductInputsToProduct();
          contentStore.setShowPageLoader(false);

          // If the plan is no longer available, we want to make sure we provide content
          // that lets the user know why, if it wasn't this, then let the default message
          // just tell the user it isn't available.
          if (isTravelerAgeZero && !apiStore.getProduct) {
            const planNotAvailableModal = deepCopy(
              contentStore.getModal('ageZeroPlanNotAvailable')
            );

            planNotAvailableModal.body.setContent({
              '{{ageZeroDaysAllowed}}': productsWithAgeZeroRestriction[productCode],
            });

            contentStore.setModalData(planNotAvailableModal);
            contentStore.setShowModal(true);

            return;
          }
        }
      });
    }

    if (
      action.name === 'setTripDetailsChanged'
      && action.args[0] === true
      && action.store.$id === 'form-store'
    ) {
      // Get the current premium of product and hold it
      const currentPremium = apiStore.getProductPremium;
      if (!currentPremium) {
        return;
      }

      action.after(async () => {
        contentStore.setPageLoaderData(contentStore.getPageLoader('itpRequote'));
        contentStore.setShowPageLoader(true);
        await apiStore.addProductInputsToProduct();

        formStore.setTripDetailsChanged(false);
        contentStore.setShowPageLoader(false);
      });
    }

    if (
      action.name === 'setClickthrough' &&
      action.args.includes('note51dc21549571e') &&
      action.store.$id === 'form-store'
    ) {
      // Get the current premium of product and hold it
      const currentPremium = apiStore.getProductPremium;
      if (!currentPremium) {
        return;
      }

      action.after(async () => {
        contentStore.setPageLoaderData(contentStore.getPageLoader('clickthroughRequote'));
        contentStore.setShowPageLoader(true);

        // Requote by updating product inputs
        await apiStore.addProductInputsToProduct();

        formStore.setTripDetailsChanged(false);
        contentStore.setShowPageLoader(false);

        // Check if total cost changed and show modal if needed
        const updatedPremium = apiStore.getProductPremium;

        if (updatedPremium !== null && currentPremium !== updatedPremium) {
          const premiumChangeModal = deepCopy(
            contentStore.getModal('DOBPremiumChange')
          );

          const direction = (currentPremium < updatedPremium) ? 'increased' : 'decreased';
          premiumChangeModal.body.setContent({
            '{{priceChangeType}}': direction,
            '{{newValue}}': `$${updatedPremium}`,
          });

          contentStore.setModalData(premiumChangeModal);
          contentStore.setShowModal(true);
        }
      });
    }

    if (
      action.name === 'setCountry'
      && action.args[0] === 'residence'
      && action.store.$id === 'form-store'
      && apiStore.getAppInitializationStatus
    ) {
      // eslint-disable-next-line no-unused-vars
      const [_, countryCodeChange] = action.args;
      const currResidenceCountry = formStore.getResidenceCountry;
      const currentTotalCost = apiStore.getProductTotalCost;
      const orderId = apiStore.getOrderId;
      const productId = apiStore.getProduct?.productId;

      formStore.setState('residence', (countryCodeChange === 'USA' || countryCodeChange === 'CAN') ? null : 'OT');

      action.after(async () => {
        // We can update inputs if there is a change and countryCode is not USA or CAN.
        if (currResidenceCountry !== countryCodeChange && countryCodeChange !== 'USA' && countryCodeChange !== 'CAN') {
          contentStore.setPageLoaderData(contentStore.getPageLoader('itpRequote'));
          contentStore.setShowPageLoader(true);

          // Updating product
          const updateProduct = await apiStore.addProductInputsToProduct();
          if (updateProduct) {
            // Setting all our content for order.
            const order = await apiStore.fetchOrder();

            if (!order) {
              console.error(`Could not get order for id '${orderId}'`);
              return;
            }
          } else {
            console.error(`Could not update product for id '${productId}'`);
            return;
          }

          contentStore.setShowPageLoader(false);

          const updatedTotalCost = apiStore.getProductTotalCost;

          if (updatedTotalCost !== null && currentTotalCost !== updatedTotalCost) {
            const premiumChangeModal = deepCopy(
              contentStore.getModal('DOBPremiumChange')
            );

            const direction = (currentTotalCost < updatedTotalCost) ? 'increased' : 'decreased';
            premiumChangeModal.body.setContent({
              '{{priceChangeType}}': direction,
              '{{newValue}}': `$${updatedTotalCost}`,
            });

            contentStore.setModalData(premiumChangeModal);
            contentStore.setShowModal(true);
          }
        }
      });
    }

    if (
      action.name === 'setState'
      && action.args[0] === 'residence'
      && action.store.$id === 'form-store'
      && apiStore.getAppInitializationStatus
    ) {
      // eslint-disable-next-line no-unused-vars
      const [_, stateCodeChange] = action.args;
      const currResidenceState = formStore.getResidenceState;
      const currentTotalCost = apiStore.getProductTotalCost;
      const orderId = apiStore.getOrderId;
      const productId = apiStore.getProduct?.productId;

      action.after(async () => {
        if (currResidenceState !== 'OT' && stateCodeChange !== null && stateCodeChange !== 'OT' && currResidenceState !== stateCodeChange) {

          contentStore.setPageLoaderData(contentStore.getPageLoader('itpRequote'));
          contentStore.setShowPageLoader(true);

          // Updating product
          const updateProduct = await apiStore.addProductInputsToProduct();
          if (updateProduct) {
            // Setting all our content for order.
            const order = await apiStore.fetchOrder();

            if (!order) {
              console.error(`Could not get order for id '${orderId}'`);
              return;
            }
          } else {
            console.error(`Could not update product for id '${productId}'`);
            return;
          }

          contentStore.setShowPageLoader(false);

          const updatedTotalCost = apiStore.getProductTotalCost;

          if (updatedTotalCost !== null && currentTotalCost !== updatedTotalCost) {
            const premiumChangeModal = deepCopy(
              contentStore.getModal('DOBPremiumChange')
            );

            const direction = (currentTotalCost < updatedTotalCost) ? 'increased' : 'decreased';
            premiumChangeModal.body.setContent({
              '{{priceChangeType}}': direction,
              '{{newValue}}': `$${updatedTotalCost}`,
            });

            contentStore.setModalData(premiumChangeModal);
            contentStore.setShowModal(true);
          }
        }
      });
    }
  });
}
