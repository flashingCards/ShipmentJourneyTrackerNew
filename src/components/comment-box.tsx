'use client';

import React, { useMemo, useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronsUpDown, MessageSquarePlus } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import type { NodeComment } from '@/lib/types';


interface CommentBoxProps {
  shipmentScancode: string;
  nodeName: string;
}

export function CommentBox({ shipmentScancode, nodeName }: CommentBoxProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formIsOpen, setFormIsOpen] = useState(false);

  const commentsQuery = useMemo(() => {
    if (!firestore) return null;
    const commentsPath = `shipments/${shipmentScancode}/node_comments`;
    return query(
        collection(firestore, commentsPath),
        where('nodeName', '==', nodeName)
    );
  }, [firestore, shipmentScancode, nodeName]);

  const { data: comments, loading, error } = useCollection<Omit<NodeComment, 'id'>>(commentsQuery);
  
  const nodeComments = useMemo(() => {
    if (!comments) return [];
    const sortedComments = comments.map(doc => ({ id: doc.id, ...doc.data() } as NodeComment));
    sortedComments.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
    return sortedComments;
  }, [comments]);


  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || newComment.trim() === '' || authorName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your name and a comment.',
      });
      return;
    }

    setIsSubmitting(true);
    const commentsPath = `shipments/${shipmentScancode}/node_comments`;
    const commentData = {
      authorName: authorName.trim(),
      message: newComment.trim(),
      nodeName: nodeName,
      createdAt: serverTimestamp(),
    };

    const commentsCollection = collection(firestore, commentsPath);

    addDoc(commentsCollection, commentData)
      .then(() => {
        setNewComment('');
        // We don't clear authorName as they might want to post again
        setFormIsOpen(false); // Close form on success
        toast({
          title: 'Comment Added',
          description: 'Your comment has been successfully submitted.',
        });
      })
      .catch((err) => {
        // Exclude serverTimestamp from the data passed to the error context
        const { createdAt, ...resourceData } = commentData;
        const permissionError = new FirestorePermissionError({
          path: commentsPath,
          operation: 'create',
          requestResourceData: resourceData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 w-full">
      <Card className="bg-card/50 border-dashed">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Remarks ({loading ? '...' : nodeComments?.length ?? 0})</h4>
             <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-auto p-2 h-auto">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle comment section</span>
                </Button>
            </CollapsibleTrigger>
          </div>
          <div className="mt-2 space-y-3">
            {loading && (
               <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4/5" />
                  </div>
               </div>
            )}
            {!loading && nodeComments && nodeComments.length > 0 ? (
              <div className="text-sm p-2 rounded-md bg-background/50 truncate">
                <span className="font-semibold text-foreground">{nodeComments[0].authorName}:</span>
                <span className="ml-2 text-muted-foreground">{nodeComments[0].message}</span>
              </div>
            ) : (
              !loading && <p className="text-xs text-muted-foreground text-center py-1">No remarks yet.</p>
            )}
             {error && <p className="text-xs text-destructive text-center py-2">Error loading comments.</p>}
          </div>
        </div>

        <CollapsibleContent>
            <CardContent className="p-4 pt-0">
               <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                {!loading && nodeComments && nodeComments.length > 0 ? (
                    nodeComments.map((comment) => (
                    <div key={comment.id} className="text-sm p-3 rounded-md bg-background/50">
                        <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-foreground">{comment.authorName}</p>
                        {comment.createdAt && comment.createdAt.toDate && (
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                            </p>
                        )}
                        </div>
                        <p className="mt-1 text-muted-foreground break-words">{comment.message}</p>
                    </div>
                    ))
                ) : null}
               </div>

              {!formIsOpen ? (
                <div className="border-t pt-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setFormIsOpen(true)}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Add a Remark
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="space-y-3 mt-4 border-t pt-4">
                    <Input
                      placeholder="Your Name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="bg-background"
                      required
                    />
                    <Textarea
                      placeholder="Add a remark..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-background"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Remark'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setFormIsOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                </form>
              )}
            </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
