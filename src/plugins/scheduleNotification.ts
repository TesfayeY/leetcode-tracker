import { useErrorLogger } from '~/composables/useErrorLogger';

export default defineNuxtPlugin({
  enforce: 'pre',
  async setup(nuxtApp) {
    onNuxtReady(async () => {
      const { reportError } = useErrorLogger();
      const token = useCookie('token');
      const latestStreakToken = useCookie('latestStreakToken');
      const latestCheckinToken = useCookie('latestCheckinToken');
      const latestDailyProblemToken = useCookie('latestDailyProblemToken');
      
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
            latestDailyProblemToken.value = (new Date(response.data.autoProblemDatetime)).getUTCHours().toString();
            latestCheckinToken.value = (new Date(response.data.autoCheckinDatetime)).getUTCHours().toString();
            latestStreakToken.value = (new Date(response.data.autoStreakDatetime)).getUTCHours().toString();
          }

        } catch(error: any) {
          console.log(error);
          reportError(error, { session: 'autoNotification', context_type: 'scheduler'  })
        }
      }

      // Setup each auto notification a schedule
      await checkIntervalStatus(parseInt(latestDailyProblemToken.value), 'latestDailyProblemNotification');
      scheduleInterval(parseInt(latestDailyProblemToken.value), 'latestDailyProblemNotification', 6000);

      await checkIntervalStatus(parseInt(latestCheckinToken.value), 'latestCheckinNotification');
      scheduleInterval(parseInt(latestCheckinToken.value), 'latestCheckinNotification', 3000);

      await checkIntervalStatus(parseInt(latestStreakToken.value), 'latestStreakNotification');
      scheduleInterval(parseInt(latestStreakToken.value), 'latestStreakNotification', 1000);
    });
  } 
});

async function checkIntervalStatus(userChosenHour: number, tokenStorageName: string) {
  const latestNotification = useCookie(tokenStorageName);
  const currentDatetime = new Date();
  const currentHour = currentDatetime.getUTCHours();
  const currentDay = currentDatetime.toISOString().split('T')[0];

  const latestDay = latestNotification.value;

  // Check if there is the last notification day token or the current is already passes user hour
  if (latestDay === null || latestDay === undefined || currentHour >= userChosenHour && latestDay !== currentDay) {
    const typeNotification = tokenStorageName.split('latest')[1].toUpperCase();
    console.log('Send')
    sendNotification(typeNotification);

    latestNotification.value = currentDay;
  }
}

function scheduleInterval(userChosenHour: number, tokenStorageName: string, debugTimer: number) {
  const currentDatetime = new Date();
  const nextUserChosenDateTime = new Date();
  //Set the  hour in time the notification will be sent
  nextUserChosenDateTime.setUTCHours(userChosenHour, 0, 0, 0);

  // Check if the current time is already pass the user time, set to next day point if so
  if (currentDatetime >= nextUserChosenDateTime) {
    nextUserChosenDateTime.setUTCDate(nextUserChosenDateTime.getUTCDate() + 1);
  }

  // Calculate the interval to wait to trigger the next sending
  const intervalMillis = nextUserChosenDateTime.getTime() - currentDatetime.getTime();

  //Debuging only for checking waiting, every 1 hour to log one time
  // const timer = setInterval(() => {
  //   console.log(`Time remaining until next run: ${nextUserChosenDateTime.getTime() - (new Date().getTime())} milliseconds at ${tokenStorageName}`)
  // }, debugTimer)

  console.log(`start to wait for ${tokenStorageName}`)
  // The waiting block
  setTimeout(() => {
    checkIntervalStatus(userChosenHour, tokenStorageName);
    scheduleInterval(userChosenHour, tokenStorageName, debugTimer);

    //clear the timer debugging
    //clearInterval(timer);
  }, intervalMillis);
}

async function sendNotification(typeNotification: string) {
  switch (typeNotification) {
    case 'STREAKNOTIFICATION':
      sendInboxMessage('Hey, your are currently on streak day. Continue on!');
      break; 
    case 'CHECKINNOTIFICATION':
      sendInboxMessage('Hi user, you have not check in yet fo today');
      break;
    case 'DAILYPROBLEMNOTIFICATION':
      sendInboxMessage('You daily Leetcode problem is ...');
      break;
    default:
      break;
  }
}

async function sendInboxMessage(content: string) {
  const { reportError } = useErrorLogger();
  const recipientUsername = useCookie('email');

  try {
    const response = await $fetch(`/api/inbox/message/auto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        recipientUsername: recipientUsername.value,
        messageContent: content
      }
    });

    if (response === null) {
      throw createError({ statusCode: 400, message: 'Bad request' });
    }
  }
  catch (error: any) {
    console.log(error)
    reportError(error, { section : `scheduler`});
  }
}