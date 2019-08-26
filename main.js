const { S3 } = require('aws-sdk');

const { S3_BUCKET, ...envs } = process.env;
const S3_ENV_PREFIX = 'S3_OPTION';

async function main() {
  if (!S3_BUCKET) {
    throw new Error('Missing S3_BUCKET env');
  }

  const options = {
    s3ForcePathStyle: true,
  };

  const envKeys = Object.keys(envs);

  for (const envKey of envKeys) {
    if (envKey.startsWith(S3_ENV_PREFIX)) {
      const optionKey = envKey
        .substr(S3_ENV_PREFIX.length + 1)
        .toLowerCase()
        .replace(/(\_[a-z])/ig, found => found.substr(1).toUpperCase());

      options[optionKey] = envs[envKey];
    }
  }

  const s3 = new S3(options);

  const params = {
    Bucket: S3_BUCKET,
    Key: `s3-debug-${Date.now()}.json`,
  };

  const hasObject = await new Promise((resolve, reject) => {
    s3.headObject(params, (err) => {
      if (err) {
        if (err.code === 'NotFound') {
          resolve(false);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });

  console.log('hasObject:', hasObject);

  if (!hasObject) {
    const putObject = await new Promise((resolve, reject) => {
      s3.putObject({
        ...params,
        ContentType: 'application/json',
        Body: JSON.stringify({
          time: Date.now(),
        }),
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });

    console.log('putObject:', putObject);
  }
}

main().catch(console.error);
