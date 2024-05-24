<template>
  <div>
    <div class="mb-6">
      <h2 class="text-black font-weight-bold">Клуб</h2>
      <div class="text-blue-grey">Вы можете приобрести абонемент в текущий клуб, выбрав соответствующую позицию при оформлении на странице "Абонементы"</div>
    </div>
    <v-container class="d-flex" style="gap: 24px">
      <v-card class="mb-4" elevation="2" rounded="xl">
        <v-card-title class="py-4">{{ club?.club?.title }}</v-card-title>
        <v-card-text>
          <v-img :src="club?.club?.image_url" cover max-height="300px" rounded="xl" class="mb-6" />
          <v-list>
            <v-list-item>
              <div class="mb-4"><b>Адрес:</b> {{ club?.club?.address }}</div>
              <div class="mb-4"><b>График работы:</b> {{ club?.club?.working_hours }}</div>
              <div><b>Описание:</b> {{ club?.club?.description }}</div>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
      <v-row>
        <v-col>
          <v-card elevation="2" rounded="xl">
            <v-card-title class="py-4">Сотрудники</v-card-title>
            <v-card-text>
              <v-list v-if="club?.employees?.length">
                <v-list-item v-for="employee in club?.employees" :key="employee.id">
                  <div class="d-flex align-center">
                    <v-avatar color="gray" size="32" class="mr-4" :image="employee.avatar"></v-avatar>
                    <h3>{{ `${employee.name} ${employee.surname} ${employee.patronymic}` }}</h3>
                  </div>
                  <v-list class="ml-8">
                    <v-list-item>
                      <div class="mb-2"><b>Электронная почта:</b> {{ employee.email }}</div>
                      <div class="mb-2"><b>Позиция:</b> {{ employee.position }}</div>
                      <div><b>Адрес:</b> {{ employee.address }}</div>
                    </v-list-item>
                  </v-list>
                </v-list-item>
              </v-list>
              <h3 v-else>Сотрудники отсутствуют</h3>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <div class="mb-6 overflow-auto">
      <div class="mb-3">
        <h3 class="text-black font-weight-bold">Групповые услуги</h3>
        <div class="text-blue-grey">Запишитесь на групповые услуги, предлагаемые сетью и оплатите их прямо на сайте</div>
      </div>
      <div class="d-flex pa-2" style="gap: 16px">
        <ServiceCard v-for="service in groupServices" :service="service" @register="router.push({ name: 'services', query: { serviceId: service.id }, hash: service.is_group ? '#group' : '#personal' })" />
      </div>
    </div>
    <div class="overflow-auto">
      <div class="mb-3">
        <h3 class="text-black font-weight-bold">Индивидуальные услуги</h3>
        <div class="text-blue-grey">Запишитесь на индивидуальные услуги, предлагаемые сетью и оплатите их прямо на сайте</div>
      </div>
      <div class="d-flex pa-2" style="gap: 16px">
        <ServiceCard v-for="service in personalServices" :service="service" @register="router.push({ name: 'services', query: { serviceId: service.id }, hash: service.is_group ? '#group' : '#personal' })" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {useRoute} from "vue-router";
import {ref} from "vue";
import {API_URL} from "../../utils/constants";
import ServiceCard from "@/components/cards/ServiceCard.vue";
import {Service} from "@/models/service";
import router from "@/router";

const route = useRoute();
let club = ref(null) as any;
const groupServices = ref<Service[]>([]);
const personalServices = ref<Service[]>([]);

const fetchClub = async () => {
  try {
    return (await axios.get(`${API_URL}/api/club/${route.params.id}`))?.data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchServices(serviceType: 'group' | 'personal') {
  try {
    return (await axios.get(`${API_URL}/api/services`, { params: { serviceType } }))?.data;
  } catch (error) {
    console.error(error);
  }
}

const getClub = async () => {
  club.value = await fetchClub();
}

(async () => {
  groupServices.value = await fetchServices('group');
  personalServices.value = await fetchServices('personal');
})();

getClub();
</script>
