<template>
  <div>
    <div class="mb-6">
      <h2 class="text-black">Услуги</h2>
      <div class="text-blue-grey">Выбирайте услуги, проводите запись и оплачивайте не выходя из приложения</div>
    </div>
    <v-tabs v-model="tab" class="mb-6" grow>
      <v-tab :to="{ name: 'services', hash: '#group' }" value="group">Групповые</v-tab>
      <v-tab :to="{ name: 'services', hash: '#personal' }" value="personal">Индивидуальные</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="group">
        <services-tab :services="groupServices" :loading-service-id="loadingServiceId" @register="register" />
      </v-window-item>
      <v-window-item value="personal">
        <services-tab :services="personalServices" :loading-service-id="loadingServiceId" @register="register" />
      </v-window-item>
    </v-window>
    <ServiceRegisterModal
        v-model="serviceRegisterModal.show"
        :service="serviceRegisterModal.service"
        :allowed-dates="serviceRegisterModal.dates"
        :is-change-mode="serviceRegisterModal.isChangeMode"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import axios from "axios";
import {API_URL} from "../../utils/constants";
import type {Service} from "@/models/service";
import ServicesTab from "@/components/tabs/ServicesTab.vue";
import ServiceRegisterModal from "@/components/modals/ServiceRegisterModal.vue";
import {useRoute} from "vue-router";

const { query, hash } = useRoute();
const tab = useRoute().hash === '#group' ? ref('personal') : ref('group');
const groupServices = ref<Service[]>([]);
const personalServices = ref<Service[]>([]);
const loadingServiceId = ref(null);
const serviceRegisterModal = ref({
  show: false,
  service: {} as Service,
  dates: [],
  isChangeMode: false,
});

async function fetchServices(serviceType: 'group' | 'personal') {
  try {
    return (await axios.get(`${API_URL}/api/services`, { params: { serviceType } }))?.data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAvailableDates(): Promise<string[]> {
  loadingServiceId.value = serviceRegisterModal.value.service.id;

  try {
    return (await axios.get(`${API_URL}/api/service/${serviceRegisterModal.value.service.id}/dates`))?.data;
  } catch (error) {
    console.error(error);
  } finally {
    loadingServiceId.value = null;
  }
}

async function register(service: Service, isChangeMode = false) {
  serviceRegisterModal.value.service = service;
  serviceRegisterModal.value.isChangeMode = isChangeMode;
  serviceRegisterModal.value.dates = await fetchAvailableDates();
  serviceRegisterModal.value.show = true;
}

onMounted(async () => {
  groupServices.value = await fetchServices('group');
  personalServices.value = await fetchServices('personal');

  if (query?.serviceId) {
    const source = hash === '#group' ? groupServices.value : personalServices.value;
    const service = source.find((service) => service.id === Number(query.serviceId));

    if (service) await register(service, query?.isChangeMode);
  }
})
</script>
