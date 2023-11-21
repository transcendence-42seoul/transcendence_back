import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.entity';
import { ChatParticipant } from './chat.participant.entity';
import { ChatParticipantService } from './chat.participant.service';
import { CreateMessageDto } from './dto/message.dto';
import { ChatMessageService } from './chat.message.service';

@Controller('chats')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatParticipantService: ChatParticipantService,
    private chatMessageService: ChatMessageService,
  ) {}

  @Post('/private/:idx')
  async createPrivate(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('limit', ParseIntPipe) limit: number,
  ): Promise<Chat> {
    return await this.chatService.createPrivate(idx, name, password, limit);
  }

  @Post('/public/:idx')
  async createPublic(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('name') name: string,
    @Body('limit', ParseIntPipe) limit: number,
  ): Promise<Chat> {
    return await this.chatService.createPublic(idx, name, limit);
  }

  @Post('/dm/:idx1/:idx2')
  async getDM(
    @Param('idx1', ParseIntPipe) idx1: number,
    @Param('idx2', ParseIntPipe) idx2: number,
  ): Promise<Chat> {
    return await this.chatService.getDM(idx1, idx2);
  }

  @Get('/private')
  async getPrivateChats(): Promise<Chat[]> {
    return await this.chatService.getPrivateChats();
  }

  @Get('/public')
  async getPublicChats(): Promise<Chat[]> {
    return await this.chatService.getPublicChats();
  }

  @Get('/private-public')
  async getPrivatePublicChats(): Promise<Chat[]> {
    return await this.chatService.getPrivatePublicChats();
  }

  @Post('/private/:userIdx/:chatIdx')
  async joinPrivateChat(
    @Param('userIdx', ParseIntPipe) userIdx: number,
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Body('password') password: string,
  ): Promise<ChatParticipant> {
    return await this.chatParticipantService.joinPrivateChat(
      userIdx,
      chatIdx,
      password,
    );
  }

  @Post('/public/:userIdx/:chatIdx')
  async joinPublicChat(
    @Param('userIdx', ParseIntPipe) userIdx: number,
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
  ): Promise<ChatParticipant> {
    return await this.chatParticipantService.joinPublicChat(userIdx, chatIdx);
  }

  @Get('/participants/:chatIdx')
  async getChatParticipants(
    @Param('chatIdx') chatIdx: number,
  ): Promise<ChatParticipant[]> {
    return await this.chatParticipantService.getChatParticipants(chatIdx);
  }

  @Delete('/:idx')
  async deleteChat(@Param('idx', ParseIntPipe) idx: number): Promise<void> {
    await this.chatService.deleteChat(idx);
  }

  @Get('/message/:chatIdx')
  async getChatMessages(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
  ): Promise<CreateMessageDto[]> {
    return await this.chatMessageService.getChatMessages(chatIdx);
  }
}
