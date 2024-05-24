<template>
  <v-card variant="flat" class="fill-height d-flex flex-column service-card" elevation="2" rounded="xl">
    <v-card-title>
      {{ service.title }}
    </v-card-title>
    <v-card-text>
      <v-img :src="service.image_url" class="mb-4" cover max-height="150px" rounded="xl" />
      <div class="pr-5">
        <div class="mb-4">
          <h4 class="font-weight-bold">Описание</h4>
          <div class="sliced-text">{{ service.description }}</div>
        </div>
        <div class="mb-4">
          <h4 class="font-weight-bold">Клуб</h4>
          <div>{{ service.club_title }}</div>
        </div>
        <div>
          <h4 class="font-weight-bold">Стоимость</h4>
          <div>₽ {{ service.price }},00</div>
        </div>
      </div>
    </v-card-text>
    <v-card-actions class="d-flex justify-end align-end">
      <v-btn
        :loading="loading"
        variant="flat"
        block
        rounded="xl"
        size="42"
        color="success"
        @click="$emit('register', service)"
      >
        Записаться
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Service } from "@/models/service";

interface Props {
  service: Service;
  loading?: boolean;
}
withDefaults(defineProps<Props>(), {
  loading: false,
});
</script>

<style scoped lang="scss">
.service-card {
  min-width: 300px;
}

.sliced-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -moz-box;
  -moz-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  box-orient: vertical;
}
</style>
