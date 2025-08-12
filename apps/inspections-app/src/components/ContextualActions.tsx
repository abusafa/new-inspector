import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  MessageSquare, 
  Plus, 
  X, 
  Image, 
  FileText, 
  Video,
  Paperclip,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';
import { MediaItem, NoteItem, ActionItem } from '@/types/inspection';

export function ContextualActions() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  
  const [noteText, setNoteText] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionAssignee, setActionAssignee] = useState('');
  const [actionPriority, setActionPriority] = useState<ActionItem['priority']>('medium');
  const [actionDueDate, setActionDueDate] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newMedia = Array.from(files).map(file => ({
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: file.type.startsWith('image/') ? 'image' as const : 
              file.type.startsWith('video/') ? 'video' as const : 'document' as const,
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));
      setMedia(prev => [...prev, ...newMedia]);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsMediaDialogOpen(false);
  };

  const handleMediaRemove = (mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleNoteAdd = () => {
    if (noteText.trim()) {
      const newNote: NoteItem = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: noteText.trim(),
        createdAt: new Date().toISOString(),
        author: 'Current User' // In a real app, this would come from auth context
      };
      setNotes(prev => [...prev, newNote]);
      setNoteText('');
      setIsNoteDialogOpen(false);
    }
  };

  const handleNoteRemove = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleActionAdd = () => {
    if (actionTitle.trim() && actionAssignee.trim()) {
      const newAction: ActionItem = {
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: actionTitle.trim(),
        description: actionDescription.trim(),
        assignedTo: actionAssignee.trim(),
        priority: actionPriority,
        dueDate: actionDueDate || undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setActions(prev => [...prev, newAction]);
      setActionTitle('');
      setActionDescription('');
      setActionAssignee('');
      setActionPriority('medium');
      setActionDueDate('');
      setIsActionDialogOpen(false);
    }
  };

  const handleActionRemove = (actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {/* Add Media */}
        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Camera className="h-4 w-4" />
              Add media
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select files to upload</Label>
                <div className="mt-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    variant="outline"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleMediaAdd}
                    className="hidden"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: Images, videos, PDF, Word documents, text files
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Note */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" />
              Add note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-text">Note</Label>
                <Textarea
                  id="note-text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your note..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleNoteAdd} disabled={!noteText.trim()} className="flex-1">
                  Add Note
                </Button>
                <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Action */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Plus className="h-4 w-4" />
              Create action
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Action Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="action-title">Title *</Label>
                <Input
                  id="action-title"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="Action title..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="action-description">Description</Label>
                <Textarea
                  id="action-description"
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  placeholder="Detailed description..."
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="action-assignee">Assigned To *</Label>
                  <Input
                    id="action-assignee"
                    value={actionAssignee}
                    onChange={(e) => setActionAssignee(e.target.value)}
                    placeholder="Person name..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="action-priority">Priority</Label>
                  <Select value={actionPriority} onValueChange={(value: ActionItem['priority']) => setActionPriority(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="action-due-date">Due Date</Label>
                <Input
                  id="action-due-date"
                  type="date"
                  value={actionDueDate}
                  onChange={(e) => setActionDueDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleActionAdd} 
                  disabled={!actionTitle.trim() || !actionAssignee.trim()} 
                  className="flex-1"
                >
                  Create Action
                </Button>
                <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Media Display */}
      {media.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Attached Media ({media.length})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((item) => {
              const MediaIcon = getMediaIcon(item.type);
              return (
                <Card key={item.id} className="relative group">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <MediaIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleMediaRemove(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Display */}
      {notes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Notes ({notes.length})</Label>
          <div className="space-y-2">
            {notes.map((note) => (
              <Card key={note.id} className="relative group">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.author} • {formatDate(note.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleNoteRemove(note.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions Display */}
      {actions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Action Items ({actions.length})</Label>
          <div className="space-y-2">
            {actions.map((action) => (
              <Card key={action.id} className="relative group">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{action.title}</p>
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority.toUpperCase()}
                        </Badge>
                      </div>
                      {action.description && (
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {action.assignedTo}
                        </div>
                        {action.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(action.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleActionRemove(action.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}