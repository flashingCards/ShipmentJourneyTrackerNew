'use client';

import React, { useMemo, useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface CommentBoxProps {
  shipmentScancode: string;
  nodeName: string;
}

export function CommentBox({ shipmentScancode, nodeName }: CommentBoxProps) {
  const firestore = useFirestore();
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsQuery = useMemo(() => {
    if (!firestore) return null;
    const commentsPath = `shipments/${shipmentScancode}/node_comments`;
    return query(collection(firestore, commentsPath), orderBy('createdAt', 'desc'));
  }, [firestore, shipmentScancode]);

  const { data: comments, loading, error } = useCollection(commentsQuery);
  
  const nodeComments = useMemo(() => {
    // Note: The query gets all comments for the shipment. We filter client-side.
    // This is not ideal for performance at scale but works for this scenario
    // where security rules prevent filtering on sub-collections.
    return comments?.map(doc => ({ id: doc.id, ...doc.data() })).filter(comment => comment.nodeName === nodeName);
  }, [comments, nodeName]);


  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' || authorName.trim() === '') {
      alert('Please enter your name and a comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const commentsPath = `shipments/${shipmentScancode}/node_comments`;
      await addDoc(collection(firestore, commentsPath), {
        authorName: authorName.trim(),
        message: newComment.trim(),
        nodeName: nodeName,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (e) {
      console.error('Error adding comment: ', e);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-4 bg-card/50 border-dashed">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium">Comments / Remarks</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <form onSubmit={handleAddComment} className="space-y-3">
            <Input
              placeholder="Your Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-background"
              required
            />
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-background"
              required
            />
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
        </form>
        <div className="mt-4 space-y-3">
          {loading && (
             <div className="space-y-3">
                <div className="flex items-start space-x-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="flex items-start space-x-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-3/5" />
                </div>
            </div>
          )}
          {!loading && nodeComments && nodeComments.length > 0 ? (
            nodeComments.map((comment) => (
              <div key={comment.id} className="text-sm p-3 rounded-md bg-background/50">
                <div className="flex justify-between items-baseline">
                   <p className="font-semibold text-foreground">{comment.authorName}</p>
                   {comment.createdAt && (
                     <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                    </p>
                   )}
                </div>
                <p className="mt-1 text-muted-foreground">{comment.message}</p>
              </div>
            ))
          ) : (
            !loading && <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
          )}
           {error && <p className="text-xs text-destructive text-center py-2">Error loading comments.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
