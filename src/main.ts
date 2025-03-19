import { createAndSetupApp } from './app';
import './instrument.ts';

async function bootstrap() {
  const app = await createAndSetupApp();
  const PORT = process.env.PORT || 5555;

  await app.listen(PORT, () => {
    console.info(`Server is running on port:${PORT}`);
    console.info(`Swagger documentation is available at http://localhost:${PORT}/swagger`);
  });
}

bootstrap();
