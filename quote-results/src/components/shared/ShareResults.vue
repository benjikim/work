<script setup lang="ts">
  import { reactive, computed, watch, ref } from 'vue';
  import { ArrowUpOnSquareIcon } from '@heroicons/vue/24/outline';
  import BaseCheckBox from '@/components/base/BaseCheckBox.vue';
  import BaseTextInput from '@/components/base/BaseTextInput.vue';
  import BaseTextArea from '@/components/base/BaseTextArea.vue';
  import QuoteReferenceNumber from '@/components/shared/QuoteReferenceNumber.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { getShownPlans } from '@/utility/index.ts';
  import { useApiStore } from '@/store/api';
  import { useVuelidate } from '@vuelidate/core';
  import { required, helpers, email } from '@vuelidate/validators';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();

  const props = defineProps({
    destination: {
      type: String,
      required: false,
      default: '',
    },
  });

  const state = reactive({
    isOpen: false,
    showFriendInput: false,
    marketingOptin: false,
    email: '',
    friendsEmail: '',
    firstName: '',
    lastName: '',
    emailSent: false,
    errorSendingEmail: false,
    isSending: false,
  });

  // Add this new ref to track if the first field has been interacted with
  const firstFieldInteracted = ref(false);

  // Regex for name validation
  const nameRegex = /^[A-Za-z\-'\.]+$/;

  /**
   * Regex for name validation.
   *
   * @param {string} name given
   */
  const nameValidation = (name: string) => {
    const regex = new RegExp(nameRegex);
    if (name === '') {
      return true;
    }
    return regex.test(name);
  };

  /**
   * Regex for multiple email format.
   *
   * @param {string} emails
   */
  const emailsFormat = (emails: string) => {
    const regex = new RegExp(
      /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/
    );
    if (emails === '') {
      return true;
    }
    return regex.test(emails);
  };

  const rules = computed(() => ({
    firstName: {
      required: helpers.withMessage('First name cannot be blank.', required),
      nameValidation: helpers.withMessage(
        'Please only use upper/lower case letters and the following symbols: "-", "\'", "."',
        nameValidation
      ),
    },
    lastName: {
      required: helpers.withMessage('Last name cannot be blank.', required),
      nameValidation: helpers.withMessage(
        'Please only use upper/lower case letters and the following symbols: "-", "\'", "."',
        nameValidation
      ),
    },
    email: {
      required: helpers.withMessage('Email address cannot be blank.', required),
      email: helpers.withMessage('Please enter a valid email address.', email),
    },
    friendsEmail: {
      emailsFormat: helpers.withMessage(
        'Please enter a valid email address.',
        emailsFormat
      ),
    },
  }));

  /**
   * Handler for share with friend checkbox.
   *
   * @param {InputEvent} e
   */
  const handleShareWithFriend = (e: InputEvent): void => {
    const target = e.target as HTMLInputElement;

    state.showFriendInput = target.checked;

    if (target.checked) {
      event('email_a_quote', {
        hierarchical_layer_1: 'Share Your Quote With A Friend Clicked',
      } as GAObject);
    }
  };

  /**
   * Handler for marketing checkbox.
   *
   * @param {InputEvent} e
   */
  const handleMarketingOptIn = (e: InputEvent): void => {
    const target = e.target as HTMLInputElement;

    state.marketingOptin = target.checked;
    sessionStore.setEmailAQuoteMarketingOptIn(target.checked);

    if (target.checked) {
      event('email_a_quote', {
        hierarchical_layer_1:
          'I would like to receive travel news and travel insurance information from InsureMyTrip Clicked',
      } as GAObject);
    }
  };

  /**
   * A helper method to update session store for text inputs in this form.
   *
   * @param {string} data
   * @param {string} val
   */
  const updateSessionStore = (data: string, val: string) => {
    // If the user hasn't interacted with the form yet, we shall fire an event upon the users first interaction.
    if (!firstFieldInteracted.value) {
      firstFieldInteracted.value = true;
      event('form_interaction', {
        hierarchical_layer_1: `First Field Interaction: ${val}`,
      } as GAObject);
    }

    if (val === 'firstName') {
      state.firstName = data;
      v$.value.firstName.$validate();
      if (!v$.value.firstName.$error) {
        sessionStore.setEmailAQuoteFirstName(data);
      } else {
        sessionStore.setEmailAQuoteFirstName(null);
      }
    } else if (val === 'lastName') {
      state.lastName = data;
      v$.value.lastName.$validate();
      if (!v$.value.lastName.$error) {
        sessionStore.setEmailAQuoteLastName(data);
      } else {
        sessionStore.setEmailAQuoteLastName(null);
      }
    } else if (val === 'email') {
      state.email = data;
      v$.value.email.$validate();
      if (!v$.value.email.$error) {
        sessionStore.setEmailAQuoteEmail(data);
      } else {
        sessionStore.setEmailAQuoteEmail(null);
      }
    } else if (val === 'message') {
      sessionStore.setEmailAQuoteMessage(data);
    } else if (val === 'friendsEmail') {
      state.friendsEmail = data;
      v$.value.friendsEmail.$validate();
      if (!v$.value.friendsEmail.$error) {
        const emails = data.split(',').map((e) => e.trim()) as string[];
        sessionStore.setEmailAQuoteFriendsEmail(emails);
      } else {
        sessionStore.setEmailAQuoteFriendsEmail([]);
      }
    }
  };

  /**
   * Checks to see if form is valid.
   */
  const isValid = computed(() => {
    const { firstName, lastName, email } = sessionStore.getEmailAQuoteObject;
    return firstName !== null && lastName !== null && email !== null;
  });

  const handleSend = async () => {
    // Email A Quote Event
    event('email_a_quote', {
      hierarchical_layer_1: 'Send Email a Quote Widget',
    } as GAObject);

    state.isSending = true;
    await sessionStore.setPlanParameters();

    const plans = getShownPlans()
      .filter((plan) => plan.showPlan)
      .map((plan) => {
        return {
          productCode: plan.code,
          price: sessionStore.getCurrentPlanCostUnformatted(plan.code),
        };
      });

    sessionStore.setEmailAQuotePlans(plans);

    const url = new URL(window.location.href);
    url.searchParams.set('utm_source', 'sharequote');
    url.searchParams.set('utm_medium',  window.location.pathname.includes('compare') ? 'compare' : 'results');
    url.searchParams.set('utm_campaign', 'emailaquote');
    sessionStore.setEmailAQuoteUrl(url.toString());

    const obj = sessionStore.getEmailAQuoteObject;
    const result = await apiStore.emailAQuote(obj);

    if (result) {
      state.emailSent = true;
    } else {
      state.errorSendingEmail = true;
    }
    state.isSending = false;
  };

  const handleOpen = () => {
    state.isOpen = true;

    // Fire Email a Quote Event
    event('email_a_quote', {
      hierarchical_layer_1: 'Share Results Button Clicked',
    } as GAObject);
  };

  const handleCancel = () => {
    sessionStore.setEmailAQuoteFirstName(null);
    state.firstName = '';
    sessionStore.setEmailAQuoteLastName(null);
    state.lastName = '';
    sessionStore.setEmailAQuoteMarketingOptIn(false);
    state.marketingOptin = false;
    sessionStore.setEmailAQuoteEmail(null);
    state.email = '';
    state.showFriendInput = false;
    state.isOpen = false;

    // Fire Email a Quote Event
    event('email_a_quote', {
      hierarchical_layer_1: 'Cancel Email a Quote Widget',
    } as GAObject);
  };

  const handleClose = () => {
    state.errorSendingEmail = false;
    state.isOpen = false;
    state.emailSent = false;

    // Fire Email a Quote Event
    event('email_a_quote', {
      hierarchical_layer_1: 'User Exits Email a Quote Widget',
    } as GAObject);
  };

  const isMarketingHidden = computed(() => apiStore.isMarketingHidden);

  // Default value for text area message.
  const textAreaMessage = computed(() => {
    return `Hello${state.firstName && !state.showFriendInput ? ` ${state.firstName}` : ''},\n\n${!state.showFriendInput ? `Thank you for getting a travel insurance quote for your trip to ${props.destination}!` : `${state.firstName ? `${state.firstName}` : 'Your Friend'} wanted to share this quote for travel protection for an upcoming trip to ${props.destination}!`} You can review the details of your quote below.\n\nMany benefits are time-sensitive, and rates can change the longer you wait.\n\nReady to protect your trip now? Click the button below to purchase your plan.`;
  });
  sessionStore.setEmailAQuoteMessage(textAreaMessage.value);

  const v$ = useVuelidate(rules, state);

  // Watch for changes in the computed message and update the session store
  watch(textAreaMessage, (newMessage) => {
    sessionStore.setEmailAQuoteMessage(newMessage);
  });
</script>

<template>
  <div>
    <button
      class="text-xs sm:text-base h-[36px] pl-3 pr-3 md:pl-4 md:pr-4 md:h-12 min-h-8 md:min-h-12 m-1 daisy-btn mb-1 sm:mb-5 md:rounded-3xl md:bg-transparent md:border-2 md:border-[#DEDEDE] font-normal md:w-[215px] md:text-[#4397C7]"
      data-cy="open-shareResults--modal-btn"
      @click="handleOpen"
    >
      <ArrowUpOnSquareIcon class="size-5 md:stroke-action-primary cursor-pointer" />
      <p class="font-bold text-sm display-none md:block text-action-primary">Share Results</p>
    </button>
    <dialog
      v-if="state.isOpen"
      class="daisy-modal daisy-modal-open z-[998]"
      @close="handleClose"
    >
      <div
        class="daisy-modal-box w-dvw max-w-3xl p-6 rounded overflow-hidden shadow-black float-right"
      >
        <button
          type="button"
          class="close-btn text-2xl float-right"
          aria-label="close"
          data-cy="close-shareResults--modal-btn"
          @click="handleClose"
        >
          ×
        </button>

        <p class="text-3xl pb-4" v-if="!state.emailSent">Email Quote</p>
        <p class="text-3xl pb-4" v-if="state.emailSent">Sending Email</p>
        <QuoteReferenceNumber />
        
        <div class="content h-full">
          <div
            class="h-full"
            v-if="!state.emailSent && !state.errorSendingEmail"
          >
            <div class="grid grid-cols-2 gap-4">
              <BaseTextInput
                :id="'firstName'"
                data-cy="firstName-shareResults--modal-input"
                v-model="state.firstName"
                :value="state.firstName"
                :hint="''"
                :label="'First Name'"
                :disabled="false"
                :required="true"
                :placeholder="''"
                :type="'text'"
                class="py-2"
                @update:blur="updateSessionStore($event, 'firstName')"
                :errors="v$.firstName?.$errors.map((error) => error.$message)"
              >
              </BaseTextInput>

              <BaseTextInput
                :id="'lastName'"
                data-cy="lastName-shareResults--modal-input"
                v-model="state.lastName"
                :value="state.lastName"
                :hint="''"
                :label="'Last Name'"
                :disabled="false"
                :required="true"
                :placeholder="''"
                :type="'text'"
                class="py-2"
                @update:blur="updateSessionStore($event, 'lastName')"
                :errors="v$.lastName?.$errors.map((error) => error.$message)"
              >
              </BaseTextInput>
            </div>

            <BaseTextInput
              :id="'email'"
              data-cy="email-shareResults--modal-input"
              v-model="state.email"
              :value="state.email"
              :hint="''"
              :label="'Email'"
              :disabled="false"
              :required="true"
              :placeholder="''"
              :type="'text'"
              class="py-2"
              @update:blur="updateSessionStore($event, 'email')"
              :errors="v$.email?.$errors.map((error) => error.$message)"
            >
            </BaseTextInput>

            <BaseTextArea
              id="message"
              data-cy="message-shareResults--modal-textArea"
              :value="textAreaMessage"
              :hint="''"
              :label="'Message'"
              :disabled="false"
              :required="false"
              :placeholder="''"
              class="py-2"
              @update:blur="updateSessionStore($event, 'message')"
            >
            </BaseTextArea>

            <BaseCheckBox
              :id="`share-quote-friend`"
              data-cy="shareQuoteFriend-shareResults--modal-checkbox"
              :name="`share-quote-friend`"
              label="Share your quote results with a friend."
              :disabled="false"
              :checked="state.showFriendInput"
              :required="false"
              class="py-2"
              @input="handleShareWithFriend"
            />

            <div v-if="state.showFriendInput" class="ml-4 my-5">
              <BaseTextInput
                :id="'friendsEmail'"
                data-cy="friendsEmail-shareResults--modal-input"
                v-model="state.friendsEmail"
                :value="sessionStore.getEmailAQuoteFriendsEmail?.join(',')"
                :hint="''"
                label="Recipient email(s)"
                :disabled="false"
                :required="false"
                :placeholder="''"
                :type="'text'"
                :messages="['Separate multiple email addresses with a comma.']"
                :maxlength="512"
                @update:blur="updateSessionStore($event, 'friendsEmail')"
                :errors="
                  v$.friendsEmail?.$errors.map((error) => error.$message)
                "
              >
              </BaseTextInput>
            </div>

            <BaseCheckBox
              v-show="!isMarketingHidden"
              id="emailOptIn"
              data-cy="emailOptIn-shareResults--modal-checkbox"
              name="emailOptIn"
              label="I would like to receive travel news and travel insurance information from InsureMyTrip."
              :disabled="false"
              :checked="state.marketingOptin"
              :required="false"
              class="py-4"
              @input="handleMarketingOptIn"
            />

            <div class="grid grid-cols-2 gap-4 py-4 overflow-hidden">
              <button
                data-cy="cancel-shareResults--modal-btn"
                class="daisy-btn daisy-btn-block bg-[white] border-action-alt-primary border-2 py-4 px-6 flex justify-center text-action-primary font-semibold rounded uppercase"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                data-cy="send-shareResults--modal-btn"
                :class="`daisy-btn daisy-btn-block py-4 px-6 flex justify-center text-[white] font-semibold rounded uppercase ${isValid && state.isSending === false ? 'bg-action-primary' : 'daisy-btn-disabled'}`"
                @click="handleSend"
              >
                Send
              </button>
            </div>
          </div>

          <div class="h-full" v-if="state.emailSent">
            <div class="alert alert-success">
              <p>
                Your message has been sent to
                <span class="font-bold">{{
                  state.friendsEmail === ''
                    ? state.email
                    : `${state.email}, ${state.friendsEmail}`
                }}</span
                >.
              </p>
              <p>
                If the email does not arrive in the next half hour, please check
                your spam or junk mail folder.
              </p>
            </div>
          </div>

          <div class="h-full" v-if="state.errorSendingEmail">
            <div class="alert alert-error">
              <p>
                There was an issue processing your request. Please try again
                later.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="daisy-modal-backdrop" @click="handleClose"></div>
    </dialog>
  </div>
</template>

<style lang="scss" scoped>
  #quote-results-app {
    .alert {
      padding: 20px;
    }
    .alert-success {
      background-color: #dff0d8;
      color: #3c763d;
    }
    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .content {
      overflow-y: auto;
      max-height: calc(100vh - 5em - 5rem - 1.5rem);
    }
  }
</style>
