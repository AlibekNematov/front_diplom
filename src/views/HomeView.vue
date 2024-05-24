<template>
  <div style="display: flex; flex-wrap: wrap;">
    <div class="mb-6">
      <h2 class="text-black">Клубы</h2>
      <div class="text-blue-grey">Выбирайте подходящий клуб на основе подробной информации о каждом из предложенных вариантов</div>
    </div>
    <v-row>
      <v-col v-for="club of clubs" :key="club.id" cols="12" sm="6" md="4" lg="4">
        <v-card :to="`club/${club.id}`" variant="flat" elevation="2" rounded="xl" class="fill-height">
          <v-card-title>{{ club.title }}</v-card-title>
          <v-card-text>
            <v-img :src="club.image_url" rounded="xl" class="my-4" cover />
            <div class="d-flex flex-column justify-space-between fill-height">
              <div class="d-flex">
                <p class="text-black font-weight-bold">{{ club.working_hours }}</p>
              </div>
              <div class="mt-4">
                {{ club.description }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {ref} from "vue";
import {API_URL} from "../../utils/constants";

let clubs = ref(null) as any;

const fetchClubs = async () => {
  try {
    return (await axios.get(`${API_URL}/api/clubs`))?.data;
  } catch (error) {
    console.error(error);
  }
}

const getClubs = async () => {
  clubs.value = await fetchClubs();
}

getClubs();
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
