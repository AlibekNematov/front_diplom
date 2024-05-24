<template>
  <v-row>
      <v-col v-for="service in services" cols="12" xs="12" sm="6" lg="4" class="pa-4">
      <service-card :service="service" :loading="loadingServiceId === service.id" @register="(selectedService) => $emit('register', selectedService)" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import ServiceCard from "@/components/cards/ServiceCard.vue";
import type {Service} from "@/models/service";

interface Props {
  services: Service[];
  loadingServiceId?: number | null;
}
defineProps<Props>();
</script>
