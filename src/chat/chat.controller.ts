import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.entity';
import { ChatParticipantService } from './chat.participant.service';
import { ChatMessageService } from './chat.message.service';
import { ChatMessage } from './chat.message.entity';
import { ChatMemberDto } from './dto/chat.member.dto';

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

  @Get('/data/:idx')
  async getChat(@Param('idx', ParseIntPipe) idx: number): Promise<Chat> {
    return await this.chatService.getChatByIdx(idx);
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
  ): Promise<void> {
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
  ): Promise<void> {
    return await this.chatParticipantService.joinPublicChat(userIdx, chatIdx);
  }

  @Get('/participants/:chatIdx')
  async getChatParticipants(
    @Param('chatIdx') chatIdx: number,
  ): Promise<ChatMemberDto[]> {
    return await this.chatParticipantService.getChatParticipants(chatIdx);
  }

  @Get('/participant/:chatIdx/:userIdx')
  async isParticipant(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('userIdx', ParseIntPipe) userIdx: number,
  ): Promise<boolean> {
    return await this.chatParticipantService.isParticipant(chatIdx, userIdx);
  }

  @Delete('/:idx')
  async deleteChat(@Param('idx', ParseIntPipe) idx: number): Promise<void> {
    await this.chatService.deleteChat(idx);
  }

  @Get('/message/:chatIdx/:userIdx')
  async getChatMessages(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('userIdx', ParseIntPipe) userIdx: number,
  ): Promise<ChatMessage[]> {
    return await this.chatMessageService.getChatMessages(chatIdx, userIdx);
  }

  @Post('/message/:chatIdx/:userIdx')
  async createChatMessage(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('userIdx', ParseIntPipe) userIdx: number,
    @Body('content') content: string,
  ): Promise<ChatMessage> {
    return this.chatMessageService.createChatMessage(chatIdx, userIdx, content);
  }

  @Get('/ban/:chatIdx/:userIdx')
  async getIsBanned(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('userIdx', ParseIntPipe) userIdx: number,
    @Res() res,
  ) {
    try {
      await this.chatParticipantService.checkBan(chatIdx, userIdx);
      res.status(200).send(false);
    } catch (error) {
      res.status(200).send(true);
    }
  }
}
