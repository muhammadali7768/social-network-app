export const generatePrivateChatRoomName=(userOneId:number,userTwoId:number):string=>{
    const sortedIds = [userOneId, userTwoId].sort((a, b) => a - b);
    return `private_chat_messages: ${sortedIds.join('_')}`;
}