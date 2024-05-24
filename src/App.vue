<template>
  <header>
    <v-toolbar v-if="currentUser()" class="d-flex w-100">
      <v-toolbar-items>
        <v-btn to="/">Главная</v-btn>
        <v-btn to="/subscriptions">Абонементы</v-btn>
        <v-btn to="/services">Услуги</v-btn>
        <v-btn to="/profile" class="ml-auto">
          <div class="d-flex align-center">
            <v-avatar size="24" color="primary" class="mr-2" image="https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8="></v-avatar>
            <div>{{ currentUser().name }}</div>
          </div>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
  </header>
  <main>
    <v-container>
      <RouterView />
    </v-container>
  </main>
</template>


<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUser } from "../utils/globals";

const { init, currentUser } = useUser();

init();
</script>


<style lang="scss" scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.logo {
  margin: 0 2rem 0 0;
}
</style>
