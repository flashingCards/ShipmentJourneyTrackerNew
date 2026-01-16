'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  serverTimestamp,
  Timestamp,
  addDoc,
  orderBy,
} from 'firebase/firestore';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useAuth,
  useUser,
  initiateAnonymousSignIn,
} from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Comment as CommentType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageSquarePlus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CommentBoxProps {
  shipmentScancode: string;
  nodeName: string;
}

interface Comment extends Omit<CommentType, 'createdAt'> {
  createdAt: Timestamp | null;
}

const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};


export function CommentBox({ shipmentScancode, nodeName }: CommentBoxProps) {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();

  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Anonymous sign-in effect
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  // Memoize the Firestore query to point to the correct subcollection.
  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(
      firestore,
      `shipments/${shipmentScancode}/shipment_nodes/${nodeName}/comments`
    );
  }, [firestore, shipmentScancode, nodeName]);

  const { data: comments, isLoading: areCommentsLoading, error } = useCollection<Comment>(
    useMemoFirebase(() => commentsQuery ? query(commentsQuery) : null, [commentsQuery])
  );
  
  // Sort comments on the client-side to ensure chronological order and avoid indexing issues.
  const sortedComments = useMemo(() => {
    if (!comments) return [];
    return [...comments].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        }
        if (!a.createdAt && b.createdAt) return 1;
        if (a.createdAt && !b.createdAt) return -1;
        return 0;
    });
  }, [comments]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === '' || authorName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your name and a remark.',
      });
      return;
    }
    if (!firestore || !commentsQuery) {
        toast({ variant: 'destructive', title: 'Database not available. Please try again.' });
        return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication required', description: 'Please wait a moment and try again.' });
        return;
    }

    setIsSubmitting(true);
    
    const newComment = {
      userId: user.uid,
      authorName: authorName.trim(),
      message: message.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(commentsQuery, newComment);
      setMessage('');
      setIsFormOpen(false); // Close form on success
      toast({
          title: 'Success!',
          description: 'Your remark has been submitted.',
      });
    } catch (err: any) {
        console.error('Submission failed:', err);
        const permissionError = new FirestorePermissionError({
          path: commentsQuery.path,
          operation: 'create',
          requestResourceData: {
            userId: user.uid,
            authorName: authorName.trim(),
            message: message.trim(),
          }
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full space-y-4 rounded-lg border bg-card/50 p-4 h-full"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Remarks ({sortedComments?.length ?? 0})</h4>
        <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(prev => !prev)} className="shrink-0">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          {isFormOpen ? 'Cancel' : 'Add Remark'}
        </Button>
      </div>
      
      <div className="space-y-4">
        {areCommentsLoading && (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )}
        {!areCommentsLoading && error && (
          <p className="text-xs text-destructive">Error loading remarks.</p>
        )}
        {!areCommentsLoading && !error && sortedComments?.length === 0 && !isFormOpen && (
          <p className="text-xs text-muted-foreground">No remarks yet.</p>
        )}
        {sortedComments?.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3 text-sm">
            <Avatar className="h-8 w-8 border">
                <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-foreground">{comment.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {comment.createdAt
                    ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })
                    : 'just now'}
                </p>
              </div>
              <p className="mt-1 break-words text-muted-foreground">{comment.message}</p>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="border-t pt-4">
          <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border">
                      <AvatarFallback>
                          {getInitials(authorName)}
                      </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                      <Input
                          placeholder="Your Name"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="bg-background h-8"
                          required
                          disabled={isSubmitting || isUserLoading}
                      />
                      <Textarea
                          placeholder="Post a new remark..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="bg-background min-h-[60px]"
                          required
                          disabled={isSubmitting || isUserLoading}
                      />
                  </div>
              </div>
              <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isSubmitting || isUserLoading}>
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                      <Send className="ml-2 h-4 w-4" />
                  </Button>
              </div>
          </form>
        </div>
      )}
    </div>
  );
}
