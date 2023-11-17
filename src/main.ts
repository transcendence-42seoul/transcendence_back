import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  // Graceful Shutdown 활성화
  //  app.enableShutdownHooks();

  // beforeShutdown 훅 등록
  //  app.registerShutdownHook(() => {
  //    console.log('Custom operation before shutdown');
  //    // 추가적인 종료 작업 수행 가능
  //  });
  // cors 무시
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
