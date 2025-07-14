export default defineNuxtPlugin({
  enforce: 'pre',
  async setup(nuxtApp) {
    onNuxtReady(async () => {
      // Check if the user has been logged in, only perform the notification when the user is logged in with cookies set
      const token = useCookie('token');
      const latestStreakToken = useCookie('latestStreakToken');
      const latestCheckinToken = useCookie('latestCheckinToken');
      const latestDailyProblemToken = useCookie('latestDailyProblemToken');
      
      if (!token.value) {
        console.log('Logged out! No notification scheduled')
        return;
      }
      
      // Check if the cookies are set in the browser, even the JWT token is expired
      // These notification cookie should not depends on the validity of JWT token
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
          console.log(error)
        }
      }

      // Setup each auto notification a schedule
      await checkIntervalStatus(parseInt(latestDailyProblemToken.value), 'latestDailyProblemNotification');
      scheduleInterval(parseInt(latestDailyProblemToken.value), 'latestDailyProblemNotification', 60000);

      await checkIntervalStatus(parseInt(latestCheckinToken.value), 'latestCheckinNotification');
      scheduleInterval(parseInt(latestCheckinToken.value), 'latestCheckinNotification', 30000);

      await checkIntervalStatus(parseInt(latestStreakToken.value), 'latestStreakNotification');
      scheduleInterval(parseInt(latestStreakToken.value), 'latestStreakNotification', 10000);
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
    // TODO: Send notification function here
    console.log(`Notification for you at ${userChosenHour}`);
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
  //   console.log(`Time remaining until next run: ${intervalMillis} milliseconds at ${tokenStorageName}`)
  // }, debugTimer)

  console.log(`start to wait for ${tokenStorageName}`)
  // The waiting block
  setTimeout(() => {
    checkIntervalStatus(userChosenHour, tokenStorageName);
    scheduleInterval(userChosenHour, tokenStorageName, debugTimer);

    //clear the timer debugging
    // clearInterval(timer);
  }, intervalMillis);
}

async function sendNotification(typeNotification: 'STREAK' | 'CHECKIN' | 'DAILY') {
  switch (typeNotification) {
    case 'STREAK':
      
      break; 
    
  }
}

async function sendInboxMessage(content: string) {

}