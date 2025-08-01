import { Message, UserStatus } from "./chat";

export interface WebSocketMessage {
    action_type: string;
    message: Message;
    message_id: number;
    new_content: string;
    user_status: UserStatus[];
}