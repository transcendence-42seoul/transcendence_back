import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Graceful Shutdown 활성화
  //  app.enableShutdownHooks();

  // beforeShutdown 훅 등록
  //  app.registerShutdownHook(() => {
  //    console.log('Custom operation before shutdown');
  //    // 추가적인 종료 작업 수행 가능
  //  });

  await app.listen(3000);
}
bootstrap();
