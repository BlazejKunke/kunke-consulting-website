import { notifyIndexNow } from './lib.js';

export const onSuccess = async ({ inputs, utils }) => {
  try {
    const result = await notifyIndexNow({ inputs });
    utils.status.show({
      title: 'IndexNow notification sent',
      summary: `${result.submitted} canonical URLs submitted after the production deploy.`
    });
  } catch (error) {
    utils.build.failPlugin('The production deploy succeeded, but IndexNow notification failed.', {
      error
    });
  }
};
