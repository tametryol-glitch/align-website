'use client';

import { useRef } from 'react';
import {
  Send, X, Image as ImageIcon, Smile,
} from 'lucide-react';
import { GifStickerPicker } from '@/components/chat/GifStickerPicker';
import { VoiceRecorder } from '@/components/chat/VoiceRecorder';
import { AttachmentMenu } from '@/components/chat/AttachmentMenu';
import type { Message } from '@/lib/messagingService';

// ── Types ────────────────────────────────────────────────────────────

export interface MessageComposerProps {
  newMessage: string;
  editText: string;
  editingMessage: Message | null;
  replyTo: Message | null;
  sending: boolean;
  smartReplies: string[];
  showGifPicker: boolean;
  showAttachMenu: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onNewMessageChange: (value: string) => void;
  onEditTextChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onCancelReplyEdit: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGifSelect: (url: string, type: 'gif' | 'sticker') => void;
  onVoiceComplete: (blob: Blob, duration: number) => void;
  onSmartReplySelect: (reply: string) => void;
  onToggleGifPicker: () => void;
  onToggleAttachMenu: () => void;
  onCloseAttachMenu: () => void;
  onSelectFileFromMenu: () => void;
  onSelectLocation: () => void;
  onSelectPoll: () => void;
}

export function MessageComposer({
  newMessage, editText, editingMessage, replyTo, sending, smartReplies,
  showGifPicker, showAttachMenu, inputRef,
  onNewMessageChange, onEditTextChange, onSend, onCancelReplyEdit,
  onImageUpload, onFileUpload, onGifSelect, onVoiceComplete,
  onSmartReplySelect, onToggleGifPicker, onToggleAttachMenu,
  onCloseAttachMenu, onSelectFileFromMenu, onSelectLocation, onSelectPoll,
}: MessageComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Reply/Edit banner */}
      {(replyTo || editingMessage) && (
        <div className="px-4 py-2 border-t border-border-primary bg-bg-secondary flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-accent-primary font-medium">
              {editingMessage ? 'Editing message' : `Replying to ${replyTo?.sender_name}`}
            </p>
            <p className="text-xs text-text-muted truncate">
              {(editingMessage || replyTo)?.content}
            </p>
          </div>
          <button
            onClick={onCancelReplyEdit}
            className="p-1 text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* GIF/Sticker picker */}
      {showGifPicker && (
        <div className="relative">
          <GifStickerPicker
            isOpen={showGifPicker}
            onClose={onToggleGifPicker}
            onSelect={onGifSelect}
          />
        </div>
      )}

      {/* Smart reply chips */}
      {smartReplies.length > 0 && !editingMessage && !replyTo && (
        <div className="px-4 py-1.5 border-t border-border-primary bg-bg-secondary flex gap-2 overflow-x-auto">
          {smartReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSmartReplySelect(reply)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border border-accent-primary/30 text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={onSend} className="p-3 border-t border-border-primary flex items-center gap-1.5">
        {/* Attachment menu */}
        <div className="relative">
          <input ref={fileUploadRef} type="file" onChange={onFileUpload} className="hidden" />
          <AttachmentMenu
            isOpen={showAttachMenu}
            onToggle={onToggleAttachMenu}
            onSelectFile={() => { onCloseAttachMenu(); fileUploadRef.current?.click(); }}
            onSelectLocation={() => { onCloseAttachMenu(); onSelectLocation(); }}
            onSelectPoll={() => { onCloseAttachMenu(); onSelectPoll(); }}
          />
        </div>

        {/* Image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-text-muted hover:text-text-primary transition-colors"
          title="Send image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* GIF picker toggle */}
        <button
          type="button"
          onClick={onToggleGifPicker}
          className={`p-2 transition-colors ${showGifPicker ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
          title="GIFs & Stickers"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={editingMessage ? editText : newMessage}
          onChange={(e) => {
            if (editingMessage) {
              onEditTextChange(e.target.value);
            } else {
              onNewMessageChange(e.target.value);
            }
          }}
          placeholder={editingMessage ? 'Edit message...' : 'Type a message...'}
          className="input flex-1 py-2.5"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onCancelReplyEdit();
            }
          }}
        />

        {/* Voice recorder or Send button */}
        {!newMessage.trim() && !editingMessage ? (
          <VoiceRecorder
            onRecordingComplete={onVoiceComplete}
            disabled={sending}
          />
        ) : (
          <button
            type="submit"
            disabled={(!newMessage.trim() && !editingMessage) || sending}
            className="btn-primary px-4 py-2.5"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </>
  );
}
