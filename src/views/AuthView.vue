<template>
  <v-row class="justify-center">
    <v-col cols="12" sm="12" md="8" lg="6">
      <v-alert v-if="errorText" color="error" variant="tonal" :text="errorText" class="mb-4"></v-alert>
      <v-card v-if="isLoginMode" rounded="xl" elevation="2" class="login-card">
        <v-card-title class="mb-6">
          Вход
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="userFormData.login" variant="outlined" label="Логин"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="userFormData.password" variant="outlined" label="Пароль" type="password"></v-text-field>
            </v-col>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn variant="text" class="mr-auto" @click="isLoginMode = !isLoginMode">Нет аккаунта?</v-btn>
              <v-btn color="success" @click="auth">Вход</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card v-else>
        <v-card-title class="mb-6">
          Регистрация
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="userFormData.name" label="Имя пользователя"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="userFormData.login" label="Логин"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="userFormData.password" label="Пароль" type="password"></v-text-field>
            </v-col>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn variant="text" class="mr-auto" @click="isLoginMode = !isLoginMode">Есть аккаунт?</v-btn>
              <v-btn color="success" @click="auth">Регистрация</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import axios from "axios";
import {ref} from "vue";
import router from "@/router";
import { useUser } from "../../utils/globals";
import {API_URL} from "../../utils/constants";

const isLoginMode = ref(true);
const errorText = ref('');
const userFormData = ref({
  name: '',
  login: '',
  password: '',
});

const auth = async () => {
  const action = isLoginMode.value ? 'login' : 'register';

  try {
    const { setCurrentUser } = useUser();
    const user = (await axios.post(`${API_URL}/api/${action}`, userFormData.value))?.data;

    await setCurrentUser(user);

    await router.push('/');
  } catch (error) {
    errorText.value = error.response.data?.error_text;
  }
}
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

.login-card {
  padding: 16px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
}
</style>
