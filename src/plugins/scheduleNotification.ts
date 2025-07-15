import { encryptSymmetric } from '~/composables/encryption';
import { useErrorLogger } from '~/composables/useErrorLogger';
import { LEETCODE_BASE_URL } from '~/constants/leetcodeConst';

export default defineNuxtPlugin({
  enforce: 'pre',
  dependsOn: ['create-system-worker'],
  async setup() {
    onNuxtReady(async () => {
      const { reportError } = useErrorLogger();
      const token = useCookie('token');
      const latestStreakToken = useCookie('latestStreakToken');
      const latestCheckinToken = useCookie('latestCheckinToken');
      const latestDailyProblemToken = useCookie('latestDailyProblemToken');
      const userPreferences = useCookie('preference');

      // These notification cookie should not depends on the validity of JWT. 
      // Expired JWT still retain in the session storage as a string. Auto notification should not be affected.
      // Auto notification only halts for browser with empty session storage or the user deliberately log out from the application.
      if (!token.value) {
        console.log('Logged out! No notification scheduled');
        return;
      }

      // Check if the user's notification tokens has been set in the browser
      // If the JWT is expired, the tokens are still retained from the previous JWT session upon logging in.
      // If the user changed their preferences, these cookie would be set to the newest change on the settings.vue.
      // Only refetch for user preferences when user is deliberately log out and in the process clear all tokens.
      if (!(latestDailyProblemToken.value && latestCheckinToken.value && latestStreakToken.value)) {
        try {
          const response = await $fetch(`/api/user/preference`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          if (response.data) {
            latestDailyProblemToken.value = (new Date(response.data.autoProblemDatetime)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            latestCheckinToken.value = (new Date(response.data.autoCheckinDatetime)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            latestStreakToken.value = (new Date(response.data.autoStreakDatetime)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            userPreferences.value = {
              daily: response.data.isProblemNotify,
              checkin: response.data.isCheckinNotify,
              streak: response.data.isStreakNotify
            };
          }

        } catch (error: any) {
          console.log(error);
          reportError(error, { session: 'autoNotification', context_type: 'scheduler' })
        }
      }

      // Setup each auto notification a scheduler
      if (toRaw(userPreferences.value).daily) {
        await checkIntervalStatus(latestDailyProblemToken.value, 'latestDailyProblemNotification');
        scheduleInterval(latestDailyProblemToken.value, 'latestDailyProblemNotification');
      }

      if (toRaw(userPreferences.value).checkin) {
        await checkIntervalStatus(latestCheckinToken.value, 'latestCheckinNotification');
        scheduleInterval(latestCheckinToken.value, 'latestCheckinNotification');
      }

      if (toRaw(userPreferences.value).streak) {
        await checkIntervalStatus(latestStreakToken.value, 'latestStreakNotification');
        scheduleInterval(latestStreakToken.value, 'latestStreakNotification');
      }
    });
  }
});

async function checkIntervalStatus(userChosenHour: string, tokenStorageName: string) {
  const latestNotification = useCookie(tokenStorageName);
  const currentDatetime = new Date();
  const currentHour = currentDatetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDay = currentDatetime.toISOString().split('T')[0];

  const latestDay = latestNotification.value;
  //console.log(currentHour, userChosenHour)

  // Check if there is the last notification day token or the current is already passes user hour and minutes
  if (latestDay === null || latestDay === undefined || currentHour >= userChosenHour && latestDay !== currentDay
  ) {
    // If time reach, send the notification
    const typeNotification = tokenStorageName.split('latest')[1].toUpperCase();
    sendNotification(typeNotification);

    latestNotification.value = currentDay;
  }
}

function scheduleInterval(userChosenHour: string, tokenStorageName: string) {
  const currentDatetime = new Date();
  const nextUserChosenDateTime = new Date();
  //Set the  hour in time the notification will be sent
  nextUserChosenDateTime.setHours(parseInt(userChosenHour.split(':')[0]), parseInt(userChosenHour.split(':')[1]), 0, 0);

  // Check if the current time is already pass the user time, set to next day point if so
  if (currentDatetime >= nextUserChosenDateTime) {
    nextUserChosenDateTime.setDate(nextUserChosenDateTime.getDate() + 1);
  }

  // Calculate the interval to wait to trigger the next sending
  const intervalMillis = nextUserChosenDateTime.getTime() - currentDatetime.getTime();

  //Debuging only for checking waiting, every 1 hour to log one time
  // const timer = setInterval(() => {
  //   console.log(`Time remaining until next run: ${nextUserChosenDateTime.getTime() - (new Date().getTime())} milliseconds at ${tokenStorageName}`)
  // }, 10000)

  // The waiting block
  //console.log(`start to wait for ${tokenStorageName}`)
  setTimeout(() => {
    checkIntervalStatus(userChosenHour, tokenStorageName);
    scheduleInterval(userChosenHour, tokenStorageName);

    //clear the timer debugging
    // clearInterval(timer);
  }, intervalMillis);
}

async function sendNotification(typeNotification: string) {
  const { reportError } = useErrorLogger();
  const token = useCookie('token');
  const user = useCookie('user');

  switch (typeNotification) {
    case 'STREAKNOTIFICATION':
      try {
        const response = await $fetch(`/api/user/profile/validate?lcUsername=${user.value.lcUsername}&username=${user.value.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: {
            streak: '',
            sessionToken: ''
          }
        });

        if (response.data) {
          sendInboxMessage(`Hey, your are currently on ${response.data.streakCounter.streakCount} streak days. Continue on!`);
        }
      } catch (error: any) {
        reportError(error, { section: `users/${user.email}` });
      }


      break;
    case 'CHECKINNOTIFICATION':
      // Get user session token
      try {
        const response = await $fetch(`/api/user/profile/validate?lcUsername=${user.value.lcUsername}&username=${user.value.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: {
            sessionToken: ''
          }
        });

        if (response.data) {
          if (!response.data.userStatus.checkedInToday) {
            sendInboxMessage(`Hi ${response.data.userStatus.realName}, you have not check in yet for today`);
          }
        }
      } catch (error: any) {
        reportError(error, { section: `users/${user.email}` });
      }

      break;
    case 'DAILYPROBLEMNOTIFICATION':
      // Get daily problem from leetcode graphql
      try {
        const response = await $fetch(`/api/problem/daily`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const problemTitle = response.data.activeDailyCodingChallengeQuestion.question.title;
        const problemDate = response.data.activeDailyCodingChallengeQuestion.date;
        const difficulty = response.data.activeDailyCodingChallengeQuestion.question.difficulty;
        const problemUrl = response.data.activeDailyCodingChallengeQuestion.link;

        sendInboxMessage(`Daily Problem: Today is an ${difficulty.toLowerCase()} problem about ${problemTitle}. 
                        ---> ${LEETCODE_BASE_URL}${problemUrl}`);
      } catch (error: any) {
        reportError(error, { section: `users/${user.email}` });
      }

      break;
    default:
      break;
  }
}

async function sendInboxMessage(content: string) {
  const { reportError } = useErrorLogger();
  const recipientUsername = useCookie('email');
  const runtimeConfig = useRuntimeConfig();

  try {
    const response = await $fetch(`/api/inbox/message/auto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        recipientUsername: recipientUsername.value,
        messageContent: await encryptSymmetric(runtimeConfig.public.messageEncryptionKey.toString(), content),
      }
    });

    if (response === null) {
      throw createError({ statusCode: 400, message: 'Bad request' });
    }
  }
  catch (error: any) {
    console.log(error);
    reportError(error, { section: `scheduler` });
  }
}