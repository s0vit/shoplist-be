import { createAndSetupApp } from './app';

async function bootstrap() {
  const app = await createAndSetupApp();
  const PORT = process.env.PORT || 5555;

  await app.listen(PORT, () => {
    console.info(`Server is running on port:${PORT}`);
  });
}

bootstrap();
