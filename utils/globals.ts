import {ref} from "vue";

const user = ref(null);

export const useUser = () => {
    const setCurrentUser = (userData) => {
        user.value = userData;
        localStorage.setItem('current_user', JSON.stringify(user.value));
    };

    const currentUser = () => {
        return user.value;
    }

    const init = () => {
        const currentUserStorageData = localStorage.getItem('current_user');

        if (currentUserStorageData) {
            user.value = JSON.parse(currentUserStorageData);
        }
        else user.value = null;
    }

    const clearUser = () => {
        localStorage.removeItem('current_user');
        user.value = null;
    }

    return {
        setCurrentUser,
        currentUser,
        clearUser,
        init,
    }
}
