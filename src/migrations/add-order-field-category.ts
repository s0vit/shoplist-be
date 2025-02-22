import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MigrationModule } from './migration.module';
import { Category } from '../app/category/models/category.model';

async function migrate() {
  try {
    console.log('Инициализация приложения...');
    const app = await NestFactory.createApplicationContext(MigrationModule);

    const CategoryModel = app.get<Model<Category>>(getModelToken(Category.name));

    console.log('Получение всех платежных источников...');
    const categories = await CategoryModel.find().lean();

    const sourcesByUser = categories.reduce((acc, source) => {
      const userId = source.userId.toString();

      if (!acc[userId]) {
        acc[userId] = [];
      }

      acc[userId].push(source);

      return acc;
    }, {});

    console.log(`Найдено ${Object.keys(sourcesByUser).length} пользователей для обновления`);

    for (const userId in sourcesByUser) {
      const sources = sourcesByUser[userId];
      console.log(`Обработка ${sources.length} источников для пользователя ${userId}`);

      for (let i = 0; i < sources.length; i++) {
        await CategoryModel.updateOne(
          { _id: sources[i]._id },
          {
            $set: { order: i },
            $currentDate: { updatedAt: true },
          },
        );
      }
    }

    console.log('Миграция успешно завершена');
    await app.close();
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    throw error;
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Миграция завершилась с ошибкой:', error);
    process.exit(1);
  });
