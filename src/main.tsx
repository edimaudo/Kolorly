import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Kolorly Game',
  height: 'tall',
  render: (context) => {
    return (
      <vstack width="100%" height="100%">
        <webview
          id="kolorly-webview"
          url="index.html"
          width="100%"
          height="100%"
          onMessage={(msg) => console.log('Message from Kolorly:', msg)}
        />
      </vstack>
    );
  },
});

export default Devvit;
