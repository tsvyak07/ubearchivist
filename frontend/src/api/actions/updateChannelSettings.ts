import defaultHeaders from '../../configuration/defaultHeaders';
import getApiUrl from '../../configuration/getApiUrl';
import getFetchCredentials from '../../configuration/getFetchCredentials';
import getCookie from '../../functions/getCookie';

export type ChannelAboutConfigType = {
  index_playlists?: boolean | string;
  download_format?: boolean | string;
  autodelete_days?: boolean | number;
  integrate_sponsorblock?: boolean | string;
  subscriptions_channel_size?: number;
  subscriptions_live_channel_size?: number;
  subscriptions_shorts_channel_size?: number;
};

const updateChannelSettings = async (channelId: string, config: ChannelAboutConfigType) => {
  const apiUrl = getApiUrl();
  const csrfCookie = getCookie('csrftoken');

  const response = await fetch(`${apiUrl}/api/channel/${channelId}/about/`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'X-CSRFToken': csrfCookie || '',
    },
    credentials: getFetchCredentials(),

    body: JSON.stringify(config),
  });

  const channelSubscription = await response.json();
  console.log('updateChannelSettings', channelSubscription);

  return channelSubscription;
};

export default updateChannelSettings;
