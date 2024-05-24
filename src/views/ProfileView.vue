<template>
  <div>
    <v-row>
      <v-col>
        <v-card rounded="xl" elevation="2">
          <v-card-title>Пользователь</v-card-title>
          <v-card-text>
            <div class="d-flex align-start align-md-center align-lg-center flex-column flex-md-row flex-lg-row">
              <v-avatar size="196" image="https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8="></v-avatar>
              <v-list>
                <v-list-item><b>Имя пользователя:</b> {{ user?.name }}</v-list-item>
                <v-list-item><b>Логин:</b> {{ user?.login }}</v-list-item>
                <v-list-item><b>Возраст:</b> 22</v-list-item>
                <v-list-item><b>Пол:</b> М</v-list-item>
              </v-list>
            </div>
            <v-btn color="error" variant="text" @click="exit">Сменить аккаунт</v-btn>
          </v-card-text>
        </v-card>
        <v-card v-if="subscription" class="mt-8" rounded="xl" elevation="2" @click="unbindSubscriptionModal = true">
          <v-card-title>Абонемент</v-card-title>
          <v-card-text>
            <v-card variant="text" class="fill-height">
              <v-card-title>{{ subscription?.title }}</v-card-title>
              <v-card-subtitle>
                <div><b>Цена:</b> {{ subscription?.cost }} ₽</div>
                <div><b>Формат:</b> {{ subscription?.format }}</div>
              </v-card-subtitle>
              <v-card-text>
                <div class="d-flex flex-column justify-space-between fill-height">
                  <div>{{ subscription?.description }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
        <v-card v-else rounded="xl" elevation="2" class="mt-8">
          <v-card-title>Абонемент</v-card-title>
          <v-card-subtitle>Приобрести абонемент можно на вкладке "Абонементы"</v-card-subtitle>
          <v-card-text>
            Абонемент отсутствует
          </v-card-text>
        </v-card>
        <v-card v-if="subscription" rounded="xl" elevation="2" class="mt-8" @click="router.push(`/club/${club.id}`)">
          <v-card-title>Клуб</v-card-title>
          <v-card-text>
            <v-card variant="text" class="fill-height">
              <v-card-title>{{ club?.title }}</v-card-title>
              <v-card-subtitle>
                <div><b>Название:</b> {{ club?.title }}</div>
                <div><b>Адрес:</b> {{ club?.address }}</div>
                <div><b>График работы:</b> {{ club?.working_hours }}</div>
              </v-card-subtitle>
              <v-card-text>
                <div class="d-flex flex-column justify-space-between fill-height">
                  <div>{{ club?.description }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
        <v-card v-else rounded="xl" elevation="2" class="mt-8">
          <v-card-title>Клуб</v-card-title>
          <v-card-subtitle>Приобретите абонемент для возможности посещения клуба</v-card-subtitle>
          <v-card-text>
            Клуб отсутствует
          </v-card-text>
        </v-card>
        <v-card v-if="registrations.length" rounded="xl" elevation="2" class="mt-8">
          <v-card-title>Записи</v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="registrations" :loading="registrationsTableLoading" :sort-by="[{ key: 'date', order: 'asc' }]">
              <template #item.date="{ item }">
                {{ dayjs(item.date).format('DD.MM.YYYY') }}
              </template>
              <template #item.service_title="{ item }">
                <div class="d-flex align-center">
                  <div>{{ item.service_title }}</div>
                  <v-chip v-if="item.is_group" size="small" variant="outlined" color="purple" class="ml-4">Групповая</v-chip>
                </div>
              </template>
              <template #item.timeslot="{ item }">
                {{ useTimeslot(item.timeslot) }}
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex align-center justify-end">
                  <v-btn v-if="dayjs().unix() < dayjs(`${item.date} ${useTimeslot(item.timeslot)}`).unix()" color="primary" class="mr-2" @click="router.push({ name: 'services', query: { serviceId: item.service_id, registrationId: item.id, isChangeMode: true }, hash: item.is_group ? '#group' : '#personal' })">Перенести</v-btn>
                  <v-btn
                      variant="text"
                      color="error"
                      @click="onAbortRegistrationBtnClick(item, dayjs().unix() < dayjs(`${item.date} ${useTimeslot(item.timeslot)}`).unix())"
                  >
                    {{ dayjs().unix() < dayjs(`${item.date} ${useTimeslot(item.timeslot)}`).unix() ? 'Отменить' : 'Удалить' }}
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="unbindSubscriptionModal" width="400">
      <v-card>
        <v-card-title>Абонемент {{ subscription?.title }}</v-card-title>
        <v-card-subtitle>
          <div><b>Цена:</b> {{ subscription?.cost }} ₽</div>
          <div><b>Формат:</b> {{ subscription?.format }}</div>
        </v-card-subtitle>
        <v-card-text>{{ subscription?.description }}</v-card-text>
        <v-card-actions class="d-flex justify-end align-center">
          <v-btn variant="flat" class="mt-4" @click="unbindSubscriptionModal = false">Отменить</v-btn>
          <v-btn variant="flat" class="mt-4" color="primary" @click="router.push('/subscriptions')">Сменить</v-btn>
          <v-btn color="error" variant="flat" class="mt-4" @click="unbindSubscription">Отвязать</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="registrationAbortAcceptanceModal.show" width="400px">
      <v-card
          :title="`${registrationAbortAcceptanceModal.isAbortMode ? 'Отмена' : 'Удаление'} записи`"
          :subtitle="`Вы уверены, что хотите ${registrationAbortAcceptanceModal.isAbortMode ? 'отменить' : 'удалить'} запись?`"
      >
        <v-card-actions>
          <v-btn @click="registrationAbortAcceptanceModal.show = false">Не {{ registrationAbortAcceptanceModal.isAbortMode ? 'отменять' : 'удалять' }}</v-btn>
          <v-btn base-color="red" @click="abortRegistration">{{ registrationAbortAcceptanceModal.isAbortMode ? 'Отменить' : 'Удалить' }} запись</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useUser } from "../../utils/globals";
import router from "@/router";
import axios from "axios";
import {API_URL} from "../../utils/constants";
import {ref} from "vue";
import dayjs from "dayjs";
import {useTimeslot} from "../utils/use-timeslot";

const { currentUser, clearUser, setCurrentUser } = useUser();
const user = currentUser();
const subscription = ref({});
const club = ref({});
const unbindSubscriptionModal = ref(false);
const registrations = ref([]);
const registrationsTableLoading = ref(false);
const registrationAbortAcceptanceModal = ref({
  show: false,
  id: null,
  isAbortMode: true,
});
const headers = ref([
  {
    title: 'Услуга',
    key: 'service_title',
  },
  {
    title: 'Дата',
    key: 'date',
  },
  {
    title: 'Время',
    key: 'timeslot',
  },
  {
    title: 'Клуб',
    key: 'club_title',
  },
  {
    align: 'end',
    title: '',
    key: 'actions',
    sortable: false,
  },
])

const exit = () => {
  clearUser();

  router.push('/auth');
}

const getUserSubscriptions = async () => {
  try {
    subscription.value = (await axios.get(`${API_URL}/api/subscription`, {
      params: { user_id: user.id }
    }))?.data[0];
  } catch (error) {
    throw error;
  }
}

const getUserClub = async () => {
  try {
    club.value = (await axios.get(`${API_URL}/api/club/${user.club_id}`))?.data?.club;
  } catch (error) {
    console.error(error);
  }
}

const setUserRegistrations = async () => {
  try {
    registrations.value = (await axios.get(`${API_URL}/api/client/${user.id}/registrations`))?.data;
  } catch (error) {
    console.error(error);
  }
}

const unbindSubscription = async () => {
  try {
    await axios.post(`${API_URL}/api/buy-subscription`, {
      user_id: user?.id,
      subscription_id: null,
    });

    user.subscription_id = null;
    user.club_id = null;

    setCurrentUser(user);

    unbindSubscriptionModal.value = false;
    subscription.value = null;
  } catch (error) {
    console.error(error);
  }
}

async function abortRegistration() {
  try {
    await axios.delete(`${API_URL}/api/service/${registrationAbortAcceptanceModal.value.id}/unregister`);

    registrationAbortAcceptanceModal.value.show = false;
    registrationAbortAcceptanceModal.value.id = null;

    registrationsTableLoading.value = true;

    await setUserRegistrations();
  } catch (error) {
    console.error(error);
  } finally {
    registrationsTableLoading.value = false;
  }
}

function onAbortRegistrationBtnClick(item, isAbortMode = true) {
  registrationAbortAcceptanceModal.value.id = item.id;
  registrationAbortAcceptanceModal.value.show = true;
  registrationAbortAcceptanceModal.value.isAbortMode = isAbortMode;
}

getUserSubscriptions();

if (user.club_id) getUserClub();
setUserRegistrations();
</script>

<style lang="scss" scoped>
.movie-card {
  border: 1px solid green;
  margin-right: 16px;
  height: 175px;
  width: 200px;
  min-width: 100px;
  margin-bottom: 16px;
}
</style>
