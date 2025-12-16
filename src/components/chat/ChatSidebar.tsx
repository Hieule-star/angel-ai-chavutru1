import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateTitle: (sessionId: string, title: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface GroupedSessions {
  today: ChatSession[];
  yesterday: ChatSession[];
  thisWeek: ChatSession[];
  thisMonth: ChatSession[];
  older: ChatSession[];
}

function groupSessionsByDate(sessions: ChatSession[]): GroupedSessions {
  const grouped: GroupedSessions = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  sessions.forEach((session) => {
    const date = new Date(session.updated_at);
    if (isToday(date)) {
      grouped.today.push(session);
    } else if (isYesterday(date)) {
      grouped.yesterday.push(session);
    } else if (isThisWeek(date)) {
      grouped.thisWeek.push(session);
    } else if (isThisMonth(date)) {
      grouped.thisMonth.push(session);
    } else {
      grouped.older.push(session);
    }
  });

  return grouped;
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onUpdateTitle,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [isHovered, setIsHovered] = useState(false);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isEditing && onSelect()}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm px-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveTitle();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              setEditTitle(session.title);
              setIsEditing(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm truncate">{session.title}</span>
          
          {isHovered && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SessionGroup({
  title,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onUpdateTitle,
}: {
  title: string;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateTitle: (sessionId: string, title: string) => void;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-muted-foreground px-3 mb-2">{title}</h3>
      <div className="space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onSelect={() => onSelectSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
            onUpdateTitle={(title) => onUpdateTitle(session.id, title)}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onUpdateTitle,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-background border-r transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-foreground">Lịch sử chat</h2>
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Cuộc trò chuyện mới
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 px-2">
          {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8 px-4">
              Chưa có cuộc trò chuyện nào.
              <br />
              Bắt đầu chat với ANGEL AI ngay!
            </div>
          ) : (
            <>
              <SessionGroup
                title="Hôm nay"
                sessions={groupedSessions.today}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  onSelectSession(id);
                  onClose();
                }}
                onDeleteSession={onDeleteSession}
                onUpdateTitle={onUpdateTitle}
              />
              <SessionGroup
                title="Hôm qua"
                sessions={groupedSessions.yesterday}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  onSelectSession(id);
                  onClose();
                }}
                onDeleteSession={onDeleteSession}
                onUpdateTitle={onUpdateTitle}
              />
              <SessionGroup
                title="Tuần này"
                sessions={groupedSessions.thisWeek}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  onSelectSession(id);
                  onClose();
                }}
                onDeleteSession={onDeleteSession}
                onUpdateTitle={onUpdateTitle}
              />
              <SessionGroup
                title="Tháng này"
                sessions={groupedSessions.thisMonth}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  onSelectSession(id);
                  onClose();
                }}
                onDeleteSession={onDeleteSession}
                onUpdateTitle={onUpdateTitle}
              />
              <SessionGroup
                title="Cũ hơn"
                sessions={groupedSessions.older}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => {
                  onSelectSession(id);
                  onClose();
                }}
                onDeleteSession={onDeleteSession}
                onUpdateTitle={onUpdateTitle}
              />
            </>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}
