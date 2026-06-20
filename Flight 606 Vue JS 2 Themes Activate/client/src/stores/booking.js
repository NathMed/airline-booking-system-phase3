import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useBookingStore = defineStore('booking', () => {
    const currentStep = ref(1);

    function nextStep() {
        currentStep.value++;
    }

    function previousStep() {
        if (currentStep.value > 1) currentStep.value--;
    }

    function clearBookingData() {
        currentStep.value = 1;
    }

    return {
        currentStep,
        nextStep,
        previousStep,
        clearBookingData
    };
});