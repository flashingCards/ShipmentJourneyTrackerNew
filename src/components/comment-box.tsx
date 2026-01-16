'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { NodeComment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';


interface CommentBoxProps {
  shipmentScancode: string;
  nodeName: string;
}

// Redefine type locally for clarity, ensuring it matches lib/types.ts
interface Comment extends Omit<NodeComment, 'createdAt'> {
  createdAt: Timestamp | null;
}

export function CommentBox({ shipmentScancode, nodeName }: CommentBoxProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, `shipments/${shipmentScancode}/node_comments`);
  }, [firestore, shipmentScancode]);

  useEffect(() => {
    if (!commentsCollectionRef) {
        setLoading(false);
        return;
    };

    const q = query(
      commentsCollectionRef,
      where('nodeName', '==', nodeName),
      orderBy('createdAt', 'desc')
    );

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
        setComments(commentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching comments: ', error);
        toast({
          variant: 'destructive',
          title: 'Error loading comments',
          description: 'Could not retrieve remarks for this node. Check the console for more details.',
        });
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [commentsCollectionRef, nodeName, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '' || authorName.trim() === '' || !commentsCollectionRef) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your name and a comment.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(commentsCollectionRef, {
        authorName: authorName.trim(),
        message: message.trim(),
        nodeName: nodeName,
        createdAt: serverTimestamp(),
      });
      
      // Clear form
      setAuthorName('');
      setMessage('');

      toast({
        title: 'Success!',
        description: 'Your remark has been submitted.',
      });

    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error saving your remark. Please check the console and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 w-full space-y-4 rounded-lg border border-dashed bg-card/50 p-4">
      <h4 className="text-sm font-medium">Remarks</h4>
      
      {/* Comment Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Your Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="bg-background"
          required
          disabled={isSubmitting}
        />
        <Textarea
          placeholder="Add a remark..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-background"
          required
          disabled={isSubmitting}
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Remark'}
        </Button>
      </form>

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* Display Comments */}
      <div className="space-y-3">
        {loading && <p className="text-xs text-muted-foreground">Loading remarks...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No remarks yet.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="text-sm rounded-md bg-background/50 p-3">
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
        ))}
      </div>
    </div>
  );
}
