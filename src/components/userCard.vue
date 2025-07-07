<template>
  <UCard>
    <template #header>
      <p class="text-left text-3xl">Leetcode Profile</p>
    </template>
    <div class="h-[500px] grid grid-cols-3">
      <div class="bg-gray-100 col-span-1 justify-center grid grid-rows-2 rounded-l-md">
        <div class="flex items-center justify-center">
          <img
            :src="toRaw(userData.value.matchedUser.profile.userAvatar)"
            alt="Your avatar"
            class="w-48 h-48 rounded-full"
        ></img>
        </div>
        <div class="flex items-start flex-col">
          <p class="text-black text-2xl text-center">{{ toRaw(userData.value.matchedUser.username) }}</p>
          <p class="text-black text-2xl text-center">Problem solved: {{ toRaw(userData.value.matchedUser.submitStats.totalSubmissionNum[0].count) }}</p>
          <p class="text-black text-2xl text-center">Ranking: {{ toRaw(userData.value.matchedUser.profile.ranking) }}</p>
        </div>
      </div>
      <div class="col-span-2 rounded-r-md grid grid-rows-5">
        <div class="bg-green-100 grid grid-cols-4 row-span-3">
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
          <div class="grid grid-rows-4 place-content-center">
            <p class="text-black text-2xl mt-5">Top Languages</p>

          </div>    
        </div>
        <div class="bg-blue-100 row-span-2">

        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, watch, onMounted, toRaw } from 'vue';
import { useErrorLogger } from '../composables/useErrorLogger';

const { reportError } = useErrorLogger();
const props = defineProps(['lcUsername', 'username']);
const token = useCookie('token') ;
const lcUsername = ref(props.lcUsername);
const username = ref(props.username);
const userData = reactive({
  matchedUser: {},
  recentSubmissionList: []
});

const problemData = reactive({
  allQuestionsCount: []
})

onMounted(async () => {
  // Fetch the leetcode user if username available
  try {
    const response = await $fetch(`/api/user/profile?lcUsername=${lcUsername.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.data) {
      userData.value = response.data;
    }

  } catch (error: any ) {
    reportError(error, { section : `users/${username.value}`});
  }

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
})

// This will watch for the props update in parent to pass back to children
watch(() => props.lcUsername, async (updateValue: string) => {
  lcUsername.value = updateValue

  try {
    const response = await $fetch(`/api/user/profile?lcUsername=${lcUsername.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.data) {
      userData.value = response.data;
      console.log(userData.value)
    }
  } catch (error: any ) {
    reportError(error, { section : `users/${username.value}`});
  }
});



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
  background:conic-gradient(var(--primary) calc(var(--value) * 1%), var(--secondary) 0);
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