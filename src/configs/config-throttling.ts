import { ConfigService } from '@nestjs/config';
import { seconds } from '@nestjs/throttler';

export const configThrottling = (config: ConfigService) => {
  const ttlInMilliseconds = seconds(config.get('THROTTLE_TTL'));

  return {
    // TODO add redis storage
    // https://www.npmjs.com/package/nestjs-throttler-storage-redis
    throttlers: [
      {
        ttl: ttlInMilliseconds,
        limit: +config.get('THROTTLE_LIMIT'),
      },
    ],
  };
};
