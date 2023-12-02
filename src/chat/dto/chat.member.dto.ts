export class ChatMemberDto {
  idx: number;
  role: string;
  user: {
    idx: number;
    nickname: string;
  };
  isHighlighted: boolean;
}
