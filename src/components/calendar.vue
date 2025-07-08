<template>
  <Loading :isLoading="isLoadingCalendarData" :style="'text-black'"></Loading>
  <div v-if="isLoadingCalendarData === false" class="grid grid-rows-4">
    <div class="bg-red-100 row-span-1 h-12 grid grid-cols-12">
      <div class="bg-gray-100 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Jan</p>
      </div>
      <div class="bg-gray-200 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Feb</p>
      </div>
      <div class="bg-gray-300 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Mar</p>
      </div>
      <div class="bg-gray-400 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Apr</p>
      </div>
      <div class="bg-gray-500 place-content-center">
        <p class="text-black text-bold text-center text-2xl">May</p>
      </div>
      <div class="bg-gray-600 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Jun</p>
      </div>
      <div class="bg-gray-100 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Jul</p>
      </div>
      <div class="bg-gray-200 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Aug</p>
      </div>
      <div class="bg-gray-300 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Sep</p>
      </div>
      <div class="bg-gray-400 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Oct</p>
      </div>
      <div class="bg-gray-500 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Nov</p>
      </div>
      <div class="bg-gray-600 place-content-center">
        <p class="text-black text-bold text-center text-2xl">Dec</p>
      </div>
    </div>
    <div class="bg-yellow-100 row-span-3 h-36 grid grid-cols-12">
      <div v-for="(month, monthIndex) in months" class="bg-yellow-100 grid grid-cols-6">
        <div v-for="(week, weekIndex) in weeks" class="grid grid-rows-7">
          <div v-for="(day, dayIndex) in days" :class="getStyles(dayIndex, weekIndex, monthIndex)">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, defineProps, defineEmits } from 'vue';

const props = defineProps(['submissionDates', 'currentYear', 'isLoadingCalendar']);
const emit = defineEmits(['start-fetch', 'finish-fetch']);

const days = ref(new Array(7));
const weeks = ref(new Array(6));
const months = ref(new Array(12));
const submissionDates = ref(JSON.parse(props.submissionDates));
const currentYear = ref(props.currentYear)
let activeDates = Object.keys(toRaw(submissionDates.value)).map((key) => ({
  activeDate: new Date(parseInt(key) * 1000),
  submissions: toRaw(submissionDates.value[key]),
}));

const currentYearDates = ref(activeDates.filter(date => date.activeDate.getFullYear() === currentYear.value));
const startDate = ref(new Date(currentYear.value, 0));
const endDate = ref(new Date(currentYear.value, 11, 31));
const displayDates = ref(Array.from({ length: 12 }, () => Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => null))));
const isLoadingCalendarData = ref(props.isLoadingCalendar);

// This will call before any component is rendered and mounted on DOM
onBeforeMount(() => {
  setupDisplayDates();
});

// These watch for props changes from parent
watch(() => props.isLoadingCalendar, (updateValue: any) => {
  isLoadingCalendarData.value = updateValue;
});

watch(() => props.currentYear, (updateValue: any) => {
  currentYear.value = updateValue;
  startDate.value = new Date(currentYear.value, 0);
  endDate.value = new Date(currentYear.value, 11, 31);
});

watch(() => props.submissionDates, (updateValue: any) => {
  submissionDates.value = JSON.parse(updateValue);
  activeDates = Object.keys(submissionDates.value).map((key) => ({
    activeDate: new Date(parseInt(key) * 1000),
    submissions: toRaw(submissionDates.value[key]),
  }));
  currentYearDates.value = activeDates.filter(date => date.activeDate.getFullYear() === currentYear.value);
  setupDisplayDates();
});

// This assign the style to individual square that represent day and submissions
function getStyles(dayIndex: number, weekIndex: number, monthIndex: number) {
  if (toRaw(displayDates.value).length === 0) {
    return `bg-green-200`;
  } else {
    let date = toRaw(displayDates.value)[monthIndex][weekIndex][dayIndex];

    if (date === null) {
      return `bg-gray-100`;
    }

    let submissions = toRaw(displayDates.value)[monthIndex][weekIndex][dayIndex].submissions;

    let bgColor = submissions >= 1 && submissions < 10 ? `bg-green-300`
    : submissions >= 10 && submissions < 20 ? `bg-green-400` 
    : submissions >= 20 ? `bg-green-500`: `bg-green-200`;

    let otherStyles = 'border-[1px] border-gray-100';

    return bgColor + ' ' + otherStyles;
  }
}

function compareDates(currentDate: Date, targetDate: Date) {
  const date = currentDate.getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  return date === targetDate.getDate() && month === targetDate.getMonth() && year === targetDate.getFullYear();
}

// This will create a 3D array to represent day, week, month of the calendar
function setupDisplayDates() {
  displayDates.value = Array.from({ length: 12 }, () => Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => null)));
  let currentDate = new Date(startDate.value);
  let currentWeek = 0;
  let currentMonth = currentDate.getMonth();

  while (currentDate <= endDate.value) {
    let index = toRaw(currentYearDates.value).findIndex(date => compareDates(date.activeDate, currentDate));

    if (currentDate.getDay() === 0) {
      if (currentDate.getMonth() === currentMonth) {
        currentWeek += 1;
      } else {        
        currentMonth = currentDate.getMonth();
        currentWeek = 0;
      }
    }

    if (currentMonth !== currentDate.getMonth())  {        
      currentMonth = currentDate.getMonth();
      currentWeek = 0;
    }

    // Push in the date and submission numbers into heatmap
    toRaw(displayDates.value)[currentMonth][currentWeek][currentDate.getDay()] = {
      date: currentDate.toUTCString(),
      submissions: index !== -1 ? toRaw(currentYearDates.value)[index].submissions : 0
    };

    currentDate.setDate(currentDate.getDate() + 1);
  }
}
</script>