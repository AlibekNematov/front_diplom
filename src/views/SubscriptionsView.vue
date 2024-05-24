<template>
  <div>
    <div class="mb-6">
      <h2 class="text-black">Абонементы</h2>
      <div class="text-blue-grey">На текущей странице вы можете выбрать и оплатить подходящий абонемент</div>
    </div>
    <v-row>
      <v-col v-for="subscription in subscriptions" :key="subscription.id" cols="12" sm="6" md="4" lg="3">
        <v-card variant="flat" elevation="2" rounded="xl" :color="user?.subscription_id === subscription.id ? 'success' : ''" class="fill-height" @click="onSubscriptionClick(subscription)">
          <v-card-title>{{ subscription?.title }}</v-card-title>
          <v-card-subtitle>
            <div><b>Цена:</b> {{ subscription?.cost }} ₽</div>
            <div><b>Формат:</b> {{ subscription?.format }}</div>
          </v-card-subtitle>
          <v-card-text>
            <div class="d-flex flex-column justify-space-between fill-height">
              <div>{{ subscription.description }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="buySubscriptionModal" width="400">
      <v-card>
        <v-card-title>Абонемент {{ currentSubscription.title }}</v-card-title>
        <v-card-text>
          <div>{{ currentSubscription.description }}</div>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                  v-if="user.subscription_id !== currentSubscription.id"
                  v-model="selectedClub"
                  :items="clubs"
                  :hint="`${clubs.find((club) => club.id === selectedClub)?.working_hours || ''}`"
                  no-data-text="Клубов не найдено"
                  label="Клуб"
                  item-title="title"
                  item-value="id"
                  persistent-hint class="mt-4"
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
              v-if="user.subscription_id !== currentSubscription.id"
              :loading="buySubscriptionModalIsLoading"
              :disabled="!selectedClub"
              color="primary"
              variant="flat"
              class="mt-4"
              @click="buySubscription(false)">Приобрести за {{ currentSubscription.cost }} ₽</v-btn>
          <v-btn v-else color="error" variant="flat" class="mt-4" :loading="buySubscriptionModalIsLoading" @click="buySubscription(true)">Отвязать абонемент</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="acceptSubscriptionModal" width="400">
      <v-card>
        <v-card-title>Сменить абонемент</v-card-title>
        <v-card-subtitle>У вас уже приобретен абонемент</v-card-subtitle>
        <v-card-text>Смена тарифа осуществляется по условиям, указанным в договоре, Вы уверены, что хотите изменить тариф?</v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn class="mr-2" @click="acceptSubscriptionModal = false">Отмена</v-btn>
          <v-btn variant="flat" color="error" @click="buySubscription(false, true)">Сменить тариф</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {ref} from "vue";
import {API_URL} from "../../utils/constants";
import {useUser} from "../../utils/globals";

let subscriptions = ref(null) as any;
const buySubscriptionModal = ref(false);
const buySubscriptionModalIsLoading = ref(false);
const currentSubscription = ref(null);
const selectedClub = ref(null);
const { setCurrentUser, currentUser } = useUser();
const user = currentUser();
const clubs = ref([]);
const acceptSubscriptionModal = ref(false);

const fetchSubscriptions = async () => {
  try {
    return (await axios.get(`${API_URL}/api/subscriptions`))?.data;
  } catch (error) {
    console.error(error);
  }
}

const getSubscriptions = async () => {
  subscriptions.value = await fetchSubscriptions();
}

const onSubscriptionClick = (subscription) => {
  buySubscriptionModal.value = true;
  currentSubscription.value = subscription;
}

const buySubscription = async (isUnbindMode: boolean, subscriptionIsAccepted: boolean = false) => {
  if (!subscriptionIsAccepted && user?.club_id && !isUnbindMode) {
    acceptSubscriptionModal.value = true;
    return;
  }

  buySubscriptionModalIsLoading.value = true;

  try {
    await axios.post(`${API_URL}/api/buy-subscription`, {
      user_id: user?.id,
      subscription_id: isUnbindMode ? null : currentSubscription.value.id,
      club_id: isUnbindMode ? null : selectedClub.value,
    });

    user.subscription_id = isUnbindMode ? null : currentSubscription.value.id;
    user.club_id = isUnbindMode ? null : selectedClub.value;

    setCurrentUser(user);

    buySubscriptionModal.value = false;
    acceptSubscriptionModal.value = false;
    buySubscriptionModalIsLoading.value = false;
    selectedClub.value = null;
  } catch (error) {
    console.error(error);
  }
}

const getSelectableMoviesList = async () => {
  try {
    clubs.value = (await axios.get(`${API_URL}/api/clubs`))?.data;
  } catch (error) {
    console.error(error);
  }
}

console.log(user);
getSelectableMoviesList();
getSubscriptions();
</script>
