import { redirect } from 'next/navigation';

// Web pushes sent before the link shape was fixed point at /messages/<id>,
// which has no page of its own — forward them to the query form the inbox
// actually reads so those notifications still land in the conversation.
export default function MessageConversationRedirect({
  params,
}: {
  params: { conversationId: string };
}) {
  redirect(`/messages?conversation=${encodeURIComponent(params.conversationId)}`);
}
