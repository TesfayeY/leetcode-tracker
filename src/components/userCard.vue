<template>
  <Loading :isLoading="isLoadingState" :style="'text-white'"></Loading>
  <UCard v-if="isLoadingState === false">
    <template #header>
      <div class="flex flex-row justify-start gap-4">
        <p class="text-left text-3xl">Leetcode Profile {{ viewYear }}</p>
        <span v-if="isProfileVerified" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 h-fit rounded">Verified</span>
        <UButton 
          v-bind:disabled="viewYear === activeYears[activeYears.length - 1] || activeYears.length === 0" 
          @click="handleYearChange(true)"
        >Previous year</UButton>
        <UButton 
          v-bind:disabled="viewYear === activeYears[0] || activeYears.length === 0" 
          @click="handleYearChange(false)"
        >Next Year</UButton>
      </div>
    </template>
    <div class="h-[500px] grid grid-cols-3">
      <div class="bg-gray-200 col-span-1 justify-center grid grid-rows-2 rounded-l-md">
        <div class="flex items-center justify-center">
          <img
            :src="toRaw(userData.value.matchedUser.profile.userAvatar)"
            alt="Your avatar"
            class="w-48 h-48 rounded-full"
        ></img>
        </div>
        <div class="flex items-start flex-col">
          <p class="text-black text-2xl text-center font-bold mb-2">{{ toRaw(userData.value.matchedUser.username) }}</p>
          <p class="text-black text-2xl text-center">Problem solved: {{ toRaw(userData.value.matchedUser.submitStats.totalSubmissionNum[0].count) }}</p>
          <p class="text-black text-2xl text-center">Ranking: {{ toRaw(userData.value.matchedUser.profile.ranking) }}</p>
          <p class="text-black text-2xl text-center">Max streak: {{ toRaw(userData.value.matchedUser.userCalendar.streak) }}</p>
          <p class="text-black text-2xl text-center">Total active days: {{ toRaw(userData.value.matchedUser.userCalendar.totalActiveDays) }}</p>
        </div>
      </div>
      <div class="col-span-2 rounded-r-md grid grid-rows-5 h-full w-full m-0">
        <div class="bg-green-100 grid grid-cols-4 row-span-3 h-full w-full m-0 rounded-tr-lg">
          <div class="flex flex-col justify-start items-center">
            <p class="text-black text-center text-2xl font-bold mt-5">{{ toRaw(problemData.value.allQuestionsCount[1].difficulty) }}</p>
            <div 
              class="mt-5"
              role="progress-circle" 
              :style="{ 
                '--size': '180px', 
                '--value': toRaw(userData.value.matchedUser.submitStats.totalSubmissionNum[1].count),
                '--total': toRaw(problemData.value.allQuestionsCount[1].count),
                '--primary': 'green',
                '--secondary': 'rgb(142, 240, 112)'
              }"
            ></div>
          </div>
          <div class="flex flex-col justify-start items-center">
            <p class="text-black text-center text-2xl font-bold mt-5">{{ toRaw(problemData.value.allQuestionsCount[2].difficulty) }}</p>
            <div 
              class="mt-5"
              role="progress-circle" 
              :style="{
                '--size': '180px',
                '--value': toRaw(userData.value.matchedUser.submitStats.totalSubmissionNum[2].count),
                '--total': toRaw(problemData.value.allQuestionsCount[2].count),
                '--primary': 'orange',
                '--secondary': 'rgb(231, 189, 140)'
            }"
          ></div>
          </div>  
          <div class="flex flex-col justify-start items-center">
            <p class="text-black text-center text-2xl font-bold mt-5">{{ toRaw(problemData.value.allQuestionsCount[3].difficulty) }}</p>
            <div 
              class="mt-5"
              role="progress-circle" 
              :style="{
                '--size': '180px', 
                '--value': toRaw(userData.value.matchedUser.submitStats.totalSubmissionNum[3].count),
                '--total': toRaw(problemData.value.allQuestionsCount[3].count),
                '--primary': 'red',
                '--secondary': 'rgb(240, 112, 112)'
              }"
            ></div>
          </div>
          <div v-if="toRaw(userData.value.matchedUser.languageProblemsCount.length !== 0)" class="flex flex-col justify-center ml-5">
            <p class="text-black text-2xl font-bold">Top Languages</p>
            <p v-for="i in NUM_LANGUAGE_DISPLAY" class="text-black text-2xl">
              {{ toRaw(userData.value.matchedUser.languageProblemsCount[i - 1].languageName) }}
              :
              {{ toRaw(userData.value.matchedUser.languageProblemsCount[i - 1].problemsSolved) }}
            </p>
          </div>    
        </div>
        <div class="bg-gray-100 row-span-2 w-full h-full m-0 place-content-center">
          <Calendar
            :submissionDates="toRaw(userData.value.matchedUser.userCalendar.submissionCalendar)"
            :currentYear="viewYear"
            :isLoadingCalendar="isLoadingCalendar"
          ></Calendar>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { NUM_LANGUAGE_DISPLAY } from '../constants/appConst';
import { ref, reactive, defineProps, watch, onMounted, toRaw } from 'vue';
import { useErrorLogger } from '../composables/useErrorLogger';

const { reportError } = useErrorLogger();
const props = defineProps(['lcUsername', 'username', 'isProfileVerified']);
const token = useCookie('token');
const lcUsername = ref(props.lcUsername);
const username = ref(props.username);
const isProfileVerified = ref(props.isProfileVerified)
const isLoadingState = ref(true);
const isLoadingCalendar = ref(true);
const viewYear = ref(new Date().getFullYear());
const activeYears = ref([]);

// Use reactive instead of ref to prevent assigning value back
// since these are for display purposes only.
const userData = reactive({
  matchedUser: {},
  recentSubmissionList: [],
  langCount: [],
  userCalendar: {}
});

const problemData = reactive({
  allQuestionsCount: []
});

onMounted(async () => {
  // Fetch the leetcode user if username available
  await fetchUserProfile();

  // Fetch all current problem counts
  try {
    const response = await $fetch(`/api/problem`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.data) {
      problemData.value = response.data;
    }

  } catch (error: any) {
    reportError(error, { section : `users/${username.value}`});
  }

  isLoadingState.value = false;
})

// This will watch for the props update in parent to pass back to children
watch(() => props.lcUsername, async (updateValue: string) => {
  lcUsername.value = updateValue;
  isLoadingState.value = true;
  await fetchUserProfile();
  isLoadingState.value = false;
});

watch(() => props.isProfileVerified, async (updateValue: boolean) => {
  isProfileVerified.value = updateValue;
});

const handleYearChange = async (isBack: boolean) => {
  viewYear.value = isBack ? viewYear.value - 1 : viewYear.value === new Date().getFullYear() ? viewYear.value : viewYear.value + 1;

  await fetchUserProfile();
}

// This will fetch the whole user profile includings problems and calendar heatmap
async function fetchUserProfile() {
  isLoadingCalendar.value = true;

  try {
    const response = await $fetch(`/api/user/profile?lcUsername=${lcUsername.value}&year=${viewYear.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.data) {
      userData.value = response.data;
      activeYears.value = toRaw(userData.value.matchedUser.userCalendar.activeYears);
    }

    //console.log(toRaw(userData.value));
    isLoadingCalendar.value = false;
  } catch (error: any ) {
    reportError(error, { section : `users/${username.value}`});
  }
}
</script>

<style scoped>
div[role=progress-circle] {
  --primary: green;
  --secondary: rgb(231, 189, 140);
  --size: 200px;
  width: var(--size);
  aspect-ratio: 1;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
}

div[role=progress-circle]::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:conic-gradient(var(--primary) calc((var(--value) / var(--total) * 100) * 1%), var(--secondary) 0);
  mask: radial-gradient(white 55%, transparent 0);
  mask-mode: alpha;
  -webkit-mask: radial-gradient(#0000 55%, #000 0);
  -webkit-mask-mode: alpha;
}

div[role=progress-circle]::after {
  counter-reset: current var(--value) total var(--total);
  content: counter(current) '/' counter(total);
  color: black;
  font-size:xx-large;
  font-weight: bold;
}
</style>