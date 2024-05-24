<template>
  <v-dialog v-model="modelValue" width="800">
    <v-card>
      <v-card-title>
        <div class="d-flex align-center">
          <div>{{ service.title }}</div>
          <v-icon class="ml-auto cursor-pointer" size="md" @click="modelValue = false">mdi-close</v-icon>
        </div>
      </v-card-title>
      <v-card-subtitle>Пройдите необходимые шаги записи на услугу</v-card-subtitle>
      <v-card-text>
        <div class="d-flex">
          <v-img :src="service.image_url" class="mr-5 rounded-xl" width="400px" max-width="400px" style="height: fit-content" />
          <div>
            <div class="mb-4">
              <h4 class="font-weight-bold">Описание</h4>
              <div>{{ service.description }}</div>
            </div>
            <div class="mb-4">
              <h4 class="font-weight-bold">Клуб</h4>
              <div>{{ service.club_title }}</div>
            </div>
            <div class="mb-4">
              <h4 class="font-weight-bold">Длительность</h4>
              <div>{{ service.duration * 60 }} мин</div>
            </div>
            <div class="mb-4">
              <h4 class="font-weight-bold">Исполнители</h4>
              <div v-for="employee in service.employees">- {{ employee.name }} {{ employee.surname }}</div>
            </div>
            <div>
              <h4 class="font-weight-bold">Стоимость</h4>
              <div>₽ {{ service.price }}</div>
            </div>
          </div>
        </div>
        <v-stepper v-model="currentStep" :items="stepperItems" class="mt-8" flat next-text="Продолжить" prev-text="Назад">
          <template #item.1>
            <v-date-picker
                v-model="userSelectedData.date"
                :allowed-dates="allowedDates"
                hide-header
                header="Выберите дату"
                title="Выберите дату"
                class="mx-auto w-50"
            />
          </template>
          <template #item.2>
            <v-chip-group v-if="!isTimeslotsLoading && availableTimeslots.length" v-model="userSelectedData.timeslotIndex" column filter>
              <v-chip v-for="timeslot in availableTimeslots" variant="outlined" color="primary">{{ useTimeslot(timeslot) }}</v-chip>
            </v-chip-group>
            <div v-else class="d-flex justify-center align-center w-100 py-8">
              <template v-if="isTimeslotsLoading">
                <div class="mr-4">Идет загрузка...</div>
                <v-progress-circular indeterminate />
              </template>
              <template v-else>
                <div>Отсутствуют свободные промежутки. Выберите другую дату и повторите попытку</div>
              </template>
            </div>
          </template>
          <template #item.3>
            <div class="payment-form-wrapper py-2">
              <div v-if="isChangeMode" class="text-green position-relative font-weight-bold d-flex align-center mb-5" style="z-index: 1;">
                <v-icon class="mr-2">mdi-check-circle</v-icon>
                Услуга оплачена
              </div>
              <v-text-field v-model="paymentData.cardNumber" v-maska:[masks.cardNumber] label="Номер карты" variant="outlined" />
              <v-text-field v-model="paymentData.cardHolder" v-maska:[masks.cardHolder] data-maska="A A" data-maska-tokens="A:[A-Z]" label="Владелец карты" variant="outlined" />
              <v-text-field v-model="paymentData.CVV" v-maska:[masks.CVV] label="Код безопасности" variant="outlined" />
              <div v-if="isPaymentInProgress || userSelectedData.isPayed || isChangeMode" class="form-loading-overlay" />
              <v-progress-circular v-if="isPaymentInProgress" indeterminate class="form-loading-overlay-spinner" />
            </div>
          </template>
          <template #item.4>
            <div class="py-2">
              <h3>Вы успешно записаны на услугу <span class="font-weight-bold">"{{ service.title }}"</span></h3>
              <h3 class="mt-1">Дата записи: <span class="font-weight-bold">{{  dayjs(userSelectedData.date).format('DD.MM.YYYY') }}</span></h3>
              <h3 class="mt-1">Время записи: <span class="font-weight-bold">{{  useTimeslot(availableTimeslots[userSelectedData.timeslotIndex]) }}</span></h3>
              <h3 class="mt-1">Клуб: <span class="font-weight-bold">{{  service.club_title }}</span></h3>
              <div class="mt-2 text-red">Место проведения уточняйте на стойке регистрации</div>
            </div>
          </template>
          <template #prev>
            <v-btn v-if="currentStep !== stepperItems.length" @click="toPrevStep">Назад</v-btn>
          </template>
          <template #next>
            <div class="d-flex align-center" style="gap: 12px">
              <v-btn v-if="currentStep === stepperItems.length" :disabled="false" variant="text" color="primary" href="/profile" target="_blank" tag="a">
                В личный кабинет
                <v-icon class="ml-2">mdi-chevron-right</v-icon>
              </v-btn>
              <v-btn v-if="currentStep !== 3" color="primary" :disabled="isNextButtonDisabled" @click="toNextStep">
                {{ currentStep === stepperItems.length ? 'Завершить' : 'Далее' }}
              </v-btn>
              <v-btn v-else :disabled="isPaymentButtonDisabled" :readonly="userSelectedData.isPayed" :color="userSelectedData.isPayed ? 'success' : 'primary'" class="mb-4" elevation="0" @click="pay">
                <v-icon v-if="!userSelectedData.isPayed">mdi-credit-card-outline</v-icon>
                <v-icon v-else>mdi-check</v-icon>
                <div v-if="!isChangeMode" class="ml-4">{{ userSelectedData.isPayed ? 'Успешно!' : 'Оплатить' }}</div>
                <div v-else>{{ userSelectedData.isPayed ? 'Успешно!' : 'Перенести запись' }}</div>
              </v-btn>
            </div>
          </template>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type {Service} from "@/models/service";
import {computed, ref, watch} from "vue";
import {API_URL} from "../../../utils/constants";
import axios from "axios";
import dayjs from "dayjs";
import { vMaska } from "maska";
import router from "@/router";
import {useUser} from "../../../utils/globals";
import {useTimeslot} from "../../utils/use-timeslot";
import {useRoute} from "vue-router";

interface Props {
  service: Service;
  allowedDates: string[];
  isChangeMode: boolean;
}
const props = defineProps<Props>();

// data
const modelValue = defineModel<boolean>();
const { query } = useRoute();
const masks = {
  cardNumber: { mask: '####-####-####-####' },
  cardHolder: { preProcess: (val: string) => {
    if (val === ' ') return '';

    let resultString = val;

    if (val[val.length - 1] === ' ' && val.split(' ').length - 1 > 1) resultString = val.slice(0, -1)

    return resultString.toUpperCase();
    }
  },
  CVV: { mask: '###' },
}
const currentStep = ref(1);
const availableTimeslots = ref([]);
const isPaymentInProgress = ref(false);
const isTimeslotsLoading = ref(false);
const userSelectedData = ref({
  date: null,
  timeslotIndex: undefined,
  executor: '',
  isPayed: false,
});
const paymentData = ref({
  cardNumber: '',
  cardHolder: '',
  CVV: '',
});

// computed
const stepperItems = computed(() => {
  return ['Выберите дату', 'Выберите время', 'Проведите оплату', 'Готово!'];
})

const isNextButtonDisabled = computed<boolean>(() => {
  if (currentStep.value === 1) return !userSelectedData.value.date;
  else if (currentStep.value === 2) return userSelectedData.value.timeslotIndex === undefined;
  else if (currentStep.value === 3 && !props.isChangeMode) return !userSelectedData.value.isPayed;
  else if (currentStep.value === 4) return false;
})

const isPaymentButtonDisabled = computed<boolean>(() => {
  return !props.isChangeMode && (isPaymentInProgress.value || paymentData.value.cardNumber.length < 19 || paymentData.value.CVV.length < 3 || !paymentData.value.cardHolder);
})

// functions
async function fetchAvailableTimes(): Promise<string[]> {
  isTimeslotsLoading.value = true;

  const selectedDate = dayjs(userSelectedData.value.date).format('YYYY-MM-DD');

  try {
    return (await axios.get(`${API_URL}/api/service/${props.service.id}/date/${selectedDate}/timeslots`))?.data;
  } catch (error) {
    console.error(error);
  } finally {
    isTimeslotsLoading.value = false;
  }
}

async function pay(): Promise<void> {
  isPaymentInProgress.value = true;

  try {
    props.isChangeMode ? await changeAppointment() :  await makeAppointment();

    isPaymentInProgress.value = false;
    userSelectedData.value.isPayed = true;

    setTimeout(async () => {
      currentStep.value += 1;
    }, 2000);
  } catch (error) {
    console.error(error);
  }
}

async function changeAppointment(): Promise<void> {
  try {
    await axios.put(`${API_URL}/api/service/${query.registrationId}/register`, {
      date: dayjs(userSelectedData.value.date).format('YYYY-MM-DD'),
      timeslot: availableTimeslots.value[userSelectedData.value.timeslotIndex],
    });
  } catch (error) {
    console.error(error);
  }
}

async function makeAppointment(): Promise<void> {
  try {
    await axios.post(`${API_URL}/api/service/${props.service.id}/register`, {
      date: dayjs(userSelectedData.value.date).format('YYYY-MM-DD'),
      timeslot: availableTimeslots.value[userSelectedData.value.timeslotIndex],
      clientId: useUser().currentUser().id,
    });
  } catch (error) {
    console.error(error);
  }
}

function toNextStep(): void {
  if (currentStep.value !== stepperItems.value.length) currentStep.value += 1;
  else modelValue.value = false;
}

function toPrevStep(): void {
  currentStep.value -= 1;

  if (currentStep.value === 1) userSelectedData.value.timeslotIndex = undefined;
}

// watch
watch(currentStep, async (value) => {
  if (value === 2) availableTimeslots.value = await fetchAvailableTimes();
})

watch(modelValue,(value) => {
  if (!modelValue.value) {
    userSelectedData.value = {
      date: null,
      timeslotIndex: undefined,
      executor: '',
      isPayed: false,
    };

    paymentData.value = {
      cardNumber: '',
      cardHolder: '',
      CVV: '',
    };

    currentStep.value = 1;
  }
})
</script>

<style lang="scss" scoped>
.payment-form-wrapper {
  position: relative;

  > .form-loading-overlay {
    position: absolute;
    background-color: white;
    opacity: 0.6;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;

    & + .form-loading-overlay-spinner {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-100%);
    }
  }
}
</style>
